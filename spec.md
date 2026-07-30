# AI SPEC — MeetFlow AI · Nhóm [NHÓM CẦN ĐIỀN] · Zone [NHÓM CẦN ĐIỀN]

Hướng: [ ] A — VLearn  [ ] B — Trợ lý Học viên  [x] C — Làn mở

Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

> Trạng thái: **DRAFT CÓ PLACEHOLDER**. File này không tuyên bố đã có khảo sát,
> willing users, validation, kết quả eval, AI trace hay checkpoint đúng hạn.
> Nhóm chỉ thay placeholder bằng bằng chứng thật có thể kiểm tra lại.

## §1. User & Job

### Job executor và workflow

- **Job executor:** một thành viên nhóm dự án/hackathon của khoá đang tham gia
  cuộc họp trực tuyến qua Zoom, Google Meet hoặc Microsoft Teams.
- **Workflow hiện tại — giả thuyết cần khảo sát:** tham gia thảo luận → tự ghi
  chú rời rạc → hỏi lại quyết định và người phụ trách → tổng hợp và gửi biên bản.
- **Alternative hiện tại — cần khảo sát:** ghi tay, nhắn lại trong nhóm, xem bản
  ghi cuộc họp, dùng công cụ tóm tắt phổ thông, hoặc không lập biên bản.
- Worksheet/sơ đồ: **[NHÓM CẦN ĐÍNH KÈM SAU JTBD INTERVIEW]**

### Core JTBD

Khi đang họp trực tuyến cùng nhóm dự án, tôi muốn nắm lại chính xác những gì đã
được thống nhất và ai cần làm gì, để cả nhóm có thể tiếp tục công việc mà không
phải hỏi lại sau buổi họp.

### Problem statement

Một thành viên nhóm dự án đang vừa tham gia thảo luận vừa ghi biên bản có thể bỏ
sót quyết định hoặc công việc, khiến cả nhóm không rõ việc tiếp theo và người
chịu trách nhiệm sau buổi họp.

> Đây là giả thuyết sản phẩm, chưa phải pain đã được evidence xác nhận.

### Evidence

- Đường evidence dự kiến: **A — khảo sát người dùng thật**.
- Cỡ mẫu: **[NHÓM CẦN ĐIỀN SAU KHẢO SÁT: n ≥ 20 NGƯỜI NGOÀI NHÓM]**
- Tỷ lệ xác nhận: **[NHÓM CẦN ĐIỀN SAU KHẢO SÁT: %; CHỈ ĐẠT KHI ≥ 50%]**
- Câu hỏi và từng câu trả lời nguyên văn:
  **[NHÓM CẦN THÊM LOG KHẢO SÁT CÓ THỂ KIỂM TRA LẠI]**
- Quote 1: **[NHÓM CẦN ĐIỀN QUOTE THẬT + NGUỒN]**
- Quote 2: **[NHÓM CẦN ĐIỀN QUOTE THẬT + NGUỒN]**
- Quote 3: **[NHÓM CẦN ĐIỀN QUOTE THẬT + NGUỒN]**
- Quote 4: **[NHÓM CẦN ĐIỀN QUOTE THẬT + NGUỒN]**
- Quote 5: **[NHÓM CẦN ĐIỀN QUOTE THẬT + NGUỒN]**

Data pack VLearn hiện không được dùng để khẳng định pain cuộc họp. Golden set
synthetic trong eval/ chỉ là dữ liệu kiểm thử, không phải evidence người dùng.

## §2. Impact & quyết định chọn

Các ứng viên dưới đây là khung so sánh; chưa có con số khảo sát nên chưa được
tuyên bố là bảng impact hoàn chỉnh.

| Ứng viên | Bao nhiêu người gặp | Tần suất | Tốn gì mỗi lần | Build nổi? | Quyết định |
|---|---:|---:|---|---|---|
| A. Biên bản hành động tăng dần trong cuộc họp | [CẦN ĐO] | [CẦN ĐO] | [CẦN ĐO PHÚT/VIỆC BỎ SÓT] | Có thể trong MVP | Chọn tạm thời |
| B. Chỉ tóm tắt sau khi họp xong | [CẦN ĐO] | [CẦN ĐO] | [CẦN ĐO] | Có | Ứng viên loại tạm thời |
| C. Nhắc deadline và đồng bộ calendar tự động | [CẦN ĐO] | [CẦN ĐO] | [CẦN ĐO] | Không phù hợp phạm vi MVP | Ứng viên loại tạm thời |

### Ứng viên đã loại

- **B — tóm tắt sau cuộc họp:** chưa giải quyết nhu cầu nhìn thấy chỗ mơ hồ để
  xác nhận ngay; **[NHÓM CẦN KIỂM CHỨNG LÝ DO NÀY BẰNG KHẢO SÁT]**.
