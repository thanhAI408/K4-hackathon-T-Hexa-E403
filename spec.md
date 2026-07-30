# AI SPEC — MeetFlow AI · Nhóm T-Hexa · Zone E403

Hướng: [ ] A — VLearn  [ ] B — Trợ lý Học viên  [x] C — Làn mở  
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

> Trạng thái ngày 30/07/2026: **Working MVP đã deploy production; khảo sát định
> lượng đã hoàn thành; evaluation production và validation usability chưa chạy
> đủ.** Mọi khoảng trống được ghi rõ, không tạo kết quả hoặc quote giả.

## §1. User & Job

### Job executor và workflow

- **Job executor:** một thành viên nhóm dự án/hackathon đang tham gia cuộc họp
  trực tuyến qua Zoom, Google Meet hoặc Microsoft Teams.
- **Workflow hiện tại:** tham gia thảo luận → cố ghi chú hoặc nhớ nội dung → cuối
  buổi tự tổng hợp/hỏi lại → gửi quyết định và việc cần làm cho nhóm.
- **Alternative hiện tại theo khảo sát:** cố tập trung toàn bộ buổi họp; hỏi lại
  thành viên; chờ/đề xuất ban tổ chức gửi tổng kết; dùng công cụ khác.
- **Nguồn evidence:** `evidence/survey-results.md` và
  `evidence/survey-responses.xlsx`.

### Core JTBD

Khi đang họp trực tuyến cùng nhóm dự án, tôi muốn nắm lại chính xác những gì đã
được thống nhất và ai cần làm gì, để cả nhóm tiếp tục công việc mà không phải hỏi
lại hoặc xem lại toàn bộ buổi họp.

### Problem statement

Một thành viên nhóm dự án vừa tham gia thảo luận vừa cố ghi nhớ nội dung có thể
bỏ sót quyết định hoặc công việc, khiến nhóm không rõ việc tiếp theo, người phụ
trách hoặc deadline sau buổi họp.

### Evidence

Khảo sát ngày 30/07/2026 ghi nhận **36 phản hồi**:

- **33/36 (91,7%)** tham gia ít nhất 3 cuộc họp online mỗi tuần.
- **31/36 (86,1%)** không kiểm soát được 100% nội dung buổi họp dài hơn 60 phút.
- **18/36 (50,0%)** chỉ kiểm soát được 25–50% nội dung.
- **29/36 (80,6%)** không thường xuyên nhận được tổng kết cuối buổi.
- **26/36 (72,2%)** đồng thời bỏ sót một phần nội dung và không thường xuyên có
  tổng kết — đây là **pain proxy** được định nghĩa trước khi tính.
- **18/36 (50,0%)** chọn phương án AI Agent voice → text + tổng hợp, nhiều nhất
  trong các phương án.
- **30/36 (83,3%)** sẵn sàng sử dụng; **35/36 (97,2%)** sẵn sàng hoặc cân nhắc.

**Giới hạn evidence:** form không thu tên, không có câu trả lời mở và không hỏi
số phút lãng phí. Do đó, khảo sát đạt bằng chứng định lượng về pain/nhu cầu, nhưng
chưa thay thế 3 willing users có tên và vòng validation sau khi dùng prototype.

## §2. Impact & quyết định chọn

| Ứng viên | Bao nhiêu người gặp / tín hiệu | Tần suất hoặc chi phí quan sát được | Build nổi? | Quyết định |
|---|---|---|---|---|
| **A. Biên bản hành động tăng dần trong cuộc họp** | 26/36 pain proxy; 18/36 chọn AI Agent; 30/36 sẵn sàng | 33/36 họp ≥3 lần/tuần; 31/36 bỏ sót một phần nội dung | Đã build + deploy | **Chọn** |
| **B. Chỉ tóm tắt sau cuộc họp** | 29/36 không thường xuyên có tổng kết | Giải quyết thiếu tổng kết nhưng không xác nhận owner/deadline ngay khi đang họp | Có | Loại khỏi lát cắt |
| **C. Nhắc deadline + đồng bộ calendar** | Khảo sát chưa đo nhu cầu này | Sai deadline có cost-of-error cao; cần quyền ghi lịch và integration | Không phù hợp MVP | Loại |

### Ứng viên đã loại

- **B — tóm tắt sau họp:** hữu ích nhưng không giúp người dùng phát hiện và sửa
  chỗ mơ hồ ngay trong cuộc họp.
- **C — calendar automation:** mở rộng thẩm quyền, yêu cầu integration và có rủi
  ro thực thi sai deadline.

### Ứng viên chọn

Chọn **A — biên bản hành động tăng dần** vì có evidence nhu cầu lặp lại, có thể
demo end-to-end trong 5 phút và cho thấy quyết định AI trung tâm: phân biệt
“đã chốt” với “mới đề xuất”, đồng thời không đoán owner/deadline.

