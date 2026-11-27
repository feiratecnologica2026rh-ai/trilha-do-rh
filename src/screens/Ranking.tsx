import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, Info, RefreshCw, Trophy, User, Users, X } from 'lucide-react';
import { Podium } from '../components/Podium';
import { CRITERIA, compareRank, explain, loadRanking, type RankEntry, type RankMode } from '../lib/ranking';

type Tab = 'geral' | RankMode;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const joinPt = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}`);

const MODE_NAME: Record<RankMode, string> = { solo: 'sozinho', grupo: 'em grupo' };

export function Ranking({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<Tab>('geral');
  const [onlyToday, setOnlyToday] = useState(true);
  const [data, setData] = useState<{ entries: RankEntry[]; shared: boolean } | null>(null);
  const [reload, setReload] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    loadRanking().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [reload]);

  // atualiza sozinho a cada 30 s (o ranking do dia vai mudando conforme as partidas terminam)
  useEffect(() => {
    const id = setInterval(() => loadRanking().then(setData), 30_000);
    return () => clearInterval(id);
  }, []);

  const list = useMemo(() => {
    if (!data) return [];
    const since = onlyToday ? startOfToday() : 0;
    return data.entries.filter((e) => (tab === 'geral' || e.mode === tab) && e.at >= since).sort(compareRank).slice(0, 10);
  }, [data, tab, onlyToday]);

  useEffect(() => setPicked(null), [tab, onlyToday]);

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
          Carta certa: <b className="text-verde">fácil 1</b>, <b className="text-laranja">médio 2</b>, <b className="text-red-700">difícil 3</b> pontos. Chegar
          ao final: <b className="text-azul">+10</b>.
        </p>

        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm">
          {(
            [
              ['geral', 'Geral', Crown],
              ['solo', 'Sozinho', User],
              ['grupo', 'Em grupo', Users],
            ] as const
          ).map(([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => setTab(m)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-black transition ${tab === m ? 'bg-marinho text-white' : 'text-marinho/70'}`}
            >
              <Icon size={17} /> {label}
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
              <h2 className="text-center font-black text-lg">{onlyToday && tab === 'geral' ? 'Campeões do dia' : 'Os 3 primeiros'}</h2>
              <p className="text-center text-xs font-bold text-marinho/50">Toque no nome para ver os critérios</p>
              <Podium
                items={list.map((e, i) => ({ key: `${i}`, name: e.name, points: e.points, detail: `${e.correct}/${e.answered} acertos` }))}
                onSelect={(i) => setPicked(picked === i ? null : i)}
                selected={picked}
              />
              {picked !== null && list[picked] && <Criteria list={list} index={picked} onClose={() => setPicked(null)} />}
              {list.length > 3 && (
                <ol className="mt-4 grid gap-1.5" start={4}>
                  {list.slice(3).map((e, k) => {
                    const i = k + 3;
                    return (
                      <li key={i}>
                        <button
                          onClick={() => setPicked(picked === i ? null : i)}
                          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-left ${picked === i ? 'bg-marinho text-white' : 'bg-fundo'}`}
                        >
                          <span className="w-7 font-black">{i + 1}º</span>
                          <span className="flex-1 font-extrabold truncate">{e.name}</span>
                          <span className={`font-bold ${picked === i ? 'text-white/70' : 'text-marinho/60'}`}>
                            {e.correct}/{e.answered}
                          </span>
                          <span className={`w-14 text-right font-black ${picked === i ? 'text-amarelo' : 'text-laranja'}`}>{e.points} pts</span>
                        </button>
                        {picked === i && <Criteria list={list} index={i} onClose={() => setPicked(null)} />}
                      </li>
                    );
                  })}
                </ol>
              )}
            </>
          )}
        </section>

        <details className="rounded-2xl bg-white px-4 py-3 shadow-sm text-sm">
          <summary className="flex items-center gap-2 font-black cursor-pointer">
            <Info size={16} /> Como é feito o desempate
          </summary>
          <ol className="mt-2 grid gap-1 font-semibold text-marinho/80 list-decimal pl-5">
            {CRITERIA.map((c) => (
              <li key={c.id}>
                <b>{c.label}:</b> {c.rule}
              </li>
            ))}
          </ol>
        </details>

        {data && (
          <p className="text-center text-xs font-semibold text-marinho/50">
            {data.shared ? 'Ranking compartilhado entre todos os aparelhos · atualiza sozinho' : 'Ranking salvo neste aparelho · atualiza sozinho'}
          </p>
        )}
      </div>
    </div>
  );
}

/** Cartão com os critérios de um colocado e o motivo da posição. */
function Criteria({ list, index, onClose }: { list: RankEntry[]; index: number; onClose: () => void }) {
  const e = list[index];
  const above = index > 0 ? list[index - 1] : null;
  const below = index < list.length - 1 ? list[index + 1] : null;

  const sentence = (a: RankEntry, b: RankEntry, aheadName: string, behindName: string) => {
    const { decisive, tied } = explain(a, b);
    if (!decisive) return `${aheadName} e ${behindName} empataram em todos os critérios.`;
    const tiePart = tied.length ? `Empatou com ${behindName === e.name ? aheadName : behindName} em ${joinPt(tied.map((c) => c.label.toLowerCase()))}; ` : '';
    return `${tiePart}${aheadName} ficou à frente de ${behindName} por ${decisive.why} (${decisive.show(a)} × ${decisive.show(b)}).`;
  };

  return (
    <div className="mt-3 rounded-2xl border-2 border-marinho/15 bg-fundo p-3 text-sm animate-pop">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-black text-base truncate">
            {index + 1}º · {e.name}
          </div>
          <div className="text-xs font-bold text-marinho/60">
            Jogou {MODE_NAME[e.mode]} às {new Date(e.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <button aria-label="Fechar" onClick={onClose} className="p-1 rounded-full hover:bg-white">
          <X size={18} />
        </button>
      </div>

      <table className="mt-2 w-full text-left">
        <tbody>
          {CRITERIA.map((c, k) => (
            <tr key={c.id} className="border-t border-marinho/10">
              <td className="py-1.5 pr-2 font-bold text-marinho/70">
                {k + 1}. {c.label}
              </td>
              <td className="py-1.5 text-right font-black">{c.show(e)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 grid gap-1.5">
        {above && <p className="rounded-xl bg-white px-3 py-2 font-semibold">⬆️ {sentence(above, e, above.name, e.name)}</p>}
        {below && <p className="rounded-xl bg-white px-3 py-2 font-semibold">⬇️ {sentence(e, below, e.name, below.name)}</p>}
        {!above && !below && <p className="rounded-xl bg-white px-3 py-2 font-semibold">Único participante até agora.</p>}
      </div>
    </div>
  );
}
