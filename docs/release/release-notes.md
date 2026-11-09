# Release Notes — Survival Kit

**Ngày:** 2026-11-09  
**Bản đánh giá:** Production preview QA

## Đã xác minh

- Cài dependency thành công bằng pnpm 12.15.0.
- 22 test tự động đạt.
- Production build bằng Hugo Extended 0.163.3 đạt.
- Các route chính, sitemap và trang 404 đã được smoke test.
- Preview xác nhận tại `http://localhost:3000/`.

## Known issues

- Thiếu `robots.txt`.
- Chưa thấy canonical và Open Graph image trong các trang đã kiểm tra.
- Audit HTML phát hiện 11 ảnh thiếu alt.
- Audit HTML phát hiện 16 trang có số lượng h1 khác 1; cần phân loại theo template.
- Hugo cảnh báo sử dụng `.Site.Data` API deprecated.

## Quyết định phát hành

Trạng thái hiện tại là **Conditional**, chưa đánh dấu release cuối cho đến khi các issue QA nêu trên được owner xử lý hoặc được nhóm chấp thuận chấp nhận rủi ro.