- **C — tự động nhắc và đồng bộ:** cần integration, quyền ghi dữ liệu và xử lý
  sai deadline có cost-of-error cao; nằm ngoài lát cắt hackathon.

### Ứng viên chọn

Chọn tạm thời **A — biên bản hành động tăng dần** vì có thể demo end-to-end
trong năm phút và thể hiện rõ hành vi khi thiếu căn cứ. Quyết định cuối cùng
phải được bổ sung bằng số:
**[NHÓM CẦN ĐIỀN LÝ DO CHỌN BẰNG IMPACT SAU KHẢO SÁT]**.

## §3. Giải pháp tương tự đã nghiên cứu

Không được coi danh sách sản phẩm là “đã nghiên cứu” cho đến khi thành viên dùng
thử và ghi lại flow cụ thể.

| Sản phẩm | Flow quan sát | Đáng học | Đáng né | MeetFlow khác gì |
|---|---|---|---|---|
| Otter.ai | [NHÓM CẦN DÙNG THỬ] | [CẦN GHI QUAN SÁT] | [CẦN GHI QUAN SÁT] | [CẦN ĐỐI CHIẾU] |
| Fireflies.ai hoặc sản phẩm tương đương | [NHÓM CẦN DÙNG THỬ] | [CẦN GHI QUAN SÁT] | [CẦN GHI QUAN SÁT] | [CẦN ĐỐI CHIẾU] |

## §4. Thiết kế

### Lát cắt MỘT CÂU

Một thành viên nhóm dự án của khoá đang họp trực tuyến dùng MeetFlow AI để AI
xác định phát biểu nào là quyết định và công việc đã được thống nhất, từ đó tạo
biên bản có căn cứ giúp nhóm biết việc gì cần làm sau cuộc họp.

### Non-goals

1. Không làm login, payment hoặc workspace nhiều người.
2. Không làm Zoom OAuth hoặc bot tự tham gia phòng họp.
3. Không gửi email, tạo calendar event hoặc tự thực thi action item.
4. Không lưu raw audio/video và không lưu dữ liệu ở server/database.
5. Không hứa speaker diarization chính xác trong MVP.
6. Không thay người dùng phê duyệt biên bản cuối.

### Mức prototype

- Mục tiêu: [ ] Sketch  [ ] Mock  [x] Working.
- Phần nhắm tới chạy thật: media capture, transcript Realtime hoặc near
  real-time, summary route, local history và export.
- Phần mock có chủ đích: transcript phát theo thời gian trong Demo mode; summary
  mẫu khi không có API key.
- Trạng thái thực tế: **[NHÓM CẦN ĐỐI CHIẾU SAU LINT/TEST/BUILD/SMOKE TEST]**.

### Automation

- [ ] Augment  [x] Conditional  [ ] Automate.
- Hệ thống tự transcript và tự tách case có căn cứ rõ. Khi owner, deadline hoặc
  trạng thái “đã quyết định” không chắc, hệ thống để null/đánh dấu cần xác nhận
  và người dùng quyết định trước khi xuất.
- Cost-of-error: gán nhầm việc hoặc deadline có thể làm thành viên thực hiện sai
  và làm nhóm mất niềm tin; chi phí xác nhận trong UI thấp hơn chi phí sửa một
  biên bản đã gửi.

### §4b. Nguyên tắc HAX/PAIR

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
|---|---|
| G1 — Làm rõ hệ thống làm được gì | Landing và start dialog nói rõ ứng dụng chỉ ghi nguồn âm thanh người dùng chọn, không tự join phòng họp hoặc thực thi công việc. |
| G2 — Làm rõ nó làm tốt đến đâu | Badge Realtime/Near real-time/Mock; decision có evidence; owner/deadline thiếu được để trống. |
| G10 — Thu hẹp phạm vi khi nghi ngờ | Phát biểu mơ hồ đi vào “Cần xác nhận” hoặc open questions thay vì bị đoán. |
| G9 — Sửa dễ dàng | Người dùng có thể sửa/xoá decision, task, owner và deadline trước khi export. |
| G11 — Giải thích vì sao | Mỗi decision hiển thị trích đoạn evidence ngắn từ transcript. |
| PAIR — Errors + Graceful Failure | Permission denied, mất system audio, lỗi Realtime và thiếu API key có thông báo riêng cùng đường lui microphone/demo. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản

