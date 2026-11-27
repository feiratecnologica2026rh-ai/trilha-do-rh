import { useState } from 'react';
import { BookOpen, Smartphone, Trophy } from 'lucide-react';
import logo from '../assets/logo.webp';
import { RulesSummary } from '../components/RulesSummary';

interface Props {
  onLocal: () => void;
  onRanking: () => void;
}

export function Home({ onLocal, onRanking }: Props) {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="min-h-dvh px-4 py-6">
      <div className="mx-auto max-w-md grid gap-4">
        <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
          <img src={logo} alt="Trilha do RH — Segurança e Saúde no Trabalho" className="w-full aspect-[16/9] object-cover" />
        </div>

        <p className="text-center font-bold text-marinho/80">
          Jogo educativo baseado na NR-1. Responda, jogue o dado e chegue primeiro à CHEGADA!
        </p>

        <button
          onClick={onLocal}
          className="flex items-center gap-3 rounded-3xl bg-verde text-white px-5 py-4 text-left shadow-md active:scale-[0.99] transition"
        >
          <Smartphone size={32} className="flex-none" />
          <span>
            <span className="block text-lg font-black">Jogar</span>
            <span className="block text-sm font-bold text-white/85">1 a 3 jogadores neste aparelho · funciona sem internet</span>
          </span>
        </button>

        <button
          onClick={onRanking}
          className="flex items-center gap-3 rounded-3xl bg-white px-5 py-3.5 text-left shadow-sm active:scale-[0.99] transition"
        >
          <Trophy size={28} className="flex-none text-amarelo" />
          <span className="flex-1">
            <span className="block text-lg font-black">Ranking de jogadores</span>
            <span className="block text-sm font-bold text-marinho/60">Campeões do dia · toque no nome para ver os critérios</span>
          </span>
        </button>

        <section className="rounded-3xl bg-white shadow-sm">
          <button onClick={() => setRulesOpen(!rulesOpen)} className="w-full flex items-center gap-2 px-5 py-4 text-lg font-black">
            <BookOpen size={22} /> Como jogar
            <span className="ml-auto text-sm text-azul">{rulesOpen ? 'fechar' : 'ver'}</span>
          </button>
          {rulesOpen && (
            <div className="px-5 pb-5">
              <RulesSummary />
            </div>
          )}
        </section>

        <p className="text-center text-xs font-semibold text-marinho/50">
          Material educativo escolar baseado na NR-1. Para requisitos legais, consulte a versão vigente publicada pelo Ministério do Trabalho e Emprego.
        </p>
      </div>
    </div>
  );
}
