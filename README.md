# MCI Viet Nam – Student System (redesign)

Giao diện mới cho trang đăng nhập [hocvien.mcivietnam.com](https://hocvien.mcivietnam.com/): tone cam, phong cách hiện đại (gradient mờ, kính mờ, bo góc lớn) lấy cảm hứng từ bộ *Startup 3 Blocks* của Designmodo.

## Tính năng

- Bố cục 2 cột: phần giới thiệu (tiêu đề gradient động, slider tính năng, số liệu đếm tăng dần) + thẻ đăng nhập.
- 3 màn hình **Sign in / Register / Forgot password** chuyển cảnh mượt (trượt + mờ + co giãn chiều cao thẻ), có hash `#register`, `#forgot`.
- Hiệu ứng: hiện dần khi tải trang, blob nền trôi + parallax theo chuột, spotlight trên thẻ, ripple khi bấm nút, nhãn nổi trong ô nhập, rung khi lỗi, đo độ mạnh mật khẩu.
- Light / Dark mode (nhớ lựa chọn), responsive cho mobile, tôn trọng `prefers-reduced-motion`.

## Chạy thử

Chỉ là HTML/CSS/JS tĩnh — mở `index.html` trực tiếp hoặc phục vụ thư mục bằng bất kỳ static server nào.

## Lưu ý

Các form hiện chỉ là **demo phía giao diện** (kiểm tra dữ liệu và hiện thông báo). Cần nối vào API đăng nhập/đăng ký thật của hệ thống trong `app.js` (phần `form.addEventListener("submit", ...)`).
