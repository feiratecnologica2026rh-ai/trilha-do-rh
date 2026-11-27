import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';
import { Box, Check, LogOut, Square, Star, Timer, Volume2, VolumeX, Zap } from 'lucide-react';
import { Board } from './Board';
import { Dice } from './Dice';
import { CardModal } from './CardModal';
import { FinalScreen } from './FinalScreen';
import { Avatar } from './Avatar';
import { TIMING, currentPlayer, displayPos } from '../game/engine';
import { HOUSE_INFO, houseType } from '../game/board';
import type { GameAction, GameState } from '../game/types';
import { PAWN_COLORS } from '../game/types';
import { isMuted, play, setMuted } from '../lib/sound';
import logo from '../assets/logo.webp';

interface Props {
  state: GameState;
  now: number;
  /** este aparelho pode jogar pelo jogador com este id? */
  canControl: (playerId: string) => boolean;
  onAction: (a: GameAction) => void;
  onExit: () => void;
  onPlayAgain?: () => void;
  badge?: ReactNode;
  offlineIds?: string[];
}

const Board3D = lazy(() => import('./Board3D'));

const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* sem armazenamento: só não lembra a escolha */
    }
  },
};

function can3D() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
const HAS_3D = typeof document !== 'undefined' && can3D();
const WEAK = typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency || 4) <= 4 || Math.min(screen.width, screen.height) < 400);

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function GameView({ state, now, canControl, onAction, onExit, onPlayAgain, badge, offlineIds = [] }: Props) {
  const ph = state.phase;
  const cur = currentPlayer(state);
  const myTurn = canControl(cur.id);
  const positions = state.players.map((_, i) => displayPos(state, i, now));
  const [muted, setMutedState] = useState(isMuted());
  const [view3d, setView3d] = useState(() => HAS_3D && store.get('trilha:view') !== '2d');
  const [lite, setLite] = useState(() => (store.get('trilha:lite') ?? (WEAK ? '1' : '0')) === '1');

  // sons ligados às mudanças de fase
  const lastKey = useRef('');
  useEffect(() => {
    const key = `${state.turnCount}:${ph.kind}:${'cardId' in ph ? ph.cardId : ''}:${ph.kind === 'moving' ? ph.startedAt : ''}`;
    if (key === lastKey.current) return;
    const first = lastKey.current === '';
    lastKey.current = key;
    if (first) return;
    if (ph.kind === 'question' && ph.purpose === 'turn' && myTurn) play('turn');
    if (ph.kind === 'awaitRoll') play('right');
    if (ph.kind === 'feedback') play(ph.correct ? 'right' : 'wrong');
    if (ph.kind === 'moving' && ph.dice !== null) play('dice');
    if (ph.kind === 'finished') play('win');
  }, [state.turnCount, ph, myTurn]);

  // som de passo enquanto o peão anda
  const lastPos = useRef(positions[state.turn]);
  useEffect(() => {
    const p = positions[state.turn];
    if (ph.kind === 'moving' && p !== lastPos.current) play('step');
    lastPos.current = p;
  });

  if (ph.kind === 'finished') {
    return <FinalScreen state={state} onExit={onExit} onPlayAgain={onPlayAgain} />;
  }

  const timeLeft = state.endsAt !== null ? state.endsAt - now : null;
  const diceRolling = ph.kind === 'moving' && ph.dice !== null && now - ph.startedAt < TIMING.diceMs;
  const fakeFace = 1 + (Math.floor(now / 90) % 6);
  const landedType = houseType(positions[state.turn]);

  let status: string;
  if (ph.kind === 'question') status = myTurn ? 'Responda a carta!' : `${cur.name} está respondendo…`;
  else if (ph.kind === 'awaitRoll') status = myTurn ? 'Acertou! Jogue o dado.' : `${cur.name} vai jogar o dado`;
  else if (ph.kind === 'feedback') status = ph.correct ? 'Acertou!' : 'Errou — o peão fica onde está';
  else status = ph.banner ?? (ph.dice !== null ? `${cur.name} tirou ${ph.dice}!` : 'Movendo…');

  return (
    <div className="min-h-dvh flex flex-col">
      {/* cabeçalho */}
      <header className="bg-marinho text-white px-4 py-2.5 flex items-center gap-3">
        <img src={logo} alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-0.5" />
        <div className="min-w-0 flex-1">
          <div className="font-black leading-tight truncate">Trilha do RH</div>
          <div className="text-xs text-white/70 truncate">Rodada {Math.ceil(state.turnCount / state.players.length)}</div>
        </div>
        {badge}
        {timeLeft !== null && (
          <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-black ${timeLeft < 30_000 ? 'bg-red-600' : 'bg-white/15'}`}>
            <Timer size={15} /> {fmt(timeLeft)}
          </div>
        )}
        <button
          aria-label={muted ? 'Ativar som' : 'Desativar som'}
          onClick={() => {
            setMuted(!muted);
            setMutedState(!muted);
          }}
          className="p-1.5 rounded-full hover:bg-white/10"
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button aria-label="Sair da partida" onClick={onExit} className="p-1.5 rounded-full hover:bg-white/10">
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-4 py-3 grid gap-3 lg:grid-cols-[1fr_300px] lg:items-start">
        <section className={`relative rounded-3xl shadow-sm overflow-hidden ${view3d ? 'bg-[#040a14] aspect-[4/5] sm:aspect-[5/4] max-h-[72dvh] w-full' : 'bg-white p-2 sm:p-4'}`}>
          {view3d ? (
            <Suspense fallback={<div className="absolute inset-0 grid place-items-center font-black text-white/60">Carregando o 3D…</div>}>
              <Board3D
                lite={lite}
                players={state.players.map((p) => ({ id: p.id, name: p.name, color: PAWN_COLORS[p.color].hex }))}
                positions={positions}
                turn={state.turn}
                moving={ph.kind === 'moving'}
                round={Math.ceil(state.turnCount / state.players.length)}
              />
            </Suspense>
          ) : (
            <Board players={state.players} positions={positions} turn={state.turn} showTurn />
          )}

          {/* botões do tabuleiro */}
          {HAS_3D && (
            <div className="absolute top-2 right-2 z-10 flex gap-1.5">
              {view3d && (
                <button
                  onClick={() => {
                    setLite(!lite);
                    store.set('trilha:lite', lite ? '0' : '1');
                  }}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black backdrop-blur ${lite ? 'bg-amarelo text-marinho' : 'bg-white/15 text-white'}`}
                  aria-pressed={lite}
                  title="Modo leve: menos brilho, mais rápido em celulares simples"
                >
                  <Zap size={13} /> Leve
                </button>
              )}
              <button
                onClick={() => {
                  setView3d(!view3d);
                  store.set('trilha:view', view3d ? '2d' : '3d');
                }}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black backdrop-blur ${view3d ? 'bg-white/15 text-white' : 'bg-marinho text-white'}`}
              >
                {view3d ? <Square size={13} /> : <Box size={13} />} {view3d ? '2D' : '3D'}
              </button>
            </div>
          )}

          {/* dado e avisos sobre o tabuleiro */}
          {ph.kind === 'moving' && (
            <div className={`pointer-events-none absolute inset-0 grid ${view3d ? 'place-items-start justify-center pt-3' : 'place-items-center'}`}>
              <div className={`animate-pop flex items-center gap-2 rounded-3xl bg-white/92 shadow-xl ${view3d ? 'flex-row px-3 py-2' : 'flex-col px-6 py-4'}`}>
                {ph.dice !== null && <Dice value={diceRolling ? fakeFace : ph.dice} rolling={diceRolling} size={view3d ? 48 : 84} />}
                {!diceRolling && (
                  <div className={`text-center font-black max-w-[240px] ${view3d ? 'text-base' : 'text-lg'}`}>
                    {ph.banner ?? `${cur.name} tirou ${ph.dice}!`}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className="grid gap-3">
          <div
            className="rounded-2xl px-4 py-3 font-black text-center text-white shadow-sm"
            style={{ background: PAWN_COLORS[cur.color].hex, color: cur.color === 'amarelo' ? '#0F2942' : '#fff' }}
          >
            {status}
          </div>

          <ul className="grid gap-2">
            {state.players.map((p, i) => {
              const active = i === state.turn;
              const offline = offlineIds.includes(p.id);
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-sm border-2 ${active ? 'border-marinho' : 'border-transparent'}`}
                >
                  <Avatar name={p.name} photo={p.photo} color={p.color} />
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold truncate">
                      {p.name} {canControl(p.id) && state.players.length > 1 && !allLocal(state, canControl) ? <span className="text-xs text-azul">(você)</span> : null}
                    </div>
                    <div className="text-xs font-bold text-marinho/60 flex items-center gap-2">
                      <span>Casa {positions[i]}</span>
                      <span className="flex items-center gap-0.5">
                        <Check size={12} /> {p.correct}/{p.answered}
                      </span>
                      <span className="flex items-center gap-0.5 text-laranja">
                        <Star size={12} fill="currentColor" /> {p.points ?? 0} pts
                      </span>
                      {offline && <span className="text-red-600">desconectado</span>}
                    </div>
                  </div>
                  {active && <span className="text-xs font-black rounded-full bg-marinho text-white px-2 py-0.5">VEZ</span>}
                </li>
              );
            })}
          </ul>

          <div className="rounded-2xl bg-white p-3 shadow-sm text-xs font-bold text-marinho/80 grid gap-1">
            {(['pergunta', 'alerta', 'prevencao', 'desafio', 'saude'] as const).map((t) => (
              <div key={t} className={`flex items-center gap-2 ${landedType === t && ph.kind !== 'question' ? 'text-marinho' : ''}`}>
                <span className="h-3 w-3 rounded-full flex-none" style={{ background: HOUSE_INFO[t].color }} />
                <span>
                  <b>{HOUSE_INFO[t].label}:</b> {HOUSE_INFO[t].rule}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </main>

      {(ph.kind === 'question' || ph.kind === 'feedback' || ph.kind === 'awaitRoll') && (
        <CardModal
          phase={ph}
          player={cur}
          canAct={myTurn}
          now={now}
          onAnswer={(choice) => onAction({ type: 'answer', playerId: cur.id, choice })}
          onRoll={() => onAction({ type: 'roll', playerId: cur.id })}
          onContinue={() => onAction({ type: 'continue', playerId: cur.id })}
        />
      )}
    </div>
  );
}

function allLocal(state: GameState, canControl: (id: string) => boolean) {
  return state.players.every((p) => canControl(p.id));
}
