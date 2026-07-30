import type { TranscriptSegment } from "@/types/meeting";

export type RealtimeTranscriptEvent =
  | { type: "order"; itemId: string; previousItemId: string | null }
  | {
      type: "delta" | "completed";
      key: string;
      itemId: string;
      contentIndex: number;
      text: string;
    };

interface PendingTranscript {
  id: string;
  itemId: string;
  contentIndex: number;
  text: string;
  startedAtMs: number;
  order: number;
}

interface TranscriptItemOrder {
  previousItemId: string | null;
  explicit: boolean;
  observedOrder: number;
  startedAtMs: number;
}

interface TranscriptContentOrder {
  itemId: string;
  contentIndex: number;
  observedOrder: number;
}

export interface TranscriptState {
  segments: TranscriptSegment[];
  pending: Record<string, PendingTranscript>;
  itemOrder: Record<string, TranscriptItemOrder>;
  contentOrder: Record<string, TranscriptContentOrder>;
  nextOrder: number;
}

function safeElapsedMs(elapsedMs: number): number {
  return Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
}

function itemPrecedes(
  candidateItemId: string,
  itemId: string,
  itemOrder: TranscriptState["itemOrder"],
): boolean {
  const visited = new Set<string>();
  let currentItemId = itemId;

  while (!visited.has(currentItemId)) {
    visited.add(currentItemId);
    const previousItemId = itemOrder[currentItemId]?.previousItemId;
    if (!previousItemId) return false;
    if (previousItemId === candidateItemId) return true;
    currentItemId = previousItemId;
  }

  return false;
}

function compareContentKeys(aKey: string, bKey: string, state: TranscriptState): number {
  if (aKey === bKey) return 0;

  const aContent = state.contentOrder[aKey];
  const bContent = state.contentOrder[bKey];
  if (!aContent || !bContent) return aContent ? -1 : bContent ? 1 : 0;

  if (aContent.itemId === bContent.itemId) {
    return (
      aContent.contentIndex - bContent.contentIndex ||
      aContent.observedOrder - bContent.observedOrder
    );
  }

  if (itemPrecedes(aContent.itemId, bContent.itemId, state.itemOrder)) return -1;
  if (itemPrecedes(bContent.itemId, aContent.itemId, state.itemOrder)) return 1;

  const aItemOrder = state.itemOrder[aContent.itemId]?.observedOrder ?? aContent.observedOrder;
  const bItemOrder = state.itemOrder[bContent.itemId]?.observedOrder ?? bContent.observedOrder;
  return aItemOrder - bItemOrder || aContent.observedOrder - bContent.observedOrder;
}

function sortSegments(segments: TranscriptSegment[], state: TranscriptState): TranscriptSegment[] {
  const sorted = [...segments].sort((a, b) => compareContentKeys(a.id, b.id, state));
  return sorted.every((segment, index) => segment === segments[index]) ? segments : sorted;
}

function withSortedSegments(state: TranscriptState): TranscriptState {
  const segments = sortSegments(state.segments, state);
  return segments === state.segments ? state : { ...state, segments };
}

function registerContent(
  state: TranscriptState,
  event: Extract<RealtimeTranscriptEvent, { type: "delta" | "completed" }>,
  elapsedMs: number,
): TranscriptState {
  let nextOrder = state.nextOrder;
  let itemOrder = state.itemOrder;
  let contentOrder = state.contentOrder;
  const observedAtMs = safeElapsedMs(elapsedMs);

  if (!itemOrder[event.itemId]) {
    itemOrder = {
      ...itemOrder,
      [event.itemId]: {
        previousItemId: null,
        explicit: false,
        observedOrder: nextOrder,
        startedAtMs: observedAtMs,
      },
    };
    nextOrder += 1;
  }

  const existingContent = contentOrder[event.key];
  if (!existingContent) {
    contentOrder = {
      ...contentOrder,
      [event.key]: {
        itemId: event.itemId,
        contentIndex: event.contentIndex,
        observedOrder: nextOrder,
      },
    };
    nextOrder += 1;
  } else if (
    existingContent.itemId !== event.itemId ||
    existingContent.contentIndex !== event.contentIndex
  ) {
    contentOrder = {
      ...contentOrder,
      [event.key]: {
        ...existingContent,
        itemId: event.itemId,
        contentIndex: event.contentIndex,
      },
    };
  }

  if (
    itemOrder === state.itemOrder &&
    contentOrder === state.contentOrder &&
    nextOrder === state.nextOrder
  ) {
    return state;
  }

  return { ...state, itemOrder, contentOrder, nextOrder };
}

