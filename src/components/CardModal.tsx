import { ArrowRight, CheckCircle2, Clock, Dices, XCircle } from 'lucide-react';
import { CARD_BY_ID, CATEGORY_INFO, DIFFICULTY_INFO } from '../data/cards';
import { questionDuration } from '../game/engine';
import type { AwaitRollPhase, FeedbackPhase, Player, QuestionPhase } from '../game/types';

interface Props {
  phase: QuestionPhase | FeedbackPhase | AwaitRollPhase;
  player: Player;
  canAct: boolean;
  now: number;
  onAnswer: (choice: number) => void;
  onRoll: () => void;
  onContinue: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export function CardModal({ phase, player, canAct, now, onAnswer, onRoll, onContinue }: Props) {
  const card = CARD_BY_ID[phase.cardId];
  const cat = CATEGORY_INFO[card.category];
  const answered = phase.kind !== 'question';
  const chosen = phase.kind === 'question' ? null : phase.chosen;
  const correct = phase.kind === 'awaitRoll' || (phase.kind === 'feedback' && phase.correct);
  const purpose = phase.kind === 'awaitRoll' ? 'turn' : phase.purpose;
  const diff = DIFFICULTY_INFO[card.difficulty];
  const pts = card.difficulty;

  let secondsLeft = 0;
  let progress = 0;
  if (phase.kind === 'question') {
    const total = questionDuration(card.id);
    const left = Math.max(0, phase.deadline - now);
    secondsLeft = Math.ceil(left / 1000);
    progress = left / total;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-marinho/55 backdrop-blur-[2px] p-0 sm:p-4">
      <div className="animate-slide-up w-full sm:max-w-lg max-h-[94dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
        {/* cabeçalho da carta */}
        <div className="px-5 pt-4 pb-3 rounded-t-3xl" style={{ background: cat.color, color: cat.text }}>
          <div className="flex items-center justify-between gap-2 text-xs font-extrabold uppercase tracking-wide">
            <span>{purpose === 'house' ? 'Carta da casa · ' : ''}{cat.name}</span>
            <span className="opacity-80">Carta {card.id}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-base font-black">Vez de {player.name}</span>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-black" style={{ color: diff.color }}>
              {diff.name} · {pts} {pts === 1 ? 'ponto' : 'pontos'}
            </span>
          </div>
        </div>

        {/* timer */}
        {phase.kind === 'question' && (
          <div className="px-5 pt-3">
            <div className="flex items-center justify-between text-sm font-extrabold">
              <span className="flex items-center gap-1.5">
                <Clock size={16} /> Tempo
              </span>
              <span className={secondsLeft <= 5 ? 'text-red-600' : ''}>{secondsLeft}s</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-100 ease-linear"
                style={{ width: `${progress * 100}%`, background: secondsLeft <= 5 ? '#DC2626' : cat.color === '#F1C40F' ? '#C9A000' : cat.color }}
              />
            </div>
          </div>
        )}

        <div className="px-5 py-4">
          <h2 className="text-lg sm:text-xl font-extrabold leading-snug">{card.question}</h2>

          <div className="mt-4 grid gap-2.5">
            {phase.order.map((optIdx, i) => {
              const isCorrect = optIdx === 0;
              const isChosen = chosen === optIdx;
              let cls = 'border-slate-200 bg-white';
              if (answered && isCorrect) cls = 'border-green-600 bg-green-50';
              else if (answered && isChosen) cls = 'border-red-500 bg-red-50';
              else if (answered) cls = 'border-slate-100 bg-white opacity-60';
              else if (canAct) cls = 'border-slate-200 bg-white hover:border-azul hover:bg-blue-50 active:scale-[0.99]';
              return (
                <button
                  key={optIdx}
                  disabled={!canAct || answered}
                  onClick={() => onAnswer(optIdx)}
                  className={`flex items-start gap-3 text-left rounded-2xl border-2 px-3.5 py-3 font-bold transition ${cls} disabled:cursor-default`}
                >
                  <span
                    className="flex-none grid place-items-center h-7 w-7 rounded-full text-sm font-black"
                    style={{ background: answered && isCorrect ? '#2E7D32' : answered && isChosen ? '#DC2626' : '#0F2942', color: '#fff' }}
                  >
                    {LETTERS[i]}
                  </span>
                  <span className="pt-0.5 leading-snug">{card.options[optIdx]}</span>
                  {answered && isCorrect && <CheckCircle2 className="ml-auto flex-none text-green-700" size={22} />}
                  {answered && isChosen && !isCorrect && <XCircle className="ml-auto flex-none text-red-600" size={22} />}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="animate-pop mt-4 rounded-2xl p-4" style={{ background: correct ? '#E8F5E9' : '#FDECEA' }}>
              <div className="font-black text-base" style={{ color: correct ? '#2E7D32' : '#B71C1C' }}>
                {correct ? `Resposta correta! +${pts} ${pts === 1 ? 'ponto' : 'pontos'} 🎉` : chosen === null ? 'O tempo acabou! ⏰' : 'Resposta incorreta'}
              </div>
              <p className="mt-1 text-[15px] leading-relaxed text-marinho">{card.explanation}</p>
              <p className="mt-2 text-sm font-bold text-marinho/70">
                {phase.kind === 'awaitRoll'
                  ? ''
                  : correct
                    ? 'Bônus: avance 1 casa!'
                    : purpose === 'house'
                      ? 'O peão fica onde está.'
                      : 'O peão fica onde está e a vez passa para o próximo.'}
              </p>
            </div>
          )}

          {phase.kind === 'feedback' && (
            <div className="mt-4">
              {canAct ? (
                <button
                  onClick={onContinue}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-marinho text-white text-lg font-black py-3.5 shadow active:scale-[0.98] transition"
                >
                  Continuar <ArrowRight size={22} />
                  <span className="text-sm font-bold text-white/60">({Math.max(0, Math.ceil((phase.until - now) / 1000))}s)</span>
                </button>
              ) : (
                <div className="text-center text-sm font-bold text-marinho/60">
                  Continua em {Math.max(0, Math.ceil((phase.until - now) / 1000))}s…
                </div>
              )}
            </div>
          )}

          {phase.kind === 'awaitRoll' && (
            <div className="mt-4">
              {canAct ? (
                <button
                  onClick={onRoll}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-marinho text-white text-xl font-black py-4 shadow-lg active:scale-[0.98] transition"
                >
                  <Dices size={28} /> Jogar Dado
                </button>
              ) : (
                <div className="text-center font-bold text-marinho/70 py-2">Aguardando {player.name} jogar o dado…</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
