// Ranking de jogadores.
// Com Firebase configurado, o ranking é compartilhado (todos os aparelhos da feira veem o mesmo).
// Sem Firebase (ou sem internet), fica salvo neste aparelho.
import { signInAnonymously } from 'firebase/auth';
import { get, limitToLast, orderByChild, push, query, ref, set } from 'firebase/database';
import { auth, db, firebaseReady } from './firebase';
import type { GameState } from '../game/types';

export type RankMode = 'solo' | 'grupo';

export interface RankEntry {
  name: string;
  points: number;
  correct: number;
  answered: number;
  mode: RankMode;
  at: number;
}

const LOCAL_KEY = 'trilha:ranking';
const MAX_LOCAL = 500;

function readLocal(): RankEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as RankEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries: RankEntry[]) {
  try {
    const all = [...readLocal(), ...entries].sort((a, b) => b.points - a.points).slice(0, MAX_LOCAL);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  } catch {
    /* sem armazenamento: ignora */
  }
}

export function entriesFromGame(game: GameState, onlyPlayerId?: string): RankEntry[] {
  const mode: RankMode = game.players.length === 1 ? 'solo' : 'grupo';
  return game.players
    .filter((p) => !onlyPlayerId || p.id === onlyPlayerId)
    .map((p) => ({
      name: p.name.slice(0, 40),
      points: p.points ?? 0,
      correct: p.correct,
      answered: p.answered,
      mode,
      at: Date.now(),
    }));
}

/** Salva o resultado da partida no ranking (uma vez por partida, controlado por `key`). */
export async function saveResults(key: string, entries: RankEntry[]) {
  try {
    const savedKey = `trilha:saved:${key}`;
    if (localStorage.getItem(savedKey)) return;
    localStorage.setItem(savedKey, '1');
  } catch {
    /* segue mesmo sem armazenamento */
  }
  if (firebaseReady && db && auth) {
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      const uid = auth.currentUser!.uid;
      await Promise.all(entries.map((e) => set(push(ref(db!, 'ranking')), { ...e, uid })));
      return;
    } catch {
      /* sem internet: guarda neste aparelho */
    }
  }
  writeLocal(entries);
}

export async function loadRanking(): Promise<{ entries: RankEntry[]; shared: boolean }> {
  if (firebaseReady && db) {
    try {
      const snap = await get(query(ref(db, 'ranking'), orderByChild('points'), limitToLast(500)));
      const entries: RankEntry[] = [];
      snap.forEach((child) => {
        entries.push(child.val() as RankEntry);
      });
      return { entries: [...entries, ...readLocal()], shared: true };
    } catch {
      /* cai para o ranking local */
    }
  }
  return { entries: readLocal(), shared: false };
}

/** Ordena: mais pontos, depois mais acertos, depois menos cartas respondidas. */
export const compareRank = (a: RankEntry, b: RankEntry) =>
  b.points - a.points || b.correct - a.correct || a.answered - b.answered || a.at - b.at;
