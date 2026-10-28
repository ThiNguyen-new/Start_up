# Phân công dự án Hugo cho 5 người
## Tài liệu phân công, ranh giới chỉnh sửa và quy trình phối hợp

---

## 1. Mục đích và trạng thái hiện tại
Tài liệu này chia quyền sở hữu mã nguồn để năm người có thể làm việc song song, giảm tối đa xung đột Git. Đây là quy ước bắt buộc: mỗi người chỉ sửa các đường dẫn được cấp cho mình ở phần tương ứng; mọi ngoại lệ phải được cả nhóm đồng ý trong issue/PR trước khi sửa.

### Kết luận khảo sát
- Dự án ban đầu ở **theme-setup**: theme nằm ở thư mục gốc (`layouts/`, `assets/`, `theme.toml`), còn site mẫu nằm trong `exampleSite/`.
- Package manager hiện hành là **pnpm** (phiên bản `12.15.0`), khai báo trường `packageManager` trong `package.json`.
- **Hugo Extended** đúng phiên bản **0.163.3**, khớp cả `mise.toml` lẫn `netlify.toml` và `.github/workflows/main.yml`.
- Quy định của dự án yêu cầu chuyển sang **project-setup** trước khi sửa nội dung, cấu hình, layout, style hoặc script. Không được tự kéo/thả file giữa hai cấu trúc.
- **Người 1** thực hiện mốc chuyển đổi một lần đầu tiên (**M0**). Các đường dẫn ở phần phân công bên dưới là đường dẫn sau khi đã chuyển đổi. Không ai khác bắt đầu chỉnh giao diện/nội dung trước khi mốc này được merge.

---

## 2. Quy tắc làm việc chung
1. Mỗi công việc tạo branch riêng theo mẫu `feat/<ten-viec>` hoặc `fix/<ten-viec>`; không commit trực tiếp vào nhánh chính.
2. Trước khi làm việc, cập nhật nhánh cá nhân từ nhánh tích hợp (`main`). Trước khi tạo PR, rebase/merge nhánh tích hợp theo quy ước của nhóm.
3. Không sửa file nằm ngoài danh sách **Được phép sửa** của mình, kể cả chỉ sửa format, dấu cách hoặc xuống dòng. Nếu phát hiện lỗi ở vùng của người khác, mở issue hoặc để review comment.
4. Không sửa trực tiếp bất kỳ file nào trong `themes/<ten-theme>/`, thư mục Go cache, `hugo_stats.json`, `generated-theme.css`, `public/`, `resources/`, `.hugo_build.lock` hoặc `node_modules/`.
5. Không chỉnh tay `scripts/projectSetup.js`, `scripts/themeSetup.js`, `scripts/clearModules.js`; không tự di chuyển file giữa theme-setup và project-setup. Chỉ dùng lệnh `pnpm project-setup` hoặc `pnpm theme-setup` khi có quyết định nhóm.
6. Không chạy `remove-darkmode` hay `remove-multilang` nếu chưa có phê duyệt bằng văn bản; đây là thao tác ghi đè khó đảo ngược.
7. Không chạy `hugo server` trực tiếp nếu chưa thiết lập port; sau khi môi trường đã đạt điều kiện, chỉ dùng các script dự án: `pnpm dev`, `pnpm build` và `pnpm preview`.
8. Không đưa khóa API, token, email/mật khẩu thật hoặc dữ liệu khách hàng vào commit. Dùng biến môi trường hoặc placeholder an toàn.
9. Mọi PR phải nêu: mục tiêu, các file đã sửa, ảnh/chứng cứ giao diện nếu có, lệnh đã chạy và các rủi ro còn lại.
10. Nếu hai hạng mục cần cùng một file, chủ file thực hiện thay đổi sau khi nhận yêu cầu cụ thể; người yêu cầu không tự sửa file đó.

---

## 3. Thứ tự triển khai và điểm đồng bộ

