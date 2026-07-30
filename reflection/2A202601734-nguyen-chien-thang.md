Reflection — 2A202601734 — Nguyễn Chiến Thắng
1. Vai trò và phần tôi phụ trách
Vai trò: Thiết lập môi trường chạy local, cấu hình biến môi trường và kiểm tra luồng chạy của prototype MeetFlow AI.

File/flow cụ thể tôi chịu trách nhiệm kiểm tra: codebase/package.json, codebase/.env.example, file .env.local trên máy cá nhân, hướng dẫn trong codebase/README.md và luồng từ cài dependency → chạy development server → mở giao diện → thử Demo mode hoặc AI mode.

Tôi có thể giải thích phần này end-to-end như sau:

Sau khi clone repository, tôi kiểm tra phiên bản Node.js và package manager mà dự án yêu cầu. Dự án sử dụng pnpm nên cần bật Corepack, cài đúng phiên bản pnpm, sau đó chạy pnpm install trong thư mục codebase.

File .env.example chỉ là file mẫu để cho biết tên các biến môi trường cần có. Khi chạy local, tôi phải tạo file .env.local, điền OPENAI_API_KEY vào file này và khởi động lại development server để ứng dụng đọc cấu hình mới. API key không được ghi trực tiếp vào source code và không được commit lên GitHub.

Khi chưa có API key hợp lệ, tôi vẫn có thể dùng Demo mode để kiểm tra giao diện, transcript mô phỏng, phần summary mô phỏng, pause/resume, kết thúc phiên và export. Luồng ghi âm thật và tóm tắt bằng OpenAI chỉ được xem là đã kiểm tra thành công khi có key hợp lệ và chạy thử thực tế trên trình duyệt.

2. Tôi đã làm gì
Quyết định quan trọng tôi đưa ra:

Không sửa và điền API key trực tiếp vào .env.example.

Tạo .env.local riêng trên máy và giữ file này ngoài Git.

Dùng đúng pnpm theo cấu hình dự án thay vì tự chuyển sang npm, tránh làm thay đổi lockfile và dependency.

Kiểm tra Demo mode trước để tách lỗi giao diện khỏi lỗi cấu hình OpenAI.

Không ghi nhận tính năng AI live là đã pass khi chưa có bằng chứng chạy thật.

Bằng chứng/test case ảnh hưởng đến quyết định:

Sau khi clone, terminal chưa nhận lệnh node, npm hoặc pnpm.

Trong repository ban đầu chỉ có .env.example, chưa có file môi trường chạy local.

Ứng dụng có thể mở Demo mode khi chưa có API key, nhưng phần ghi âm thật và gọi AI cần cấu hình riêng.

Sau khi thay đổi biến môi trường, development server cần được restart thì ứng dụng mới đọc lại cấu hình.

Cách tôi kiểm tra phần mình làm:

Kiểm tra Node.js bằng node -v.

Kiểm tra Corepack và pnpm bằng corepack --version và pnpm -v.

Cài dependency bằng pnpm install.

Chạy ứng dụng bằng pnpm dev.

Mở địa chỉ local do terminal cung cấp và thử luồng Demo mode.

Kiểm tra git status để chắc chắn .env.local và API key không bị đưa vào commit.

Phân biệt rõ trạng thái Demo/Mock với trạng thái gọi AI thật trên giao diện.

3. AI đã hỗ trợ thế nào
Công cụ/model đã dùng: ChatGPT và công cụ AI hỗ trợ lập trình trong quá trình đọc cấu trúc repository, giải thích lỗi terminal và chuẩn bị các bước chạy dự án.

AI hỗ trợ ở bước nào:

Đọc yêu cầu trong README và xác định dự án sử dụng Node.js, Corepack và pnpm.

Giải thích sự khác nhau giữa .env.example và .env.local.

Đưa ra thứ tự lệnh cài đặt và chạy local.

Phân tích nguyên nhân terminal chưa nhận Node/npm sau khi đã cài.

Nhắc kiểm tra lại ứng dụng sau khi restart server.

Tôi đã kiểm tra, sửa hoặc từ chối output nào:

Tôi đối chiếu các lệnh AI đề xuất với package.json và README của chính repository trước khi chạy.

Tôi không làm theo hướng điền secret vào .env.example hoặc commit API key.

Tôi không coi Demo mode là bằng chứng cho việc OpenAI API đã chạy thật.

Khi lệnh chưa chạy được, tôi dựa vào thông báo lỗi thực tế trên terminal để điều chỉnh thay vì tiếp tục copy toàn bộ lệnh một cách máy móc.

