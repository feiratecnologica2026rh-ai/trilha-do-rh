// Efeitos sonoros simples gerados pelo navegador (sem arquivos de áudio).
let ctx: AudioContext | null = null;
let muted = false;

try {
  muted = localStorage.getItem('trilha:mute') === '1';
} catch {
  /* ignora */
}

export const isMuted = () => muted;
export function setMuted(v: boolean) {
  muted = v;
  try {
    localStorage.setItem('trilha:mute', v ? '1' : '0');
  } catch {
    /* ignora */
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur);
}

export type Sfx = 'right' | 'wrong' | 'dice' | 'step' | 'turn' | 'win' | 'tick';

export function play(sfx: Sfx) {
  if (muted) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    return;
  }
  switch (sfx) {
    case 'right':
      tone(660, 0, 0.12); tone(880, 0.1, 0.18);
      navigator.vibrate?.(60);
      break;
    case 'wrong':
      tone(220, 0, 0.25, 'square', 0.06); tone(160, 0.18, 0.3, 'square', 0.06);
      navigator.vibrate?.([80, 60, 80]);
      break;
    case 'dice':
      for (let i = 0; i < 6; i++) tone(300 + Math.random() * 300, i * 0.12, 0.05, 'triangle', 0.08);
      break;
    case 'step':
      tone(520, 0, 0.06, 'triangle', 0.07);
      break;
    case 'turn':
      tone(523, 0, 0.1); tone(659, 0.1, 0.1); tone(784, 0.2, 0.15);
      navigator.vibrate?.(120);
      break;
    case 'win':
      [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.14, 0.25));
      navigator.vibrate?.([100, 50, 100, 50, 200]);
      break;
    case 'tick':
      tone(1000, 0, 0.03, 'square', 0.03);
      break;
  }
}