| Mốc | Chủ sở hữu | Điều kiện hoàn tất | Người có thể bắt đầu tiếp theo |
|---|---|---|---|
| **M0 – Chuẩn hóa workspace** | Người 1 | Cấu trúc project-setup đã được tạo bằng script, môi trường được kiểm tra, CI không bị thay đổi ngầm | Tất cả thành viên |
| **M1 – Khung thương hiệu và cấu hình** | Người 1 + Người 2 | Tên site, menu, SEO nền, token màu/chữ đã được chốt | Người 3, Người 4 |
| **M2 – Giao diện và nội dung** | Người 3 + Người 4 | Các route, component, ảnh và nội dung đã khớp với cấu hình | Người 5 |
| **M3 – Kiểm thử và phát hành** | Người 5 | Build, kiểm tra liên kết, responsive, accessibility và checklist deploy đạt | Người 1 duyệt phát hành |

*Lưu ý:* Người 2 có thể bắt đầu khung token ở M0, nhưng chỉ merge sau khi đường dẫn project-setup đã ổn định. Người 3 và Người 4 làm song song tại M2 vì không có file chung. Người 5 không tự sửa source để “chữa nhanh”; mọi lỗi source phải được trả về đúng chủ sở hữu.

---

## 4. Bảng sở hữu nhanh

| Người | Vai trò | Sở hữu chính | Không sở hữu |
|---|---|---|---|
| **1** | Kỹ thuật nền tảng / tích hợp | Chuyển đổi cấu trúc, cấu hình, menu, deployment, CI, VS Code | Layout, CSS, nội dung, ảnh nội dung |
| **2** | Thiết kế hệ thống | Token theme, CSS override, tài nguyên thương hiệu | HTML/layout, config site, nội dung Markdown |
| **3** | Front-end Hugo | Layout override, partial/component, hành vi JavaScript riêng | Theme token/CSS chung, config, Markdown/ảnh |
| **4** | Nội dung / SEO | Markdown, frontmatter, ảnh nội dung, bản dịch | Template, CSS, cấu hình site/CI |
| **5** | QA / phát hành | Kịch bản kiểm thử, báo cáo chất lượng, tài liệu release | Toàn bộ source/cấu hình sản phẩm |

---

## 5. Phân công chi tiết

### Người 1 — Kỹ thuật nền tảng, cấu hình và tích hợp
- **Mục tiêu:** Đưa repo về project-setup đúng cách, thiết lập cấu hình vận hành nhất quán và giữ nhánh tích hợp luôn build được.
- **Công việc bắt buộc:**
  1. Kiểm tra `node -v`, `pnpm -v`, `hugo version` và xác nhận Hugo là bản Extended 0.163.3.
  2. Chạy đúng một lần `pnpm project-setup` để chuyển cấu trúc. Kiểm tra thay đổi do script tạo ra, commit riêng cho việc chuyển đổi (**commit M0**) và thông báo commit gốc cho cả nhóm.
  3. Sau chuyển đổi, chốt cấu hình site: URL production, timezone, title, feature toggle, SEO mặc định, menu, ngôn ngữ, social link và quy tắc deploy.
  4. Duy trì môi trường làm việc trong `.vscode/`, workflow CI/CD và cấu hình Vercel/Netlify.
  5. Xem xét PR theo phạm vi file; từ chối PR sửa file ngoài vùng sở hữu hoặc sửa generated file.
- **Được phép sửa — và chỉ các đường dẫn này:**
  - `.vscode/**`
  - `.github/**`
  - `.gitlab-ci.yml`
  - `.editorconfig`
  - `.markdownlint.json`
  - `.jshintrc`
  - `mise.toml`
  - `package.json`
  - `pnpm-lock.yaml` (chỉ khi thay đổi dependency/tool hợp lệ)
  - `pnpm-workspace.yaml`
  - `netlify.toml`
  - `vercel.json`
  - `vercel-build.sh`
  - `server.js`
  - `config/_default/hugo.toml`
  - `config/_default/params.toml`
  - `config/_default/menus.*.toml`
  - `config/_default/languages.toml`
  - `config/_default/security.toml`
  - `data/social.json`
  - `docs/phan-cong-5-nguoi.md`
  - `docs/release/**`
  - `config/_default/module.toml` (chỉ khi cần thêm/bỏ Hugo Module đã được phê duyệt)
