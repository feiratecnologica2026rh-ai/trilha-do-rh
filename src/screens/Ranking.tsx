import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, User, Users } from 'lucide-react';
import { Podium } from '../components/Podium';
import { compareRank, loadRanking, type RankEntry, type RankMode } from '../lib/ranking';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function Ranking({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<RankMode>('solo');
  const [onlyToday, setOnlyToday] = useState(true);
  const [data, setData] = useState<{ entries: RankEntry[]; shared: boolean } | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    setData(null);
    loadRanking().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [reload]);

  const list = useMemo(() => {
    if (!data) return [];
    const since = onlyToday ? startOfToday() : 0;
    return data.entries.filter((e) => e.mode === mode && e.at >= since).sort(compareRank).slice(0, 20);
  }, [data, mode, onlyToday]);

  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto max-w-md grid gap-4">
        <button onClick={onExit} className="flex items-center gap-1 font-bold text-marinho/70 w-fit">
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="flex items-center gap-2">
          <Trophy className="text-amarelo" size={30} />
          <h1 className="text-2xl font-black flex-1">Ranking de jogadores</h1>
          <button aria-label="Atualizar" onClick={() => setReload((r) => r + 1)} className="p-2 rounded-full hover:bg-white">
            <RefreshCw size={20} />
          </button>
        </div>
        <p className="-mt-2 text-sm font-semibold text-marinho/70">
          Cada carta acertada vale pontos: <b className="text-verde">fácil 1</b>, <b className="text-laranja">médio 2</b> e{' '}
          <b className="text-red-700">difícil 3</b>.
        </p>

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
          {(
            [
              ['solo', 'Sozinho', User],
              ['grupo', 'Em grupo', Users],
            ] as const
          ).map(([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-black transition ${mode === m ? 'bg-marinho text-white' : 'text-marinho/70'}`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 text-sm font-bold">
          {[
            [true, 'Hoje'],
            [false, 'Todos'],
          ].map(([v, label]) => (
            <button
              key={String(v)}
              onClick={() => setOnlyToday(v as boolean)}
              className={`rounded-full px-4 py-1.5 border-2 ${onlyToday === v ? 'border-marinho bg-marinho text-white' : 'border-slate-200 bg-white'}`}
            >
              {label as string}
            </button>
          ))}
        </div>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          {!data ? (
            <p className="py-8 text-center font-bold text-marinho/60">Carregando…</p>
          ) : list.length === 0 ? (
            <p className="py-8 text-center font-bold text-marinho/60">Ninguém pontuou ainda. Seja o primeiro!</p>
          ) : (
            <>
              <h2 className="text-center font-black text-lg">Os 3 primeiros</h2>
              <Podium
                items={list.map((e, i) => ({ key: `${i}`, name: e.name, points: e.points, detail: `${e.correct}/${e.answered} acertos` }))}
              />
              {list.length > 3 && (
                <ol className="mt-4 grid gap-1.5" start={4}>
                  {list.slice(3).map((e, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-xl bg-fundo px-3 py-2 text-sm">
                      <span className="w-7 font-black">{i + 4}º</span>
                      <span className="flex-1 font-extrabold truncate">{e.name}</span>
                      <span className="font-bold text-marinho/60">
                        {e.correct}/{e.answered}
                      </span>
                      <span className="w-14 text-right font-black text-laranja">{e.points} pts</span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </section>

        {data && (
          <p className="text-center text-xs font-semibold text-marinho/50">
            {data.shared ? 'Ranking compartilhado entre todos os aparelhos.' : 'Ranking salvo neste aparelho.'}
          </p>
        )}
      </div>
    </div>
  );
}
