// Ranking de jogadores.
// Com Firebase configurado, o ranking é compartilhado (todos os aparelhos da feira veem o mesmo).
// Sem Firebase (ou sem internet), fica salvo neste aparelho.
import { signInAnonymously } from 'firebase/auth';
import { get, limitToLast, orderByChild, push, query, ref, set } from 'firebase/database';
import { auth, db } from './firebase';
import type { GameState } from '../game/types';

export type RankMode = 'solo' | 'grupo';

/**
 * Ranking compartilhado pelo Firebase. Desligado enquanto o projeto Firebase está fora do ar:
 * o ranking fica salvo neste aparelho. Para religar, troque para `firebaseReady`.
 */
const SHARED = false;

export interface RankEntry {
  name: string;
  /** pontos das cartas + bônus de chegada */
  points: number;
  correct: number;
  answered: number;
  mode: RankMode;
  at: number;
  /** tempo médio por resposta (ms) */
  avgMs?: number;
  /** chegou à casa 20 */
  finished?: boolean;
}

const LOCAL_KEY = 'trilha:ranking';
const MAX_LOCAL = 500;

function readLocal(): RankEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as RankEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries: RankEntry[]) {
  try {
    const all = [...readLocal(), ...entries].sort((a, b) => b.points - a.points).slice(0, MAX_LOCAL);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  } catch {
    /* sem armazenamento: ignora */
  }
}

export function entriesFromGame(game: GameState, onlyPlayerId?: string): RankEntry[] {
  const mode: RankMode = game.players.length === 1 ? 'solo' : 'grupo';
  return game.players
    .filter((p) => !onlyPlayerId || p.id === onlyPlayerId)
    .map((p) => ({
      name: p.name.slice(0, 40),
      points: p.points ?? 0,
      correct: p.correct,
      answered: p.answered,
      mode,
      at: Date.now(),
      avgMs: p.answered > 0 ? Math.round((p.answerMs ?? 0) / p.answered) : 0,
      finished: !!p.finished,
    }));
}

/** Salva o resultado da partida no ranking (uma vez por partida, controlado por `key`). */
export async function saveResults(key: string, entries: RankEntry[]) {
  try {
    const savedKey = `trilha:saved:${key}`;
    if (localStorage.getItem(savedKey)) return;
    localStorage.setItem(savedKey, '1');
  } catch {
    /* segue mesmo sem armazenamento */
  }
  if (SHARED && db && auth) {
    try {
      await withTimeout(
        (async () => {
          if (!auth!.currentUser) await signInAnonymously(auth!);
          const uid = auth!.currentUser!.uid;
          await Promise.all(entries.map((e) => set(push(ref(db!, 'ranking')), { ...e, uid })));
        })(),
        8000,
      );
      return;
    } catch {
      /* sem internet ou banco fora do ar: guarda neste aparelho */
    }
  }
  writeLocal(entries);
}

/** Desiste de esperar o Firebase depois de `ms` (sem internet ele pode nunca responder). */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => (clearTimeout(id), resolve(v)),
      (e) => (clearTimeout(id), reject(e)),
    );
  });
}

/** Remove repetidos (um resultado pode estar no Firebase e neste aparelho). */
function unique(list: RankEntry[]) {
  const seen = new Set<string>();
  return list.filter((e) => {
    const k = `${e.name}|${e.at}|${e.points}|${e.mode}`;
    return seen.has(k) ? false : (seen.add(k), true);
  });
}

export async function loadRanking(): Promise<{ entries: RankEntry[]; shared: boolean }> {
  if (SHARED && db) {
    try {
      const snap = await withTimeout(get(query(ref(db, 'ranking'), orderByChild('points'), limitToLast(500))), 6000);
      const entries: RankEntry[] = [];
      snap.forEach((child) => {
        const { uid: _uid, ...e } = child.val() as RankEntry & { uid?: string };
        entries.push(e);
      });
      return { entries: unique([...entries, ...readLocal()]), shared: true };
    } catch {
      /* cai para o ranking local */
    }
  }
  return { entries: unique(readLocal()), shared: false };
}

// ---------- critérios de classificação e desempate (nesta ordem) ----------
const avg = (e: RankEntry) => (e.answered > 0 && e.avgMs ? e.avgMs : Number.POSITIVE_INFINITY);
const secs = (ms: number) => (Number.isFinite(ms) ? `${(ms / 1000).toFixed(1).replace('.', ',')} s` : '—');
const hour = (t: number) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export interface Criterion {
  id: string;
  label: string;
  /** frase curta usada na explicação ("ficou à frente por …") */
  why: string;
  /** regra explicada na tela de ranking */
  rule: string;
  /** < 0 quando `a` fica à frente de `b` */
  cmp: (a: RankEntry, b: RankEntry) => number;
  show: (e: RankEntry) => string;
}

export const CRITERIA: Criterion[] = [
  { id: 'points', label: 'Pontos', why: 'ter mais pontos', rule: 'quem tiver mais pontos (cartas certas + 10 se chegou ao final)', cmp: (a, b) => b.points - a.points, show: (e) => `${e.points} pts${e.finished ? ' (inclui +10 da chegada)' : ''}` },
  { id: 'correct', label: 'Cartas certas', why: 'ter acertado mais cartas', rule: 'empatou nos pontos? Fica à frente quem acertou mais cartas', cmp: (a, b) => b.correct - a.correct, show: (e) => `${e.correct} de ${e.answered}` },
  { id: 'speed', label: 'Tempo médio por resposta', why: 'ter respondido mais rápido', rule: 'ainda empatado? Fica à frente quem respondeu mais rápido (menor tempo médio por carta)', cmp: (a, b) => avg(a) - avg(b) || 0, show: (e) => secs(avg(e)) },
  { id: 'finished', label: 'Chegou ao final', why: 'ter chegado à CHEGADA', rule: 'ainda empatado? Fica à frente quem chegou à casa 20', cmp: (a, b) => Number(!!b.finished) - Number(!!a.finished), show: (e) => (e.finished ? 'Sim' : 'Não') },
  { id: 'at', label: 'Horário da partida', why: 'ter jogado primeiro', rule: 'por último: fica à frente quem jogou primeiro', cmp: (a, b) => a.at - b.at, show: (e) => hour(e.at) },
];

/** Ordena pelos critérios: pontos → acertos → mais rápido → chegou ao final → jogou primeiro. */
export const compareRank = (a: RankEntry, b: RankEntry) => {
  for (const c of CRITERIA) {
    const d = c.cmp(a, b);
    if (d) return d;
  }
  return 0;
};

/** Explica por que `a` ficou à frente de `b` (critério decisivo e os que empataram antes dele). */
export function explain(a: RankEntry, b: RankEntry) {
  const tied: Criterion[] = [];
  for (const c of CRITERIA) {
    if (c.cmp(a, b) === 0) {
      tied.push(c);
      continue;
    }
    return { decisive: c, tied };
  }
  return { decisive: null, tied };
}
