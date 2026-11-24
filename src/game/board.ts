import type { Category } from '../data/cards';

export type HouseType = 'inicio' | 'normal' | 'pergunta' | 'alerta' | 'prevencao' | 'desafio' | 'saude' | 'chegada';

export interface House {
  n: number;
  type: HouseType;
}

export const FINISH = 20;

const SPECIAL: Record<number, HouseType> = {
  1: 'inicio',
  3: 'pergunta',
  5: 'alerta',
  7: 'prevencao',
  9: 'desafio',
  11: 'saude',
  14: 'alerta',
  16: 'pergunta',
  18: 'prevencao',
  19: 'desafio',
  20: 'chegada',
};

export const HOUSES: House[] = Array.from({ length: FINISH }, (_, i) => ({
  n: i + 1,
  type: SPECIAL[i + 1] ?? 'normal',
}));

export const houseType = (n: number): HouseType => SPECIAL[n] ?? 'normal';

export const HOUSE_INFO: Record<HouseType, { label: string; color: string; text: string; icon: string; rule: string }> = {
  inicio: { label: 'INÍCIO', color: '#2E7D32', text: '#FFFFFF', icon: '', rule: 'Todos começam aqui.' },
  normal: { label: '', color: '#FFFFFF', text: '#0F2942', icon: '', rule: '' },
  pergunta: { label: 'PERGUNTA', color: '#1565C0', text: '#FFFFFF', icon: '?', rule: 'Responda a uma pergunta extra.' },
  alerta: { label: 'ALERTA', color: '#F1C40F', text: '#0F2942', icon: '!', rule: 'Volte 1 casa e responda a uma carta de prevenção.' },
  prevencao: { label: 'PREVENÇÃO', color: '#2E7D32', text: '#FFFFFF', icon: '✓', rule: 'Avance 2 casas.' },
  desafio: { label: 'DESAFIO', color: '#7B1FA2', text: '#FFFFFF', icon: '★', rule: 'Resolva uma situação-problema.' },
  saude: { label: 'SAÚDE', color: '#E67E22', text: '#FFFFFF', icon: '+', rule: 'Responda sobre saúde e bem-estar no trabalho.' },
  chegada: { label: 'CHEGADA', color: '#0F2942', text: '#FFFFFF', icon: '🏁', rule: 'Chegou ou passou? Vitória!' },
};

/** Categorias de carta sorteadas em cada tipo de casa especial. */
export const HOUSE_CATEGORIES: Partial<Record<HouseType, Category[]>> = {
  pergunta: ['azul'],
  alerta: ['amarelo', 'verde'],
  desafio: ['roxo'],
  saude: ['laranja'],
};
