# QA Bug Report — 2026-11-09

Phạm vi kiểm tra: bản trong `Start_up`, Hugo Extended `0.163.3`, môi trường production preview.

## QA-001 — Thiếu robots.txt

- **Mức độ:** Medium — SEO/release blocker.
- **Owner đề xuất:** Người 1, vì liên quan cấu hình/deployment.
- **Bằng chứng:** `GET /robots.txt` trả `404`; `public/robots.txt` không tồn tại sau build.
- **Ảnh hưởng:** Crawler không nhận được quy tắc crawl hoặc đường dẫn sitemap chuẩn.
- **Đề xuất xử lý:** Người 1 bổ sung cấu hình/file robots theo quy ước deployment và xác nhận lại URL sitemap.

## QA-002 — Chưa phát hiện canonical và Open Graph metadata

- **Mức độ:** Medium — SEO/release blocker.
- **Owner đề xuất:** Người 1 cho metadata/config hoặc Người 3 cho template, cần phân công theo file sở hữu trước khi sửa.
- **Bằng chứng:** Kiểm tra phần `<head>` của `/`, `/products/`, `/contact/` và `/faq/` thấy title/description nhưng không thấy `rel="canonical"` hoặc `og:image`.
- **Ảnh hưởng:** Chia sẻ mạng xã hội và canonicalization có thể không ổn định.
- **Đề xuất xử lý:** Chuyển cho đúng chủ sở hữu template/config; Người 5 không tự sửa source.

## QA-003 — 11 ảnh thiếu thuộc tính alt

- **Mức độ:** Medium — accessibility.
- **Owner đề xuất:** Người 3 nếu ảnh phát sinh từ template; Người 4 nếu thuộc nội dung/frontmatter.
- **Bằng chứng:** Audit 50 file HTML trong `public/` phát hiện 11 thẻ `img` không có `alt`.
- **Ảnh hưởng:** Người dùng screen reader không nhận được thông tin của ảnh.
- **Đề xuất xử lý:** Xác định ảnh trang trí hay ảnh nội dung; thêm accessible name/alt ở đúng source owner.

## QA-004 — 16 trang có số lượng h1 khác 1

- **Mức độ:** Low/Medium — accessibility/SEO.
- **Owner đề xuất:** Người 3.
- **Bằng chứng:** Audit 50 file HTML trong `public/`: 16 file có `h1` bằng 0 hoặc khác 1; một số là trang list/tài liệu tải xuống và cần xác nhận quy ước trước khi sửa.
- **Ảnh hưởng:** Cấu trúc heading không nhất quán cho screen reader và công cụ tìm kiếm.
- **Đề xuất xử lý:** Phân loại page template; bảo đảm mỗi trang nội dung có heading chính phù hợp, không thêm h1 máy móc cho file không phải trang nội dung.

## Ghi chú không phải blocker

- Hugo cảnh báo deprecated `.Site.Data`; build vẫn thành công. Cần chuyển cho chủ sở hữu template trong một task riêng, không sửa trong phạm vi Người 5.
- Script bên thứ ba rating widget không resolve được trong môi trường preview hiện tại; cần xác minh lại ở môi trường deploy trước khi kết luận lỗi sản phẩm.
