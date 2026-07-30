# MeetFlow AI — T-Hexa E403

> **Biến cuộc họp thành quyết định và hành động.**

MeetFlow AI là Working MVP hỗ trợ chuyển giọng nói thành transcript thời gian
thực, tạo tóm tắt tăng dần, phân biệt quyết định với đề xuất và trích xuất action
item có owner/deadline khi transcript có căn cứ.

- **Production:** https://meetflow-ai-ruby.vercel.app
- **Repository:** https://github.com/thanhAI408/K4-hackathon-T-Hexa-E403
- **Track:** Hướng C — Làn mở
- **Production commit:** `959e8b8`

## Thành viên và phân công

| Vai trò | Mã học viên | Họ tên | Phụ trách |
|---|---|---|---|
| **Lead** | **2A202601030** | **Nguyễn Văn Thành** | Kiến trúc, AI integration, Git/GitHub, Vercel, duyệt bản cuối |
| Thành viên | 2A202601426 | Nguyễn Hoàng Hải | Khảo sát, evidence, impact, spec §1–§2 |
| Thành viên | 2A202601530 | Nguyễn Duy Khánh | Prompt, schema, golden set, evaluation |
| Thành viên | 2A202601068 | Ngô Xuân Ninh | Frontend/UI/UX, media capture, smoke test |
| Thành viên | 2A202601734 | Nguyễn Chiến Thắng | Validation, feedback log, slide, dry run |

## Evidence người dùng

Khảo sát ngày 30/07/2026 có **36 phản hồi**:

- **91,7%** tham gia ít nhất 3 cuộc họp online/tuần.
- **86,1%** không kiểm soát được 100% nội dung buổi họp dài.
- **80,6%** không thường xuyên nhận tổng kết cuối buổi.
- **72,2%** thỏa pain proxy: vừa bỏ sót nội dung, vừa thiếu tổng kết thường xuyên.
- **50,0%** chọn AI Agent voice → text + tổng hợp.
- **83,3%** sẵn sàng sử dụng; **97,2%** sẵn sàng hoặc cân nhắc.

Chi tiết: `evidence/survey-results.md`. Dữ liệu gốc:
`evidence/survey-responses.xlsx`.

## Lát cắt

> Một thành viên nhóm dự án đang họp trực tuyến dùng MeetFlow AI để AI xác định
> phát biểu nào là quyết định và công việc đã được thống nhất, từ đó tạo biên bản
> có căn cứ giúp nhóm biết việc gì cần làm sau cuộc họp.

## Demo flow 5 phút

1. Mở production URL.
2. Xác nhận consent.
3. Chọn microphone, system audio hoặc cả hai.
4. Chạy case chuẩn: quyết định + action item rõ.
5. Chạy case khó: đề xuất chưa chốt hoặc thiếu owner/deadline.
6. Sửa một item rồi export Markdown/JSON.
7. Dùng Demo mode nếu audio live gặp sự cố.

Kịch bản phân vai: `demo-script.md`.

## Tính năng đã có

- Mic, system audio và nguồn trộn.
- OpenAI Realtime transcription qua WebRTC.
- Near real-time fallback bằng MediaRecorder.
- Structured summary qua OpenAI Responses API.
- Decision có evidence; owner/deadline mơ hồ để null.
- Pause/resume/end; history localStorage.
- Export Markdown và JSON.
- Demo mode có nhãn mock rõ ràng.
- Consent và ranh giới privacy.

## Real và mock

| Phần | Trạng thái |
|---|---|
| Landing/workspace/history/export | Working |
| Production deployment | Ready |
| Realtime/near real-time code path | Working trong code; cần smoke test thủ công có bằng chứng |
| Summary API | Working trong code và production env đã cấu hình |
| Demo transcript | Mock có chủ đích |
| Demo summary khi thiếu key | Mock có nhãn |
| 20-case production eval | **Chưa chạy; có script tự động** |
| Validation 5 user | **Chưa thực hiện** |

## Chạy local

```powershell
cd codebase
corepack enable
corepack prepare pnpm@10.5.2 --activate
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

`.env.local`:

```dotenv
OPENAI_API_KEY=your_key
OPENAI_SUMMARY_MODEL=gpt-5-mini
```

Không commit API key.

## Quality checks

```powershell
cd codebase
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Chạy evaluation production

Từ root repository:

```powershell
node eval/run-production-eval.mjs
```

Script:

- đọc `eval/golden-set.json`;
- gọi `https://meetflow-ai-ruby.vercel.app/api/summarize`;
- giữ khoảng cách để không vượt rate limit;
- sinh `eval/run-01-results.json`;
- sinh `eval/run-01-results.md`.

Không ghi tỷ lệ pass vào spec/slide trước khi script chạy xong.

## Deploy Vercel

- Team: `thanhai408s-projects`
- Project: `meetflow-ai`
- Framework: Next.js
- Root Directory: `codebase`
- Environment variables:
  - `OPENAI_API_KEY`
  - `OPENAI_SUMMARY_MODEL=gpt-5-mini`

Mỗi push lên `main` sẽ tự tạo production deployment mới.

## Privacy

- Chỉ ghi khi mọi người đã đồng ý.
- Không lưu raw audio/video.
- API key chỉ ở server.
- MVP chỉ lưu transcript/summary trong localStorage.
- Không tự join Zoom/Meet/Teams.
- Không tự gửi email, tạo lịch hoặc thực thi task.

## Artifact nộp bài

| Artifact | Trạng thái |
|---|---|
| `README.md` | Đã cập nhật |
| `spec.md` | Đã cập nhật evidence/deploy |
| `codebase/` | Working MVP |
| `evidence/` | Có khảo sát 36 phản hồi |
| `eval/golden-set.json` | Có sẵn 20 case synthetic |
| `eval/run-production-eval.mjs` | Đã bổ sung |
| `validation/feedback-log.md` | Mẫu sẵn; chưa có feedback thật |
| `reflection/` | Có 5 bản nháp; mỗi người phải tự xác nhận |
| `demo-slides.pdf` | Đã tạo |
| `demo-slides.pptx` | Bản chỉnh sửa được |
| `demo-script.md` | Đã tạo |

## Còn bắt buộc trước CP6

1. Chạy `node eval/run-production-eval.mjs`, đọc mọi case fail và cập nhật slide 4.
2. Xin tên của ít nhất 3 willing users ngoài nhóm.
3. Test prototype với ít nhất 5 người ngoài nhóm, ghi tên/vai và quote thật.
4. Cập nhật slide 5 bằng ≥2 quote validation và thay đổi đã làm.
5. Mỗi thành viên tự hoàn thiện reflection bằng một case fail thật.
6. Nếu TA giữ yêu cầu provenance, phát triển ≥10 case từ dữ liệu được phép.