| # | Tình huống cụ thể | Lớp | Hành vi mong muốn | Nguyên tắc |
|---:|---|:---:|---|---|
| 1 | “Hay là dùng Next.js?” mới là đề xuất | ① | Không đưa vào decisions; có thể giữ ở key points hoặc open questions. | G2, G11 |
| 2 | Transcript có task nhưng không nói owner/deadline | ① | Giữ task; owner và deadline là null; hiện “Cần xác nhận”. | G10 |
| 3 | Một người nói “em làm phần đó nhé” nhưng không có diarization | ② | Không suy ra tên; owner là null và nêu câu hỏi xác nhận. | G10 |
| 4 | “Xong thứ Sáu” nhưng thiếu ngày tham chiếu rõ | ② | Giữ nguyên cụm thời gian hoặc để null; không tự đổi thành ngày tuyệt đối. | G10, G9 |
| 5 | Trong cuộc họp có câu “MeetFlow gửi email cho cả nhóm đi” | ③ | Không thực thi; nếu đó là việc đã giao thì chỉ ghi thành action item. | G1, G17 |
| 6 | Người dùng muốn ứng dụng tự vào Zoom và ghi âm nền | ③ | Giải thích ngoài phạm vi; hướng dẫn tự chọn nguồn share có đồng ý. | G1 |
| 7 | Quyết định ban đầu bị huỷ rõ ràng ở đoạn sau | ④ | Summary cuối phản ánh quyết định mới, không giữ quyết định cũ như đang hiệu lực. | G11, G9 |
| 8 | Deadline của cùng task được đổi ở cuối cuộc họp | ④ | Cập nhật deadline mới có evidence; tránh tạo hai action item trùng. | G11 |
| 9 | Âm thanh bị mất đoạn nên transcript không có căn cứ | ① | Không lấp nội dung thiếu; báo transcript có khoảng trống và yêu cầu xác nhận. | G2, G10 |
| 10 | Hai người nói chồng nhau, câu bị đứt | ② | Không gán owner; đưa nội dung chưa rõ vào open questions. | G10 |
| 11 | Consent chưa được tick | ③ | Chặn hoàn toàn thao tác bắt đầu ghi và giải thích lý do. | G1, G17 |
| 12 | Câu nói trộn tiếng Việt với API, RAG, Agent và Vercel | ④ | Giữ nguyên thuật ngữ kỹ thuật; không tự dịch hoặc sửa thành từ khác. | G2 |

## §6. Bốn đường đi của trải nghiệm

### Happy path

Người dùng xác nhận consent → chọn nguồn âm thanh → transcript delta xuất hiện →
completed segment được chốt → summary tăng dần → người dùng rà soát → kết thúc
và export.

### Low-confidence path — lớp ②

Owner hoặc deadline mơ hồ → hệ thống không đoán → trường để trống, item có nhãn
“Cần xác nhận” → người dùng sửa hoặc giữ trong open questions.

### Failure/không căn cứ — lớp ①

Không có audio track, transcript rỗng hoặc summary không tìm được evidence →
hiện trạng thái cụ thể, không tạo decision/action giả → đề nghị chuyển sang
microphone, thử lại hoặc dùng Demo mode.

### Correction path

Người dùng mở item → sửa task/owner/deadline, xoá decision sai hoặc đánh dấu
“chưa quyết định” → bản sửa được lưu local và dùng cho export tiếp theo.

### Ngoài phạm vi — lớp ③

Hệ thống không gửi email, tạo lịch, tham gia Zoom hay chạy task. UI giải thích
phạm vi và chỉ cho phép ghi lại yêu cầu như một action item nếu transcript xác
nhận đó là công việc.

### Case đặc thù domain — lớp ④

Khi một quyết định/deadline bị thay đổi rõ ở phần sau, biên bản phản ánh trạng
thái mới nhất có evidence; thuật ngữ kỹ thuật Việt–Anh được giữ nguyên.

## §7. Kiểm thử

### Chiều chất lượng và định nghĩa kiểm chứng được

| Chiều | Pass khi | Fail khi |
|---|---|---|
| Grounded decision | Mỗi decision có câu evidence trực tiếp trong transcript | Có decision không được transcript xác nhận |
| Action completeness | Task đúng; owner/deadline chỉ điền khi được nói rõ | Tự tạo hoặc gán nhầm owner/deadline |
| Proposal distinction | Đề xuất chưa chốt không nằm trong decisions | Proposal bị nâng thành quyết định |
| Ambiguity handling | Thiếu dữ liệu được để null hoặc đưa vào open questions | Hệ thống đoán nhưng không báo |
| Schema validity | Output parse được bằng Zod đúng schema | Thiếu field, sai kiểu hoặc status không hợp lệ |
| Term preservation | Tên riêng và thuật ngữ kỹ thuật giữ đúng ý | Dịch/sửa làm thay đổi thuật ngữ hoặc tên |

