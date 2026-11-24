export type PawnColor = 'azul' | 'laranja' | 'verde' | 'roxo' | 'amarelo' | 'marinho';

export const PAWN_COLORS: Record<PawnColor, { name: string; hex: string }> = {
  azul: { name: 'Azul', hex: '#1565C0' },
  laranja: { name: 'Laranja', hex: '#E67E22' },
  verde: { name: 'Verde', hex: '#2E7D32' },
  roxo: { name: 'Roxo', hex: '#7B1FA2' },
  amarelo: { name: 'Amarelo', hex: '#F1C40F' },
  marinho: { name: 'Marinho', hex: '#0F2942' },
};

export interface PlayerSeed {
  id: string;
  name: string;
  photo?: string | null;
  color: PawnColor;
}

export interface Player extends PlayerSeed {
  pos: number;
  correct: number;
  answered: number;
  /** pontos: 1 (fácil), 2 (médio) ou 3 (difícil) por carta acertada */
  points: number;
}

export interface HistoryItem {
  cardId: number;
  playerId: string;
  correct: boolean;
}

export type Purpose = 'turn' | 'house';

export interface QuestionPhase {
  kind: 'question';
  purpose: Purpose;
  cardId: number;
  /** ordem de exibição das alternativas (índices da carta) */
  order: number[];
  startedAt: number;
  deadline: number;
}

export interface FeedbackPhase {
  kind: 'feedback';
  purpose: Purpose;
  cardId: number;
  order: number[];
  /** índice da alternativa escolhida (na carta) ou null se o tempo acabou */
  chosen: number | null;
  correct: boolean;
  until: number;
}

export interface AwaitRollPhase {
  kind: 'awaitRoll';
  cardId: number;
  order: number[];
  chosen: number;
  deadline: number;
}

export type MoveReason = 'dice' | 'prevencao' | 'alerta' | 'bonus';

export interface MovingPhase {
  kind: 'moving';
  reason: MoveReason;
  dice: number | null;
  from: number;
  path: number[];
  startedAt: number;
  until: number;
  then: 'land' | 'askAlerta' | 'endTurn';
  banner: string | null;
}

export interface FinishedPhase {
  kind: 'finished';
  winners: string[];
  reason: 'chegada' | 'tempo';
}

export type Phase = QuestionPhase | FeedbackPhase | AwaitRollPhase | MovingPhase | FinishedPhase;

export interface GameState {
  v: 1;
  players: Player[];
  turn: number;
  turnCount: number;
  phase: Phase;
  used: number[];
  history: HistoryItem[];
  startedAt: number;
  endsAt: number | null;
}

export type GameAction =
  | { type: 'answer'; playerId: string; choice: number }
  | { type: 'roll'; playerId: string }
  | { type: 'continue'; playerId: string };
