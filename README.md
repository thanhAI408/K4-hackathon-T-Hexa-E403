# Mini Hackathon AI — Batch 03

**SPEC → Prototype → Demo.** Đây không phải cuộc thi code — đây là cuộc thi **tư duy sản phẩm AI**.

- Thời lượng: **1,5 ngày** (một ngày build + một buổi demo)
- Nhóm: **4-5 người** · zone tối đa 5 nhóm · thi theo lớp

## Bắt đầu từ đâu?

1. Đọc **`01-de-bai.md`** để chọn hướng và hiểu tiêu chí.
2. Mở **`02-guide.md`** — hướng dẫn từng giai đoạn, đứng ở đâu đọc mục đó.
3. Viết spec theo **`03-template-ai-spec.md`** — deliverable trung tâm của cả sự kiện.
4. Đọc **`04-rubric.md`** ngay từ đầu — biết trước bài được chấm theo tiêu chí nào.

| File / thư mục | Nội dung |
|---|---|
| `01-de-bai.md` | Đề bài 3 hướng · 5 tiêu chí nghiệm thu · ràng buộc chung |
| `02-guide.md` | Hướng dẫn 5 giai đoạn: khám phá → spec → build → đo & validate → demo |
| `03-template-ai-spec.md` | Template AI Spec (nộp 23:59 ngày 1) |
| `04-rubric.md` | Rubric 100 điểm (25 nộp checkpoint + 75 chấm bài) + checklist xác minh 6 mốc |
| `data/` | Dữ liệu thật đã ẩn danh: chatlog VLearn tutor + 6 transcript bài giảng + 2 bộ slide bản hackathon — dùng để tìm bằng chứng và xây golden set |
| `tham-khao/` | JTBD Playbook (PDF) + worksheet JTBD đầy đủ — đọc khi muốn đào sâu |

## Lịch — 6 mốc

| Mốc | Khoá 3 | Khoá 4 |
|---|---|---|
| Khai mạc + phát đề | 09:00 ngày 1 | 14:00 ngày 1 |
| CP1 · Chốt Canvas | 10:00 ngày 1 | 15:00 ngày 1 |
| CP2 · Show được thứ bấm được | 12:00 ngày 1 | 17:00 ngày 1 |
| CP3 · AI chạy thật + đo lượt đầu | 16:00 ngày 1 | 10:30 ngày 2 |
| CP4 · Chốt tiến độ — spec nộp hạn cứng **23:59 ngày 1** | 17:30 ngày 1 | 12:00 ngày 2 |
| CP5 · Xác minh + validation + dry run | 09:00 ngày 2 | 14:00 ngày 2 |
| CP6 · Demo | 10:00 ngày 2 | 15:00 ngày 2 |

Mỗi mốc cần show gì và được xác minh thế nào: xem bảng trong `04-rubric.md`.

## Nộp bài

Một repo nhóm, cấu trúc như sau. Spec chốt lúc 23:59 ngày 1; bản hoàn chỉnh trước CP6.

```
repo/
├── README.md          ← thành viên (mã HV + tên) + phân công có tên từng phần
├── spec.md            ← AI Spec theo 03-template-ai-spec.md
├── demo-slides.pdf    ← slide 6 trang theo 02-guide.md §5.1
├── codebase/          ← prototype (ghi rõ phần nào mock)
├── eval/              ← golden set + bảng kết quả các lượt chạy
├── validation/        ← feedback log từ vòng user test
└── reflection/        ← mỗi người 1 file
```

## Chấm điểm

Tổng **100 điểm = 25 điểm nộp checkpoint + 75 điểm chấm bài nộp**. Chi tiết từng ý điểm: `04-rubric.md`.

**25 điểm nộp — mỗi checkpoint 5 điểm (CP1-CP5):** nộp đúng hạn → 5 điểm · nộp muộn → 0 điểm cho mốc đó. Mỗi thành viên nộp riêng, cả nhóm dùng chung một link repo.

**75 điểm chấm — trên artifact trong repo, mỗi con điểm trỏ về một file:**

| Khối | Điểm | Chấm trên file nào |
|---|---|---|
| R1 · Bằng chứng & impact | 15 | `spec.md` §1-§2 + log khảo sát/mining |
| R2 · Lát cắt & thiết kế | 15 | `spec.md` §4 |
| R3 · Chỗ khó & kịch bản rủi ro | 11 | `spec.md` §5-§6 |
| R4 · Kiểm thử | 15 | `spec.md` §7 + `eval/` |
| R5 · Prototype chạy được | 8 | `codebase/` + demo |
| R6 · Validation với user | 8 | `validation/` |
| R7 · Quy trình & repo | 3 | cấu trúc repo |

Ba điều nên biết trước khi làm:

