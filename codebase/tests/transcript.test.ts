import { describe, expect, it } from "vitest";

import {
  createTranscriptState,
  getInterimTranscript,
  reduceTranscriptEvent,
} from "@/lib/transcript";

describe("transcript reducer", () => {
  it("merges deltas and replaces them with one completed segment", () => {
    let state = createTranscriptState();
    state = reduceTranscriptEvent(
      state,
      { type: "delta", key: "item-1:0", itemId: "item-1", contentIndex: 0, text: "Xin " },
      500,
    );
    state = reduceTranscriptEvent(
      state,
      { type: "delta", key: "item-1:0", itemId: "item-1", contentIndex: 0, text: "chào" },
      700,
    );

    expect(getInterimTranscript(state)).toBe("Xin chào");
    expect(state.segments).toHaveLength(0);

    state = reduceTranscriptEvent(
      state,
      {
        type: "completed",
        key: "item-1:0",
        itemId: "item-1",
        contentIndex: 0,
        text: "Xin chào cả nhóm.",
      },
      1_100,
    );
    expect(getInterimTranscript(state)).toBe("");
    expect(state.segments).toEqual([
      { id: "item-1:0", text: "Xin chào cả nhóm.", startedAtMs: 500, completed: true },
    ]);
  });

  it("does not duplicate repeated completed events", () => {
    let state = createTranscriptState();
    const completed = {
      type: "completed" as const,
      key: "item-7:0",
      itemId: "item-7",
      contentIndex: 0,
      text: "Đã chốt deadline.",
    };
    state = reduceTranscriptEvent(state, completed, 2_000);
    state = reduceTranscriptEvent(state, completed, 2_100);
    expect(state.segments).toHaveLength(1);
  });

  it("uses committed A→B order when completed events arrive B→A", () => {
    let state = createTranscriptState();
    state = reduceTranscriptEvent(
      state,
      { type: "order", itemId: "a", previousItemId: null },
      100,
    );
    state = reduceTranscriptEvent(
      state,
      { type: "order", itemId: "b", previousItemId: "a" },
      200,
    );
    state = reduceTranscriptEvent(
      state,
      { type: "completed", key: "b:0", itemId: "b", contentIndex: 0, text: "B hoàn tất" },
      600,
    );
    state = reduceTranscriptEvent(
      state,
      { type: "completed", key: "a:0", itemId: "a", contentIndex: 0, text: "A hoàn tất" },
      800,
    );

    expect(state.segments.map((segment) => segment.id)).toEqual(["a:0", "b:0"]);
    expect(state.segments.map((segment) => segment.text)).toEqual(["A hoàn tất", "B hoàn tất"]);
    expect(state.segments.map((segment) => segment.startedAtMs)).toEqual([100, 200]);
  });
});