- **Cấm sửa:** mọi `content/**`, `assets/css/**`, `assets/images/**`, `layouts/**`, `static/**`, `.sitepins/**`, `themes/**`, `scripts/**`, `go.mod`, `go.sum` và file do build sinh ra.
- **Bàn giao:** Commit M0; bảng ghi version công cụ; URL preview; danh sách feature toggle/menu/site metadata đã chốt; PR mô tả rõ mọi thay đổi cấu hình.

---

### Người 2 — Thiết kế hệ thống và nhận diện thương hiệu
- **Mục tiêu:** Xây dựng ngôn ngữ hình ảnh nhất quán nhưng không can thiệp cấu trúc HTML hay nội dung.
- **Công việc bắt buộc:**
  1. Đề xuất bảng màu, cặp font, cỡ chữ và trạng thái dark mode dựa trên `data/theme.json`; dùng token thay vì mã màu rải rác.
  2. Tạo các CSS override tái sử dụng cho spacing, button, card, biểu mẫu, trạng thái focus/hover và responsive trong `assets/css/custom.css`.
  3. Chuẩn bị logo, favicon và tài nguyên thương hiệu trong `assets/images/brand/**`, `assets/images/icons/**`, `assets/images/logo/**`.
  4. Kiểm tra tương phản màu, focus visible, kích thước chạm và hiển thị desktop/mobile.
  5. Cung cấp tài liệu ngắn trong PR: token nào thay đổi, class/biến nên được Người 3 sử dụng.
- **Được phép sửa:**
  - `data/theme.json`
  - `assets/css/custom.css`
  - `assets/images/brand/**`
  - `assets/images/icons/**`
  - `assets/images/logo/**`
- **Cấm sửa:** `layouts/**`, `content/**`, `config/**`, `hugo.toml`, `data/social.json`, JavaScript, CSS trong `themes/**`, `generated-theme.css`, `hugo_stats.json`.

---

### Người 3 — Front-end Hugo: Template, Component và Tương tác
- **Mục tiêu:** Hiện thực cấu trúc giao diện bằng override ở root, tái sử dụng component và giữ template tương thích Hugo mới.
- **Công việc bắt buộc:**
  1. Tạo/chỉnh override template tại root (`layouts/`), không sửa template trong `themes/hargo-hugo/`.
  2. Dùng cấu trúc Hugo hiện đại: `layouts/home.html`, `layouts/baseof.html`, `layouts/single.html`, `layouts/list.html`, `layouts/_partials/`.
  3. Dùng partial "image" / shortcode image cho ảnh content; không viết thẻ `<img>` thủ công.
  4. Đọc feature toggle và menu từ cấu hình; không hard-code liên kết, social link, URL production hoặc mã màu.
  5. Giữ JavaScript nhỏ gọn, không thêm framework/dependency nếu chưa được Người 1 duyệt.
- **Được phép sửa:**
  - `layouts/baseof.html`
  - `layouts/home.html`
  - `layouts/single.html`
  - `layouts/list.html`
  - `layouts/taxonomy.html`
  - `layouts/term.html`
  - `layouts/_partials/**`
  - `layouts/partials/**`
  - `layouts/shortcodes/**`
  - `assets/js/**`
- **Cấm sửa:** `themes/**`, `content/**`, `assets/images/**`, `assets/css/**`, `data/theme.json`, `config/**`, `hugo.toml`, CI/deploy.

---

