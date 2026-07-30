# Reflection — 2A202601426 — Nguyễn Hoàng Hải

## 1. Vai trò và phần tôi phụ trách

**Vai trò:** AI Engineer

**File/flow cụ thể tôi chịu trách nhiệm:**

* Thiết kế và triển khai luồng tích hợp OpenAI cho bài toán nhận dạng giọng nói và tóm tắt cuộc họp.
* Xây dựng pipeline chuyển đổi từ audio → transcript → structured meeting summary.
* Tham gia thiết kế cơ chế fallback từ Realtime Transcription sang Near Real-time Transcription nhằm đảm bảo hệ thống vẫn hoạt động khi kết nối WebRTC gặp sự cố.
* Tham gia xây dựng prompt và cấu trúc dữ liệu cho AI Summary để tạo ra biên bản cuộc họp có cấu trúc gồm:

  * Key points
  * Decisions
  * Action items
  * Open questions

**Tôi có thể giải thích phần này end-to-end như sau:**

Người dùng bắt đầu ghi âm cuộc họp thông qua microphone hoặc âm thanh màn hình. Hệ thống ưu tiên sử dụng OpenAI Realtime Transcription thông qua WebRTC để nhận transcript với độ trễ thấp. Trong trường hợp kết nối Realtime thất bại hoặc bị gián đoạn, hệ thống tự động chuyển sang Near Real-time mode bằng cách chia âm thanh thành các đoạn khoảng 7 giây và gửi tuần tự tới OpenAI Speech-to-Text API.

Sau khi transcript được cập nhật, phần transcript mới sẽ được gửi cùng với summary trước đó tới OpenAI Responses API. AI tạo ra bản tóm tắt theo schema đã được xác thực bằng Zod nhằm đảm bảo đầu ra luôn đúng định dạng. Kết quả cuối cùng được hiển thị trên giao diện và lưu trong localStorage để người dùng có thể chỉnh sửa hoặc export dưới dạng Markdown và JSON.

---

## 2. Tôi đã làm gì

### Quyết định quan trọng tôi đưa ra

* Ưu tiên sử dụng Realtime Transcription để giảm độ trễ trong quá trình ghi nhận nội dung cuộc họp.
* Thiết kế cơ chế fallback sang Near Real-time thay vì dừng hoàn toàn hệ thống khi WebRTC gặp lỗi, giúp đảm bảo trải nghiệm người dùng.
* Sử dụng Structured Output kết hợp Zod để kiểm tra tính hợp lệ của dữ liệu AI trả về, tránh các lỗi định dạng.
* Thiết kế prompt yêu cầu AI không tự suy diễn thông tin, chỉ ghi nhận các quyết định, người phụ trách và deadline khi thực sự được đề cập trong cuộc họp.

### Bằng chứng/test case ảnh hưởng đến quyết định

* Kiểm thử trường hợp Realtime hoạt động bình thường và transcript được cập nhật liên tục.
* Kiểm thử khi kết nối WebRTC bị lỗi để xác nhận hệ thống tự động chuyển sang Near Real-time mode.
* Kiểm thử các transcript dài nhằm đánh giá khả năng cập nhật summary tăng dần (incremental summary).
* Kiểm thử các cuộc họp không có thông tin rõ ràng về người phụ trách hoặc thời hạn để đảm bảo AI không sinh thông tin không tồn tại.

### Cách tôi kiểm tra phần mình làm

* Kiểm tra transcript thu được giữa Realtime và Near Real-time.
* So sánh kết quả summary với nội dung transcript gốc.
* Kiểm tra dữ liệu trả về có đúng schema hay không.
* Thực hiện nhiều lần ghi âm với các nguồn âm thanh khác nhau để đánh giá độ ổn định của pipeline AI.

---

## 3. AI đã hỗ trợ thế nào

### Công cụ/model đã dùng

* ChatGPT
* OpenAI Realtime Transcription
* OpenAI Speech-to-Text (gpt-transcribe)
* OpenAI Responses API
* Zod

### AI hỗ trợ ở bước nào

* Hỗ trợ xây dựng prompt cho phần tóm tắt cuộc họp.
* Hỗ trợ tìm hiểu tài liệu về OpenAI Realtime API.
* Hỗ trợ phân tích và xử lý một số lỗi trong quá trình tích hợp.
* Hỗ trợ đề xuất cấu trúc output cho meeting summary.

### Tôi đã kiểm tra, sửa hoặc từ chối output nào

Các nội dung AI sinh ra đều được đối chiếu với transcript thực tế. Trong nhiều trường hợp AI có xu hướng suy diễn người chịu trách nhiệm hoặc deadline khi cuộc họp không đề cập rõ, vì vậy tôi điều chỉnh prompt và chỉ chấp nhận các thông tin có căn cứ từ transcript.

### Phần nào là quyết định của tôi, không giao cho AI

* Lựa chọn kiến trúc pipeline AI.
* Thiết kế luồng fallback giữa Realtime và Near Real-time.
* Quyết định cấu trúc dữ liệu của meeting summary.
* Kiểm tra tính chính xác của kết quả AI trước khi tích hợp vào hệ thống.

---

## 4. Một case fail của chính nhóm

### Input/tình huống

Người dùng lựa chọn ghi âm bằng chế độ chia sẻ âm thanh màn hình, tuy nhiên trong quá trình chia sẻ không bật tùy chọn "Share audio" của Chrome.

### Output hoặc hành vi sai

Hệ thống không nhận được audio track nên không thể tạo transcript mặc dù người dùng vẫn nghĩ rằng cuộc họp đang được ghi nhận.

### Vì sao lỗi này quan trọng với người dùng

Nếu người dùng không phát hiện kịp thời, toàn bộ nội dung cuộc họp có thể không được ghi lại, dẫn đến mất dữ liệu và không thể tạo biên bản.

### Nhóm đã tìm nguyên nhân thế nào

Kiểm tra quá trình capture audio và xác định browser không cung cấp audio track khi người dùng không bật tùy chọn chia sẻ âm thanh trong cửa sổ chọn screen share.

### Thay đổi đã làm

Nhóm bổ sung cơ chế kiểm tra sự tồn tại của audio track. Khi không phát hiện được system audio, hệ thống hiển thị thông báo lỗi rõ ràng và yêu cầu người dùng chọn lại nguồn ghi âm thay vì tự động chuyển sang microphone.

### Kết quả sau khi chạy lại

Người dùng nhận được thông báo ngay khi thiếu audio track và có thể thực hiện lại thao tác chia sẻ màn hình đúng cách. Điều này giúp tránh việc ghi sai nguồn âm thanh và cải thiện trải nghiệm sử dụng.

---

## 5. Bài học

### Một điều tôi hiểu khác đi sau hackathon

Tôi nhận thấy việc xây dựng ứng dụng AI không chỉ tập trung vào mô hình mà còn cần quan tâm đến toàn bộ pipeline xử lý dữ liệu, khả năng chịu lỗi, trải nghiệm người dùng và cơ chế fallback. Một hệ thống AI tốt không chỉ cho kết quả chính xác mà còn phải hoạt động ổn định trong nhiều tình huống thực tế.

### Nếu có thêm một tuần, tôi sẽ ưu tiên

* Nâng cao chất lượng prompt để cải thiện độ chính xác của meeting summary.
* Bổ sung speaker diarization để phân biệt người nói.
* Tối ưu tốc độ cập nhật summary theo thời gian thực.
* Mở rộng bộ kiểm thử với nhiều tình huống cuộc họp thực tế nhằm đánh giá chất lượng transcript và summary toàn diện hơn.
