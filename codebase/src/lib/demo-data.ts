import type { MeetingSummary } from "@/types/meeting";

export interface DemoTranscriptCue {
  atMs: number;
  text: string;
}

export const DEMO_TRANSCRIPT: DemoTranscriptCue[] = [
  {
    atMs: 800,
    text: "Minh: Mình chốt dùng Next.js App Router cho bản demo vì cả nhóm đã quen TypeScript.",
  },
  {
    atMs: 3_600,
    text: "Lan: Mình nhận phần frontend, gồm landing page và meeting workspace.",
  },
  {
    atMs: 6_800,
    text: "Huy: Mình phụ trách tích hợp OpenAI Realtime và kiểm tra fallback MediaRecorder.",
  },
  {
    atMs: 10_000,
    text: "Minh: Deadline cho bản demo chạy được là 18 giờ thứ Sáu tuần này.",
  },
  {
    atMs: 13_400,
    text: "Lan: Hay là mình lưu luôn file audio để xem lại? Đây mới là đề xuất, chưa cần chốt.",
  },
  {
    atMs: 17_000,
    text: "Minh: Không lưu audio. Nhóm thống nhất chỉ lưu transcript và biên bản trong trình duyệt để bảo vệ riêng tư.",
  },
  {
    atMs: 20_500,
    text: "Huy: Còn một câu hỏi mở: nếu Realtime mất kết nối giữa cuộc họp thì mình tự chuyển fallback hay hỏi người dùng?",
  },
  {
    atMs: 24_000,
    text: "Lan: Mình sẽ hoàn thiện responsive và gửi link preview trước 16 giờ thứ Sáu để cả nhóm dry run.",
  },
];

const EARLY_SUMMARY: MeetingSummary = {
  summary: "Nhóm đã chọn stack cho bản demo và bắt đầu phân công hai hạng mục chính.",
  keyPoints: ["Sử dụng Next.js App Router và TypeScript cho prototype."],
  decisions: [
    {
      content: "Dùng Next.js App Router cho bản demo.",
      evidence: "Mình chốt dùng Next.js App Router cho bản demo.",
    },
  ],
  actionItems: [
    {
      task: "Xây landing page và meeting workspace.",
      owner: "Lan",
      deadline: null,
      status: "todo",
    },
    {
      task: "Tích hợp OpenAI Realtime và kiểm tra fallback MediaRecorder.",
      owner: "Huy",
      deadline: null,
      status: "todo",
    },
  ],
  openQuestions: [],
};

export const DEMO_SUMMARY: MeetingSummary = {
  summary:
    "Nhóm thống nhất stack Next.js, phân công frontend và AI integration, đặt hạn hoàn thành bản demo, đồng thời chọn không lưu audio để bảo vệ riêng tư.",
  keyPoints: [
    "Prototype dùng Next.js App Router và TypeScript.",
    "Realtime transcription có fallback MediaRecorder.",
    "Dữ liệu phiên họp chỉ được lưu trên trình duyệt.",
  ],
  decisions: [
    {
      content: "Dùng Next.js App Router cho bản demo.",
      evidence: "Mình chốt dùng Next.js App Router cho bản demo.",
    },
    {
      content: "Không lưu audio; chỉ lưu transcript và biên bản trong trình duyệt.",
      evidence: "Nhóm thống nhất chỉ lưu transcript và biên bản trong trình duyệt.",
    },
  ],
  actionItems: [
    {
      task: "Hoàn thiện landing page, meeting workspace và responsive.",
      owner: "Lan",
      deadline: "Trước 16 giờ thứ Sáu",
      status: "todo",
    },
    {
      task: "Tích hợp OpenAI Realtime và kiểm tra fallback MediaRecorder.",
      owner: "Huy",
      deadline: "18 giờ thứ Sáu tuần này",
      status: "todo",
    },
  ],
  openQuestions: [
    "Khi Realtime mất kết nối giữa cuộc họp, hệ thống nên tự chuyển fallback hay hỏi người dùng?",
  ],
};

export function demoSummaryForSegmentCount(segmentCount: number): MeetingSummary {
  if (segmentCount < 2) {
    return {
      summary: "Đang chờ thêm nội dung để tạo biên bản hành động.",
      keyPoints: [],
      decisions: [],
      actionItems: [],
      openQuestions: [],
    };
  }
  return segmentCount < 6 ? EARLY_SUMMARY : DEMO_SUMMARY;
}
