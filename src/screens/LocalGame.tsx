import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Play, Plus, Trash2 } from 'lucide-react';
import { ColorPicker } from '../components/ColorPicker';
import { MatchLength } from '../components/MatchLength';
import { entriesFromGame, saveResults } from '../lib/ranking';
import { GameView } from '../components/GameView';
import { createGame, reduce, tick } from '../game/engine';
import type { GameAction, GameState, PawnColor, PlayerSeed } from '../game/types';
import { PAWN_COLORS } from '../game/types';
import { useNow } from '../hooks/useNow';

const clock = () => Date.now();
const DEFAULT_COLORS: PawnColor[] = ['azul', 'laranja', 'verde'];

/** Modo "1 aparelho": de 1 a 3 jogadores passando o celular/tablet. Não precisa de internet. */
export function LocalGame({ onExit }: { onExit: () => void }) {
  const [seeds, setSeeds] = useState<PlayerSeed[]>([{ id: 'p1', name: '', color: 'azul' }]);
  const [minutes, setMinutes] = useState(10);
  const [game, setGame] = useState<GameState | null>(null);
  const now = useNow(clock, 100);

  useEffect(() => {
    if (!game) return;
    const next = tick(game, now);
    if (next !== game) setGame(next);
  }, [now, game]);

  // salva a pontuação de todos no ranking quando a partida termina
  useEffect(() => {
    if (game?.phase.kind === 'finished') void saveResults(`local:${game.startedAt}`, entriesFromGame(game));
  }, [game]);

  const onAction = useCallback((a: GameAction) => setGame((g) => (g ? reduce(g, a, Date.now()) : g)), []);

  const start = () => {
    const ready = seeds.map((s, i) => ({ ...s, name: s.name.trim() || `Jogador ${i + 1}` }));
    setGame(createGame(ready, Date.now(), minutes));
  };

  if (game) {
    return (
      <GameView
        state={game}
        now={now}
        canControl={() => true}
        onAction={onAction}
        onExit={() => (game.phase.kind === 'finished' || confirm('Sair da partida?') ? onExit() : undefined)}
        onPlayAgain={start}
      />
    );
  }

  const taken = seeds.map((s) => s.color);

  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto max-w-md grid gap-4">
        <button onClick={onExit} className="flex items-center gap-1 font-bold text-marinho/70 w-fit">
          <ArrowLeft size={18} /> Voltar
        </button>
        <h1 className="text-2xl font-black">Jogar neste aparelho</h1>
        <p className="font-semibold text-marinho/70 -mt-2">De 1 a 3 jogadores. Na vez de cada um, passe o aparelho.</p>

        {seeds.map((s, i) => (
          <div key={s.id} className="rounded-3xl bg-white p-4 shadow-sm grid gap-3">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 flex-none rounded-full grid place-items-center font-black text-white" style={{ background: PAWN_COLORS[s.color].hex }}>
                {i + 1}
              </span>
              <input
                value={s.name}
                maxLength={20}
                onChange={(e) => setSeeds(seeds.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))}
                placeholder={`Nome do jogador ${i + 1}`}
                className="min-w-0 flex-1 rounded-2xl border-2 border-slate-200 px-3 py-2.5 font-bold outline-none focus:border-azul"
              />
              {seeds.length > 1 && (
                <button aria-label="Remover jogador" onClick={() => setSeeds(seeds.filter((x) => x.id !== s.id))} className="p-2 text-marinho/50">
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <ColorPicker
              value={s.color}
              taken={taken}
              onChange={(c) => setSeeds(seeds.map((x) => (x.id === s.id ? { ...x, color: c } : x)))}
            />
          </div>
        ))}

        {seeds.length < 3 && (
          <button
            onClick={() => {
              const color = (DEFAULT_COLORS.find((c) => !taken.includes(c)) ??
                (Object.keys(PAWN_COLORS) as PawnColor[]).find((c) => !taken.includes(c)))!;
              setSeeds([...seeds, { id: `p${Date.now()}`, name: '', color }]);
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-marinho/30 py-3 font-extrabold text-marinho/70"
          >
            <Plus size={20} /> Adicionar jogador
          </button>
        )}

        <MatchLength value={minutes} onChange={setMinutes} />

        <button onClick={start} className="flex items-center justify-center gap-2 rounded-2xl bg-verde text-white py-4 text-xl font-black shadow-md">
          <Play size={24} /> Começar
        </button>
      </div>
    </div>
  );
}
