# Kế hoạch kiểm thử QA

**Phạm vi:** Survival Kit – website Hugo  
**Phụ trách:** Người 5 (QA, Accessibility & Release)  
**Ngày cập nhật:** 31/10/2026  
**Trạng thái:** QA IN PROGRESS – kiểm tra tự động đạt; kiểm tra browser thủ công còn chờ thực hiện

## 1. Nguyên tắc và giới hạn

- Xác minh route, menu, form, 404, CTA mua hàng và luồng đặt lịch.
- Kiểm tra responsive, accessibility và SEO trên bản build thực tế.
- Người 5 chỉ ghi nhận, phân loại và chuyển lỗi cho owner; không sửa source, config, content hoặc asset ngoài phạm vi QA/release.

## 2. Toolchain và kết quả tự động

| Hạng mục | Giá trị/kết quả |
|---|---|
| Node.js | `22.23.4` qua mise |
| pnpm | `12.15.0` |
| Hugo | Extended `0.163.3` (Windows amd64) |
| `mise exec -- pnpm test` | PASS – 6/6 test |
| `mise exec -- pnpm build` | PASS |
| Output Hugo | 29 trang EN, 7 trang VI; 15 static files mỗi ngôn ngữ; 86 processed images; aliases EN 4, VI 2 |
| Port preview | `3000` |

## 3. Ma trận route và chức năng

| ID | Khu vực | Kiểm tra | Trạng thái |
|---|---|---|---|
| R-01 | `/` | Hero, CTA, ảnh, section và heading hiển thị đúng | PENDING browser |
| R-02 | `/products/` | Danh sách sản phẩm, link chi tiết, ảnh | PENDING browser |
| R-03 | `/products/taba-cream/`, `.1/`, `.2/` | Tên, mô tả, giá, ảnh, CTA | PENDING browser |
| R-04 | `/products/taba-facewash/`, `.1/`, `.2/` | Tên, mô tả, giá, ảnh, CTA | PENDING browser |
| R-05 | `/products/taba-shampoo/`, `.1/`, `.2/` | Tên, mô tả, giá, ảnh, CTA | PENDING browser |
| R-06 | `/blog/`, `/blog/post-1/`, `/blog/post-2/` | Danh sách, metadata và liên kết bài viết | PENDING browser |
| R-07 | `/faq/`, `/contact/` | Nội dung, form, thông tin liên hệ | PENDING browser; form có blocker đã ghi nhận |
| R-08 | `/terms-conditions/` | Nội dung và link footer | PENDING browser |
| R-09 | `/404.html` | Trang lỗi hữu ích và link quay lại | PENDING browser |
| R-10 | Menu/CTA/cart | Không có link hỏng; CTA mở đúng luồng | FAIL/PENDING – xem findings |
| R-11 | `/survival-kit-m0-m1-setup.zip` | Link tải setup phải trả về asset tồn tại | FAIL – asset không có trong `public/` |
| R-12 | `/robots.txt` | Artifact SEO phải tồn tại sau build | FAIL – file không có trong `public/` |

## 4. Responsive và browser

Kiểm tra tại `375×812`, `768×1024`, `1280×800` trên Chromium/Edge; nếu có môi trường thì kiểm tra thêm Firefox/Safari.

- Không cuộn ngang ngoài chủ đích.
- Header, menu, card, ảnh và form không chồng lấn.
- CTA và vùng chạm đủ dùng trên màn hình nhỏ.

Trạng thái hiện tại: **NOT RUN** – chưa có bằng chứng preview/browser trong hồ sơ này.

## 5. Accessibility

Kiểm tra heading/landmark, keyboard focus, label form, thông báo lỗi, alt text, contrast và lỗi nghiêm trọng từ axe/Lighthouse.

Trạng thái hiện tại: **NOT RUN** – cần chạy trên preview sau khi owner xử lý các lỗi chức năng.

## 6. SEO và artifact build

- Homepage đã sinh title, description và `h1`; cần kiểm tra thêm canonical/Open Graph trên các route chính.
- `sitemap.xml` có trong output.
- `robots.txt` chưa có trong output: ghi nhận `QA-SEO-001`.
- Không commit `public/`, `resources/`, `node_modules/`, `hugo_stats.json` hoặc `.hugo_build.lock`.

## 7. Findings cần chuyển owner

| ID | Mức độ | Phát hiện | Owner đề xuất |
|---|---|---|---|
| `QA-FUNC-001` | High | Form contact/FAQ sinh ra với `action="#"`, chưa có endpoint gửi dữ liệu | Người phụ trách source/config form |
| `QA-REL-001` | High | Menu trỏ tới `/survival-kit-m0-m1-setup.zip` nhưng asset không tồn tại trong build | Người phụ trách asset/menu |
| `QA-SEO-001` | Medium | `robots.txt` chưa được sinh; canonical/OG chưa được xác nhận thủ công | Người phụ trách SEO/template |
| `QA-SEC-001` | High | Config source có giá trị API/integration; cần owner kiểm tra việc giới hạn key và cơ chế cấp phát an toàn, không ghi giá trị secret vào tài liệu | Người phụ trách config/security |

## 8. Tiêu chí kết luận

**Pass:** build/test đạt, route chính không có blocker, browser/accessibility/SEO có bằng chứng và findings đã đóng hoặc được chấp nhận.  
**Fail:** có blocker/critical, route chính hỏng, asset bắt buộc thiếu hoặc form không có luồng gửi thật.  
**Blocked:** thiếu preview/quyền/tool để kiểm tra thủ công; không được coi là Pass.

Mỗi lỗi cần có ID, bước tái hiện, kết quả mong đợi/thực tế, mức độ, route/viewport, bằng chứng và owner.
