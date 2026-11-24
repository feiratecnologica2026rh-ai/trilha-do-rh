import { HOUSE_INFO } from '../game/board';

export function RulesSummary() {
  return (
    <div className="grid gap-3 text-[15px] leading-relaxed">
      <ol className="grid gap-1.5 list-decimal pl-5 font-semibold">
        <li>Todos começam na casa 1 (INÍCIO).</li>
        <li>Na sua vez, uma carta é sorteada: você tem <b>1 minuto</b> para escolher a resposta.</li>
        <li><b>Acertou?</b> Jogue o dado e avance.</li>
        <li><b>Errou ou o tempo acabou?</b> O peão fica onde está e todos veem a explicação.</li>
        <li>Caiu numa casa colorida? Cumpra a instrução dela.</li>
        <li>Vence quem chegar primeiro à casa 20 (CHEGADA).</li>
        <li>
          Cada carta acertada vale pontos para o <b>Ranking</b>: fácil = 1, médio = 2, difícil = 3.
        </li>
      </ol>
      <div className="grid gap-1.5 text-sm">
        {(['pergunta', 'alerta', 'prevencao', 'desafio', 'saude'] as const).map((t) => (
          <div key={t} className="flex items-start gap-2">
            <span className="mt-1 h-3.5 w-3.5 rounded-full flex-none" style={{ background: HOUSE_INFO[t].color }} />
            <span>
              <b>{HOUSE_INFO[t].label}</b> — {HOUSE_INFO[t].rule}
              {t !== 'prevencao' ? ' Acertou: +1 casa.' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