## §3. Giải pháp tương tự đã nghiên cứu

| Sản phẩm | Flow quan sát từ tài liệu chính thức | Đáng học | Đáng né trong MVP | MeetFlow khác gì |
|---|---|---|---|---|
| Otter.ai | Có thể kết nối lịch, tự tham gia Zoom/Meet/Teams, tạo live transcript, live summary và action items liên kết transcript | Summary trực tiếp; action item có căn cứ transcript | Auto-join và lưu recording làm tăng phạm vi privacy/integration | Người dùng tự chọn nguồn âm thanh; không auto-join; không lưu audio/video |
| Fireflies.ai | Có live transcript, notes, action items; sau họp có summary và khả năng tải transcript/recording | Live notes và cấu trúc action item | Lưu/tải recording và tự gán participant vượt phạm vi MVP | Owner mơ hồ để null; dữ liệu chỉ lưu local dạng text |

Nguồn:
- https://otter.ai/zoom
- https://help.otter.ai/hc/en-us/articles/5093228433687-Conversation-Page-Overview
- https://fireflies.ai/product/real-time
- https://guide.fireflies.ai/articles/6653885315-learn-about-the-fireflies-notepad

## §4. Thiết kế

### Lát cắt MỘT CÂU

Một thành viên nhóm dự án đang họp trực tuyến dùng MeetFlow AI để AI xác định
phát biểu nào là quyết định và công việc đã được thống nhất, từ đó tạo biên bản
có căn cứ giúp nhóm biết việc gì cần làm sau cuộc họp.

### Non-goals

1. Không làm login, payment hoặc workspace nhiều người.
2. Không làm Zoom OAuth hoặc bot tự tham gia phòng họp.
3. Không gửi email, tạo calendar event hoặc tự thực thi action item.
4. Không lưu raw audio/video và không dùng database trong MVP.
5. Không hứa speaker diarization chính xác.
6. Không thay người dùng phê duyệt biên bản cuối.

### Mức prototype

- [ ] Sketch  [ ] Mock  [x] **Working**
- **Chạy thật:** microphone/system audio capture, Realtime WebRTC, near real-time
  fallback, summary route, local history và export.
- **Mock có chủ đích:** demo transcript chạy theo timeline; summary mẫu khi không
  có API key.
- **Production:** https://meetflow-ai-ruby.vercel.app
- **Production commit:** `959e8b8`

### Automation

- [ ] Augment  [x] **Conditional**  [ ] Automate
- Case rõ được tự động ghi nhận. Owner/deadline/trạng thái quyết định không chắc
  được để `null` hoặc đưa vào open questions.
- **Cost-of-error:** gán nhầm việc hoặc hạn có thể khiến nhóm làm sai; yêu cầu
  người dùng xác nhận rẻ hơn sửa một biên bản đã chia sẻ.

### §4b. HAX/PAIR

| Nguyên tắc | Áp cụ thể |
|---|---|
| G1 — Làm rõ hệ thống làm được gì | Landing/start dialog nói rõ nguồn audio do user chọn; không tự join hay thực thi task |
| G2 — Làm rõ nó làm tốt đến đâu | Badge Realtime/Near real-time/Mock; hiển thị evidence |
| G10 — Thu hẹp phạm vi khi nghi ngờ | Owner/deadline mơ hồ để null và tạo câu hỏi |
| G9 — Sửa dễ dàng | User sửa/xóa decision/action item trước export |
| G11 — Giải thích vì sao | Decision kèm trích đoạn evidence |
| PAIR — Graceful failure | Permission denied, thiếu system audio, lỗi Realtime và thiếu key có thông báo/đường lui |

## §5. Kiểu lỗi — 4 lớp chỗ khó

| # | Tình huống | Lớp | Hành vi mong muốn |
|---:|---|:---:|---|
| 1 | “Hay là dùng Next.js?” | ① | Không tạo decision |
| 2 | Task rõ nhưng thiếu owner/deadline | ① | Task được giữ; owner/deadline = null |
| 3 | “Em làm phần đó” không có diarization | ② | Không suy ra tên |
| 4 | “Xong thứ Sáu” thiếu tuần tham chiếu | ② | Không tự đổi thành ngày tuyệt đối |
| 5 | Yêu cầu MeetFlow gửi email | ③ | Chỉ ghi yêu cầu/task; không thực thi |
| 6 | Yêu cầu bot tự vào Zoom | ③ | Từ chối ngoài phạm vi; yêu cầu user mở app và consent |
| 7 | Quyết định cũ bị huỷ | ④ | Chỉ giữ quyết định mới nhất |
| 8 | Deadline cùng task được đổi | ④ | Cập nhật deadline; không tạo item trùng |
| 9 | Âm thanh mất đoạn | ① | Không lấp nội dung thiếu |
| 10 | Hai người nói chồng | ② | Đưa vào open questions |
| 11 | Consent chưa tick | ③ | Chặn bắt đầu ghi |
| 12 | Câu trộn AI/RAG/Agent/API/Vercel | ④ | Giữ nguyên thuật ngữ |

