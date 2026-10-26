# Talk with Emma – app luyện nói tiếng Anh

Emma hỏi học sinh bằng giọng nói, nghe học sinh trả lời qua micro, sửa câu sai và hỏi tiếp.

## Cấu trúc

- `index.html` – giao diện app (Emma, micro, chủ đề, câu gợi ý)
- `api/emma.js` – máy chủ nhỏ gọi Claude; **key nằm ở đây qua biến môi trường, không nằm trong code**
- `package.json`

## Chạy trên máy (localhost)

1. Cài Node.js 18+ (https://nodejs.org).
2. Tạo file `.env.local` (xem mẫu `.env.example`): `ANTHROPIC_API_KEY=sk-ant-api03-...`
3. Mở Terminal trong thư mục này, chạy `npm start`, rồi mở http://localhost:3000 bằng Chrome hoặc Edge.
   Màn hình Terminal sẽ báo `AI: BẬT` hoặc `AI: TẮT`.

## Deploy lên Vercel (miễn phí, khoảng 5 phút)

1. Tạo tài khoản tại https://vercel.com (đăng nhập bằng GitHub hoặc email).
2. Đưa thư mục `emma-app` lên GitHub (tạo repo mới → Upload files → kéo cả thư mục vào), **hoặc** cài Vercel CLI và chạy `npx vercel` trong thư mục này.
3. Trên Vercel: **Add New → Project → Import** repo vừa tạo → bấm **Deploy** (không cần chỉnh gì).
4. Vào **Project → Settings → Environment Variables**, thêm:
   - Name: `ANTHROPIC_API_KEY`
   - Value: key Claude API của bạn (bắt đầu bằng `sk-ant-api03-`, lấy ở https://console.anthropic.com → API Keys)
5. Vào tab **Deployments** → bấm **⋯ → Redeploy** để app nhận key.
6. Mở link dạng `https://ten-app.vercel.app` bằng Chrome hoặc Edge, cho phép micro.

Không có key, app vẫn chạy: Emma hỏi theo kịch bản, nghe và đọc to; chỉ thiếu phần sửa câu và trò chuyện tự do.

## Tùy chọn

- `EMMA_MODEL` – đổi model (mặc định `claude-haiku-5-5`, nhanh và rẻ).
- Giới hạn sẵn 30 lượt/phút mỗi thiết bị để tránh bị dùng hết tiền.
- Trên console.anthropic.com nên đặt **Spend limit** hằng tháng (ví dụ 5–10 USD).

## Ghi chú

- Nhận giọng nói dùng tính năng có sẵn của Chrome/Edge (miễn phí, cần Internet). Firefox chưa hỗ trợ.
- Giọng đọc hay nhất: mở bằng **Microsoft Edge** và chọn giọng có dấu ★ (Ava, Emma, Jenny, Ana…).
