"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { LandingView } from "@/components/landing-view";
import { MeetingWorkspace } from "@/components/meeting-workspace";
import { DeleteDialog, RenameDialog } from "@/components/session-dialogs";
import { StartMeetingDialog } from "@/components/start-meeting-dialog";
import { AudioCaptureError, captureAudio, type AudioCapture } from "@/lib/audio-capture";
import { DEMO_TRANSCRIPT, demoSummaryForSegmentCount } from "@/lib/demo-data";
import { downloadTextFile, meetingToMarkdown, sanitizeFilename } from "@/lib/export";
import { MeetingSummarySchema } from "@/lib/meeting-schema";
import { NearRealtimeTranscriber } from "@/lib/near-realtime";
import { RealtimeTranscriptionClient } from "@/lib/realtime-client";
import {
  deleteMeetingSession,
  loadMeetingSessions,
  renameMeetingSession,
  saveMeetingSessions,
  upsertMeetingSession,
} from "@/lib/storage";
import {
  buildIncrementalSummaryPayload,
  shouldAutoSummarize,
} from "@/lib/summary";
import {
  appendFinalTranscript,
  createTranscriptState,
  getInterimTranscript,
  reduceTranscriptEvent,
  transcriptText,
  type RealtimeTranscriptEvent,
  type TranscriptState,
} from "@/lib/transcript";
import type {
  ActionItem,
  AudioSource,
  Decision,
  MeetingSession,
  MeetingStatus,
} from "@/types/meeting";
import { EMPTY_SUMMARY } from "@/types/meeting";

interface MeetFlowAppProps {
  aiConfigured: boolean;
}

