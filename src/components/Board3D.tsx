import { useEffect, useRef } from 'react';
import { TrilhaScene, type SceneState } from '../three/TrilhaScene';

interface Props extends SceneState {
  lite: boolean;
}

/** Tabuleiro 3D (carregado sob demanda: o Three.js só baixa quando o 3D é usado). */
export default function Board3D({ lite, ...state }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const scene = useRef<TrilhaScene | null>(null);

  useEffect(() => {
    if (!box.current) return;
    const s = new TrilhaScene(box.current, { lite });
    scene.current = s;
    return () => {
      s.dispose();
      scene.current = null;
    };
    // a cena é criada uma vez; lite e estado chegam pelos efeitos abaixo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scene.current?.setLite(lite);
  }, [lite]);

  useEffect(() => {
    scene.current?.update(state);
  });

  return <div ref={box} className="absolute inset-0" aria-label="Tabuleiro 3D da Trilha do RH" role="img" />;
}
