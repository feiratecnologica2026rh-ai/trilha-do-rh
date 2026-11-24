import { Check } from 'lucide-react';
import { PAWN_COLORS, type PawnColor } from '../game/types';

export function ColorPicker({ value, taken, onChange }: { value: PawnColor; taken: PawnColor[]; onChange: (c: PawnColor) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor do peão">
      {(Object.keys(PAWN_COLORS) as PawnColor[]).map((c) => {
        const disabled = c !== value && taken.includes(c);
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === value}
            aria-label={PAWN_COLORS[c].name}
            disabled={disabled}
            onClick={() => onChange(c)}
            className={`grid place-items-center h-9 w-9 rounded-full border-[3px] transition ${c === value ? 'border-marinho scale-110' : 'border-white'} ${disabled ? 'opacity-20' : ''}`}
            style={{ background: PAWN_COLORS[c].hex, boxShadow: '0 1px 3px rgba(0,0,0,.25)' }}
          >
            {c === value && <Check size={18} color={c === 'amarelo' ? '#0F2942' : '#fff'} strokeWidth={4} />}
          </button>
        );
      })}
    </div>
  );
}
