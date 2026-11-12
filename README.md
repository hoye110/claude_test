# Học viện MCI – giao diện mới

Bản làm lại giao diện trang chủ [mcivietnam.com](https://mcivietnam.com/) theo tone cam, phong cách hiện đại (gradient mờ, bo góc lớn, kính mờ), lấy cảm hứng từ bộ *Startup 3 Blocks* của Designmodo.

## Các trang

| File | Nội dung |
| --- | --- |
| `index.html` + `home.css` + `home.js` | Trang chủ mcivietnam.com |
| `login.html` + `styles.css` + `app.js` | Trang đăng nhập học viên (mở từ nút "Đăng nhập") |

## Trang chủ gồm

Header dính với mega-menu khóa học · Hero với banner tự chuyển · Số liệu đếm tăng dần · 5 lộ trình đào tạo · Khóa học nổi bật theo tab · Lý do chọn MCI (bento) · Dải logo đối tác chạy vòng · Giảng viên (carousel) · Cảm nhận học viên · Bài viết · Form tư vấn · Footer.

Hiệu ứng: hiện dần khi cuộn, thanh tiến trình cuộn, header thu gọn khi cuộn, thẻ nghiêng 3D theo chuột, nút "hút" theo chuột, tab có thanh trượt, menu mobile mở dạng rèm. Có Light/Dark mode, responsive, tôn trọng `prefers-reduced-motion`.

## Lưu ý

- Ảnh (logo, banner, giảng viên, đối tác, bài viết) đang lấy trực tiếp từ `mcivietnam.com` / `cdn.mcivietnam.com`.
- **Form "Nhận tư vấn lộ trình học miễn phí"** lưu thông tin khách vào Supabase (project `mci-website`, bảng `public.consultation_requests`). Cấu hình ở `config.js`, cấu trúc bảng ở `supabase/migrations/`. Row Level Security chỉ cho phép khách **thêm** dữ liệu; xem danh sách trong Supabase Dashboard → Table Editor.
- Form đăng nhập (`login.html`) vẫn chỉ là **demo phía giao diện**.

## Chạy & deploy

HTML/CSS/JS tĩnh — mở `index.html` hoặc dùng bất kỳ static server nào. Deploy bằng `Dockerfile` (nginx, nghe cổng `$PORT`) — dùng được cho Railway.
