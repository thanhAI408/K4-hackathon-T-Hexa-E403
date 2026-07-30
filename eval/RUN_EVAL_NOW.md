# Chạy evaluation production ngay

Từ **root repository**:

```powershell
node eval/run-production-eval.mjs
```

Thời gian dự kiến khoảng **2–3 phút** vì route production giới hạn 10 request/phút.

Script không cần API key trên máy. Nó gọi:

```text
https://meetflow-ai-ruby.vercel.app/api/summarize
```

và tạo:

- `eval/run-01-results.json` — input, expected, actual output và checks từng case.
- `eval/run-01-results.md` — bảng PASS/FAIL và đối chiếu quality bar.

Sau khi chạy:

1. Hai thành viên chấm độc lập `MF-009`, `MF-010`, `MF-011`, `MF-015`, `MF-017`.
2. Không sửa quality bar 80% sau khi thấy kết quả.
3. Cập nhật `spec.md` §7 và slide 4 bằng số thật.
4. Nếu fail, chọn **một failure đau nhất**, sửa prompt/code rồi chạy lại toàn bộ.
5. Không commit API key, raw audio hoặc dữ liệu họp thật.

### Trường hợp lỗi Origin/429

- Giữ nguyên production URL trong script.
- Nếu gặp 429, script tự đợi và retry.
- Nếu đổi domain:

```powershell
$env:MEETFLOW_BASE_URL="https://domain-moi.vercel.app"
node eval/run-production-eval.mjs
```
