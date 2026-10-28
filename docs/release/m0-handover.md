# Biên bản bàn giao M0 & Hướng dẫn bắt đầu cho các thành viên (M0 Handover)
**Mốc:** M0 – Chuẩn hóa Workspace & M1 – Khung cấu hình nền tảng  
**Người bàn giao:** Người 1 (Kỹ thuật nền tảng, cấu hình và tích hợp)  
**Người nhận bàn giao:** Người 2, Người 3, Người 4, Người 5  

---

## 1. Tóm tắt kết quả hoàn thành của Người 1
1. **Chuyển đổi cấu trúc project-setup thành công (M0):**
   - Đã chạy script `pnpm project-setup` chuyển đổi an toàn từ theme-setup sang project-setup.
   - Thư mục theme mẫu `exampleSite` đã được chuyển vào thư mục gốc (`content/`, `config/`, `data/`, `i18n/`, `assets/images/`, `static/`).
   - Mã nguồn gốc của theme được chuyển vào `themes/hargo-hugo/` và được khóa nguyên vẹn.
   - Đã tạo commit M0 riêng biệt trong Git: `chore(setup): migrate repository from theme-setup to project-setup (M0)`.
2. **Khởi tạo và kiểm tra toolchain:**
   - Node.js LTS `v22.23.4`, pnpm `12.15.0`.
   - Hugo Extended `0.163.3` (biên dịch nhanh, chỉ 100–150ms).
   - Go `1.23.4` phục vụ Hugo Modules.
   - Cấu hình quản lý phiên bản thống nhất trong `mise.toml`.
3. **Chốt cấu hình nền tảng:**
   - Cấu hình site `config/_default/hugo.toml`, `params.toml`, `menus.en.toml`, `languages.toml`, `security.toml`.
   - Cập nhật thông tin nhận diện thương hiệu "Survival Kit - The Deadline Rescue Station".
   - Chốt các cờ tính năng (`enable_schedule_rescue`, `enable_send_rescue`, `enable_panic_level`).
   - Định dạng tiền tệ `₫`, múi giờ `Asia/Ho_Chi_Minh`.
4. **Hạ tầng CI/CD & Deploy:**
   - Hoàn thiện `.github/workflows/main.yml` (GitHub Pages).
   - Hoàn thiện `.gitlab-ci.yml` (GitLab Pages).
   - Hoàn thiện `netlify.toml` và `vercel.json` / `vercel-build.sh`.
   - Tạo runner `server.js` tích hợp cổng 3000 phục vụ preview môi trường AI Studio.
5. **Hồ sơ tài liệu:**
   - `docs/phan-cong-5-nguoi.md`
   - `docs/survival-kit-idea.md`
   - `docs/release/toolchain-versions.md`
   - `docs/release/site-configuration.md`
   - `docs/release/m0-handover.md`

---

## 2. Hướng dẫn chi tiết cho từng thành viên bắt đầu công việc

### Dành cho Người 2 (Thiết kế hệ thống & Nhận diện thương hiệu)
- **Nhánh làm việc đề xuất:** `feat/design-tokens-and-brand`
- **Các file được phép thao tác:**
  - `data/theme.json`
  - `assets/css/custom.css`
  - `assets/images/brand/**`, `assets/images/icons/**`, `assets/images/logo/**`
- **Công việc tiếp theo:**
  - Định nghĩa bảng màu đặc trưng Survival Kit trong `data/theme.json` (màu chính primary, warning cho Panic Mode, màu nền, font chữ).
  - Chuẩn bị logo mới của Survival Kit đặt vào `assets/images/logo/` hoặc `assets/images/logo.png`.
  - Tạo các class override trong `assets/css/custom.css` để Người 3 sử dụng.
  - *Lưu ý:* Không chỉnh sửa HTML trong `layouts/` hay `themes/`.

### Dành cho Người 3 (Front-end Hugo: Template, Component)
- **Nhánh làm việc đề xuất:** `feat/hugo-layouts-override`
- **Các file được phép thao tác:**
  - `layouts/baseof.html`, `layouts/home.html`, `layouts/single.html`, `layouts/list.html`
  - `layouts/_partials/**`, `layouts/partials/**`, `layouts/shortcodes/**`
  - `assets/js/**`
- **Công việc tiếp theo:**
  - Tạo override tại thư mục gốc `layouts/` (không sửa `themes/hargo-hugo/`).
  - Xây dựng component chọn Panic Level (1–7) trên trang chủ.
  - Hiển thị khối tính năng Schedule Your Rescue và Send a Rescue.
  - Đọc menu và feature toggles từ `site.Params.features` và `site.Menus.main`.

### Dành cho Người 4 (Nội dung, Ảnh nội dung & SEO)
- **Nhánh làm việc đề xuất:** `feat/content-survival-kits`
- **Các file được phép thao tác:**
  - `content/**` (`content/products/`, `content/blog/`, `content/faq/`, v.v.)
  - `assets/images/content/**`, `assets/images/blog/**`, `assets/images/products/**`
  - `i18n/**`, `archetypes/**`
- **Công việc tiếp theo:**
  - Cập nhật các bộ kit MVP vào `content/products/`: *Exam Survival Kit*, *Project Survival Kit*, *Mini Rescue Kit*, *Break Care Kit*.
  - Thêm thuộc tính frontmatter `panic_level: [1-7]` vào sản phẩm.
  - Soạn thảo các bài viết blog tư vấn vượt qua mùa thi, mẹo chạy deadline.
  - Cập nhật FAQ giải đáp về đặt trước theo deadline và dịch vụ tặng quà.

### Dành cho Người 5 (QA, Accessibility & Release)
- **Nhánh làm việc đề xuất:** `docs/qa-test-plan`
- **Các file được phép thao tác:**
  - `docs/qa/**`
  - `docs/release/qa-approval.md`, `docs/release/release-notes.md`
- **Công việc tiếp theo:**
  - Thiết lập kịch bản kiểm thử (Test Plan) cho các luồng mua hàng và đặt lịch.
  - Kiểm tra độ tương phản, heading, keyboard accessibility và hiển thị responsive.
  - Theo dõi kết quả build production qua lệnh `pnpm build`.

---

## 3. Lệnh khởi động nhanh cho toàn đội
```bash
# 1. Cài đặt dependencies
pnpm install

# 2. Khởi chạy dev server (port 3000)
pnpm dev

# 3. Kiểm tra build production
pnpm build
```

Môi trường đã hoàn toàn sẵn sàng. Chúc cả nhóm hoàn thành dự án xuất sắc!
