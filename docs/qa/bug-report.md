# Báo cáo lỗi QA

**Phụ trách:** Người 5 (QA, Accessibility & Release)  
**Ngày cập nhật:** 01/11/2026  
**Nguồn kiểm tra:** nhánh hiện tại, Hugo Extended 0.163.3, Windows amd64

## Quy tắc báo cáo

Người 5 chỉ tái hiện, ghi bằng chứng, gán mức độ và chuyển đúng owner. Không tự sửa source, content, layout, asset hoặc config của thành viên khác.

## Findings hiện tại

### QA-BUILD-001 — Hugo build bị lỗi quyền khi prune image cache

- Mức độ: High / Blocked
- Lệnh: mise exec -- pnpm build
- Kết quả mong đợi: build hoàn tất không lỗi.
- Kết quả thực tế: Hugo hoàn tất render nhưng lỗi khi xóa cache resources/_gen/images/images/material với thông báo Access is denied.
- Bối cảnh: đang có tiến trình hugo server/node chạy preview; cần dừng preview rồi chạy lại để phân biệt file lock với lỗi quyền.
- Owner đề xuất: Người 1 (toolchain/release).
- Bằng chứng: log pnpm build ngày 01/11/2026.

### QA-A11Y-001 — Một số thẻ img chưa có alt

- Mức độ: High
- Phạm vi: output public sau build.
- Kết quả kiểm tra tĩnh: 125 thẻ img; 9 thẻ chưa khớp thuộc tính alt.
- Kết quả mong đợi: ảnh nội dung có alt có nghĩa; ảnh trang trí có alt rỗng.
- Owner đề xuất: Người 3 (template) và Người 4 (content/image).
- Bước tiếp theo: xác nhận từng thẻ, route và ảnh; không kết luận tất cả 9 trường hợp đều là lỗi trước khi kiểm tra ngữ cảnh.

### QA-FUNC-001 — Form dùng action="#"

- Mức độ: High
- Route: trang chủ, FAQ, contact và footer form.
- Kết quả mong đợi: submit tới endpoint thật hoặc có trạng thái demo được ghi rõ.
- Kết quả thực tế: HTML build sinh form action="#"; chưa có endpoint gửi dữ liệu.
- Owner đề xuất: Người 1 (tích hợp) và Người 3 (template).

### QA-REL-001 — Thiếu file setup ZIP

- Mức độ: High
- Route/link: /survival-kit-m0-m1-setup.zip.
- Kết quả mong đợi: link trả về asset tải được.
- Kết quả thực tế: public/survival-kit-m0-m1-setup.zip không tồn tại.
- Owner đề xuất: Người 1 (release/menu/asset).

### QA-SEO-001 — Thiếu robots.txt

- Mức độ: Medium
- Kết quả mong đợi: output có robots.txt phù hợp base URL.
- Kết quả thực tế: public/robots.txt không tồn tại.
- Owner đề xuất: Người 1 (config/release) và Người 3 (template nếu cần).

### QA-TECH-001 — Hugo cảnh báo API template deprecated

- Mức độ: Low/Medium
- Kết quả thực tế: Hugo cảnh báo .Site.Data deprecated trong v0.156.0 và sẽ bị loại bỏ ở bản tương lai.
- Owner đề xuất: Người 3 hoặc Người 1.
- Ghi chú: Người 5 không tự sửa theme/template.

## Mẫu issue chuẩn

- Tiêu đề:
- ID:
- Mức độ:
- Owner:
- Route/viewport:
- Môi trường:
- Bước tái hiện:
- Kết quả mong đợi:
- Kết quả thực tế:
- Bằng chứng:
- Trạng thái: Open / In progress / Fixed / Verified
