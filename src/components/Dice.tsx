const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
};

export function Dice({ value, rolling, size = 96 }: { value: number; rolling: boolean; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={rolling ? 'animate-shake' : 'animate-pop'}
      role="img"
      aria-label={rolling ? 'Dado rolando' : `Dado: ${value}`}
    >
      <rect x={4} y={4} width={92} height={92} rx={18} fill="#fff" stroke="#0F2942" strokeWidth={5} />
      {PIPS[value].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={8.5} fill="#0F2942" />
      ))}
    </svg>
  );
}
