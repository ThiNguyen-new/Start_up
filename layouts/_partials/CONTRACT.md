# Hợp đồng template (Người 3) — cần Người 1 / Người 4

Người 3 phụ trách front-end Hugo (template, partial, styling component và client scripts).

## 1. Người 1 — Menu & Route
- Đã thêm mục menu `Build Your Own Kit` trỏ `build-your-own-kit/` trong `config/_default/menus.en.toml`.
- Hỗ trợ tham số URL chia sẻ trạng thái: `/build-your-own-kit/?category=<exam|project|club|care>&level=<1-7>&apply=1`.

## 2. Hệ thống Recommendation Engine & Panic Slider (Mới)
- **28 Kit gợi ý theo ma trận Category × Panic Level:**
  - `data/survival_kit/kits.json`: 4 category (`exam`, `project`, `club`, `care`) × 7 level = 28 kit gợi ý hoàn chỉnh với mô tả và số lượng món.
  - `data/survival_kit/products.json`: 15 sản phẩm mẫu (bổ sung 3 sản phẩm cho nhóm club: `snack-chia-se`, `tra-tui-loc-nhom`, `bo-but-nhom`).
  - `static/images/survival-kit/*.svg`: 15 ảnh vector SVG đồng bộ phong cách.
- **Partials dữ liệu & Bộ chọn:**
  - `layouts/_partials/kits-data.html`: nhúng dữ liệu vào `<script id="sk-kit-data">`, tự động kiểm tra tính hợp lệ của kit lúc build (báo lỗi nếu thiếu level hoặc có ID lạ).
  - `layouts/_partials/kit-category-picker.html`: 4 nút category dùng chung trang chủ và trang Build.
  - `layouts/_partials/panic-selector.html`: tích hợp showcase gợi ý động theo level và category, hiệu ứng chuyển màu mượt mà.
- **Client Scripts & State:**
  - `assets/js/kit-recommend.js`: module gợi ý kit dùng chung (`window.KitRecommend`), đồng bộ `sessionStorage` key `survivalKitCategory`, phát event `kitcategorychange`.
  - `assets/js/panic-level.js`: đồng bộ `sessionStorage` key `survivalKitPanicLevel`, phát event `paniclevelchange`.
  - `assets/js/script.js`: tối ưu slider không giật (CSS `@property`, dải màu theo vị trí núm `--f`, touch-action, chống chạy lặp).
  - `assets/js/build-your-own-kit.js`: card gợi ý theo level & category, nút "Áp dụng kit này", tự động nhận `?apply=1`.

## 3. Người 4 — Frontmatter sản phẩm chính (`content/products/*.md`) & i18n
Ngoài field theme (`price`, `priceBefore`, `productID`, `shortDescription`, `images[].image`, `description`, `type: products`):
- `panic_level`: số 1–7
- `kit_type`: `exam` | `project` | `club` | `care`
- i18n: các tên category (`Mùa thi`, `Đồ án`, `CLB & nhóm`, `Chăm sóc & tặng bạn`) hiện nằm trực tiếp trong `kits.json`. Nếu cần chuyển sang `i18n/*.yaml`, Người 4 có thể bổ sung key tương ứng.

## 4. Người 2 — Design Tokens
- Đã cấu hình `--panic-accent` tự động ánh xạ sang `--panic-1-text` đến `--panic-7-fill` theo thuộc tính `html[data-panic="N"]`.
- Núm slider và nút chọn category active tự động đổi màu theo Panic Level với độ tương phản text $\ge 4.5:1$.
