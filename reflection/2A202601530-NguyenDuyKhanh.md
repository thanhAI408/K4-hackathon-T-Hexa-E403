# Reflection — [2A202601530] — Nguyễn Duy Khánh

## 1. Vai trò và phần tôi phụ trách

- **Vai trò:** Product Manager (PM), đồng thời hỗ trợ thiết kế luồng sản phẩm và đánh giá tính khả thi.

- **File/flow cụ thể tôi chịu trách nhiệm:**
  - Thiết kế PRD và xác định phạm vi MVP.
  - Thiết kế luồng xử lý từ transcript cuộc họp đến các đầu ra của hệ thống.
  - Xây dựng prompt cho AI Agent để tạo:
    - Meeting Summary.
    - Deadline.
    - Meeting Report.
  - Thiết kế tiêu chí đánh giá chất lượng đầu ra.

- **Tôi có thể giải thích phần này end-to-end như sau:**

  Người dùng tham gia cuộc họp trực tuyến, hệ thống nhận luồng transcript theo thời gian thực từ công cụ Speech-to-Text. Transcript được lưu và truyền vào AI Agent theo từng đoạn. AI liên tục cập nhật bản tóm tắt, phát hiện deadline, người phụ trách và các quyết định quan trọng của cuộc họp. Sau khi cuộc họp kết thúc, Agent tổng hợp toàn bộ nội dung để tạo báo cáo cuối cùng gồm Summary, Deadline và Meeting Report.

---

## 2. Tôi đã làm gì

- **Quyết định quan trọng tôi đưa ra:**
  - Giới hạn phạm vi MVP chỉ tập trung vào các tính năng mang lại giá trị cao nhất:
    - Tóm tắt cuộc họp theo thời gian thực.
    - Trích xuất deadline.
    - Sinh báo cáo sau cuộc họp.

- **Bằng chứng/test case ảnh hưởng đến quyết định:**
  - Thử nghiệm với nhiều transcript mẫu có độ dài và nội dung khác nhau.
  - So sánh kết quả giữa prompt đơn giản và prompt có cấu trúc.
  - Đánh giá xem AI có trích xuất đúng các deadline và nội dung quan trọng hay không.

- **Cách tôi kiểm tra phần mình làm:**
  - Chuẩn bị nhiều transcript mẫu.
  - Đối chiếu Summary với nội dung gốc.
  - Kiểm tra tính chính xác của các deadline được trích xuất.
  - Đánh giá tính dễ đọc và tính đầy đủ của báo cáo cuối cùng.

---

## 3. AI đã hỗ trợ thế nào

- **Công cụ/model đã dùng:**
  - ChatGPT.
  - Gemini.

- **AI hỗ trợ ở bước nào:**
  - Brainstorm ý tưởng sản phẩm.
  - Hỗ trợ xây dựng PRD.
  - Thiết kế prompt cho AI Agent.
  - Hỗ trợ rà soát tài liệu.

- **Tôi đã kiểm tra, sửa hoặc từ chối output nào:**
  - Chỉnh sửa prompt để AI chỉ sử dụng thông tin có trong transcript.
  - Loại bỏ các nội dung AI tự suy diễn.
  - Chuẩn hóa format của Summary và Meeting Report để thống nhất giữa các lần chạy.

- **Phần nào là quyết định của tôi, không giao cho AI:**
  - Xác định phạm vi MVP.
  - Lựa chọn các tính năng ưu tiên.
  - Thiết kế luồng sản phẩm.
  - Quyết định cấu trúc đầu ra của hệ thống.

> Không sử dụng API key, secret, raw audio hoặc dữ liệu người thật trong quá trình phát triển.

---

## 4. Một case fail của chính nhóm

- **Input/tình huống:**

  Transcript chứa câu:

  > "Tuần sau mình sẽ cố gắng hoàn thành giao diện, nếu kịp thì demo vào thứ Sáu."

- **Output hoặc hành vi sai:**

  AI tự động tạo deadline là **thứ Sáu tuần sau**, mặc dù đây chỉ là kế hoạch dự kiến chứ chưa phải quyết định chính thức.

- **Vì sao lỗi này quan trọng với người dùng:**

  Nếu AI tự suy diễn các kế hoạch thành deadline chính thức, báo cáo cuộc họp sẽ không còn chính xác và có thể gây hiểu nhầm trong quá trình quản lý công việc.

- **Nhóm đã tìm nguyên nhân thế nào:**

  Sau khi kiểm tra prompt, nhóm nhận thấy Agent đang coi mọi câu chứa mốc thời gian đều là deadline mà chưa phân biệt giữa kế hoạch và quyết định đã thống nhất.

- **Thay đổi đã làm:**

  Điều chỉnh prompt để:
  - Chỉ trích xuất deadline khi cuộc họp đã đưa ra quyết định hoặc có sự thống nhất.
  - Không tạo deadline từ các câu mang tính đề xuất hoặc dự kiến.

- **Kết quả sau khi chạy lại:**

  AI không còn sinh các deadline không chính xác và báo cáo phản ánh đúng nội dung của cuộc họp.

---

## 5. Bài học

- **Một điều tôi hiểu khác đi sau hackathon:**

  Tôi nhận ra chất lượng của AI Agent không chỉ phụ thuộc vào mô hình AI mà còn phụ thuộc rất nhiều vào việc thiết kế prompt, workflow và cách đánh giá đầu ra.

- **Nếu có thêm một tuần, tôi sẽ ưu tiên:**
  - Xây dựng bộ dữ liệu đánh giá với nhiều loại cuộc họp khác nhau.
  - Tích hợp với Google Calendar hoặc các công cụ quản lý công việc để tự động tạo lịch sau cuộc họp.
```

## Checklist trước CP5/CP6

- [ ] File có mã học viên và tên thật.
- [ ] Phần phụ trách khớp README và spec §8.
- [ ] Có ít nhất một file/flow cụ thể.
- [ ] Có một case fail thật của nhóm.
- [ ] Giải thích được phần có tên mình mà không đọc script.
- [ ] Không chứa secret hoặc dữ liệu nhạy cảm.

