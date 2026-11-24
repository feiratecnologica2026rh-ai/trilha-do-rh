import { PAWN_COLORS, type PawnColor } from '../game/types';

export function Avatar({ name, photo, color, size = 40 }: { name: string; photo?: string | null; color: PawnColor; size?: number }) {
  const hex = PAWN_COLORS[color].hex;
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      {photo ? (
        <img
          src={photo}
          alt=""
          referrerPolicy="no-referrer"
          className="rounded-full object-cover w-full h-full"
          style={{ boxShadow: `0 0 0 3px ${hex}` }}
        />
      ) : (
        <div
          className="rounded-full w-full h-full grid place-items-center font-black"
          style={{ background: hex, color: color === 'amarelo' ? '#0F2942' : '#fff', fontSize: size * 0.42 }}
        >
          {name.trim().charAt(0).toUpperCase() || '?'}
        </div>
      )}
      <span
        className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white"
        style={{ width: size * 0.36, height: size * 0.36, background: hex }}
      />
    </div>
  );
}
