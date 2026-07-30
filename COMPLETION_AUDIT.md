# MeetFlow AI — Kiểm tra mức độ hoàn thiện artifact

Ngày kiểm tra: **30/07/2026**  
Nhóm: **T-Hexa — E403**  
Lead: **Nguyễn Văn Thành — 2A202601030**

## Kết luận nhanh

Prototype và deployment đã hoàn thành tốt, nhưng bài nộp **chưa hoàn chỉnh theo rubric** vì còn thiếu bằng chứng người dùng, kết quả evaluation, validation, slide và reflection cá nhân. Không nên thay các phần này bằng số liệu giả.

## Trạng thái từng artifact

| Artifact | Trạng thái | Việc cần làm |
|---|---|---|
| `README.md` | Đã cập nhật trong gói này | Thay file ở root repo; kiểm tra lại Zone E403 |
| `spec.md` | Đã cập nhật phần nhóm, phân công, deploy | Bổ sung evidence, impact, similar-product log, willing users, eval và validation thật |
| `codebase/` | Đã build và deploy | Chạy smoke test mic/system audio/Realtime/fallback; lưu ảnh hoặc trace an toàn |
| `eval/golden-set.json` | Có 20 case synthetic | Rubric yêu cầu thêm ít nhất 10 case data-derived nếu quy định không đổi |
| `eval/results-template.md` | Chưa chạy | Chạy đủ 20 case, giữ actual output, hai người chấm độc lập 5 case khó |
| `validation/feedback-template.md` | Chưa có feedback | Test với ≥5 người ngoài nhóm, trong đó ≥2 willing users |
| `reflection/` | Chỉ có hướng dẫn | Gói này tạo 5 draft; từng thành viên phải xác nhận và viết case fail thật |
| `demo-slides.pdf` | Chưa có | Tạo 6 slide theo guide §5.1 trước CP6 |
| Evidence log | Chưa có | Dùng file `evidence/survey-plan-and-log.md` trong gói |

## Đánh giá theo rubric 75 điểm

### R1 — Evidence & impact (15 điểm): **chưa đạt**

Thiếu khảo sát ≥20 người ngoài nhóm hoặc mining đạt chuẩn; thiếu ≥5 quote; bảng impact chưa có số. Đây là phần ưu tiên cao nhất vì chiếm 15 điểm.

### R2 — Lát cắt & thiết kế (15 điểm): **gần hoàn chỉnh**

Lát cắt, non-goals, conditional automation và HAX/PAIR đã được viết rõ. Cần bảo đảm bản build thật sự cho phép sửa/xóa item đúng như spec.

### R3 — Chỗ khó & kịch bản (11 điểm): **phần tài liệu tốt**

Spec có 12 kịch bản, phủ đủ bốn lớp và đủ các đường trải nghiệm. Cần chuẩn bị một case lỗi live để demo.

### R4 — Kiểm thử (15 điểm): **chưa đạt phần kết quả**

Có 20 case synthetic và quality bar 80%, nhưng chưa có actual output, bảng kết quả và phân tích failure. Bộ hiện tại cũng chưa có case data-derived.

### R5 — Prototype (8 điểm): **khả năng đạt cao**

Working MVP đã deploy. Cần lưu bằng chứng ít nhất một AI call thật ở quyết định trung tâm và ghi rõ phần mock.

### R6 — Validation (8 điểm): **chưa đạt**

Chưa có feedback từ 5 người ngoài nhóm và chưa có thay đổi dựa trên feedback.

### R7 — Quy trình & repo (3 điểm): **sau khi thay README sẽ gần đạt**

README đã có đủ tên và phân công. Cần bổ sung slide và 5 reflection cá nhân để repo hoàn chỉnh cho demo.

## Thứ tự làm trong buổi còn lại

1. **Hải + Thành:** khảo sát 20 người, chốt evidence và bảng impact.
2. **Khánh:** chạy 20 case, lưu output và điền bảng kết quả.
3. **Thắng + Ninh:** validation 5 người, ghi quote và chọn một thay đổi UI.
4. **Thành + Ninh:** smoke test production mic/system audio/Realtime/fallback.
5. **Thắng:** làm slide 6 trang và điều phối dry run 5 phút.
6. **Mỗi thành viên:** hoàn thiện reflection của mình và học phần code/tài liệu được phân công.

## Những nội dung không thể hoàn thiện thay nhóm

Các mục sau bắt buộc phải đến từ hoạt động thật: câu trả lời khảo sát, quote người dùng, tên willing users, actual output của model, pass/fail evaluation, feedback validation và bài học/case fail cá nhân. Tạo giả các dữ liệu này có thể làm mất toàn bộ điểm mục tương ứng.
