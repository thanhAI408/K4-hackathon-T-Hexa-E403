# Reflection — 2A202601068 — Ngô Xuân Ninh

## 1. Vai trò và phần tôi phụ trách

- Vai trò: AI Engineer.
- File/flow cụ thể tôi chịu trách nhiệm:
  - Khảo sát người dùng và JTBD — `spec.md` §1 (User & Job, Core JTBD, Problem statement).
  - Thiết kế workflow/trải nghiệm AI — `spec.md` §4 (Lát cắt một câu, Automation, bốn đường đi của trải nghiệm ở §6).
  - Test case đánh giá AI — `eval/golden-set.json` (20 case: 8 thường, 8 chỗ khó theo 4 lớp, 4 hiếm).
- Tôi có thể giải thích phần này end-to-end như sau:
  Tôi xuất phát từ JTBD của một thành viên nhóm dự án đang họp trực tuyến: sau
  buổi họp cả nhóm cần biết quyết định nào đã chốt, ai làm việc gì, deadline là
  gì và chỗ nào còn phải hỏi lại. Vì vậy tôi không thiết kế MeetFlow như một
  công cụ chỉ viết bản tóm tắt cuối buổi, mà chọn hướng "biên bản hành động tăng
  dần": transcript và summary được cập nhật trong lúc họp để người dùng nhìn
  thấy sớm chỗ mơ hồ và sửa ngay trước khi xuất biên bản.
  Điểm chính trong flow là AI chỉ tự tách quyết định/action khi transcript có
  căn cứ rõ. Nếu thiếu owner, deadline, consent, hoặc trạng thái "đã chốt", hệ
  thống để trống/đưa vào open questions thay vì đoán. Thiết kế này khớp với
  HAX G2, G10, G11: làm rõ mức chắc chắn, thu hẹp phạm vi khi nghi ngờ và luôn
  giữ evidence cho decision. PAIR được áp vào các đường lui như thiếu API key,
  permission denied, mất system audio hoặc dùng Demo mode.
  Golden set 20 case được chia để kiểm tra đúng các rủi ro đó: lớp ① kiểm tra
  nguồn sự thật như đề xuất chưa chốt hoặc task thiếu owner/deadline; lớp ② kiểm
  tra mơ hồ như đại từ "em" hoặc deadline tương đối; lớp ③ kiểm tra yêu cầu ngoài
  thẩm quyền như gửi email/tự vào Zoom; lớp ④ kiểm tra đặc thù domain như quyết
  định bị hủy, deadline đổi ở cuối cuộc họp và thuật ngữ kỹ thuật phải giữ nguyên.

## 2. Tôi đã làm gì

- Quyết định quan trọng tôi đưa ra:
  Tôi chọn tạm thời ứng viên A — biên bản hành động tăng dần trong cuộc họp —
  thay vì chỉ tóm tắt sau khi họp xong hoặc tự động nhắc deadline/đồng bộ lịch.
  Lý do là A vừa đủ nhỏ để demo end-to-end trong MVP, vừa thể hiện được điểm AI
  quan trọng nhất của sản phẩm: phân biệt thông tin đã có căn cứ với thông tin
  cần xác nhận. Tôi cũng chọn mức automation là **Conditional** thay vì
  **Automate** vì gán nhầm owner/deadline hoặc biến đề xuất thành quyết định có
  cost-of-error cao hơn nhiều so với việc bắt người dùng xác nhận thêm trong UI.
- Bằng chứng/test case ảnh hưởng đến quyết định:
  Do spec hiện ghi rõ chưa có log khảo sát thật, tôi không dùng số khảo sát giả
  để biện minh. Bằng chứng tôi dựa vào ở giai đoạn này là các test case và risk
  scenario trong `eval/golden-set.json`: MF-009 kiểm tra đề xuất Supabase chưa
  được chốt; MF-010 kiểm tra action thiếu owner/deadline; MF-011 kiểm tra đại từ
  "em" khi chưa có diarization; MF-013 và MF-014 kiểm tra yêu cầu ngoài phạm vi
  như tự gửi email hoặc tự vào Zoom; MF-015, MF-016 kiểm tra việc quyết định hoặc
  deadline bị đổi ở cuối cuộc họp. Các case này khiến tôi ưu tiên nguyên tắc
  "không đoán khi thiếu căn cứ" hơn là tự động hóa toàn bộ.
- Cách tôi kiểm tra phần mình làm:
  Tôi đối chiếu golden set với 6 chiều chấm trong `eval/README.md`: grounded
  decision, action completeness, proposal distinction, ambiguity handling, schema
  validity và term preservation. Khi đọc lại từng case, tôi kiểm tra xem expected
  output có buộc hệ thống giữ evidence, không tự tạo owner/deadline, không nâng
  đề xuất thành decision và giữ đúng thuật ngữ kỹ thuật hay chưa. Tôi cũng kiểm
  tra Demo/mock mode để biết rõ phần nào chỉ là dữ liệu mô phỏng và không được
  dùng như kết quả eval thật.

## 3. AI đã hỗ trợ thế nào

- Công cụ/model đã dùng: Claude (Claude Code) — dùng để đọc lại toàn bộ spec,
  eval, và code thật của prototype trước khi viết reflection này.