## §6. Bốn đường đi trải nghiệm

- **Happy path:** consent → chọn audio → transcript → summary tăng dần → rà soát
  → kết thúc → export.
- **Low-confidence:** thiếu owner/deadline → null/open question → user sửa.
- **Failure:** không có audio/transcript/evidence → không tạo dữ kiện → thử lại,
  đổi nguồn hoặc demo mode.
- **Correction:** sửa/xoá item sai → lưu local → export bản đã duyệt.
- **Ngoài phạm vi:** không gửi email, tạo lịch hoặc join Zoom.
- **Domain:** quyết định/deadline mới thay bản cũ; giữ thuật ngữ kỹ thuật.

## §7. Kiểm thử

### Chiều chất lượng

| Chiều | Pass | Fail |
|---|---|---|
| Grounded decision | Mỗi decision có evidence trực tiếp | Decision không có căn cứ |
| Action completeness | Owner/deadline chỉ có khi nói rõ | Tự tạo/gán nhầm |
| Proposal distinction | Đề xuất chưa chốt không thành decision | Proposal bị nâng thành decision |
| Ambiguity handling | Thiếu dữ liệu → null/open question | Đoán không báo |
| Schema validity | Output parse đúng Zod schema | Sai field/kiểu |
| Term preservation | Giữ đúng tên/thuật ngữ | Làm sai thuật ngữ |

### Golden set

- `eval/golden-set.json`: **20 case synthetic**
- 8 case thường + 8 case phủ 4 lớp + 4 case hiếm
- Hiện chưa có 10 case data-derived theo yêu cầu provenance của rubric.

### Quality bar

> **≥80% case pass**, đồng thời **0 case tự tạo owner/deadline** và
> **0 case biến đề xuất chưa chốt thành quyết định**.

Quality bar đã có trong commit `7cedb03` trước khi xem kết quả.

### Kết quả lượt chạy

- **Chưa chạy production đủ 20 case.**
- Script đã chuẩn bị: `eval/run-production-eval.mjs`.
- Chạy bằng: `node eval/run-production-eval.mjs`.
- Script gọi API production với tốc độ phù hợp rate limit và sinh
  `eval/run-01-results.json` + `eval/run-01-results.md`.
- Không điền phần trăm vào spec/slide trước khi script chạy xong.

## §8. Phân công & kế hoạch

| Mã HV | Họ tên | Phần phụ trách |
|---|---|---|
| **2A202601030** | **Nguyễn Văn Thành — Lead** | Kiến trúc, AI integration, Git/GitHub, Vercel, duyệt bản cuối |
| 2A202601426 | Nguyễn Hoàng Hải | Khảo sát, evidence, impact, spec §1–§2 |
| 2A202601530 | Nguyễn Duy Khánh | Prompt, schema, golden set, evaluation |
| 2A202601068 | Ngô Xuân Ninh | Frontend/UI/UX, media capture, smoke test |
| 2A202601734 | Nguyễn Chiến Thắng | Validation, feedback log, slide, dry run |

### Willing users

Khảo sát có **30 phản hồi “Sẵn sàng”**, nhưng không thu tên. Vì rubric yêu cầu
tên cụ thể, nhóm vẫn phải xin xác nhận nhanh từ ít nhất 3 người ngoài nhóm và ghi:

1. [Tên/vai — thời điểm đồng ý]
2. [Tên/vai — thời điểm đồng ý]
3. [Tên/vai — thời điểm đồng ý]

### Validation CP5

- Ít nhất 5 người ngoài nhóm, ưu tiên ≥2 willing users có tên.
- Task: chạy case chuẩn + case mơ hồ, sửa một item và export.
- Hỏi 3 câu chuẩn; ghi quan sát và quote thật trong
  `validation/feedback-log.md`.
- Điều phối: Nguyễn Chiến Thắng.
- Ghi log: Nguyễn Hoàng Hải.
- **Trạng thái:** chưa thực hiện; không có feedback giả.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao / bằng chứng |
|---|---|---|
| 30/07/2026 | Chọn Hướng C, conditional automation và quality bar 80% | Cost-of-error của owner/deadline |
| 30/07/2026 | Build, merge PR #1 và deploy production | Commit `959e8b8`, Vercel Ready |
| 30/07/2026 | Phân tích 36 phản hồi khảo sát | 26/36 pain proxy; 30/36 sẵn sàng |
| 30/07/2026 | Bổ sung script eval production và slide 6 trang | Chuẩn bị CP5/CP6 |
| Chưa có | Thay đổi từ validation/eval | Chỉ điền sau dữ liệu thật |