Phần nào là quyết định của tôi, không giao cho AI:

Quyết định file nào được phép commit.

Quyết định không công khai API key.

Xác nhận lệnh nào thực sự chạy được trên máy của tôi.

Xác nhận tính năng nào là mock và tính năng nào đã gọi AI thật.

Chỉ báo cáo kết quả đã có bằng chứng thay vì ghi kết quả theo lời AI dự đoán.

4. Một case fail của chính nhóm
Input/tình huống:

Tôi clone repository về máy Windows và bắt đầu chạy prototype. Máy đã cài Node.js nhưng terminal trong VS Code vẫn chưa nhận được lệnh node và npm; lệnh pnpm cũng chưa tồn tại. Ngoài ra, repository chỉ có .env.example, chưa có .env.local chứa cấu hình chạy thật.

Output hoặc hành vi sai:

Dependency chưa thể được cài đặt và development server chưa thể chạy đúng theo hướng dẫn. Khi thiếu cấu hình OpenAI, luồng ghi âm và xử lý AI thật không thể được xem là đã hoạt động; nhóm chỉ có thể kiểm tra phần Demo mode.

Vì sao lỗi này quan trọng với người dùng:

Nếu môi trường không chạy được, nhóm không thể demo prototype ổn định. Nếu nhầm Demo mode với AI thật, nhóm có thể báo cáo sai trạng thái sản phẩm và không phát hiện lỗi API trước buổi demo.

Nhóm đã tìm nguyên nhân thế nào:

Đọc lại cấu trúc thư mục và codebase/README.md.

Kiểm tra yêu cầu phiên bản trong package.json.

Chạy riêng từng lệnh kiểm tra Node, npm, Corepack và pnpm.

Phân biệt lỗi PATH của terminal với lỗi dependency của dự án.

Kiểm tra tên file môi trường mà Next.js sử dụng khi chạy local.

Đối chiếu trạng thái trên giao diện để nhận biết Demo/Mock và AI thật.

Thay đổi đã làm:

Đóng và mở lại terminal hoặc VS Code để terminal nhận PATH mới của Node.js.

Bật Corepack và chuẩn bị đúng phiên bản pnpm theo dự án.

Chạy cài dependency trong đúng thư mục codebase.

Sao chép .env.example thành .env.local.

Chỉ điền API key trong .env.local, không đưa secret lên Git.

Restart development server sau khi thay đổi biến môi trường.

Dùng Demo mode để kiểm tra giao diện trước, sau đó mới tách riêng bước kiểm tra OpenAI live.

Kết quả sau khi chạy lại:

Nhóm đã xác định được đúng quy trình cài đặt và cấu hình local, đồng thời có thể dùng Demo mode để tiếp tục kiểm tra giao diện khi chưa có API key hợp lệ. Phần gọi OpenAI thật chỉ được đánh dấu là pass sau khi chạy với key hợp lệ và có kết quả thực tế; nếu chưa có bằng chứng này thì tôi ghi trung thực là chưa xác minh, không tự suy đoán là đã thành công.

5. Bài học
Một điều tôi hiểu khác đi sau hackathon:

Trước đây tôi nghĩ chỉ cần code có sẵn là có thể chạy ngay. Sau quá trình này, tôi hiểu rằng việc quản lý phiên bản Node.js, package manager, dependency, biến môi trường và secret cũng là một phần quan trọng của sản phẩm. Một prototype chỉ được coi là chạy được khi người khác có thể làm theo hướng dẫn, cấu hình đúng và phân biệt rõ phần mock với phần AI thật.

Tôi cũng hiểu rằng dùng AI để hỗ trợ không có nghĩa là copy toàn bộ câu trả lời. Người làm vẫn phải đọc lỗi, kiểm tra cấu trúc dự án, hiểu từng lệnh và tự chịu trách nhiệm về kết quả cuối cùng.

Nếu có thêm một tuần, tôi sẽ ưu tiên:

Hoàn thiện checklist cài đặt riêng cho Windows để thành viên mới chạy dự án nhanh hơn.

Kiểm tra đầy đủ microphone, system audio và chế độ microphone + màn hình trên Chrome desktop.

Chạy thử OpenAI Realtime transcription và near real-time fallback bằng API key hợp lệ.

Ghi lại kết quả từng test case, gồm input, output, lỗi và cách sửa.

Thử deploy Preview trên Vercel và kiểm tra lại biến môi trường, quyền microphone và luồng export.

Bổ sung cảnh báo rõ hơn trên giao diện khi ứng dụng đang dùng mock thay vì AI thật.