type ToastState = { id: number; message: string; type: "success" | "error" } | null;

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `meeting-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function MeetFlowApp({ aiConfigured }: MeetFlowAppProps) {
  const [view, setView] = useState<"landing" | "meeting">("landing");
  const [sessions, setSessions] = useState<MeetingSession[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [session, setSession] = useState<MeetingSession | null>(null);
  const [status, setStatus] = useState<MeetingStatus>("idle");
  const [interim, setInterim] = useState("");
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [startBusy, setStartBusy] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [renameTarget, setRenameTarget] = useState<MeetingSession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MeetingSession | null>(null);

  const sessionRef = useRef<MeetingSession | null>(null);
  const sessionsRef = useRef<MeetingSession[]>([]);
  const statusRef = useRef<MeetingStatus>("idle");
  const transcriptStateRef = useRef<TranscriptState>(createTranscriptState());
  const durationRef = useRef(0);
  const clockRef = useRef<number | null>(null);
  const demoCueIndexRef = useRef(0);
  const captureRef = useRef<AudioCapture | null>(null);
  const realtimeRef = useRef<RealtimeTranscriptionClient | null>(null);
  const nearRealtimeRef = useRef<NearRealtimeTranscriber | null>(null);
  const fallbackStartingRef = useRef(false);
  const endingRef = useRef(false);
  const summarizedThroughRef = useRef(0);
  const summaryInFlightRef = useRef(false);
  const summarySettledRef = useRef<Promise<void> | null>(null);
  const lastSummaryAtRef = useRef(0);
  const requestSummaryRef = useRef<(manual?: boolean) => Promise<void>>(async () => {});
  const toastTimerRef = useRef<number | null>(null);

  const setMeetingStatus = useCallback((next: MeetingStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const updateCurrentSession = useCallback(
    (updater: (current: MeetingSession) => MeetingSession) => {
      const current = sessionRef.current;
      if (!current) return;
      const next = updater(current);
      sessionRef.current = next;
      setSession(next);
    },
    [],
  );

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), message, type });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3_800);
  }, []);

  const persistSessions = useCallback(
    (next: MeetingSession[]) => {
      sessionsRef.current = next;
      setSessions(next);
      try {
        saveMeetingSessions(window.localStorage, next);
      } catch {
        showToast("Không thể lưu lịch sử. Bạn vẫn có thể export biên bản ngay bây giờ.", "error");
      }
    },
    [showToast],
  );

  const applyTranscriptEvent = useCallback(
    (event: RealtimeTranscriptEvent) => {
      const previous = transcriptStateRef.current;
      const next = reduceTranscriptEvent(
        previous,
        event,
        durationRef.current * 1_000,
      );
      transcriptStateRef.current = next;
      setInterim(getInterimTranscript(next));
      if (next.segments !== previous.segments) {
        updateCurrentSession((current) => ({ ...current, transcript: next.segments }));
      }
    },
    [updateCurrentSession],
  );

  const appendNearRealtimeTranscript = useCallback(
    (itemId: string, text: string) => {
      const next = appendFinalTranscript(
        transcriptStateRef.current,
        text,
        durationRef.current * 1_000,
        itemId,
      );
      transcriptStateRef.current = next;
      setInterim(getInterimTranscript(next));
      updateCurrentSession((current) => ({ ...current, transcript: next.segments }));
    },
    [updateCurrentSession],
  );

  const processDemoCues = useCallback(() => {
    const current = sessionRef.current;
    if (!current || current.mode !== "demo") return;
    while (
      demoCueIndexRef.current < DEMO_TRANSCRIPT.length &&
      DEMO_TRANSCRIPT[demoCueIndexRef.current].atMs <= durationRef.current * 1_000
    ) {
      const index = demoCueIndexRef.current;
      const cue = DEMO_TRANSCRIPT[index];
      demoCueIndexRef.current += 1;
      const next = appendFinalTranscript(
        transcriptStateRef.current,
        cue.text,
        cue.atMs,
        `demo-${index}`,
      );
      transcriptStateRef.current = next;
      setInterim("");
      updateCurrentSession((meeting) =>
        aiConfigured
          ? { ...meeting, transcript: next.segments }
          : {
              ...meeting,
              transcript: next.segments,
              summary: demoSummaryForSegmentCount(next.segments.length),
              summarySource: "mock",
            },
      );
    }
  }, [aiConfigured, updateCurrentSession]);

  const startClock = useCallback(() => {
    if (clockRef.current !== null) window.clearInterval(clockRef.current);
    clockRef.current = window.setInterval(() => {
      if (statusRef.current !== "recording") return;
      durationRef.current += 1;
      updateCurrentSession((current) => ({ ...current, durationSeconds: durationRef.current }));
      processDemoCues();
    }, 1_000);
  }, [processDemoCues, updateCurrentSession]);

  const activateFallback = useCallback(async () => {
    if (fallbackStartingRef.current || nearRealtimeRef.current || !captureRef.current) return;
    fallbackStartingRef.current = true;
    realtimeRef.current?.close();
    realtimeRef.current = null;

    try {
      let consecutiveErrors = 0;
      const transcriber = new NearRealtimeTranscriber({
        stream: captureRef.current.stream,
        meetingId: sessionRef.current?.id,
        onCompleted: ({ itemId, text }) => {
          consecutiveErrors = 0;
          appendNearRealtimeTranscript(itemId, text);
        },
        onError: (error) => {
          consecutiveErrors += 1;
          if (consecutiveErrors < 2) {
            showToast(error.message, "error");
            return;
          }
          transcriber.close();
          captureRef.current?.setEnabled(false);
          setMeetingStatus("error");
          showToast(
            "Near real-time đã dừng sau nhiều lỗi liên tiếp. Hãy kết thúc để lưu phần đã ghi nhận.",
            "error",
          );
        },
      });
      nearRealtimeRef.current = transcriber;
      transcriber.start();
      updateCurrentSession((current) => ({ ...current, mode: "near-realtime" }));
      setMeetingStatus("recording");
      showToast("Realtime không khả dụng. Đã chuyển sang Near real-time mode.", "error");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể khởi động transcription fallback.";
      setMeetingStatus("error");
      showToast(message, "error");
    } finally {
      fallbackStartingRef.current = false;
    }
  }, [appendNearRealtimeTranscript, setMeetingStatus, showToast, updateCurrentSession]);

  const stopResources = useCallback(async (flushFallback: boolean) => {
    realtimeRef.current?.close();
    realtimeRef.current = null;

    const nearRealtime = nearRealtimeRef.current;
    nearRealtimeRef.current = null;
    if (nearRealtime) {
      if (flushFallback) {
        try {
          await nearRealtime.stop();
        } catch {
          nearRealtime.close();
        }
      } else {
        nearRealtime.close();
      }
    }

    const capture = captureRef.current;
    captureRef.current = null;
    if (capture) await capture.stop();
  }, []);

  const endMeeting = useCallback(
    async (message = "Cuộc họp đã kết thúc và được lưu trên trình duyệt này.") => {
      if (endingRef.current || !sessionRef.current) return;
      endingRef.current = true;
      setMeetingStatus("ended");
      if (clockRef.current !== null) {
        window.clearInterval(clockRef.current);
        clockRef.current = null;
      }
      await stopResources(true);
      const activeSummary = summarySettledRef.current;
      if (activeSummary) await activeSummary;
      const pendingSession = sessionRef.current;
      if (
        pendingSession &&
        buildIncrementalSummaryPayload(pendingSession, summarizedThroughRef.current)
      ) {
        await requestSummaryRef.current(false);
      }
      const current = sessionRef.current;
      if (current) {
        const finalized = {
          ...current,
          endedAt: current.endedAt ?? new Date().toISOString(),
          durationSeconds: durationRef.current,
        };
        sessionRef.current = finalized;
        setSession(finalized);
        if (historyReady) {
          persistSessions(upsertMeetingSession(sessionsRef.current, finalized));
        }
      }
      showToast(message);
      endingRef.current = false;
    },
    [historyReady, persistSessions, setMeetingStatus, showToast, stopResources],
  );

  const startMeeting = useCallback(
    async ({ title, source, demo }: { title: string; source: AudioSource; demo: boolean }) => {
      setStartError(null);
      if (!demo && !aiConfigured) {
        setStartError("Cần cấu hình OPENAI_API_KEY ở server để dùng transcription thật.");
        return;
      }

      setStartBusy(true);
      endingRef.current = false;
      summarizedThroughRef.current = 0;
      lastSummaryAtRef.current = Date.now();
      summaryInFlightRef.current = false;
      summarySettledRef.current = null;
      durationRef.current = 0;
      demoCueIndexRef.current = 0;
      transcriptStateRef.current = createTranscriptState();
      setInterim("");

      const startedAt = new Date().toISOString();
      const nextSession: MeetingSession = {
        id: createSessionId(),
        title: title.trim() || "Cuộc họp mới",
        startedAt,
        endedAt: null,
        durationSeconds: 0,
        transcript: [],
        summary: { ...EMPTY_SUMMARY },
        summarySource: "none",
        mode: demo ? "demo" : "realtime",
        audioSource: demo ? null : source,
      };

      if (demo) {
        sessionRef.current = nextSession;
        setSession(nextSession);
        setView("meeting");
        setStartDialogOpen(false);
        setMeetingStatus("recording");
        startClock();
        setStartBusy(false);
        showToast("Đang phát dữ liệu mô phỏng — không sử dụng microphone.");
        return;
      }

      try {
        const capture = await captureAudio(source, {
          onUnexpectedEnd: () => {
            void endMeeting("Nguồn chia sẻ đã dừng. Phiên hiện tại đã được lưu an toàn.");
          },
        });
        captureRef.current = capture;
        sessionRef.current = nextSession;
        setSession(nextSession);
        setView("meeting");
        setStartDialogOpen(false);
        setMeetingStatus("connecting");
        startClock();

        let initialConnectionComplete = false;
        const realtime = new RealtimeTranscriptionClient({
          stream: capture.stream,
          onOrder: ({ itemId, previousItemId }) =>
            applyTranscriptEvent({ type: "order", itemId, previousItemId }),
          onDelta: ({ key, itemId, contentIndex, text }) =>
            applyTranscriptEvent({ type: "delta", key, itemId, contentIndex, text }),
          onCompleted: ({ key, itemId, contentIndex, text }) =>
            applyTranscriptEvent({ type: "completed", key, itemId, contentIndex, text }),
          onConnection: (connection) => {
            if (connection === "connected") setMeetingStatus("recording");
            if (connection === "disconnected" && initialConnectionComplete) {
              showToast("Kết nối Realtime bị gián đoạn. Đang chuyển sang fallback…", "error");
              void activateFallback();
            }
          },
          onError: (error) => {
            if (initialConnectionComplete) void activateFallback();
            else setStartError(error.message);
          },
        });
        realtimeRef.current = realtime;
        try {
          await realtime.connect();
          initialConnectionComplete = true;
          setMeetingStatus("recording");
        } catch {
          realtime.close();
          realtimeRef.current = null;
          await activateFallback();
        }
      } catch (error) {
        const message =
          error instanceof AudioCaptureError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Không thể bắt đầu cuộc họp.";
        setStartError(message);
        setView("landing");
        setMeetingStatus("error");
        await stopResources(false);
      } finally {
        setStartBusy(false);
      }
    },
    [
      activateFallback,
      aiConfigured,
      applyTranscriptEvent,
      endMeeting,
      setMeetingStatus,
      showToast,
      startClock,
      stopResources,
    ],
  );

  const requestSummary = useCallback(
    async (manual = false) => {
      const current = sessionRef.current;
      if (!current || summaryInFlightRef.current) return;
      const payload = buildIncrementalSummaryPayload(
        current,
        summarizedThroughRef.current,
        new Date().toISOString(),
      );
      if (!payload) {
        if (manual) showToast("Chưa có transcript mới để cập nhật.", "error");
        return;
      }

      summaryInFlightRef.current = true;
      let resolveSettled: () => void = () => {};
      const settled = new Promise<void>((resolve) => {
        resolveSettled = resolve;
      });
      summarySettledRef.current = settled;
      setSummaryLoading(true);
      try {
        if (!aiConfigured) {
          if (current.mode !== "demo") throw new Error("AI chưa được cấu hình.");
          const mock = demoSummaryForSegmentCount(current.transcript.length);
          updateCurrentSession((meeting) => ({ ...meeting, summary: mock, summarySource: "mock" }));
          summarizedThroughRef.current = current.transcript.length;
          lastSummaryAtRef.current = Date.now();
          showToast("Đã cập nhật Mock summary từ dữ liệu mô phỏng.");
          return;
        }

        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
          signal: AbortSignal.timeout(30_000),
        });
        const data: unknown = await response.json();
        if (!response.ok) {
          const safeMessage =
            typeof data === "object" && data && "message" in data && typeof data.message === "string"
              ? data.message
              : typeof data === "object" && data && "error" in data && typeof data.error === "string"
                ? data.error
                : "Không thể cập nhật tóm tắt lúc này.";
          throw new Error(safeMessage);
        }
        const parsed = MeetingSummarySchema.safeParse(data);
        if (!parsed.success) throw new Error("Phản hồi tóm tắt không đúng định dạng.");

        updateCurrentSession((meeting) => ({
          ...meeting,
          summary: parsed.data,
          summarySource: "ai",
        }));
        summarizedThroughRef.current = current.transcript.length;
        lastSummaryAtRef.current = Date.now();
        showToast("Biên bản AI đã được cập nhật.");
      } catch (error) {
        if (current.mode === "demo") {
          const mock = demoSummaryForSegmentCount(current.transcript.length);
          updateCurrentSession((meeting) => ({ ...meeting, summary: mock, summarySource: "mock" }));
          summarizedThroughRef.current = current.transcript.length;
          lastSummaryAtRef.current = Date.now();
          showToast("AI tạm thời không khả dụng; đang hiển thị Mock summary.", "error");
        } else {
          showToast(
            error instanceof Error ? error.message : "Không thể cập nhật biên bản.",
            "error",
          );
        }
      } finally {
        lastSummaryAtRef.current = Date.now();
        summaryInFlightRef.current = false;
        resolveSettled();
        if (summarySettledRef.current === settled) summarySettledRef.current = null;
        setSummaryLoading(false);
      }
    },
    [aiConfigured, showToast, updateCurrentSession],
  );

  const pauseMeeting = useCallback(() => {
    if (statusRef.current !== "recording") return;
    captureRef.current?.setEnabled(false);
    realtimeRef.current?.pause();
    nearRealtimeRef.current?.pause();
    setMeetingStatus("paused");
    showToast("Đã tạm dừng ghi nhận.");
  }, [setMeetingStatus, showToast]);

  const resumeMeeting = useCallback(() => {
    if (statusRef.current !== "paused") return;
    captureRef.current?.setEnabled(true);
    realtimeRef.current?.resume();
    nearRealtimeRef.current?.resume();
    setMeetingStatus("recording");
    showToast("Đã tiếp tục ghi nhận.");
  }, [setMeetingStatus, showToast]);

  const copyText = useCallback(
    async (text: string, successMessage: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(successMessage);
      } catch {
        showToast("Trình duyệt không cho phép copy tự động.", "error");
      }
    },
    [showToast],
  );

  const backToLanding = useCallback(async () => {
    if (endingRef.current) return;
    if (sessionRef.current && statusRef.current !== "ended") await endMeeting();
    await stopResources(false);
    setView("landing");
    setSession(null);
    sessionRef.current = null;
    transcriptStateRef.current = createTranscriptState();
    setInterim("");
  }, [endMeeting, stopResources]);

  const openHistorySession = useCallback((meeting: MeetingSession) => {
    const copy = structuredClone(meeting);
    sessionRef.current = copy;
    setSession(copy);
    transcriptStateRef.current = createTranscriptState(copy.transcript);
    durationRef.current = copy.durationSeconds;
    summarizedThroughRef.current = copy.transcript.length;
    setInterim("");
    setMeetingStatus("ended");
    setView("meeting");
  }, [setMeetingStatus]);

  const updateDecision = useCallback(
    (index: number, decision: Decision) => {
      updateCurrentSession((current) => {
        const decisions = [...current.summary.decisions];
        decisions[index] = decision;
        return { ...current, summary: { ...current.summary, decisions } };
      });
    },
    [updateCurrentSession],
  );

  const deleteDecision = useCallback(
    (index: number) => {
      updateCurrentSession((current) => ({
        ...current,
        summary: {
          ...current.summary,
          decisions: current.summary.decisions.filter((_, itemIndex) => itemIndex !== index),
        },
      }));
      showToast("Đã xóa quyết định khỏi biên bản.");
    },
    [showToast, updateCurrentSession],
  );

  const updateActionItem = useCallback(
    (index: number, item: ActionItem) => {
      updateCurrentSession((current) => {
        const actionItems = [...current.summary.actionItems];
        actionItems[index] = item;
        return { ...current, summary: { ...current.summary, actionItems } };
      });
    },
    [updateCurrentSession],
  );

  const deleteActionItem = useCallback(
    (index: number) => {
      updateCurrentSession((current) => ({
        ...current,
        summary: {
          ...current.summary,
          actionItems: current.summary.actionItems.filter((_, itemIndex) => itemIndex !== index),
        },
      }));
      showToast("Đã xóa action item khỏi biên bản.");
    },
    [showToast, updateCurrentSession],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedTheme = window.localStorage.getItem("meetflow.theme");
      const shouldUseDark =
        storedTheme === "dark" ||
        (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDarkMode(shouldUseDark);
      document.documentElement.classList.toggle("dark", shouldUseDark);

      const storedSessions = loadMeetingSessions(window.localStorage);
      sessionsRef.current = storedSessions;
      setSessions(storedSessions);
      setHistoryReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    requestSummaryRef.current = requestSummary;
  }, [requestSummary]);

  useEffect(() => {
    sessionRef.current = session;
    if (!session || !historyReady) return;
    const timer = window.setTimeout(() => {
      const next = upsertMeetingSession(sessionsRef.current, session);
      persistSessions(next);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [historyReady, persistSessions, session]);

  useEffect(() => {
    const scheduler = window.setInterval(() => {
      const current = sessionRef.current;
      if (!current || statusRef.current !== "recording" || summaryInFlightRef.current) return;
      const payload = buildIncrementalSummaryPayload(current, summarizedThroughRef.current);
      if (
        payload &&
        shouldAutoSummarize({
          newTranscript: payload.newTranscript,
          millisecondsSinceLastRequest: Date.now() - lastSummaryAtRef.current,
          requestInFlight: summaryInFlightRef.current,
        })
      ) {
        void requestSummaryRef.current(false);
      }
    }, 5_000);
    return () => window.clearInterval(scheduler);
  }, []);

  useEffect(() => {
    return () => {
      if (clockRef.current !== null) window.clearInterval(clockRef.current);
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      realtimeRef.current?.close();
      nearRealtimeRef.current?.close();
      void captureRef.current?.stop();
    };
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("meetflow.theme", next ? "dark" : "light");
  };

  const runDemo = () => {
    void startMeeting({
      title: "Họp phân công dự án hackathon",
      source: "microphone",
      demo: true,
    });
  };

  const confirmRename = (title: string) => {
    if (!renameTarget) return;
    const next = renameMeetingSession(sessionsRef.current, renameTarget.id, title);
    persistSessions(next);
    setRenameTarget(null);
    showToast("Đã đổi tên phiên họp.");
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const next = deleteMeetingSession(sessionsRef.current, deleteTarget.id);
    persistSessions(next);
    setDeleteTarget(null);
    showToast("Đã xóa phiên họp.");
  };

  const exportMarkdown = () => {
    if (!sessionRef.current) return;
    downloadTextFile(
      `${sanitizeFilename(sessionRef.current.title)}.md`,
      meetingToMarkdown(sessionRef.current),
      "text/markdown",
    );
    showToast("Đã tạo file Markdown.");
  };

  const exportJson = () => {
    if (!sessionRef.current) return;
    downloadTextFile(
      `${sanitizeFilename(sessionRef.current.title)}.json`,
      JSON.stringify(sessionRef.current, null, 2),
      "application/json",
    );
    showToast("Đã tạo file JSON.");
  };

  return (
    <>
      {view === "landing" || !session ? (
        <LandingView
          aiConfigured={aiConfigured}
          darkMode={darkMode}
          historyReady={historyReady}
          onDeleteSession={setDeleteTarget}
          onDemo={runDemo}
          onOpenSession={openHistorySession}
          onRenameSession={setRenameTarget}
          onStart={() => {
            setStartError(null);
            setStartDialogOpen(true);
          }}
          onToggleTheme={toggleTheme}
          sessions={sessions}
        />
      ) : (
        <MeetingWorkspace
          interim={interim}
          onBack={() => void backToLanding()}
          onCopyMinutes={() => void copyText(meetingToMarkdown(session), "Đã copy biên bản.")}
          onCopyTranscript={() =>
            void copyText(transcriptText(session.transcript), "Đã copy transcript.")
          }
          onDeleteActionItem={deleteActionItem}
          onDeleteDecision={deleteDecision}
          onEnd={() => void endMeeting()}
          onExportJson={exportJson}
          onExportMarkdown={exportMarkdown}
          onPause={pauseMeeting}
          onRefreshSummary={() => void requestSummary(true)}
          onResume={resumeMeeting}
          onUpdateActionItem={updateActionItem}
          onUpdateDecision={updateDecision}
          session={session}
          status={status}
          summaryLoading={summaryLoading}
        />
      )}

      <StartMeetingDialog
        aiConfigured={aiConfigured}
        busy={startBusy}
        error={startError}
        onClose={() => !startBusy && setStartDialogOpen(false)}
        onStart={(config) => void startMeeting(config)}
        open={startDialogOpen}
      />
      <RenameDialog onClose={() => setRenameTarget(null)} onConfirm={confirmRename} session={renameTarget} />
      <DeleteDialog onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} session={deleteTarget} />

      <div aria-live="polite" className="toast-region">
        {toast && (
          <div className={`toast${toast.type === "error" ? " toast--error" : ""}`} key={toast.id}>
            {toast.type === "error" ? <AlertTriangle size={17} /> : <CheckCircle2 size={17} />}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </>
  );
}