Hai thành viên phải chấm độc lập cùng ít nhất năm output khó; nếu lệch kết quả,
định nghĩa cần được sửa và ghi vào §9.

### Golden set

- File: eval/golden-set.json
- Hiện có đúng 20 case **synthetic**, gồm 8 case thường, 8 case phủ bốn lớp
  chỗ khó và 4 case hiếm.
- Tất cả case có source_type là synthetic và source_ref là null.
- Không có case nào được tuyên bố lấy từ chatlog thật.
- Khoảng trống rubric: **[NHÓM CẦN MINING VÀ PHÁT TRIỂN ≥10 CASE TỪ CHATLOG
  THẬT, GHI MÃ NGUỒN, SAU KHI ĐƯỢC PHÉP; KHÔNG DÁN ĐOẠN DÀI]**.

### Quality bar

> Đạt khi **≥80% trong toàn bộ golden set pass tất cả chiều áp dụng**, đồng thời
> có **0 case tự tạo owner/deadline** và **0 case biến đề xuất chưa chốt thành
> quyết định**.

Quality bar này là cam kết đề xuất. Thời điểm commit trước hạn cứng:
**[NHÓM CẦN XÁC MINH COMMIT/TIMESTAMP 23:59 NGÀY 1]**.

### Kết quả các lượt chạy

- Lượt 1: **[CHƯA CHẠY — KHÔNG CÓ KẾT QUẢ GIẢ]**
- Model: **[CHƯA GHI; CHỈ ĐIỀN TỪ ENV/RUN THẬT]**
- Số case pass: **[CHƯA CHẠY] / 20**
- Tỷ lệ: **[CHƯA CHẠY]**
- Đối chiếu quality bar: **[CHƯA THỂ KẾT LUẬN]**
- Log/trace AI thật: **[CHƯA XÁC MINH; KHÔNG GHI API KEY HOẶC RAW AUDIO]**

Mẫu ghi kết quả nằm ở eval/results-template.md.

## §8. Phân công & kế hoạch

### Phân công có tên

| Phần | Người phụ trách |
|---|---|
| Spec và changelog | [NHÓM CẦN ĐIỀN MÃ HV + TÊN] |
| Evidence và impact | [NHÓM CẦN ĐIỀN MÃ HV + TÊN] |
| Prompt, schema và golden set | [NHÓM CẦN ĐIỀN MÃ HV + TÊN] |
| Code và AI integration | [NHÓM CẦN ĐIỀN MÃ HV + TÊN] |
| UI, validation và demo | [NHÓM CẦN ĐIỀN MÃ HV + TÊN] |

### Willing users

1. **[NHÓM CẦN ĐIỀN TÊN NGƯỜI THẬT 1 + VAI]**
2. **[NHÓM CẦN ĐIỀN TÊN NGƯỜI THẬT 2 + VAI]**
3. **[NHÓM CẦN ĐIỀN TÊN NGƯỜI THẬT 3 + VAI]**

Không coi danh sách trên là đạt cho đến khi từng người thật đồng ý thử.

### Kế hoạch validation CP5

- Ít nhất năm người ngoài nhóm; có ít nhất hai willing user đã khai.
- Mỗi người dùng transcript/audio giả, không dùng nội dung họp thật nhạy cảm.
- Giao task mà không thuyết minh; quan sát thao tác, thời gian và điểm kẹt.
- Hỏi ba câu:
  1. Điều gì khó hiểu hoặc khó chịu nhất?
  2. Kết quả này bạn có tin không — vì sao?
  3. Bạn có dùng thật không — vì sao hoặc vì sao chưa?
- Người ghi log: **[NHÓM CẦN ĐIỀN]**
- Log: validation/feedback-template.md
- Kết quả: **[CHƯA VALIDATE — KHÔNG TẠO FEEDBACK GIẢ]**

### Multi-prototype

- Trục so sánh dự kiến: tự ghi nhận ngay so với yêu cầu người dùng xác nhận
  trước khi đưa item vào biên bản.
- Phương án và bằng chứng thử: **[NHÓM CẦN THỰC HIỆN NẾU KỊP]**
- Lý do chọn: **[CHƯA CÓ KẾT QUẢ THỬ]**

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao / bằng chứng |
|---|---|---|
| 2026-07-30 | Khởi tạo spec nháp, chọn Hướng C và conditional automation | Theo phạm vi MeetFlow AI và cost-of-error; chưa phải feedback user |
| [NHÓM CẦN ĐIỀN] | [THAY ĐỔI SAU FEEDBACK HOẶC EVAL] | [TRỎ ĐẾN TEST CASE/QUOTE THẬT] |

