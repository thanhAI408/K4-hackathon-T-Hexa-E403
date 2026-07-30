# Reflection — 2A202601030 — Nguyễn Văn Thành

## 1. Vai trò và phần tôi phụ trách

- **Vai trò:** Phụ trách **Lead Code và AI integration**, đồng thời tham gia hoàn thiện luồng UI và demo end-to-end của MeetFlow AI.
- **File/flow cụ thể tôi chịu trách nhiệm:**
  - `codebase/src/components/meetflow-app.tsx`: điều phối vòng đời một phiên họp, bắt đầu/tạm dừng/tiếp tục/kết thúc, cập nhật transcript, gọi tóm tắt, lưu lịch sử và export.
  - `codebase/src/lib/audio-capture.ts`: lấy âm thanh từ microphone, âm thanh màn hình hoặc trộn hai nguồn.
  - `codebase/src/lib/realtime-client.ts`: kết nối OpenAI Realtime qua WebRTC, nhận transcript dạng delta/completed và xử lý trạng thái kết nối.
  - `codebase/src/lib/near-realtime.ts`: phương án dự phòng dùng `MediaRecorder`, chia âm thanh thành các file ngắn và gửi tuần tự để phiên âm.
  - `codebase/src/app/api/realtime/session/route.ts`, `codebase/src/app/api/transcribe/route.ts`, `codebase/src/app/api/summarize/route.ts`: tạo ranh giới server để bảo vệ API key và gọi các dịch vụ AI.
  - `codebase/src/lib/transcript.ts`, `codebase/src/lib/summary.ts`, `codebase/src/lib/meeting-schema.ts`: ghép transcript, chống trùng, tạo payload tóm tắt tăng dần và kiểm tra output bằng schema.
  - `codebase/src/lib/storage.ts`, `codebase/src/lib/export.ts`: lưu dữ liệu văn bản của phiên họp trong trình duyệt và xuất Markdown/JSON.
- **Tôi có thể giải thích phần này end-to-end như sau:** Người dùng xác nhận đã có sự đồng ý ghi âm và chọn nguồn âm thanh. Trình duyệt lấy audio bằng Web API, sau đó ưu tiên kết nối Realtime qua WebRTC để nhận transcript liên tục. Nếu kết nối Realtime không thành công hoặc bị mất, hệ thống chuyển sang near real-time, ghi các đoạn audio ngắn và gửi tuần tự tới API phiên âm. Transcript mới được ghép, chống trùng và đưa vào bộ lập lịch tóm tắt. Route `/api/summarize` gửi phần transcript mới cùng bản tóm tắt trước đó tới mô hình AI, sau đó kiểm tra dữ liệu trả về bằng Zod. Người dùng có thể sửa quyết định/action item, kết thúc phiên, lưu lịch sử trong `localStorage` và xuất biên bản dưới dạng Markdown hoặc JSON. API key chỉ tồn tại ở phía server và raw audio không được lưu lâu dài.

## 2. Tôi đã làm gì

- **Quyết định quan trọng tôi đưa ra:**
  1. Chọn lát cắt MVP tập trung vào một luồng hoàn chỉnh: lấy audio → tạo transcript → tạo biên bản có cấu trúc → người dùng xác nhận/chỉnh sửa → lưu và export.
  2. Tách rõ ba trạng thái **Realtime**, **Near real-time** và **Demo/Mock** để không khiến người dùng hiểu nhầm dữ liệu mô phỏng là kết quả AI thật.
  3. Thiết kế cơ chế fallback từ Realtime sang near real-time để ứng dụng vẫn có đường lui khi WebRTC hoặc data channel gặp lỗi.
  4. Không để AI tự đoán owner, deadline hoặc biến một đề xuất chưa chốt thành quyết định. Khi transcript thiếu căn cứ, trường dữ liệu phải để trống hoặc đưa vào mục cần xác nhận.
  5. Không lưu raw audio/video, không để API key ở client và không đưa nội dung nhạy cảm vào log.
  6. Dùng `localStorage` thay vì database trong MVP để giảm phạm vi, đủ cho một bản prototype có thể demo trong thời gian hackathon.
