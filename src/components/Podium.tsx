import { Medal } from 'lucide-react';

export interface PodiumItem {
  key: string;
  name: string;
  points: number;
  detail?: string;
}

const PLACES = [
  { label: '1º', color: '#F1C40F', height: 'h-28', order: 'order-2' },
  { label: '2º', color: '#B0BEC5', height: 'h-20', order: 'order-1' },
  { label: '3º', color: '#D08A4E', height: 'h-14', order: 'order-3' },
];

/** Pódio com os 3 primeiros colocados. */
export function Podium({ items }: { items: PodiumItem[] }) {
  const top = items.slice(0, 3);
  if (top.length === 0) return null;
  return (
    <div className="grid grid-cols-3 items-end gap-2 pt-2">
      {PLACES.map((place, i) => {
        const it = top[i];
        return (
          <div key={place.label} className={`${place.order} flex flex-col items-center text-center min-w-0`}>
            {it ? (
              <>
                <Medal size={i === 0 ? 34 : 26} style={{ color: place.color }} />
                <div className="mt-1 w-full truncate font-black text-sm sm:text-base">{it.name}</div>
                <div className="text-xs font-black text-laranja">{it.points} pts</div>
                {it.detail && <div className="text-[11px] font-bold text-marinho/60">{it.detail}</div>}
              </>
            ) : (
              <div className="text-xs font-bold text-marinho/40">—</div>
            )}
            <div
              className={`mt-1.5 w-full ${place.height} rounded-t-2xl grid place-items-start justify-center pt-2 text-xl font-black`}
              style={{ background: place.color, color: i === 0 ? '#0F2942' : '#fff' }}
            >
              {place.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
