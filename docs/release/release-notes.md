# Ghi chú phát hành

## Trạng thái phát hành

**Phiên bản:** Chưa gắn version  
**Ngày:** 01/11/2026  
**Trạng thái:** Chưa sẵn sàng phát hành – QA đang tiến hành

## Phạm vi nghiệm thu

- Trang chủ với Panic Level và các CTA Schedule Your Rescue/Send a Rescue.
- Build Your Own Kit và logic chọn item/preset/giới hạn số lượng.
- Danh sách và chi tiết Survival Kit.
- Giỏ hàng/Checkout Snipcart.
- Blog, FAQ, Contact và 404.
- Responsive 390px, accessibility, broken link, ảnh và SEO artifact.

## Đã xác minh tự động

- pnpm test: PASS, 10/10 test.
- Hugo trong test: PASS, 33 trang EN, 7 trang VI, 27 static files mỗi ngôn ngữ và 44 processed images.
- Test đã bao phủ cấu hình site, menu, social links, Panic Level, Build Your Own Kit và schedule delivery validation.

## Chưa đủ điều kiện phát hành

- pnpm build hiện BLOCKED bởi Access is denied khi Hugo prune image cache; cần dừng tiến trình preview rồi chạy lại.
- 9 thẻ img trong 125 thẻ output chưa được xác minh có alt.
- Form contact/FAQ/home/footer còn action="#"; chưa có endpoint gửi dữ liệu thật.
- Link /survival-kit-m0-m1-setup.zip trỏ tới asset chưa tồn tại.
- robots.txt chưa có trong public/.
- Kiểm tra browser, responsive 390px, keyboard và axe/Lighthouse chưa hoàn tất.
- Hugo còn cảnh báo API template .Site.Data deprecated.

## Điều kiện mở phát hành

1. Owner xử lý hoặc chấp nhận có điều kiện các finding trong [bug report](../qa/bug-report.md).
2. Chạy lại pnpm build thành công sau khi giải phóng cache/progress preview.
3. Hoàn tất checklist route, broken link, ảnh và viewport 390px.
4. Hoàn tất kiểm tra heading, alt, keyboard focus và contrast.
5. Cập nhật [QA approval](./qa-approval.md) thành PASS hoặc ghi rõ lý do tiếp tục block.

Người 5 chỉ ghi nhận và báo cáo; không tự sửa source của Người 1–4.
