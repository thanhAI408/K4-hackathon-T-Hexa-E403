# MeetFlow AI Evaluation

Thư mục này tách rõ **test design** khỏi **kết quả chạy thật**.

- golden-set.json chứa 20 input synthetic và expected behavior.
- results-template.md là mẫu trống để ghi một lượt chạy trọn bộ.
- Chưa có file nào trong thư mục này chứng minh model đã chạy hoặc quality bar
  đã đạt.

## Cam kết dữ liệu

- Toàn bộ 20 case hiện tại có source_type = synthetic.
- source_ref luôn là null; không có mã chatlog hoặc quote người thật bị bịa.
- Tên vai như “Thành viên A” chỉ là nhân vật giả lập.
- Input không chứa dữ liệu họp, audio hoặc thông tin cá nhân của người thật.
- Expected output là tiêu chí mong đợi, không phải actual output.

Rubric yêu cầu ít nhất 10 case lấy hoặc phát triển từ chatlog thật. Bộ hiện tại
**chưa đạt yêu cầu provenance đó**. Sau khi nhóm mining dữ liệu được phép, hãy:

1. Ghi phương pháp chọn pattern và mã conversation/turn thật.
2. Chỉ dùng trích dẫn tối thiểu; không dán đoạn hội thoại dài.
3. Thêm hoặc thay case với source_type = data_derived và source_ref hợp lệ.
4. Không dùng các case data-derived để tuyên bố pain cuộc họp nếu nguồn không hỗ
   trợ pain đó.
5. Ghi thay đổi vào spec.md §9 trước khi chạy lại toàn bộ.

## Cơ cấu 20 case hiện tại

| Nhóm | Số case | ID |
|---|---:|---|
| Thường | 8 | MF-001 đến MF-008 |
| Chỗ khó — 2 case cho mỗi lớp ①②③④ | 8 | MF-009 đến MF-016 |
| Hiếm | 4 | MF-017 đến MF-020 |

Các case synthetic tối thiểu theo yêu cầu sản phẩm đều đã có: quyết định rõ;
action có owner/deadline; action thiếu owner; đề xuất chưa quyết định; câu mơ hồ;
câu hỏi chưa được giải quyết.

## Cách đọc schema

Mỗi case có:

- id, title, case_group và risk_class để kiểm tra độ phủ.
- source_type/source_ref để ghi provenance.
- input là payload logic cho summary, gồm previousSummary và newTranscript.
- expected là hành vi cần có, dùng các trường contains thay vì ép câu chữ tuyệt
  đối.
- hard_fail_if là lỗi làm case fail bất kể các chiều khác.

Không thêm trường actual, pass hoặc score vào golden-set.json. Kết quả của mỗi
lượt chạy phải nằm trong một file riêng được tạo từ results-template.md.

## Chiều chấm

1. **Grounded decision:** mọi decision có evidence trực tiếp.
2. **Action completeness:** task đúng; owner/deadline chỉ có khi được nói rõ.
3. **Proposal distinction:** đề xuất chưa chốt không thành decision.
4. **Ambiguity handling:** thiếu dữ liệu được để null/open question.
5. **Schema validity:** response parse được bằng Zod.
6. **Term preservation:** giữ nguyên tên và thuật ngữ kỹ thuật.

Case pass khi đạt tất cả chiều áp dụng.

## Quality bar đã đề xuất trong spec

- Tỷ lệ case pass toàn bộ ≥80%.
- Hard guardrail: 0 owner/deadline tự tạo.
- Hard guardrail: 0 đề xuất chưa chốt bị biến thành quyết định.

Không được đổi bar sau khi thấy kết quả thấp. Nếu chưa đạt, ghi đầy đủ failure
và phân tích nguyên nhân.

## Quy trình chạy

1. Ghi commit SHA, model từ environment và thời điểm bắt đầu.
2. Chạy toàn bộ 20 case trên cùng phiên bản code/prompt.
3. Lưu actual output của mọi case, kể cả fail.
4. Hai người chấm độc lập ít nhất năm case khó.
5. Tính tỷ lệ và đối chiếu quality bar.
6. Chọn một failure đau nhất, sửa một thay đổi có tên.
7. Chạy lại toàn bộ; không chỉ chạy case vừa sửa.

Không ghi API key, raw audio hoặc transcript người thật vào log.