- Điểm dựa trên **chuỗi quyết định và bằng chứng**, không dựa trên mức độ hoành tráng của sản phẩm.
- Kết quả đo **ghi nhận trung thực** — kể cả khi không đạt mục tiêu nhóm tự đặt — vẫn được tính đủ điểm. Số liệu bị chỉnh sửa hoặc che giấu sẽ không được tính.
- Reflection cá nhân chấm riêng theo rubric của khoá. Điểm vòng demo, chấm chéo trong zone và thưởng thêm (nếu có) theo thể lệ công bố lúc khai mạc.

## Luật chung

1. Prototype có 3 mức **Sketch / Mock / Working** — mức nào cũng bắt buộc **≥1 lời gọi AI chạy thật**.
2. **Vibe-coding rule:** dùng AI để build thoải mái, nhưng không giải thích được phần có tên mình thì phần đó 0 điểm (kiểm tra tại CP5).
3. **Quality bar** chốt tại spec.md 23:59 ngày 1 và giữ nguyên sau đó.
4. Chỉ dùng dữ liệu trong `data/` hoặc dữ liệu giả tự sinh — không dùng dữ liệu thật của người thật. Không commit API key.
5. Tuân thủ **quy định bảo mật dữ liệu** bên dưới — đây là điều kiện để được cấp data.

## Bảo mật dữ liệu được cung cấp

Dữ liệu trong `data/` là dữ liệu thật của khoá học (đã ẩn danh), cấp riêng cho hackathon này. Khi nhận data, nhóm cam kết:

1. **Chỉ dùng trong phạm vi hackathon** — cho việc tìm bằng chứng, xây golden set và build prototype. Không dùng cho mục đích khác.
2. **Không chia sẻ ra ngoài khoá học** — không đăng lên mạng xã hội, không gửi cho người ngoài, không đưa vào bất kỳ dataset hay repo công khai nào.
3. **Không commit data pack vào repo nộp bài** — repo nhóm chỉ chứa trích dẫn ngắn để minh hoạ (vài dòng); golden set trích từ data ghi rõ mã đoạn/mã hội thoại thay vì dán nguyên văn dài.
4. **Cẩn trọng khi đưa data vào công cụ ngoài** — chỉ đưa phần tối thiểu cần cho việc đang làm; lưu ý API/công cụ free tier có thể dùng dữ liệu để huấn luyện (xem `02-guide.md` §3.4).
5. **Không cố suy ngược danh tính** từ dữ liệu đã ẩn danh ([học viên], mã U/C/T/M).
6. Sau sự kiện, **xoá các bản sao data pack** khỏi máy cá nhân và các công cụ đã upload nếu ban tổ chức yêu cầu.

Vi phạm được xử lý theo quy định của khoá và có thể ảnh hưởng trực tiếp đến điểm của nhóm.

---

## MeetFlow AI — Prototype của nhóm

> Trạng thái tài liệu: bản chuẩn bị cho hackathon. Những trường có nhãn
> [NHÓM CẦN ĐIỀN] hoặc [CHƯA XÁC MINH] chưa phải bằng chứng hay kết quả đã đạt.

### Thông tin nhóm

| Trường | Nội dung |
|---|---|
| Tên nhóm | [NHÓM CẦN ĐIỀN: TÊN NHÓM] |
| Zone | [NHÓM CẦN ĐIỀN: ZONE] |
| Thành viên 1 | [NHÓM CẦN ĐIỀN: MÃ HV — HỌ TÊN — PHẦN PHỤ TRÁCH] |
| Thành viên 2 | [NHÓM CẦN ĐIỀN: MÃ HV — HỌ TÊN — PHẦN PHỤ TRÁCH] |
| Thành viên 3 | [NHÓM CẦN ĐIỀN: MÃ HV — HỌ TÊN — PHẦN PHỤ TRÁCH] |
| Thành viên 4 | [NHÓM CẦN ĐIỀN: MÃ HV — HỌ TÊN — PHẦN PHỤ TRÁCH] |
| Thành viên 5 | [NHÓM CẦN ĐIỀN NẾU CÓ: MÃ HV — HỌ TÊN — PHẦN PHỤ TRÁCH] |

### Sản phẩm

**MeetFlow AI** — *Biến cuộc họp thành quyết định và hành động.*

MeetFlow AI là prototype thuộc **Hướng C — Làn mở**, phục vụ học viên hoặc
nhóm dự án của khoá khi họp trực tuyến. Ứng dụng nhận âm thanh mà người dùng đã
được phép ghi, tạo transcript, rồi tách các ý chính, quyết định, công việc,
người phụ trách, deadline và câu hỏi còn mở.

**Problem hypothesis — chưa được xác nhận bằng khảo sát:** Một thành viên vừa
tham gia thảo luận vừa ghi biên bản có thể bỏ sót quyết định hoặc công việc,
khiến nhóm không rõ ai làm gì sau buổi họp.

