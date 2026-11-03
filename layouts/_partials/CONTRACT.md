# Hợp đồng template (Người 3) — cần Người 1 / Người 4

Người 3 phụ trách front-end Hugo (template, partial, styling component và client scripts).

## 1. Người 1 — Menu & Route
- Đã thêm mục menu `Build Your Own Kit` trỏ `build-your-own-kit/` trong `config/_default/menus.en.toml`.
- Đã thêm mục menu `Schedule Rescue` trỏ `schedule-rescue/` và `Send a Rescue` trỏ `send-rescue/` ở cả thanh điều hướng chính (`[[main]]`) và chân trang (`[[footer]]`).
- Hỗ trợ tham số URL chia sẻ trạng thái:
  - `/build-your-own-kit/?category=<exam|project|club|care>&level=<1-7>&apply=1`
  - `/schedule-rescue/?deadline=YYYY-MM-DD&receive=YYYY-MM-DD&category=<exam|project|club|care>&level=<1-7>`
  - `/send-rescue/?type=<bestie|love|crush|team>&recipient=<tên>&message=<lời nhắn>&category=<exam|project|club|care>&level=<1-7>`

## 2. Hệ thống Recommendation Engine & Panic Slider
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

## 3. Hệ thống Schedule a Rescue & Send a Rescue
- **Partials dùng chung:**
  - `layouts/_partials/rescue-kit-step.html`: tích hợp Panic Picker, Category Picker, bộ kit khuyến nghị và banner kit tự phối.
  - `layouts/_partials/rescue-summary.html`: sidebar tóm tắt dính (sticky desktop) và thanh ghim đáy di động (mobile bar).
- **Dữ liệu quy tắc & kiểu rescue:**
  - `data/survival_kit/schedule-rules.json`: chứa `minLeadDays` (1), `maxLeadDays` (2), `prepDays` (1), `changeWindowHours` (24), `slots` (sáng/chiều/tối), `blackoutDates`, `zones`.
  - `data/survival_kit/gift-types.json`: 4 kiểu (`bestie`, `love`, `crush`, `team`), tone giọng, defaultCategory, cờ `allowAnonymous`, các mẫu lời nhắn (`samples`), và danh sách mẫu thiệp (`cards`).
- **Module JavaScript dùng chung:**
  - `assets/js/rescue-common.js` (`window.RescueCommon`): module UMD hỗ trợ tính ngày theo múi giờ `Asia/Ho_Chi_Minh` (`todayVN`, `parseISODate`, `diffDays`, `addDays`), hàm validate (`validateSchedule`, `validateGiftDate`, `isValidPhone`), bộ đếm ký tự hỗ trợ emoji (`countChars`), mã đơn demo (`makeOrderCode`), xuất lịch `.ics` theo chuẩn RFC 5545 (`buildICS`), quản lý nháp `sessionStorage` (`loadDraft`, `saveDraft`, `clearDraft`), và bộ làm sạch query param (`sanitizeQuery`).
- **State & Contract `sessionStorage`:**
  - `survivalKitSchedule`: lưu nháp tiến trình đặt lịch:
    ```json
    {
      "selectedKitType": "reco|custom",
      "deadlineLabel": "Kỳ thi CSDL",
      "deadlineDate": "2026-11-20",
      "receiveDate": "2026-11-18",
      "slot": "morning",
      "contact": { "name": "...", "phone": "...", "address": "...", "note": "..." }
    }
    ```
  - `survivalKitGift`: lưu nháp tiến trình gửi tặng:
    ```json
    {
      "giftType": "bestie|love|crush|team",
      "selectedKitType": "reco|custom",
      "recipient": { "name": "...", "phone": "...", "address": "...", "deadline": "...", "receive": "...", "slot": "...", "note": "..." },
      "card": { "format": "physical_box|wax_letter|digital", "templateId": "...", "senderName": "...", "isAnonymous": false, "privatePhone": "...", "message": "..." }
    }
    ```
  - `survivalKitCart`: sau khi xác nhận ở bước cuối, payload được gộp vào giỏ hàng demo (`cart-demo/`):
    - Đơn đặt lịch: chứa object `schedule: { orderCode, deadline, deadlineLabel, receive, slot, contact, createdAt }`
    - Đơn gửi tặng: chứa object `gift: { orderCode, giftType, giftTypeName, recipient, card, createdAt }`
- **Trang chủ (USP Redirection):**
  - Form `#schedule` chuyển sang method GET dẫn tới `/schedule-rescue/?deadline=...&receive=...`.
  - Form `#gifting` chuyển sang method GET dẫn tới `/send-rescue/?type=...&recipient=...&message=...`.
- **Bảo mật & Trải nghiệm (XSS & Accessibility):**
  - Tuyệt đối không chèn trực tiếp nội dung người dùng nhập vào HTML; toàn bộ hiển thị (preview thiệp, người nhận, người gửi, lời nhắn) được gán thông qua `.textContent`.
  - Có checkbox cam kết không quấy rối / xúc phạm ở Bước 5 trang Send a Rescue.
  - Chế độ gửi ẩn danh (chỉ mở cho Crush Rescue) che giấu danh tính người gửi với người nhận, đồng thời lưu số điện thoại xác minh riêng nội bộ.
  - Tương thích bàn phím đầy đủ, thuộc tính ARIA (`aria-label`, `aria-describedby`, `aria-invalid`, `role="note"`, `role="region"`, `role="status"`).

## 4. Người 4 — Frontmatter sản phẩm chính (`content/products/*.md`) & i18n
Ngoài field theme (`price`, `priceBefore`, `productID`, `shortDescription`, `images[].image`, `description`, `type: products`):
- `panic_level`: số 1–7
- `kit_type`: `exam` | `project` | `club` | `care`
- i18n: các tên category (`Mùa thi`, `Đồ án`, `CLB & nhóm`, `Chăm sóc & tặng bạn`) hiện nằm trực tiếp trong `kits.json`. Nếu cần chuyển sang `i18n/*.yaml`, Người 4 có thể bổ sung key tương ứng.

## 5. Người 2 — Design Tokens
- Đã cấu hình `--panic-accent` tự động ánh xạ sang `--panic-1-text` đến `--panic-7-fill` theo thuộc tính `html[data-panic="N"]`.
- Núm slider và nút chọn category active tự động đổi màu theo Panic Level với độ tương phản text $\ge 4.5:1$.
- `assets/css/rescue.css` sử dụng hoàn toàn hệ thống biến CSS token (`--color-*`, `--space-*`, `--radius-*`, `--panic-accent`), không dùng mã màu hex cố định.
