/**
 * Leitner-box spaced repetition.
 *
 * A card starts in box 0. A correct answer moves it up one box and schedules
 * it after that box's interval; a miss drops it back to box 0 and makes it
 * due now. Simple, transparent, and good enough for a few hundred cards.
 */
export interface CardState {
  box: number;
  /** Epoch ms when the card is next due. */
  due: number;
  seen: number;
  lapses: number;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Interval in days after a correct answer lands the card in box N. */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const;
export const MAX_BOX = BOX_INTERVAL_DAYS.length - 1;
/** Box at or above which a card counts as "mastered" in progress views. */
export const MASTERED_BOX = 4;

export function review(
  state: CardState | undefined,
  known: boolean,
  now: number,
): CardState {
  const prev = state ?? { box: 0, due: now, seen: 0, lapses: 0 };
  if (known) {
    const box = Math.min(prev.box + 1, MAX_BOX);
    return {
      box,
      due: now + BOX_INTERVAL_DAYS[box] * DAY_MS,
      seen: prev.seen + 1,
      lapses: prev.lapses,
    };
  }
  return { box: 0, due: now, seen: prev.seen + 1, lapses: prev.lapses + 1 };
}

export function isDue(state: CardState | undefined, now: number): boolean {
  return state !== undefined && state.due <= now;
}

export function isNew(state: CardState | undefined): boolean {
  return state === undefined;
}

/**
 * Pick the cards for a session: everything due (longest overdue first),
 * then unseen cards in content order, up to `limit`.
 */
export function buildSession(
  cardIds: readonly string[],
  states: Record<string, CardState | undefined>,
  now: number,
  limit: number,
): string[] {
  const due = cardIds
    .filter((id) => isDue(states[id], now))
    .sort((a, b) => (states[a]?.due ?? 0) - (states[b]?.due ?? 0));
  const fresh = cardIds.filter((id) => isNew(states[id]));
  return [...due, ...fresh].slice(0, Math.max(0, limit));
}

export interface DeckSummary {
  total: number;
  due: number;
  fresh: number;
  mastered: number;
}

export function summarise(
  cardIds: readonly string[],
  states: Record<string, CardState | undefined>,
  now: number,
): DeckSummary {
  let due = 0;
  let fresh = 0;
  let mastered = 0;
  for (const id of cardIds) {
    const s = states[id];
    if (isNew(s)) fresh++;
    else if (isDue(s, now)) due++;
    if (s && s.box >= MASTERED_BOX) mastered++;
  }
  return { total: cardIds.length, due, fresh, mastered };
}