export function createTranscriptState(segments: TranscriptSegment[] = []): TranscriptState {
  const itemOrder: TranscriptState["itemOrder"] = {};
  const contentOrder: TranscriptState["contentOrder"] = {};

  segments.forEach((segment, index) => {
    const observedOrder = index * 2;
    itemOrder[segment.id] = {
      previousItemId: index === 0 ? null : segments[index - 1].id,
      explicit: true,
      observedOrder,
      startedAtMs: safeElapsedMs(segment.startedAtMs),
    };
    contentOrder[segment.id] = {
      itemId: segment.id,
      contentIndex: 0,
      observedOrder: observedOrder + 1,
    };
  });

  return {
    segments: [...segments],
    pending: {},
    itemOrder,
    contentOrder,
    nextOrder: segments.length * 2,
  };
}

export function reduceTranscriptEvent(
  state: TranscriptState,
  event: RealtimeTranscriptEvent,
  elapsedMs: number,
): TranscriptState {
  const itemId = event.itemId.trim();
  if (!itemId) return state;

  if (event.type === "order") {
    const previousItemId = event.previousItemId?.trim() || null;
    if (previousItemId === itemId) return state;

    const existing = state.itemOrder[itemId];
    if (existing?.explicit && existing.previousItemId === previousItemId) return state;

    const itemOrder = {
      ...state.itemOrder,
      [itemId]: existing
        ? { ...existing, previousItemId, explicit: true }
        : {
            previousItemId,
            explicit: true,
            observedOrder: state.nextOrder,
            startedAtMs: safeElapsedMs(elapsedMs),
          },
    };
    const nextState = {
      ...state,
      itemOrder,
      nextOrder: existing ? state.nextOrder : state.nextOrder + 1,
    };
    return withSortedSegments(nextState);
  }

  const key = event.key.trim();
  if (
    !key ||
    !Number.isInteger(event.contentIndex) ||
    event.contentIndex < 0
  ) {
    return state;
  }

  const normalizedEvent = { ...event, key, itemId };
  let nextState = registerContent(state, normalizedEvent, elapsedMs);
  const finalizedIndex = nextState.segments.findIndex((segment) => segment.id === key);
  if (finalizedIndex >= 0) {
    if (event.type === "delta" || !event.text.trim()) return withSortedSegments(nextState);

    const existing = nextState.segments[finalizedIndex];
    if (existing.text !== event.text.trim()) {
      const segments = [...nextState.segments];
      segments[finalizedIndex] = { ...existing, text: event.text.trim() };
      nextState = { ...nextState, segments };
    }
    return withSortedSegments(nextState);
  }

  const existingPending = nextState.pending[key];
  const contentMetadata = nextState.contentOrder[key];
  const pending: PendingTranscript = existingPending ?? {
    id: key,
    itemId,
    contentIndex: event.contentIndex,
    text: "",
    startedAtMs: nextState.itemOrder[itemId]?.startedAtMs ?? safeElapsedMs(elapsedMs),
    order: contentMetadata?.observedOrder ?? nextState.nextOrder,
  };

  if (event.type === "delta") {
    if (!event.text) return nextState;
    return {
      ...nextState,
      pending: {
        ...nextState.pending,
        [key]: { ...pending, text: `${pending.text}${event.text}` },
      },
    };
  }

  const finalText = event.text.trim() || pending.text.trim();
  if (!finalText) return nextState;

  const nextPending = { ...nextState.pending };
  delete nextPending[key];
  const nextSegment: TranscriptSegment = {
    id: key,
    text: finalText,
    startedAtMs: pending.startedAtMs,
    completed: true,
  };

  nextState = {
    ...nextState,
    segments: [...nextState.segments, nextSegment],
    pending: nextPending,
  };
  return withSortedSegments(nextState);
}

export function appendFinalTranscript(
  state: TranscriptState,
  text: string,
  elapsedMs: number,
  id = `chunk-${state.nextOrder}`,
): TranscriptState {
  return reduceTranscriptEvent(
    state,
    { type: "completed", key: id, itemId: id, contentIndex: 0, text },
    elapsedMs,
  );
}

export function getInterimTranscript(state: TranscriptState): string {
  return Object.values(state.pending)
    .sort((a, b) => compareContentKeys(a.id, b.id, state) || a.order - b.order)
    .map((item) => item.text)
    .join(" ")
    .trim();
}

export function transcriptText(segments: TranscriptSegment[]): string {
  return segments.map((segment) => segment.text.trim()).filter(Boolean).join("\n");
}
