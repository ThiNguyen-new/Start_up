# QA Approval — Survival Kit

**Ngày kiểm tra:** 2026-11-09  
**Preview:** http://localhost:3000/  
**Trạng thái:** Conditional — chưa đủ điều kiện phát hành cuối.

## Kết quả tự động

| Hạng mục | Kết quả |
|---|---|
| `pnpm install` | Đạt — pnpm 12.15.0, dependencies up to date |
| `pnpm test` | Đạt — 22/22 test, 0 fail |
| `pnpm build` | Đạt — Hugo Extended 0.163.3, build hoàn tất |
| Production preview | Đạt — server tại `http://localhost:3000/` |
| Template/link/image build errors | Không phát hiện lỗi build; có warning deprecated `.Site.Data` |

## Route smoke test

Các route sau trả HTTP 200: `/`, `/products/`, `/build-your-own-kit/`, `/cart-demo/`, `/schedule-rescue/`, `/send-rescue/`, `/contact/`, `/faq/`, `/terms-conditions/`, `/blog/`, `/sitemap.xml`.

URL không tồn tại trả HTTP 404 như kỳ vọng. `/robots.txt` hiện trả 404 và được ghi trong `docs/qa/bug-report.md`.

## Điều kiện còn thiếu trước khi approve

1. Xử lý QA-001 về `robots.txt`.
2. Xác nhận canonical và Open Graph metadata theo QA-002.
3. Phân loại và xử lý các ảnh thiếu alt/heading chưa đạt theo QA-003 và QA-004.
4. Kiểm tra thủ công responsive, keyboard focus và contrast trên mobile/tablet/desktop.

Người 5 chưa approve phát hành cuối và không chỉnh source thay cho owner.
