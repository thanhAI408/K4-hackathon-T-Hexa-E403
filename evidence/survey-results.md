# MeetFlow AI — Báo cáo khảo sát người dùng

- **Nguồn:** Google Forms / Google Sheets: https://docs.google.com/spreadsheets/d/1tKafXxzttLuK1h84Afte1qdmWblpV5qyoXxNKPa6oyo/edit?usp=sharing
- **Thời gian ghi nhận:** 30/07/2026, từ 15:19 đến 16:02 (GMT+7)
- **Số phản hồi hợp lệ:** **36**
- **Dữ liệu gốc:** `survey-responses.xlsx`
- **Người phụ trách:** Nguyễn Hoàng Hải — 2A202601426
- **Người kiểm tra số liệu:** Nguyễn Văn Thành — 2A202601030

> Khảo sát gồm câu hỏi lựa chọn, không thu tên và không có câu trả lời mở. Vì vậy
> dữ liệu này tạo bằng chứng định lượng tốt, nhưng **không thay thế vòng validation
> có tên và quote nguyên văn sau khi dùng prototype**.

## 1. Câu hỏi khảo sát

1. Trung bình mỗi tuần bạn tham gia bao nhiêu cuộc họp online?
2. Với buổi họp dài hơn 60 phút, bạn kiểm soát được bao nhiêu phần nội dung?
3. Bạn có nhận được tổng kết cuối buổi họp dài không?
4. Khi họp dày đặc, bạn muốn tổng hợp nội dung theo cách nào?
5. Nếu có công cụ hỗ trợ tóm tắt, bạn có sẵn sàng sử dụng không?

Toàn bộ 36 dòng trả lời nằm trong file `survey-responses.xlsx`.

## 2. Kết quả chính

| Chỉ số | Kết quả | Diễn giải |
|---|---:|---|
| Tham gia ít nhất 3 cuộc họp online/tuần | **33/36 — 91.7%** | Nhu cầu lặp lại với tần suất cao |
| Tham gia ít nhất 5 cuộc họp online/tuần | **19/36 — 52.8%** | Hơn một nửa có mật độ họp cao |
| Không kiểm soát được 100% nội dung buổi họp >60 phút | **31/36 — 86.1%** | Đa số thừa nhận bỏ sót một phần nội dung |
| Chỉ kiểm soát được 25–50% nội dung | **18/36 — 50.0%** | Một nửa chỉ giữ được tối đa một nửa nội dung |
| Không thường xuyên nhận được tổng kết cuối buổi | **29/36 — 80.6%** | Chỉ 7 người thường xuyên nhận tổng kết |
| **Pain proxy:** vừa bỏ sót nội dung, vừa không thường xuyên có tổng kết | **26/36 — 72.2%** | Vượt ngưỡng evidence ≥50% |
| Chọn phương án AI Agent voice → text + tổng hợp | **18/36 — 50.0%** | Phương án được chọn nhiều nhất |
| Sẵn sàng sử dụng | **30/36 — 83.3%** | Mức chấp nhận trực tiếp cao |
| Sẵn sàng hoặc có thể cân nhắc | **35/36 — 97.2%** | Chỉ 1 người từ chối |

### Phân bố tần suất họp

| Tần suất | Số người | Tỷ lệ |
|---|---:|---:|
| Dưới 3/tuần | 3 | 8.3% |
| 3–5/tuần | 14 | 38.9% |
| 5–7/tuần | 11 | 30.6% |
| Trên 7/tuần | 8 | 22.2% |

### Khả năng kiểm soát nội dung cuộc họp dài

| Phần nội dung kiểm soát được | Số người | Tỷ lệ |
|---|---:|---:|
| 25% | 5 | 13.9% |
| 50% | 13 | 36.1% |
| 75% | 13 | 36.1% |
| 100% | 5 | 13.9% |

### Mức độ nhận tổng kết cuối buổi

| Trạng thái | Số người | Tỷ lệ |
|---|---:|---:|
| Thường xuyên | 7 | 19.4% |
| Thi thoảng | 13 | 36.1% |
| Chỉ nhận khi đề xuất với ban tổ chức | 14 | 38.9% |
| Không bao giờ | 2 | 5.6% |

## 3. Quy tắc xác nhận pain

Trong báo cáo này, một phản hồi được tính vào **pain proxy** khi đồng thời:

1. Người trả lời không kiểm soát được 100% nội dung buổi họp dài; và
2. Người trả lời không thường xuyên nhận được tổng kết cuối buổi.

