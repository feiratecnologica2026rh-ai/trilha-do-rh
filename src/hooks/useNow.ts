import { useEffect, useState } from 'react';

/** Relógio que re-renderiza o componente a cada `ms` milissegundos. */
export function useNow(clock: () => number, ms = 100): number {
  const [now, setNow] = useState(clock);
  useEffect(() => {
    const id = window.setInterval(() => setNow(clock()), ms);
    return () => window.clearInterval(id);
  }, [clock, ms]);
  return now;
}