- **Bằng chứng/test case ảnh hưởng đến quyết định:**
  - Case transcript có sự kiện delta và completed trùng nhau cho thấy không thể nối chuỗi trực tiếp; cần khóa ổn định và cơ chế deduplicate.
  - Case completed event đến không đúng thứ tự cho thấy transcript phải được sắp xếp theo thứ tự segment thay vì thứ tự thời điểm client nhận sự kiện.
  - Case câu nói “Hay là dùng Next.js?” chỉ là đề xuất, vì vậy không được đưa vào danh sách quyết định.
  - Case có task nhưng không nêu rõ người làm hoặc deadline khiến nhóm đặt hard guardrail: owner/deadline phải là `null` hoặc “Cần xác nhận”.
  - Case không có API key dẫn tới quyết định vẫn cho phép chạy Demo mode nhưng phải gắn badge “Dữ liệu mô phỏng” và “Mock summary”.
- **Cách tôi kiểm tra phần mình làm:**
  - Chạy `pnpm lint`, `pnpm typecheck`, `pnpm test` và `pnpm build` trong thư mục `codebase`.
  - Kiểm tra các test về Realtime client, near real-time queue, transcript dedupe/order, summary cadence/schema, storage và export.
  - Smoke test trên trình duyệt các luồng landing → bắt đầu demo → pause/resume → kết thúc → xem history → copy/export.
  - Kiểm tra console để phát hiện lỗi runtime và kiểm tra giao diện ở viewport desktop.
  - Đối chiếu rõ phần nào đang chạy thật, phần nào là mock và phần nào chưa được xác minh với API key thật.

## 3. AI đã hỗ trợ thế nào

- **Công cụ/model đã dùng:** ChatGPT/Codex để hỗ trợ phân tích yêu cầu, đề xuất kiến trúc, sinh và chỉnh sửa code; OpenAI Realtime Transcription cho luồng phiên âm; OpenAI Responses API cho tóm tắt có cấu trúc. Model summary được cấu hình qua biến môi trường `OPENAI_SUMMARY_MODEL`.
- **AI hỗ trợ ở bước nào:**
  - Chuyển yêu cầu sản phẩm thành kiến trúc Next.js và luồng dữ liệu end-to-end.
  - Gợi ý cách tổ chức component, thư viện xử lý audio, API routes và test cases.
  - Sinh bản code đầu tiên cho UI, WebRTC client, near real-time fallback, summary schema, storage và export.
  - Hỗ trợ rà soát lỗi TypeScript, kiểm tra edge case và viết tài liệu README/spec.
- **Tôi đã kiểm tra, sửa hoặc từ chối output nào:**
  - Không dùng nguyên trạng code AI sinh ra nếu chưa qua lint, typecheck, test và build.
  - Sửa cách ghép transcript để tránh lặp nội dung và sai thứ tự khi event đến không ổn định.
  - Bổ sung fallback, timeout, giới hạn kích thước request và thông báo lỗi an toàn thay vì hiển thị raw upstream error.
  - Từ chối cách xử lý khiến Demo mode trông giống AI thật; bổ sung nhãn provenance rõ ràng.
  - Không chấp nhận output summary tự suy diễn owner/deadline hoặc quyết định khi transcript chưa đủ bằng chứng.
  - Không đưa API key, raw audio, transcript người thật hoặc dữ liệu nhạy cảm vào source, log hay tài liệu nộp bài.
- **Phần nào là quyết định của tôi, không giao cho AI:** Tôi quyết định phạm vi MVP, luồng demo, ranh giới giữa working và mock, các hard guardrail của summary, cách xử lý dữ liệu, tiêu chí kiểm tra và việc chỉ ghi nhận kết quả đã thực sự xác minh. AI được dùng như công cụ hỗ trợ xây dựng, còn tôi chịu trách nhiệm đọc code, chạy kiểm tra và giải thích luồng có tên mình.

> Không ghi API key, secret, raw audio hoặc dữ liệu người thật.

## 4. Một case fail của chính nhóm