Theo định nghĩa đã chốt trước khi tính, có **26/36 phản hồi (72,2%)** đáp ứng cả
hai điều kiện. Đây là bằng chứng định lượng cho vấn đề “bỏ sót nội dung và thiếu
biên bản/tổng kết”, nhưng chưa đo trực tiếp số phút lãng phí hoặc số action item
bị bỏ sót.

## 4. Năm ví dụ nguyên văn từ dữ liệu gốc

Các ví dụ dưới đây dùng **mã phản hồi**, không suy đoán danh tính.

### Phản hồi R01

- Tần suất họp: **5-7 cuộc/tuần**
- Kiểm soát nội dung: **25%**
- Tổng kết cuối buổi: **“Nhận được nếu đề xuất với ban tổ chức”**
- Cách mong muốn: **“Sử dụng AI Agent có khả năng hỗ trợ ghi chép voice -> text và tổng hợp cuối buổi”**
- Sẵn sàng sử dụng: **“Sẵn sàng”**

### Phản hồi R08

- Tần suất họp: **3-5 cuộc/tuần**
- Kiểm soát nội dung: **75%**
- Tổng kết cuối buổi: **“Không bao giờ(chưa từng)”**
- Cách mong muốn: **“Hỏi lại các thành viên cùng tham gia họp”**
- Sẵn sàng sử dụng: **“Không”**

### Phản hồi R16

- Tần suất họp: **3-5 cuộc/tuần**
- Kiểm soát nội dung: **25%**
- Tổng kết cuối buổi: **“Không bao giờ(chưa từng)”**
- Cách mong muốn: **“Sử dụng AI Agent có khả năng hỗ trợ ghi chép voice -> text và tổng hợp cuối buổi”**
- Sẵn sàng sử dụng: **“Sẵn sàng”**

### Phản hồi R20

- Tần suất họp: **5-7 cuộc/tuần**
- Kiểm soát nội dung: **100%**
- Tổng kết cuối buổi: **“Nhận được nếu đề xuất với ban tổ chức”**
- Cách mong muốn: **“Hỏi lại các thành viên cùng tham gia họp”**
- Sẵn sàng sử dụng: **“Sẵn sàng”**

### Phản hồi R34

- Tần suất họp: **3-5 cuộc/tuần**
- Kiểm soát nội dung: **25%**
- Tổng kết cuối buổi: **“Nhận được nếu đề xuất với ban tổ chức”**
- Cách mong muốn: **“Sử dụng AI Agent có khả năng hỗ trợ ghi chép voice -> text và tổng hợp cuối buổi”**
- Sẵn sàng sử dụng: **“Có thể cân nhắc”**

## 5. Bảng impact dùng trong spec

| Ứng viên | Bằng chứng về số người | Tần suất/chi phí quan sát được | Khả thi | Quyết định |
|---|---|---|---|---|
| **A. Biên bản hành động tăng dần trong cuộc họp** | 26/36 có pain proxy; 18/36 chọn AI Agent; 30/36 sẵn sàng | 33/36 họp ≥3 lần/tuần; 31/36 bỏ sót một phần nội dung | Đã build và deploy | **Chọn** |
| **B. Chỉ tóm tắt sau khi họp xong** | 29/36 không thường xuyên có tổng kết | Giải quyết thiếu tổng kết, nhưng không cho xác nhận owner/deadline ngay khi đang họp | Build được | Loại khỏi lát cắt |
| **C. Nhắc deadline + đồng bộ calendar** | Khảo sát không đo nhu cầu này | Sai deadline có cost-of-error cao; cần quyền ghi lịch/integration | Không phù hợp MVP | Loại |

## 6. Kết luận và giới hạn

- Kết quả vượt điều kiện khảo sát tối thiểu 20 người và ngưỡng 50%.
- Phương án AI Agent là lựa chọn phổ biến nhất trong bốn phương án.
- Mức sẵn sàng dùng cao, nhưng khảo sát không thu tên; vì vậy chưa đủ danh sách
  **3 willing users có tên**.
- Khảo sát chưa hỏi số phút lãng phí, chưa thu câu chuyện về “lần gần nhất”, và
  chưa phải usability validation sau khi dùng MeetFlow AI.
- Trước CP5/CP6 vẫn phải test prototype với ít nhất 5 người ngoài nhóm, ghi tên/vai,
  quan sát và quote nguyên văn.
