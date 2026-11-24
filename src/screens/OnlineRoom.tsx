import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Check, Copy, Crown, Eye, Play, Share2 } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { ColorPicker } from '../components/ColorPicker';
import { MatchLength } from '../components/MatchLength';
import { entriesFromGame, saveResults } from '../lib/ranking';
import { GameView } from '../components/GameView';
import { tick } from '../game/engine';
import type { GameAction, PawnColor } from '../game/types';
import { useNow } from '../hooks/useNow';
import type { AppUser } from '../lib/auth';
import { serverNow } from '../lib/firebase';
import {
  MAX_PLAYERS,
  SLOTS,
  backToLobby,
  joinRoom,
  leaveRoom,
  roomLink,
  sendAction,
  sendTick,
  setColor,
  setMinutes,
  startOnlineGame,
  subscribeRoom,
  type Room,
} from '../lib/rooms';

interface Props {
  code: string;
  user: AppUser;
  onExit: () => void;
}

export function OnlineRoom({ code, user, onExit }: Props) {
  const [room, setRoom] = useState<Room | null | undefined>(undefined);
  const [slot, setSlot] = useState<string | null>(null);
  const [spectator, setSpectator] = useState(false);
  const [error, setError] = useState('');
  const now = useNow(serverNow, 100);

  useEffect(() => {
    let cancelled = false;
    joinRoom(code, user)
      .then((r) => {
        if (cancelled) return;
        if ('slot' in r) setSlot(r.slot);
        else setSpectator(true);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Não foi possível entrar na sala.'));
    const unsub = subscribeRoom(code, setRoom);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [code, user]);

  const game = room?.game ?? null;
  const isHost = room?.hostUid === user.uid;

  // Relógio da partida: o criador da sala avança as fases; se ele sair, os outros assumem depois de 1,5 s.
  useEffect(() => {
    if (!game || spectator) return;
    const next = tick(game, now);
    if (next === game) return;
    const hostOnline = Object.values(room?.players ?? {}).some((p) => p?.uid === room?.hostUid && p?.online);
    const overdue = overdueBy(game, now);
    if (isHost || !hostOnline || overdue > 1500) void sendTick(code);
  }, [now, game, isHost, spectator, room, code]);

  // cada jogador salva a própria pontuação no ranking ao fim da partida
  useEffect(() => {
    if (game?.phase.kind !== 'finished' || spectator) return;
    if (!game.players.some((p) => p.id === user.uid)) return;
    void saveResults(`online:${code}:${game.startedAt}:${user.uid}`, entriesFromGame(game, user.uid));
  }, [game, spectator, user.uid, code]);

  const onAction = useCallback((a: GameAction) => void sendAction(code, a), [code]);

  if (error) {
    return (
      <Centered>
        <p className="font-bold text-red-600">{error}</p>
        <button onClick={onExit} className="mt-4 rounded-2xl bg-marinho text-white px-6 py-3 font-black">Voltar</button>
      </Centered>
    );
  }
  if (room === undefined) return <Centered>Entrando na sala {code}…</Centered>;
  if (room === null) {
    return (
      <Centered>
        <p className="font-bold">A sala {code} não existe ou foi encerrada.</p>
        <button onClick={onExit} className="mt-4 rounded-2xl bg-marinho text-white px-6 py-3 font-black">Voltar</button>
      </Centered>
    );
  }

  const players = SLOTS.map((s) => ({ slot: s, p: room.players[s] })).filter((x) => x.p);
  const offlineIds = players.filter((x) => !x.p!.online).map((x) => x.p!.uid);

  if (room.status === 'playing' && game) {
    return (
      <GameView
        state={game}
        now={now}
        canControl={(id) => !spectator && id === user.uid}
        onAction={onAction}
        offlineIds={offlineIds}
        badge={
          <span className="hidden sm:flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-black tracking-widest">
            {spectator && <Eye size={14} />} {room.code}
          </span>
        }
        onExit={onExit}
        onPlayAgain={isHost ? () => void backToLobby(room.code) : undefined}
      />
    );
  }

  // ───── Lobby ─────
  const link = roomLink(room.code);
  const me = slot ? room.players[slot] : undefined;
  const takenColors = players.map((x) => x.p!.color).filter((c) => c !== me?.color) as PawnColor[];

  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto max-w-md grid gap-4">
        <button
          onClick={() => {
            if (slot && !isHost) void leaveRoom(room.code, slot);
            onExit();
          }}
          className="flex items-center gap-1 font-bold text-marinho/70 w-fit"
        >
          <ArrowLeft size={18} /> Sair da sala
        </button>

        <section className="rounded-3xl bg-marinho text-white p-5 text-center shadow-lg">
          <div className="text-sm font-bold text-white/70">Código da sala</div>
          <div className="text-5xl font-black tracking-[0.2em] my-1">{room.code}</div>
          <div className="mx-auto mt-3 w-fit rounded-2xl bg-white p-3">
            <QRCodeSVG value={link} size={168} fgColor="#0F2942" />
          </div>
          <div className="mt-3 flex gap-2 justify-center">
            <CopyButton text={link} />
            {typeof navigator.share === 'function' && (
              <button
                onClick={() => navigator.share({ title: 'Trilha do RH', text: `Entre na minha sala: ${room.code}`, url: link }).catch(() => undefined)}
                className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-black"
              >
                <Share2 size={16} /> Compartilhar
              </button>
            )}
          </div>
        </section>

        {spectator && (
          <div className="rounded-2xl bg-amarelo/30 px-4 py-3 font-bold flex items-center gap-2">
            <Eye size={18} /> A sala está cheia: você está assistindo.
          </div>
        )}

        <section className="rounded-3xl bg-white p-4 shadow-sm grid gap-3">
          <h2 className="font-black text-lg">
            Jogadores ({players.length}/{MAX_PLAYERS})
          </h2>
          <ul className="grid gap-2">
            {players.map(({ slot: s, p }) => (
              <li key={s} className="flex items-center gap-3 rounded-2xl bg-fundo px-3 py-2.5">
                <Avatar name={p!.name} photo={p!.photo} color={p!.color} />
                <span className="flex-1 font-extrabold truncate">
                  {p!.name} {p!.uid === user.uid && <span className="text-xs text-azul">(você)</span>}
                </span>
                {p!.uid === room.hostUid && <Crown size={18} className="text-amarelo" aria-label="Criador da sala" />}
                {!p!.online && <span className="text-xs font-bold text-red-600">offline</span>}
              </li>
            ))}
            {Array.from({ length: MAX_PLAYERS - players.length }, (_, i) => (
              <li key={`v${i}`} className="rounded-2xl border-2 border-dashed border-slate-200 px-3 py-3 text-sm font-bold text-marinho/40">
                Vaga livre…
              </li>
            ))}
          </ul>

          {me && slot && (
            <div className="grid gap-2">
              <div className="text-sm font-black">Cor do seu peão</div>
              <ColorPicker value={me.color} taken={takenColors} onChange={(c) => void setColor(room.code, slot, c)} />
            </div>
          )}
        </section>

        <MatchLength value={room.minutes ?? 0} disabled={!isHost} onChange={(m) => void setMinutes(room.code, m)} />

        {isHost ? (
          <button
            onClick={() => void startOnlineGame(room)}
            disabled={players.length < 1}
            className="flex items-center justify-center gap-2 rounded-2xl bg-verde text-white py-4 text-xl font-black shadow-md disabled:opacity-40"
          >
            <Play size={24} /> Iniciar Partida
          </button>
        ) : (
          <p className="text-center font-bold text-marinho/70">Aguardando o criador da sala iniciar a partida…</p>
        )}
        {isHost && players.length === 1 && (
          <p className="-mt-2 text-center text-sm font-semibold text-marinho/60">
            Aguarde até 2 amigos entrarem pelo código ou QR Code — ou comece sozinho.
          </p>
        )}
      </div>
    </div>
  );
}

/** Há quanto tempo a fase atual já deveria ter avançado. */
function overdueBy(game: NonNullable<Room['game']>, now: number) {
  const ph = game.phase;
  const due =
    ph.kind === 'question' || ph.kind === 'awaitRoll' ? ph.deadline : ph.kind === 'feedback' || ph.kind === 'moving' ? ph.until : Infinity;
  return Math.max(now - due, game.endsAt !== null ? now - game.endsAt : -Infinity);
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() =>
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          })
          .catch(() => undefined)
      }
      className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-black"
    >
      {done ? <Check size={16} /> : <Copy size={16} />} {done ? 'Copiado!' : 'Copiar link'}
    </button>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh grid place-items-center p-6 text-center font-bold">{<div>{children}</div>}</div>;
}
