# Hợp đồng template (Người 3) — cần Người 1 / Người 4

Người 3 phụ trách front-end Hugo (template, partial, styling component và client scripts).

## 1. Người 1 — Menu & Route
- Đã thêm mục menu `Build Your Own Kit` trỏ `build-your-own-kit/` trong `config/_default/menus.en.toml`.
- Đề xuất menu hash (nếu Người 1 muốn trỏ thẳng section trang chủ):
  - `Schedule Rescue` → `/#schedule`
  - `Send a Rescue` → `/#gifting` (hoặc `contact/#gifting`)

## 2. Tính năng "Build Your Own Kit" & "Cart Demo" (Mới)
- **Trang chính:**
  - `content/build-your-own-kit/_index.md` → template `layouts/build-your-own-kit/list.html`
  - `content/cart-demo/_index.md` → template `layouts/cart-demo/list.html`
- **Dữ liệu mẫu:**
  - `data/survival_kit/products.json` (12 sản phẩm mẫu chia đều 6 nhóm: `drinks`, `snacks`, `study`, `ergonomics`, `mood`, `packaging`)
  - `data/survival_kit/presets.json` (3 bộ kit nhanh cho Level 7 SOS: `sos-rush`, `all-nighter`, `final-boss`)
  - `static/images/survival-kit/*.svg` (ảnh minh họa SVG cho 12 sản phẩm)
- **Shared Panic Level:**
  - `layouts/_partials/panic-picker.html` (7 nút radio phân đoạn 1–7)
  - `assets/js/panic-level.js` (đồng bộ `sessionStorage` key `survivalKitPanicLevel`, phát event `paniclevelchange`, API `window.PanicLevel`)
- **Bộ tương tác Builder & Demo Cart:**
  - `assets/js/build-your-own-kit.js` (quản lý số lượng 0–20, tính tổng tiền, lọc theo chủ đề `exam`/`project`/`rush`/`free`, gợi ý theo Panic Level, xem trước lời nhắn an toàn với `textContent`, lưu vào `sessionStorage` key `survivalKitCart`)
  - `assets/css/build-your-own-kit.css` (lưới card, responsive 360px, thanh sticky tóm tắt và nút bấm tối thiểu 44px)

## 3. Người 4 — Frontmatter sản phẩm chính (`content/products/*.md`)
Ngoài field theme (`price`, `priceBefore`, `productID`, `shortDescription`, `images[].image`, `description`, `type: products`):
- `panic_level`: số 1–7
- `kit_type`: `exam` | `project` | `club` | `care`

Template ẩn badge/filter data nếu thiếu field. Giá Mini/Standard/Premium: 39–59k / 79–129k / 149k+ ₫.

## 4. Người 4 — i18n keys (`i18n/en.yaml` & `i18n/vi.yaml`)
- `sk_demo_notice`, `sk_demo_disclaimer`, `sk_cart_disclaimer`, `sk_deadline_status`, `sk_panic_mode`, `sk_select_panic_level`
- Đầy đủ fallback tiếng Việt / tiếng Anh mặc định trong template nếu chưa có key i18n.
