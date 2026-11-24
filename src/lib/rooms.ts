// Salas online no Firebase Realtime Database.
//
// Estrutura:
//   rooms/{CODIGO} = {
//     code, hostUid, createdAt, status: 'lobby' | 'playing', minutes: number,
//     players: { "0": RoomPlayer, "1": RoomPlayer, "2": RoomPlayer },   // 3 vagas no máximo
//     game: string  // estado da partida (JSON), alterado só por transação
//   }
import {
  get,
  onDisconnect,
  onValue,
  ref,
  remove,
  runTransaction,
  set,
  update,
} from 'firebase/database';
import { db, serverNow } from './firebase';
import type { AppUser } from './auth';
import { createGame, reduce, tick } from '../game/engine';
import type { GameAction, GameState, PawnColor } from '../game/types';
import { PAWN_COLORS } from '../game/types';

export const MAX_PLAYERS = 3;
export const SLOTS = ['0', '1', '2'] as const;

export interface RoomPlayer {
  uid: string;
  name: string;
  photo: string | null;
  color: PawnColor;
  online: boolean;
  joinedAt: number;
}

export interface Room {
  code: string;
  hostUid: string;
  createdAt: number;
  status: 'lobby' | 'playing';
  minutes: number;
  players: Partial<Record<string, RoomPlayer>>;
  game: GameState | null;
}

// Sem 0/O e 1/I para não confundir na hora de digitar.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;

const newCode = () =>
  'RH' + Array.from({ length: 3 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

export const normalizeCode = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);

const roomRef = (code: string) => ref(db!, `rooms/${code}`);

function firstFreeColor(taken: PawnColor[]): PawnColor {
  return (Object.keys(PAWN_COLORS) as PawnColor[]).find((c) => !taken.includes(c)) ?? 'azul';
}

export async function createRoom(user: AppUser): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = newCode();
    const result = await runTransaction(roomRef(code), (cur: { createdAt?: number } | null) => {
      if (cur && typeof cur.createdAt === 'number' && serverNow() - cur.createdAt < ROOM_TTL_MS) return; // ocupado
      return {
        code,
        hostUid: user.uid,
        createdAt: serverNow(),
        status: 'lobby',
        minutes: 10,
        players: {
          '0': { uid: user.uid, name: user.name, photo: user.photo, color: 'azul', online: true, joinedAt: serverNow() },
        },
        game: null,
      };
    });
    if (result.committed) {
      watchPresence(code, '0');
      return code;
    }
  }
  throw new Error('Não foi possível criar a sala. Tente novamente.');
}

export type JoinResult = { slot: string } | { spectator: true; reason: 'full' | 'playing' };

export async function joinRoom(code: string, user: AppUser): Promise<JoinResult> {
  const snap = await get(roomRef(code));
  if (!snap.exists()) throw new Error('Sala não encontrada. Confira o código.');
  const room = snap.val() as Room;
  const players = room.players ?? {};

  const mine = SLOTS.find((s) => players[s]?.uid === user.uid);
  if (mine) {
    watchPresence(code, mine);
    return { slot: mine };
  }
  if (room.status !== 'lobby') return { spectator: true, reason: 'playing' };

  const taken = SLOTS.map((s) => players[s]?.color).filter(Boolean) as PawnColor[];
  for (const slot of SLOTS) {
    if (players[slot]) continue;
    const res = await runTransaction(ref(db!, `rooms/${code}/players/${slot}`), (cur) => {
      if (cur) return; // vaga ocupada por outra pessoa nesse meio-tempo
      return {
        uid: user.uid,
        name: user.name,
        photo: user.photo,
        color: firstFreeColor(taken),
        online: true,
        joinedAt: serverNow(),
      };
    });
    if (res.committed) {
      watchPresence(code, slot);
      return { slot };
    }
  }
  return { spectator: true, reason: 'full' };
}

/** Marca o jogador como offline automaticamente se a conexão cair. */
const watching = new Set<string>();
function watchPresence(code: string, slot: string) {
  const key = `${code}/${slot}`;
  if (watching.has(key)) return;
  watching.add(key);
  const onlineRef = ref(db!, `rooms/${code}/players/${slot}/online`);
  onValue(ref(db!, '.info/connected'), (snap) => {
    if (snap.val() !== true) return;
    onDisconnect(onlineRef).set(false);
    set(onlineRef, true).catch(() => undefined);
  });
}

export function subscribeRoom(code: string, cb: (room: Room | null) => void) {
  return onValue(roomRef(code), (snap) => {
    if (!snap.exists()) return cb(null);
    const raw = snap.val();
    let game: GameState | null = null;
    if (typeof raw.game === 'string') {
      try {
        game = JSON.parse(raw.game) as GameState;
      } catch {
        game = null;
      }
    }
    cb({ ...raw, players: raw.players ?? {}, game });
  });
}

export const setColor = (code: string, slot: string, color: PawnColor) =>
  set(ref(db!, `rooms/${code}/players/${slot}/color`), color);

export const setMinutes = (code: string, minutes: number) => set(ref(db!, `rooms/${code}/minutes`), minutes);

export const leaveRoom = (code: string, slot: string) => remove(ref(db!, `rooms/${code}/players/${slot}`));

export async function startOnlineGame(room: Room) {
  const seeds = SLOTS.map((s) => room.players[s])
    .filter((p): p is RoomPlayer => Boolean(p))
    .map((p) => ({ id: p.uid, name: p.name, photo: p.photo, color: p.color }));
  const game = createGame(seeds, serverNow(), room.minutes ?? 0);
  await update(roomRef(room.code), { status: 'playing', game: JSON.stringify(game) });
}

export const backToLobby = (code: string) => update(roomRef(code), { status: 'lobby', game: null });

/** Aplica uma mudança no estado da partida de forma atômica (sem conflito entre aparelhos). */
async function mutateGame(code: string, fn: (s: GameState, now: number) => GameState) {
  await runTransaction(
    ref(db!, `rooms/${code}/game`),
    (cur: string | null) => {
      if (typeof cur !== 'string') return cur; // ainda sem dados locais: o Firebase tenta de novo
      const state = JSON.parse(cur) as GameState;
      const next = fn(state, serverNow());
      if (next === state) return; // nada mudou: cancela
      return JSON.stringify(next);
    },
    { applyLocally: false },
  );
}

export const sendAction = (code: string, action: GameAction) => mutateGame(code, (s, now) => reduce(s, action, now));
export const sendTick = (code: string) => mutateGame(code, (s, now) => tick(s, now));

export const roomLink = (code: string) => {
  const url = new URL(window.location.href);
  url.search = `?sala=${code}`;
  url.hash = '';
  return url.toString();
};

