// Motor do jogo: funções puras que recebem o estado e devolvem o próximo estado.
// O mesmo motor roda no modo local (1 aparelho) e no modo online (via transação no Firebase).
import { CARDS, CARD_BY_ID, type Category } from '../data/cards';
import { FINISH, HOUSE_CATEGORIES, houseType } from './board';
import type { GameAction, GameState, MoveReason, MovingPhase, Player, PlayerSeed, Purpose } from './types';

export const TIMING = {
  /** tempo para responder cada carta */
  questionMs: 60_000,
  /** tempo para ler a explicação (o jogador da vez pode tocar em "Continuar" antes) */
  wrongFeedbackMs: 10_000,
  houseRightFeedbackMs: 10_000,
  awaitRollMs: 60_000,
  diceMs: 1_100,
  stepMs: 380,
  settleMs: 700,
};

/** Opções de duração da partida (minutos). 0 = sem limite de tempo. */
export const MATCH_MINUTES = [0, 5, 10, 15] as const;

const rand = (n: number) => Math.floor(Math.random() * n);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function questionDuration(_cardId: number): number {
  return TIMING.questionMs;
}

/** Sorteia uma carta sem repetir; quando o monte acaba, as cartas usadas voltam a ser embaralhadas. */
function drawCard(used: number[], categories?: Category[]): { cardId: number; used: number[] } {
  const inPool = (id: number) => !categories || categories.includes(CARD_BY_ID[id].category);
  let available = CARDS.filter((c) => inPool(c.id) && !used.includes(c.id));
  let nextUsed = used;
  if (available.length === 0) {
    nextUsed = used.filter((id) => !inPool(id));
    available = CARDS.filter((c) => inPool(c.id));
  }
  const cardId = available[rand(available.length)].id;
  return { cardId, used: [...nextUsed, cardId] };
}

function askQuestion(state: GameState, now: number, purpose: Purpose, categories?: Category[]): GameState {
  const { cardId, used } = drawCard(state.used, categories);
  const card = CARD_BY_ID[cardId];
  return {
    ...state,
    used,
    phase: {
      kind: 'question',
      purpose,
      cardId,
      order: shuffle(card.options.map((_, i) => i)),
      startedAt: now,
      deadline: now + questionDuration(cardId),
    },
  };
}

export function createGame(seeds: PlayerSeed[], now: number, minutes: number): GameState {
  const players: Player[] = seeds.map((s) => ({ ...s, photo: s.photo ?? null, pos: 1, correct: 0, answered: 0, points: 0 }));
  const base: GameState = {
    v: 1,
    players,
    turn: 0,
    turnCount: 1,
    phase: { kind: 'finished', winners: [], reason: 'chegada' },
    used: [],
    history: [],
    startedAt: now,
    endsAt: minutes > 0 ? now + minutes * 60_000 : null,
  };
  return askQuestion(base, now, 'turn');
}

export const currentPlayer = (s: GameState): Player => s.players[s.turn];

function updateCurrent(s: GameState, patch: Partial<Player>): GameState {
  return { ...s, players: s.players.map((p, i) => (i === s.turn ? { ...p, ...patch } : p)) };
}

function nextTurn(s: GameState, now: number): GameState {
  const next: GameState = { ...s, turn: (s.turn + 1) % s.players.length, turnCount: s.turnCount + 1 };
  return askQuestion(next, now, 'turn');
}

function finishByArrival(s: GameState): GameState {
  return { ...s, phase: { kind: 'finished', winners: [currentPlayer(s).id], reason: 'chegada' } };
}

/** Fim por tempo: vence quem estiver mais à frente; desempate por pontos. */
function finishByTime(s: GameState): GameState {
  const best = Math.max(...s.players.map((p) => p.pos));
  const leaders = s.players.filter((p) => p.pos === best);
  const bestPoints = Math.max(...leaders.map((p) => p.points ?? 0));
  const winners = leaders.filter((p) => (p.points ?? 0) === bestPoints).map((p) => p.id);
  return { ...s, phase: { kind: 'finished', winners, reason: 'tempo' } };
}

function startMove(
  s: GameState,
  now: number,
  delta: number,
  reason: MoveReason,
  then: MovingPhase['then'],
  banner: string | null,
  dice: number | null = null,
): GameState {
  const from = currentPlayer(s).pos;
  const to = Math.max(1, Math.min(FINISH, from + delta));
  const path: number[] = [];
  const dir = to > from ? 1 : -1;
  for (let p = from + dir; dir > 0 ? p <= to : p >= to; p += dir) path.push(p);
  const lead = dice !== null ? TIMING.diceMs : 250;
  const moved = updateCurrent(s, { pos: to });
  return {
    ...moved,
    phase: {
      kind: 'moving',
      reason,
      dice,
      from,
      path,
      startedAt: now,
      until: now + lead + path.length * TIMING.stepMs + TIMING.settleMs,
      then,
      banner,
    },
  };
}