- AI hỗ trợ ở bước nào: rà soát `spec.md`, `eval/golden-set.json`,
  `eval/results-template.md` để xác nhận việc gì đã thật sự xảy ra (eval đã
  chạy hay chưa, có case fail nào đã ghi log hay chưa) trước khi cho vào
  reflection; chạy thử `pnpm test` (26/26 unit test pass) và một đoạn code tạm
  thời để quan sát hành vi thật của `demoSummaryForSegmentCount`.
- Tôi đã kiểm tra, sửa hoặc từ chối output nào: ban đầu AI định tự bịa vai trò,
  quyết định và case fail khi tôi nói "quên rồi" — tôi (qua trao đổi) đã yêu
  cầu không bịa, nên AI quay lại tra artifact thật trong repo thay vì đoán.
- Phần nào là quyết định của tôi, không giao cho AI: nội dung khảo sát thật,
  lý do chọn workflow, và cách tôi tự giải thích phần mình phụ trách —
  [TỰ VIẾT/XÁC NHẬN lại các phần trên].

Không ghi API key, secret, raw audio hoặc dữ liệu người thật.

## 4. Một case fail của chính nhóm

- Input/tình huống: prototype đang ở giai đoạn build, chưa có API key thật để
  chạy eval trên OpenAI, nên nếu dùng Demo/mock mode
  (`src/lib/demo-data.ts::demoSummaryForSegmentCount`) để thử một case khó
  trong golden set — ví dụ MF-011 ("Em sẽ xử lý phần export Markdown nhé. Mọi
  người đồng ý.", kỳ vọng: không gán owner, hỏi lại ai phụ trách) — thì hàm này
  chỉ chọn output theo **số lượng segment transcript**, không đọc nội dung
  transcript thật.
- Output hoặc hành vi sai: chạy thật hàm này (segmentCount = 3) trả về summary
  tĩnh nói về "Next.js App Router", gán owner "Lan" và "Huy" — hoàn toàn không
  liên quan "export Markdown", và vi phạm đúng `hard_fail_if` của MF-011 ("Tự
  gán một tên hoặc vai cụ thể cho từ em").
- Vì sao lỗi này quan trọng với người dùng: nếu ai đó dùng kết quả demo/mock để
  kết luận "đã đạt quality bar eval", đó là kết luận giả — spec.md và
  eval/results-template.md đều xác nhận **chưa có lượt eval thật nào chạy
  bằng model OpenAI thật**.
- Nhóm đã tìm nguyên nhân thế nào: đọc code `demo-data.ts` — mock được thiết kế
  cố ý theo kịch bản demo cố định (`spec.md` §4 gọi đây là "mock có chủ đích"),
  không nhằm phản ánh transcript tuỳ ý.
- Thay đổi đã làm: [CHƯA SỬA — nhóm cần chạy eval thật bằng OPENAI_API_KEY thật
  trên toàn bộ 20 case trước khi tuyên bố đạt quality bar, theo đúng quy trình
  ở `eval/README.md`].
- Kết quả sau khi chạy lại: [CHƯA CHẠY LẠI — ghi trung thực, không tạo số liệu
  giả].

Chỉ dùng case đã xảy ra thật; nếu chưa sửa được, ghi trung thực điều đó.

## 5. Bài học

- Một điều tôi hiểu khác đi sau hackathon:
  Tôi hiểu rõ hơn rằng làm sản phẩm AI không chỉ là gọi model ra được một bản
  tóm tắt nghe hợp lý. Phần khó hơn là đặt ranh giới: cái gì có evidence thì ghi,
  cái gì chưa chắc thì hỏi lại, và cái gì ngoài phạm vi thì không hứa tự làm.
  Tôi cũng phân biệt rõ "mock có chủ đích để demo flow" với "đã eval thật bằng
  model thật"; nếu lẫn hai thứ này khi báo cáo tiến độ thì nhóm có thể tưởng sản
  phẩm đã an toàn trong khi các lỗi gán nhầm owner/deadline vẫn chưa được đo.
- Nếu có thêm một tuần, tôi sẽ ưu tiên:
  Tôi sẽ ưu tiên ba việc. Thứ nhất, chạy đủ 20 case trong golden set bằng model
  thật với `OPENAI_API_KEY`, lưu actual output riêng theo `eval/results-template.md`
  và chấm lại theo 6 chiều chất lượng. Thứ hai, mining thêm ít nhất 10 case từ
  chatlog/dữ liệu được phép dùng, ghi rõ provenance thay vì chỉ dùng synthetic
  case. Thứ ba, hoàn tất khảo sát ít nhất 20 người ngoài nhóm và validation với
  ít nhất 5 người để kiểm chứng pain, impact và xem người dùng có hiểu các trạng
  thái "Cần xác nhận", evidence và mock/demo hay không.

## Checklist trước CP5/CP6

- [x] File có mã học viên và tên thật.
- [ ] Phần phụ trách khớp README và spec §8 (spec.md §8 hiện vẫn để trống tên —
      cần nhóm điền bảng phân công thật).
- [x] Có ít nhất một file/flow cụ thể.
- [x] Có một case fail thật của nhóm (mock mode không phản ánh nội dung thật).
- [ ] Giải thích được phần có tên mình mà không đọc script — cần tự luyện
      trước khi vấn đáp.
- [x] Không chứa secret hoặc dữ liệu nhạy cảm.
