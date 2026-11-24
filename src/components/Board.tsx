import { HOUSES, HOUSE_INFO } from '../game/board';
import { PAWN_COLORS, type Player } from '../game/types';

const W = 500;
const H = 410;
const ROW_Y = [348, 252, 156, 60];

export function housePoint(n: number) {
  const r = Math.floor((n - 1) / 5);
  const i = (n - 1) % 5;
  const col = r % 2 === 0 ? i : 4 - i;
  return { x: 50 + col * 100, y: ROW_Y[r] };
}

const PAWN_OFFSETS = [
  { x: -15, y: -13 },
  { x: 15, y: -13 },
  { x: 0, y: 14 },
];

interface Props {
  players: Player[];
  positions: number[];
  turn: number;
  showTurn: boolean;
}

export function Board({ players, positions, turn, showTurn }: Props) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label="Tabuleiro da Trilha do RH">
      {/* trilha */}
      {HOUSES.slice(0, -1).map((h) => {
        const a = housePoint(h.n);
        const b = housePoint(h.n + 1);
        return <line key={`l${h.n}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--color-linha)" strokeWidth={12} strokeLinecap="round" />;
      })}

      {/* casas */}
      {HOUSES.map((h) => {
        const { x, y } = housePoint(h.n);
        const info = HOUSE_INFO[h.type];
        const special = h.type !== 'normal';
        const fill = h.type === 'inicio' ? '#FFFFFF' : info.color;
        const textColor = h.type === 'inicio' ? '#0F2942' : info.text;
        const showIcon = special && h.type !== 'inicio' && h.type !== 'chegada';
        return (
          <g key={h.n}>
            <circle cx={x} cy={y} r={31} fill={fill} stroke={special && h.type !== 'inicio' ? 'rgba(0,0,0,0.08)' : '#C9D6E2'} strokeWidth={3} />
            {showIcon && (
              <text x={x} y={y - 9} textAnchor="middle" fontSize={15} fontWeight={900} fill={textColor}>
                {info.icon}
              </text>
            )}
            <text
              x={x}
              y={showIcon ? y + 13 : y + 7}
              textAnchor="middle"
              fontSize={showIcon ? 15 : 21}
              fontWeight={900}
              fill={textColor}
            >
              {h.n}
            </text>
            {info.label && (
              <g>
                {h.type === 'inicio' || h.type === 'chegada' ? (
                  <>
                    <rect x={x - 34} y={y + 35} width={68} height={17} rx={8.5} fill={h.type === 'inicio' ? '#2E7D32' : '#0F2942'} />
                    <text x={x} y={y + 47.5} textAnchor="middle" fontSize={10} fontWeight={900} fill="#fff" letterSpacing={0.5}>
                      {info.label}
                    </text>
                  </>
                ) : (
                  <text x={x} y={y + 46} textAnchor="middle" fontSize={9.5} fontWeight={800} fill="#0F2942" letterSpacing={0.4}>
                    {info.label}
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}

      {/* peões */}
      {players.map((p, i) => {
        const { x, y } = housePoint(positions[i]);
        const off = PAWN_OFFSETS[i] ?? { x: 0, y: 0 };
        const color = PAWN_COLORS[p.color].hex;
        const active = showTurn && i === turn;
        return (
          <g key={p.id} className="pawn" style={{ transform: `translate(${x + off.x}px, ${y + off.y}px)` }}>
            {active && <circle r={13} fill="none" stroke={color} strokeWidth={3} className="pulse-ring" />}
            <circle r={12.5} fill={color} stroke="#fff" strokeWidth={3.5} />
            <circle r={4} cx={-3} cy={-4} fill="rgba(255,255,255,0.55)" />
            <title>{p.name}</title>
          </g>
        );
      })}
    </svg>
  );
}