### Người 4 — Nội dung, Ảnh nội dung và SEO theo trang
- **Mục tiêu:** Hoàn thiện nội dung website có cấu trúc, chuẩn SEO và sẵn sàng được template hiển thị, không thay đổi logic giao diện.
- **Công việc bắt buộc:**
  1. Lập content inventory: trang nào giữ, thay, thêm hoặc bỏ; chốt URL slug trước khi viết để tránh gãy link.
  2. Viết/chỉnh Markdown và frontmatter theo mẫu của đúng section (`content/products/`, `content/blog/`, `content/faq/`, `content/contact/`, `content/terms-conditions/`).
  3. Với bài blog: tác giả khớp taxonomy, date ISO, không để draft lọt production.
  4. Duy trì `build.render: "never"` ở các section trang chủ nếu có.
  5. Đặt ảnh nội dung vào `assets/images/content/` hoặc thư mục con theo section; dùng đường dẫn tuyệt đối kiểu `/images/content/...`.
  6. Viết bản dịch/i18n trong `i18n/**`.
- **Được phép sửa:**
  - `content/**`
  - `assets/images/content/**`
  - `assets/images/blog/**`
  - `assets/images/products/**`
  - `assets/images/pages/**`
  - `i18n/**`
  - `archetypes/**`
  - `.sitepins/config.json`
  - `.sitepins/schema/**`
  - `docs/content/**`
- **Cấm sửa:** `layouts/**`, `assets/css/**`, `assets/js/**`, `data/**`, `config/**`, `hugo.toml`, `themes/**`, `static/js/**`, ảnh thương hiệu.

---

### Người 5 — QA, Accessibility và Phát hành
- **Mục tiêu:** Xác minh chất lượng cuối, cung cấp bằng chứng lỗi rõ ràng và điều phối phát hành mà không tự sửa source vượt ranh giới.
- **Công việc bắt buộc:**
  1. Viết test plan cho mọi route, menu, form, 404, responsive trên mobile/tablet/desktop.
  2. Sau mỗi PR lớn, chạy kiểm tra: install, production build, preview; kiểm tra output không có lỗi template/link/image.
  3. Kiểm tra accessibility tối thiểu: heading hierarchy, landmark, focus keyboard, label form, alt text, contrast.
  4. Kiểm tra SEO phát hành: title, description, canonical, OG image, sitemap/robots.
  5. Lập bug report và gán cho đúng chủ sở hữu.
  6. Chuẩn bị ghi chú phát hành, checklist rollback và xác nhận preview URL.
- **Được phép sửa:**
  - `docs/qa/**`
  - `docs/release/qa-approval.md`
  - `docs/release/release-notes.md`
  - `docs/release/rollback-plan.md`
- **Cấm sửa:** Toàn bộ source code (`content/**`, `layouts/**`, `assets/**`, `static/**`, `data/**`, `config/**`, `hugo.toml`, toolchain).

---

## 6. Ranh giới kỹ thuật cần đặc biệt lưu ý
- **Cấu hình & Menu:** Chỉ Người 1 đổi menu trong `config/_default/menus.*.toml`. Người 3 render menu từ config; Người 4 cung cấp nhãn/URL. Không hard-code menu trong HTML.
- **Màu sắc & CSS:** Chỉ Người 2 đổi `data/theme.json` và `assets/css/custom.css`. Người 3 dùng token/class được cung cấp. Không hard-code mã màu trong template. `generated-theme.css` là file sinh tự động, tuyệt đối không sửa.
- **Template & Nội dung:** Người 3 quyết định template đọc field nào; Người 4 điền dữ liệu theo hợp đồng đó. Field mới phải được thống nhất qua issue trước.
- **Ảnh:** Ảnh thương hiệu thuộc Người 2; ảnh bài viết/sản phẩm thuộc Người 4.
- **Code sinh tự động & Vendor:** Tuyệt đối không commit vào `public/`, `resources/`, `node_modules/`, `.hugo_build.lock`, `hugo_stats.json`, `themes/**`, cache Go.
