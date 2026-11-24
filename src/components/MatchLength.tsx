import { Timer } from 'lucide-react';
import { MATCH_MINUTES } from '../game/engine';

/** Escolha da duração da partida: sem limite, 5, 10 ou 15 minutos. */
export function MatchLength({ value, onChange, disabled }: { value: number; onChange: (m: number) => void; disabled?: boolean }) {
  return (
    <div className={`rounded-2xl bg-white px-4 py-3 shadow-sm ${disabled ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-2 font-bold">
        <Timer size={20} /> Tempo da partida
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {MATCH_MINUTES.map((m) => (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => onChange(m)}
            className={`rounded-xl py-2 text-sm font-black border-2 transition ${value === m ? 'border-marinho bg-marinho text-white' : 'border-slate-200 bg-white'}`}
          >
            {m === 0 ? 'Livre' : `${m} min`}
          </button>
        ))}
      </div>
    </div>
  );
}