/** Aplica o efeito da casa onde o peão parou. */
function land(s: GameState, now: number, phase: MovingPhase): GameState {
  const pos = currentPlayer(s).pos;
  if (pos >= FINISH) return finishByArrival(s);
  if (phase.then === 'endTurn') return nextTurn(s, now);
  if (phase.then === 'askAlerta') return askQuestion(s, now, 'house', HOUSE_CATEGORIES.alerta);

  const type = houseType(pos);
  const fromEffect = phase.reason === 'dice' || phase.reason === 'prevencao';
  if (type === 'prevencao' && phase.reason === 'dice') {
    return startMove(s, now, 2, 'prevencao', 'land', 'PREVENÇÃO! Avance 2 casas');
  }
  if (type === 'alerta' && fromEffect) {
    return startMove(s, now, -1, 'alerta', 'askAlerta', 'ALERTA! Volte 1 casa e responda');
  }
  if ((type === 'pergunta' || type === 'desafio' || type === 'saude') && fromEffect) {
    return askQuestion(s, now, 'house', HOUSE_CATEGORIES[type]);
  }
  return nextTurn(s, now);
}

/** Avança fases que dependem do tempo (timer da pergunta, feedback, animação). */
export function tick(s: GameState, now: number): GameState {
  const ph = s.phase;
  if (ph.kind === 'finished') return s;
  if (s.endsAt !== null && now >= s.endsAt) return finishByTime(s);

  switch (ph.kind) {
    case 'question':
      if (now >= ph.deadline) return resolveAnswer(s, now, null);
      return s;
    case 'feedback':
      if (now < ph.until) return s;
      if (ph.purpose === 'house' && ph.correct) {
        return startMove(s, now, 1, 'bonus', 'endTurn', 'Acertou! Avance 1 casa bônus');
      }
      return nextTurn(s, now);
    case 'awaitRoll':
      if (now >= ph.deadline) return roll(s, now);
      return s;
    case 'moving':
      if (now >= ph.until) return land(s, now, ph);
      return s;
  }
}

function resolveAnswer(s: GameState, now: number, choice: number | null): GameState {
  const ph = s.phase;
  if (ph.kind !== 'question') return s;
  const correct = choice === 0;
  const p = currentPlayer(s);
  const earned = correct ? CARD_BY_ID[ph.cardId].difficulty : 0;
  let next = updateCurrent(s, {
    answered: p.answered + 1,
    correct: p.correct + (correct ? 1 : 0),
    points: (p.points ?? 0) + earned,
  });
  next = { ...next, history: [...next.history, { cardId: ph.cardId, playerId: p.id, correct }] };

  if (ph.purpose === 'turn' && correct) {
    return {
      ...next,
      phase: { kind: 'awaitRoll', cardId: ph.cardId, order: ph.order, chosen: 0, deadline: now + TIMING.awaitRollMs },
    };
  }
  const wait = correct ? TIMING.houseRightFeedbackMs : TIMING.wrongFeedbackMs;
  return {
    ...next,
    phase: { kind: 'feedback', purpose: ph.purpose, cardId: ph.cardId, order: ph.order, chosen: choice, correct, until: now + wait },
  };
}

function roll(s: GameState, now: number): GameState {
  if (s.phase.kind !== 'awaitRoll') return s;
  const dice = 1 + rand(6);
  return startMove(s, now, dice, 'dice', 'land', null, dice);
}

export function reduce(s: GameState, action: GameAction, now: number): GameState {
  const ticked = tick(s, now);
  if (ticked !== s) return ticked; // o tempo venceu antes da ação chegar
  if (currentPlayer(s).id !== action.playerId) return s;
  if (action.type === 'answer' && s.phase.kind === 'question') return resolveAnswer(s, now, action.choice);
  if (action.type === 'roll' && s.phase.kind === 'awaitRoll') return roll(s, now);
  // "Continuar": encerra a leitura da explicação antes do tempo
  if (action.type === 'continue' && s.phase.kind === 'feedback') return tick({ ...s, phase: { ...s.phase, until: now } }, now);
  return s;
}

/** Posição exibida do peão (anima casa a casa durante o movimento). */
export function displayPos(s: GameState, playerIndex: number, now: number): number {
  const ph = s.phase;
  const p = s.players[playerIndex];
  if (ph.kind !== 'moving' || playerIndex !== s.turn) return p.pos;
  const lead = ph.dice !== null ? TIMING.diceMs : 250;
  const idx = Math.floor((now - ph.startedAt - lead) / TIMING.stepMs);
  if (idx < 0) return ph.from;
  return ph.path[Math.min(idx, ph.path.length - 1)];
}