- **Input/tình huống:** Trong test transcript, cùng một nội dung có thể được gửi nhiều lần qua các event `delta` và `completed`; ngoài ra hai event completed của các segment khác nhau có thể đến ngược thứ tự.
- **Output hoặc hành vi sai:** Nếu chỉ nối text theo thời điểm nhận event, transcript có thể bị lặp câu hoặc hiển thị sai thứ tự phát biểu. Điều này cũng khiến phần transcript mới gửi sang summary bị lặp, từ đó tạo decision/action item trùng.
- **Vì sao lỗi này quan trọng với người dùng:** Biên bản cuộc họp phải phản ánh đúng trình tự và nội dung. Transcript trùng hoặc đảo thứ tự làm người dùng mất niềm tin, có thể khiến AI hiểu sai quyết định và giao nhầm công việc.
- **Nhóm đã tìm nguyên nhân thế nào:** Nhóm tách riêng logic transcript và tạo test cho các trường hợp delta → completed, completed lặp và completed đến ngược thứ tự. Qua đó xác định nguyên nhân là việc dùng chuỗi append trực tiếp, không có khóa ổn định cho từng segment và không tách trạng thái partial/final.
- **Thay đổi đã làm:** Dùng khóa ổn định theo `item_id` và `content_index`, lưu segment theo cấu trúc dữ liệu thay vì nối chuỗi ngay, cập nhật partial bằng delta, thay bằng final khi completed, bỏ qua event đã xử lý và sắp xếp lại theo thứ tự segment trước khi hiển thị/gửi summary.
- **Kết quả sau khi chạy lại:** Các test transcript về ghép delta, deduplicate và giữ đúng thứ tự đã pass. Luồng demo không còn tạo đoạn transcript trùng trong các case đã tái hiện bằng test. Tuy nhiên, nhóm vẫn ghi trung thực rằng Realtime transcription với API key thật và microphone/system audio cần tiếp tục được kiểm tra thủ công trên Chrome desktop trước khi khẳng định chạy ổn định ngoài môi trường test.

> Đây là case được tái hiện bằng test của nhóm; không phải dữ liệu hoặc nội dung cuộc họp thật.

## 5. Bài học

- **Một điều tôi hiểu khác đi sau hackathon:** Tôi hiểu rằng xây một sản phẩm AI không chỉ là gọi được model. Phần khó hơn là xác định rõ AI được phép quyết định đến đâu, chuẩn bị đường lui khi AI hoặc kết nối lỗi, thể hiện mức độ chắc chắn cho người dùng và tạo test để chứng minh hệ thống không mắc các lỗi có chi phí cao. Một prototype nhỏ nhưng có ranh giới rõ, dữ liệu trung thực và luồng end-to-end giải thích được có giá trị hơn một danh sách tính năng lớn nhưng không kiểm chứng.
- **Nếu có thêm một tuần, tôi sẽ ưu tiên:**
  1. Chạy toàn bộ golden set với model thật, lưu kết quả từng case và sửa failure đau nhất trước khi chạy lại toàn bộ.
  2. Kiểm thử microphone, system audio, WebRTC Realtime và near real-time trên nhiều máy/trình duyệt, mạng yếu và trường hợp người dùng từ chối permission.
  3. Thực hiện user test với người ngoài nhóm, đo thời gian hoàn thành task, mức độ tin tưởng và điểm người dùng bị kẹt.
  4. Cải thiện speaker identification theo hướng yêu cầu người dùng xác nhận, không tự suy diễn danh tính.
  5. Bổ sung browser E2E test, monitoring lỗi an toàn và triển khai preview/production trên Vercel sau khi các quality checks đều đạt.

## Checklist trước CP5/CP6

- [x] File có mã học viên và tên thật.
- [ ] Phần phụ trách cần được nhóm điền đồng nhất vào `README.md` và `spec.md` §8: **2A202601030 — Nguyễn Văn Thành — Code và AI integration**.
- [x] Có ít nhất một file/flow cụ thể.
- [x] Có một case fail thật được tái hiện bằng test của nhóm.
- [x] Nội dung đủ để giải thích phần có tên mình mà không cần đọc script.
- [x] Không chứa secret, raw audio hoặc dữ liệu nhạy cảm.
