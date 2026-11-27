import { CheckCircle2, Home, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { CARD_BY_ID, CATEGORY_INFO } from '../data/cards';
import type { GameState } from '../game/types';
import { Avatar } from './Avatar';
import { Podium } from './Podium';
import { compareRank, entriesFromGame } from '../lib/ranking';

export function FinalScreen({ state, onExit, onPlayAgain }: { state: GameState; onExit: () => void; onPlayAgain?: () => void }) {
  if (state.phase.kind !== 'finished') return null;
  const { winners, reason } = state.phase;
  // mesma ordem do Ranking do dia: pontos → acertos → mais rápido → chegou ao final
  const entries = entriesFromGame(state);
  const ranking = state.players
    .map((p, i) => ({ p, e: entries[i] }))
    .sort((a, b) => compareRank(a.e, b.e) || b.p.pos - a.p.pos)
    .map((x) => x.p);
  const winnerNames = state.players.filter((p) => winners.includes(p.id)).map((p) => p.name);
  const solo = state.players.length === 1;

  // revisão: cada carta respondida, erros primeiro
  const seen = new Set<number>();
  const review = [...state.history]
    .sort((a, b) => Number(a.correct) - Number(b.correct))
    .filter((h) => (seen.has(h.cardId) ? false : (seen.add(h.cardId), true)));

  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto max-w-2xl grid gap-4">
        <div className="animate-pop rounded-3xl bg-marinho text-white p-6 text-center shadow-lg">
          <Trophy className="mx-auto text-amarelo" size={56} />
          <h1 className="mt-2 text-2xl sm:text-3xl font-black">
            {solo
              ? reason === 'chegada'
                ? 'Você chegou ao fim da trilha!'
                : 'Tempo esgotado!'
              : winnerNames.length > 1
                ? `Empate: ${winnerNames.join(' e ')}!`
                : `${winnerNames[0]} venceu!`}
          </h1>
          <p className="mt-1 text-white/80 font-bold">
            {reason === 'chegada' ? 'Chegou à casa 20 — CHEGADA.' : 'Venceu quem estava mais perto da chegada (desempate por pontos).'}
          </p>
          <p className="mt-3 font-black text-verde bg-white rounded-full inline-block px-4 py-1">Conhecimento que protege!</p>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="font-black text-lg text-center">{solo ? 'Sua pontuação' : 'Ranking final da partida'}</h2>
          {solo ? (
            <div className="text-center my-2">
              <div className="text-5xl font-black text-laranja">{ranking[0].points ?? 0}</div>
              <div className="font-bold text-marinho/70">pontos</div>
            </div>
          ) : (
            <Podium
              items={ranking.map((p) => ({ key: p.id, name: p.name, points: p.points ?? 0, detail: `${p.correct}/${p.answered} acertos${p.finished ? ' · +10 chegada' : ''}` }))}
            />
          )}
          <p className="mt-2 text-center text-xs font-bold text-marinho/60">Fácil = 1 ponto · Médio = 2 · Difícil = 3 · Chegar ao final = +10. Resultado salvo no Ranking.</p>
          <ol className="grid gap-2 mt-3">
            {ranking.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-fundo px-3 py-2">
                <span className="w-6 text-center font-black text-lg">{i + 1}º</span>
                <Avatar name={p.name} photo={p.photo} color={p.color} size={36} />
                <span className="flex-1 font-extrabold truncate">{p.name}</span>
                <span className="text-right text-sm font-bold text-marinho/70 leading-tight">
                  <span className="block font-black text-laranja">{p.points ?? 0} pts</span>
                  casa {p.pos} · {p.correct}/{p.answered}
                  {p.finished && <span className="block text-azul">+10 chegada</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {onPlayAgain && (
            <button onClick={onPlayAgain} className="flex items-center justify-center gap-2 rounded-2xl bg-verde text-white font-black py-3.5 shadow">
              <RotateCcw size={20} /> Jogar de novo
            </button>
          )}
          <button
            onClick={onExit}
            className={`flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-marinho font-black py-3.5 ${onPlayAgain ? '' : 'col-span-2'}`}
          >
            <Home size={20} /> Início
          </button>
        </div>

        {review.length > 0 && (
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="font-black text-lg">O que aprendemos nesta partida</h2>
            <ul className="mt-3 grid gap-3">
              {review.map((h) => {
                const card = CARD_BY_ID[h.cardId];
                const cat = CATEGORY_INFO[card.category];
                return (
                  <li key={h.cardId} className="rounded-2xl border-l-8 bg-fundo p-3" style={{ borderColor: cat.color }}>
                    <div className="flex items-start gap-2">
                      {h.correct ? (
                        <CheckCircle2 size={20} className="flex-none text-green-700 mt-0.5" />
                      ) : (
                        <XCircle size={20} className="flex-none text-red-600 mt-0.5" />
                      )}
                      <div>
                        <div className="font-extrabold leading-snug">{card.question}</div>
                        <div className="mt-1 text-sm font-bold text-verde">Resposta: {card.options[0]}</div>
                        <div className="mt-1 text-sm text-marinho/80">{card.explanation}</div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
