# Phê duyệt QA phát hành

**Sản phẩm:** Survival Kit – The Deadline Rescue Station  
**Phụ trách:** Người 5 (QA, Accessibility & Release)  
**Ngày kiểm tra:** 01/11/2026  
**Trạng thái:** NOT APPROVED – QA IN PROGRESS / BUILD BLOCKED

## Bằng chứng hiện có

| Kiểm tra | Lệnh/công cụ | Trạng thái | Ghi chú |
|---|---|---|---|
| Toolchain | mise + Node/pnpm/Hugo | PASS | Node 22.23.4, pnpm 12.15.0, Hugo Extended 0.163.3 |
| Test | pnpm test | PASS | 10/10 test, 0 fail |
| Hugo trong test | Hugo build | PASS | 33 trang EN, 7 trang VI; 27 static files mỗi ngôn ngữ; 44 processed images |
| Production build | pnpm build | BLOCKED | Lần chạy này bị Access is denied khi Hugo prune image cache; cần dừng preview rồi chạy lại để xác định file lock/quyền |
| Route/link artifact | kiểm tra public/ | FAIL | Thiếu setup ZIP và robots.txt |
| Form submission | kiểm tra HTML build | FAIL | Form sinh action="#" |
| Ảnh/alt | kiểm tra tĩnh output | FAIL/PENDING | 9/125 img tags chưa có alt; cần xác minh ngữ cảnh |
| Browser/responsive 390px | Chromium/Edge | NOT RUN | Chưa có screenshot/evidence |
| Keyboard/A11y | Tab + axe/Lighthouse | NOT RUN | Chưa kiểm tra thủ công |
| SEO | title/description/sitemap/robots | PARTIAL | Sitemap có; robots/canonical/OG chưa hoàn tất |

## Quyết định

**Chưa phê duyệt phát hành.** Test tự động đạt, nhưng lần chạy production build bị block bởi quyền/cache trong môi trường hiện tại; chưa kết luận đây là lỗi source trước khi dừng preview và chạy lại. Ngoài ra còn các finding QA-A11Y-001, QA-FUNC-001, QA-REL-001, QA-SEO-001. Cần chuyển các finding trong [bug report](../qa/bug-report.md) cho đúng owner, xác nhận lại build, rồi hoàn tất browser/A11y tại viewport 390px.

## Điều kiện mở lại QA

1. Dừng tiến trình preview đang giữ cache và chạy lại pnpm build thành công.
2. Xác minh hoặc sửa 9 thẻ img chưa có alt theo từng route.
3. Xử lý hoặc chấp nhận có điều kiện form action="#", setup ZIP và robots.txt.
4. Hoàn tất kiểm tra route, responsive 390px, keyboard focus và axe/Lighthouse.
5. Cập nhật bảng bằng chứng và quyết định phát hành sau khi có log/screenshot.

Người 5 không sửa source/config/content/asset để làm thay đổi kết quả QA.