**Solution:** Tự động ghi transcript; chỉ ghi nhận owner, deadline và quyết định
khi transcript có căn cứ rõ. Thông tin thiếu được để trống hoặc đánh dấu cần
xác nhận để người dùng sửa trước khi xuất biên bản.

### Demo flow dự kiến

1. Mở landing page và chọn **Bắt đầu cuộc họp**.
2. Xác nhận đã có sự đồng ý của người tham gia.
3. Chọn microphone, âm thanh màn hình, hoặc cả hai.
4. Quan sát live transcript và bản tóm tắt tăng dần.
5. Kiểm tra một case mơ hồ: hệ thống không tự tạo owner/deadline.
6. Sửa một action item, kết thúc phiên và tải Markdown hoặc JSON.
7. Nếu chưa có phòng họp, dùng **Demo mode — Dữ liệu mô phỏng**.

### Tech stack

- Next.js App Router, React, TypeScript strict
- Tailwind CSS và component UI tương đương shadcn/ui
- OpenAI JavaScript SDK, OpenAI Realtime Transcription và Responses API
- Zod cho request/response schema
- localStorage hoặc IndexedDB; không dùng database trong MVP
- Vitest; browser smoke test khi môi trường cho phép
- pnpm; deploy tương thích Vercel

### Chạy local

Yêu cầu Node.js và pnpm theo phiên bản ghi trong codebase/README.md.

    cd codebase
    pnpm install
    Copy-Item .env.example .env.local
    # Tự điền OPENAI_API_KEY trong .env.local; không commit file này.
    pnpm dev

Mở http://localhost:3000. Media capture chỉ hoạt động trên localhost hoặc HTTPS.
Không có API key vẫn có thể kiểm tra demo flow bằng dữ liệu mô phỏng; trạng thái
đó không được tính là lời gọi AI thật.

### Quality checks

    cd codebase
    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm build

### Deploy Vercel

- Root Directory trên Vercel phải là codebase.
- Khai báo OPENAI_API_KEY và OPENAI_SUMMARY_MODEL trong Vercel Environment
  Variables; không đưa giá trị secret vào source hoặc log.
- Chỉ promote production sau khi lint, typecheck, test, build và preview smoke
  test đều đạt.
- URL: **[CHƯA DEPLOY — NHÓM CẦN ĐIỀN URL VERCEL]**

### Working và mock

Trạng thái kiểm tra tại máy phát triển ngày 30/07/2026:

| Hạng mục | Trạng thái |
|---|---|
| Landing, workspace, demo, pause/resume/end, history | Browser smoke pass ở viewport 1366×768; console không có error |
| Export Markdown/JSON | Unit test pass; thao tác click đã smoke test nhưng file tải xuống chưa được xác nhận ngoài headless browser |
| Microphone và system-audio capture | [CHƯA XÁC MINH THỦ CÔNG TRÊN CHROME DESKTOP] |
| Realtime hoặc near real-time transcription | [CHƯA XÁC MINH VỚI OPENAI_API_KEY] |
| Incremental summary bằng AI | [CHƯA XÁC MINH VỚI OPENAI_API_KEY] |
| Demo transcript | Browser smoke pass; mock có chủ đích và có badge “Dữ liệu mô phỏng” |
| Demo summary khi không có API key | Browser smoke pass; có nhãn “Mock summary” |

### Privacy

- Chỉ ghi âm khi tất cả người tham gia đã đồng ý.
- Không lưu raw audio hoặc video.
- Không upload video và không phát lại input audio ra loa.
- Không log transcript đầy đủ, nội dung audio hoặc API key ở server.
- Dữ liệu phiên họp MVP chỉ lưu trong trình duyệt.
- Dữ liệu demo là dữ liệu giả tự sinh.

### Known limitations

- System audio phụ thuộc trình duyệt và nguồn share; tối ưu cho Chrome desktop.
- Speaker diarization chưa được hỗ trợ đầy đủ, vì vậy owner mơ hồ phải để trống.
- Dữ liệu chỉ tồn tại trên một trình duyệt; chưa có đồng bộ nhiều người.
- Đây không phải Zoom/Google Meet/Teams bot và không tự tham gia phòng họp.
- Không có login, payment, multi-workspace hoặc calendar/email automation.

### Artifact và bằng chứng

- AI Spec: spec.md
- Golden set synthetic: eval/golden-set.json
- Hướng dẫn eval: eval/README.md
- Mẫu kết quả chưa chạy: eval/results-template.md
- Mẫu feedback chưa có người thử: validation/feedback-template.md
- Hướng dẫn reflection: reflection/README.md
- Screenshot landing: [codebase/public/meetflow-landing.png](codebase/public/meetflow-landing.png)
- Screenshot workspace: [codebase/public/meetflow-workspace.png](codebase/public/meetflow-workspace.png)

Không có số liệu khảo sát, tên willing user, feedback hay kết quả eval nào được
tạo giả trong các artifact trên.
