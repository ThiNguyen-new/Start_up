# Kế hoạch rollback

**Phụ trách điều phối:** Người 5 (QA, Accessibility & Release)  
**Quyền thực thi deploy/rollback:** Người 1 hoặc người quản lý môi trường phát hành

## Trạng thái release candidate hiện tại

Build và test tự động đã đạt, nhưng release candidate chưa được QA phê duyệt. Các điều kiện còn mở được ghi trong [QA approval](./qa-approval.md), gồm form chưa có endpoint, asset ZIP bị thiếu, robots.txt bị thiếu và browser/accessibility chưa kiểm tra.

## Khi nào phải rollback

Rollback hoặc dừng promote ngay khi production có một trong các tình huống:

- build/deploy không hoàn tất hoặc site trả lỗi diện rộng;
- route chính, menu, form hoặc 404 bị hỏng;
- mất ảnh/tài nguyên, lỗi template hoặc JavaScript cản trở luồng chính;
- lỗi accessibility nghiêm trọng ảnh hưởng khả năng sử dụng;
- SEO artifact bị mất hoặc canonical/robots gây lập chỉ mục sai;
- dữ liệu/cấu hình phát hành không khớp bản đã QA;
- asset bắt buộc, đặc biệt file tải setup, không tồn tại hoặc link CTA trỏ sai.

## Quy trình

1. Ghi thời điểm, URL, phiên bản đang chạy, lỗi quan sát được và bằng chứng.
2. Thông báo Người 1/chủ sở hữu deploy; Người 5 không tự sửa source hoặc config.
3. Dừng promote bản lỗi và giữ nguyên log CI/deploy.
4. Khôi phục artifact/commit deploy gần nhất đã được QA phê duyệt qua cơ chế của hosting.
5. Smoke test: /, /products/, /blog/, /faq/, /contact/, /terms-conditions/, /404.html, menu và asset chính.
6. Đánh dấu incident, liên kết issue đúng owner và cập nhật [release notes](./release-notes.md).
7. Chỉ phát hành lại sau khi bản sửa đi qua toàn bộ checklist QA.

## Xác nhận sau rollback

| Hạng mục | Kết quả |
|---|---|
| Production trả HTTP thành công | ☐ |
| Route và menu chính hoạt động | ☐ |
| Form/CTA không có lỗi nghiêm trọng | ☐ |
| Ảnh, CSS, JS tải được | ☐ |
| 404 hoạt động | ☐ |
| Sitemap/robots/canonical đúng | ☐ |
| Asset tải bắt buộc tồn tại | ☐ |
| Thông báo incident và bằng chứng đã lưu | ☐ |

## Quy tắc an toàn

- Không xóa artifact hoặc log trước khi incident được đóng.
- Không rollback bằng cách sửa trực tiếp source trên production.
- Không đánh dấu Pass nếu chỉ khôi phục được site mà chưa hoàn tất smoke test.
