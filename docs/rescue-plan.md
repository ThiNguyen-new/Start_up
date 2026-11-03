# Kế hoạch triển khai Schedule a Rescue & Send a Rescue

Nov 2, 2026 · @xczc

## Tổng quan và quyết định cần chốt

Cần thêm hai trang mới, `/schedule-rescue/` và `/send-rescue/`, làm đúng theo cách repo đã làm Build Your Own Kit và Giỏ hàng demo: Hugo section + layout riêng + JS thuần + `sessionStorage`, chưa cần backend. Hiện menu "Schedule Rescue" đang trỏ về `products/` và "Send a Rescue" trỏ về `contact/` (cả header lẫn footer), còn trang chủ chỉ có hai form demo nhỏ.

Kết quả mong muốn:

- **Schedule a Rescue:** chọn kit, nhập deadline và ngày nhận (trước deadline 1–2 ngày), điền thông tin giao, xác nhận; có nút thêm vào lịch (.ics) và mã đơn demo.
- **Send a Rescue:** chọn kiểu rescue (Bestie, Love, Secret Crush, Team), chọn kit, nhập người nhận và ngày giao, soạn thiệp có xem trước, xác nhận.
- **Nối vào luồng cũ:** dùng lại Panic Level, bộ chọn category, kit gợi ý, và đổ kết quả vào giỏ `survivalKitCart` để trang `cart-demo` hiển thị.

Sáu quyết định dưới đây đã có mặc định đề xuất; bạn không cần trả lời trước, cứ vibe code theo mặc định rồi đổi sau nếu muốn.

| Quyết định | Mặc định đề xuất | Lý do |
| --- | --- | --- |
| Dữ liệu gửi đi đâu | Giai đoạn 1 chỉ demo, lưu `sessionStorage`; gom vào một hàm `submitRescue()` để sau này đổi sang form service | Cả site đang ghi "bản demo, không lưu dữ liệu" và `formAction = "#"`; tài liệu ý tưởng cho phép vận hành thủ công ở MVP |
| Quy tắc ngày nhận | Cách deadline 1–2 ngày, cách hôm nay tối thiểu 1 ngày; cấu hình trong `data/survival_kit/schedule-rules.json` | Khớp form trang chủ (`script.js` chỉ nhận 1 hoặc 2 ngày); test hiện tại chỉ kiểm tra ≥ 1 ngày nên cần thống nhất |
| Secret Crush ẩn danh | Có trong v1, chỉ ở kiểu Crush; người gửi vẫn khai tên + liên hệ (không hiện cho người nhận) và tick cam kết nội dung | Tài liệu ý tưởng yêu cầu cơ chế an toàn và cho người nhận từ chối |
| Ngôn ngữ giao diện | Tiếng Việt cho nội dung mới, giữ tên menu tiếng Anh | Build Your Own Kit và giỏ hàng đã viết tiếng Việt |
| Độ dài lời nhắn | 200 ký tự cho Send a Rescue (Build Your Own Kit giữ 120) | Lời nhắn mẫu trong tài liệu ý tưởng dài khoảng 200 ký tự |
| Vùng giao hàng | Chỉ TP.HCM trong v1, cấu hình được | Đơn vị đặt tại Quận 5; tài liệu ý tưởng nhắc phải chốt vùng giao trước khi hứa ngày |

## Hiện trạng repo

Nền tảng đã đủ để làm hai trang này mà không cần thư viện mới; thứ thiếu là route, layout, JS và dữ liệu riêng, kèm vài bẫy cần tránh. Mình đọc nhánh `main` (commit `0a191f0`) và chưa chạy được `hugo build` trong môi trường này.

**Đã có, dùng lại:**

- **Mẫu trang:** `content/<tên>/_index.md` có `layout:` + `layouts/<tên>/list.html` định nghĩa block `main` (xem `build-your-own-kit`, `cart-demo`); tiêu đề và breadcrumb dùng `page-title.html`.
- **Bộ chọn:** `panic-picker.html`, `kit-category-picker.html`; `kits-data.html` nhúng JSON `#sk-kit-data` và báo lỗi lúc build nếu kit thiếu level hoặc có id lạ.
- **JS dùng chung:** `window.PanicLevel`, `window.KitRecommend.recommend(category, level)`, sự kiện `paniclevelchange` và `kitcategorychange`.
- **State:** `sessionStorage` với `survivalKitPanicLevel`, `survivalKitCategory`, `survivalKitCart`.
- **Dữ liệu:** `data/survival_kit/products.json` (15 sản phẩm), `kits.json` (4 category × 7 level), `presets.json` (3 combo).
- **Style:** Bootstrap + class `sk-*`. `build-your-own-kit.css` được `head.html` nạp ở mọi trang nên `sk-sticky-summary`, `sk-mobile-sticky-bar`, `sk-disclaimer-alert`, `sk-kit-chip`, `sk-reco-card` dùng được ngay; form dùng `sk-form`, `sk-field`, `sk-input`, `sk-label`, `sk-btn-*` trong `custom.css`.
- **Icon và cờ:** `assets/images/icons/schedule-rescue.svg`, `send-rescue.svg`; cờ `enable_schedule_rescue` / `enable_send_rescue` đã được header, footer và trang chủ đọc.

**Còn thiếu:**

- Chưa có `content/schedule-rescue/`, `content/send-rescue/` và layout tương ứng; menu header + footer đang trỏ nhầm (`products/`, `contact/`).
- Trang chủ có hai form demo (`usp-schedule.html`, `usp-gifting.html`); submit được xử lý trong `assets/js/script.js` và chỉ in một dòng thông báo demo.
- `cart-demo` chỉ đọc `items`, `level`, `category`, `message`, `total`; chưa có chỗ hiện lịch giao hay người nhận.
- `i18n/en.yaml` chưa có key `sk_*` nào; chuỗi mới dùng mẫu `or (i18n "key") "fallback"` như các partial hiện tại.
- FAQ vẫn là lorem ipsum, trang Terms vẫn là bản mẫu của theme, `content/products/*` vẫn là hàng mẫu Taba. Không chặn việc này, nhưng chính sách đổi lịch, giao hàng và ẩn danh cần được viết vào FAQ/Terms ở bước cuối.

**Bẫy kỹ thuật:**

1. **Handler demo trong `script.js` sẽ nuốt form mới.** Nó gắn `submit` cho `#schedule form, form.js-schedule-form` và `#gifting form, form.js-gifting-form` rồi gọi `preventDefault()`. Form mới phải dùng id/class khác (`rescue-schedule-form`, `js-rescue-schedule`), và handler cũ phải gỡ khi form trang chủ chuyển sang chuyển tiếp.
2. **`AGENTS.md` lệch repo.** File nói Tailwind v4 và theme `hugoplate`; repo này là Bootstrap + SCSS + `custom.css`, theme `hargo-hugo`. Dặn AI bỏ qua dòng đó. Các luật còn đúng: không sửa `themes/`, partial ở `layouts/_partials/`, `home.html` và `baseof.html` ở top-level, chạy bằng `pnpm dev` / `pnpm build`.
3. **Menu được so khớp theo tên.** Header và footer ẩn mục có `.Name` là "Schedule Rescue" hoặc "Send a Rescue" khi cờ tắt, nên chỉ đổi `url`, không đổi tên.
4. **CSS và JS không tự nạp.** `head.html` liệt kê từng file CSS; JS riêng của trang nạp trong block `main` của layout bằng `resources.Get … | minify` + `defer` (như Build Your Own Kit); `footer.html` chỉ nạp `panic-level.js`, `kit-recommend.js` và `script.js`.
5. **Lệch ngày do múi giờ.** `new Date("YYYY-MM-DD")` parse theo UTC, còn site đặt `Asia/Ho_Chi_Minh`. So sánh ngày theo (năm, tháng, ngày) và lấy "hôm nay" bằng `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })`.
6. **Nội dung người dùng nhập.** Lời nhắn, tên, địa chỉ chỉ được hiển thị bằng `textContent`, như Build Your Own Kit và giỏ hàng đang làm; không dùng `innerHTML`.

## Kiến trúc và danh sách file

Hai trang là hai Hugo section độc lập, dùng chung một module JS và một bộ dữ liệu, rồi cùng ghi kết quả vào giỏ `survivalKitCart` để `cart-demo` hiển thị. Không file nào trong `themes/` bị sửa.

Quy ước: URL là `/schedule-rescue/` và `/send-rescue/`; id và class mới đều mang tiền tố `rescue-` / `js-rescue-` để không đụng handler cũ; bản nháp lưu ở hai key `sessionStorage` mới là `survivalKitSchedule` và `survivalKitGift`; khi xác nhận, kit + lịch (hoặc kit + quà) được ghi vào `survivalKitCart` với thêm trường `schedule` hoặc `gift`, nên `cart-demo` đọc được mà payload cũ của Build Your Own Kit không đổi.

Mũi tên hai chiều nghĩa là trang đọc kit từ giỏ rồi ghi lịch hoặc quà vào lại giỏ; `cart-demo` chỉ đọc. Hai trang mới tô đậm.

**Tạo mới**

| File | Vai trò |
| --- | --- |
| `content/schedule-rescue/_index.md` | Front matter: `title`, `description`, `layout: "schedule-rescue"` |
| `content/send-rescue/_index.md` | Tương tự, `layout: "send-rescue"` |
| `layouts/schedule-rescue/list.html` | Giao diện 4 bước + sidebar tóm tắt |
| `layouts/send-rescue/list.html` | Giao diện 5 bước + xem trước thiệp |
| `layouts/_partials/rescue-kit-step.html` | Bước "Chọn kit" dùng chung: panic-picker, category picker, thẻ kit gợi ý, kit đã tự phối từ giỏ |
| `layouts/_partials/rescue-summary.html` | Sidebar tóm tắt + thanh dưới cho mobile (class `sk-sticky-summary`, `sk-mobile-sticky-bar` có sẵn) |
| `assets/js/rescue-common.js` | Hàm thuần dùng chung: ngày, validate, đọc/ghi state, mã đơn, file .ics; export kiểu UMD để `node --test` gọi được |
| `assets/js/schedule-rescue.js` | Điều khiển stepper và form đặt lịch |
| `assets/js/send-rescue.js` | Điều khiển stepper, chọn thiệp, xem trước |
| `assets/css/rescue.css` | Stepper, timeline ngày, thiệp xem trước; dùng biến `--color-*`, `--space-*` có sẵn |
| `data/survival_kit/schedule-rules.json` | Số ngày nhận trước deadline, ngày chuẩn bị, ngày nghỉ, khung giờ, vùng giao |
| `data/survival_kit/gift-types.json` | 4 kiểu rescue, lời nhắn mẫu, category mặc định, mẫu thiệp, hình thức gửi |
| `test/rescue.test.js` | Test hàm thuần và kiểm tra cấu trúc dữ liệu |

**Sửa file có sẵn**

| File | Việc cần sửa |
| --- | --- |
| `config/_default/menus.en.toml` | Đổi `url` của "Schedule Rescue" thành `schedule-rescue/`, "Send a Rescue" thành `send-rescue/`, ở cả `[[main]]` lẫn `[[footer]]`; giữ nguyên `name` |
| `layouts/_partials/head.html` | Thêm nạp `css/rescue.css` cạnh `build-your-own-kit.css` |
| `layouts/_partials/usp-schedule.html`, `usp-gifting.html` | Form trang chủ chuyển tiếp sang trang mới kèm query (`?deadline=…&receive=…`, `?recipient=…&type=…`) |
| `assets/js/script.js` | Gỡ hai handler demo `#schedule` / `#gifting` (khoảng dòng 339–383) |
| `layouts/cart-demo/list.html` | Hiện thẻ "Lịch giao" hoặc "Quà tặng" khi giỏ có `schedule` / `gift`; thêm hai nút "Đặt lịch giao" và "Gửi tặng kit này" |
| `layouts/_partials/CONTRACT.md` | Thêm mục mô tả schema `schedule` / `gift` và hai key `sessionStorage` mới |
| `test/config.test.js` | Thêm assertion cho URL menu mới |
| `data/faq.yml`, `content/terms-conditions/_index.md` | Viết chính sách đổi lịch, phí giao, ẩn danh (bước cuối, thay lorem ipsum) |

## Schedule a Rescue: spec chi tiết

Trang `/schedule-rescue/` dẫn người dùng qua bốn bước trên một trang (không tải lại) và chỉ cho đặt lịch khi ngày nhận hợp lệ so với deadline.

**Bố cục chung.** Đầu trang: icon `schedule-rescue.svg`, breadcrumb từ `page-title.html`, khung `sk-disclaimer-alert` ghi rõ bản demo như Build Your Own Kit. Cột trái là stepper và form; cột phải là `sk-sticky-summary` (mobile: `sk-mobile-sticky-bar`). Mỗi bước là một `<fieldset>` có `<legend>`; chỉ bước hiện tại không có `hidden`, và tiêu đề bước nhận focus khi chuyển bước.

**Bước 1: Chọn kit**

- Ba nguồn kit (radio): kit gợi ý theo Panic Level + category (`KitRecommend.recommend`), kit đã tự phối trong `survivalKitCart` (chỉ hiện khi có), hoặc liên kết sang Build Your Own Kit để tự phối.
- Panic Level và category lấy từ `PanicLevel` / `KitRecommend` như hiện tại, đồng bộ với query `?category=&level=`.
- Danh sách món và tổng tiền hiện ở sidebar ngay khi chọn.

**Bước 2: Deadline và ngày nhận**

- Trường: tên deadline (tuỳ chọn, ví dụ "Nộp đồ án CSDL"), ngày deadline, ngày nhận, khung giờ nhận. Cả hai ngày dùng `type="date"`, `min` tính theo giờ Việt Nam.
- Hai nút nhanh "Nhận trước 1 ngày" và "Nhận trước 2 ngày" tự điền ngày nhận = deadline − n; vẫn sửa tay được.
- Quy tắc đọc từ `schedule-rules.json`: ngày nhận cách deadline 1–2 ngày; ngày nhận ≥ hôm nay + `prepDays`; không rơi vào ngày nghỉ. Vi phạm thì hiện lỗi cụ thể dưới trường, ví dụ "Chọn ngày nhận trước deadline 1 hoặc 2 ngày".
- Một dải timeline nhỏ Hôm nay → Nhận → Deadline ghi số ngày giữa các mốc, đổi màu theo Panic Level của kit.

**Bước 3: Thông tin giao hàng**

- Họ tên, số điện thoại (`0` + 9 số hoặc `+84` + 9 số), địa chỉ giao, ghi chú cho người giao (tuỳ chọn). Nếu vùng giao bật trong `schedule-rules.json` thì chỉ nhận TP.HCM.
- Checkbox đồng ý Terms (liên kết `terms-conditions/`) và xác nhận hiểu đây là bản demo chưa thu tiền.
- Chỉ hỏi thông tin cần để giao hàng, đúng khuyến nghị riêng tư trong tài liệu ý tưởng.

**Bước 4: Xác nhận**

- Thẻ tóm tắt: kit, tổng tiền, deadline, ngày và giờ nhận, người nhận; mỗi mục có nút "Sửa" quay về đúng bước.
- Nút "Đặt lịch cứu hộ (demo)" gọi `submitRescue('schedule', payload)`, ghi `survivalKitCart` + `survivalKitSchedule`, rồi hiện màn hình thành công tại chỗ (không dùng `alert`).
- Màn hình thành công có mã đơn demo `SK-YYYYMMDD-XXXX`, timeline 5 trạng thái chỉ để mô phỏng (Đã đặt lịch, Nhắc lịch, Chuẩn bị, Giao, Hoàn tất), nút "Thêm vào lịch" tải file `.ics` (ngày nhận và ngày deadline), nút "Xem giỏ" sang `cart-demo`, nút "Đổi lịch" về bước 2.
- Dưới thẻ tóm tắt có ô chính sách ngắn: hạn đổi lịch (số giờ lấy từ `schedule-rules.json`), phí giao, trường hợp không nhận hàng. Nội dung thật do người phụ trách nội dung viết; v1 để chữ giữ chỗ.

**Prefill và chia sẻ.** Trang nhận `?deadline=YYYY-MM-DD&receive=YYYY-MM-DD&category=exam&level=5`. Chỉ chấp nhận giá trị đúng định dạng (ngày hợp lệ, category có trong `kits.json`, level từ 1 đến 7); giá trị sai bị bỏ qua, không báo lỗi.

**Lưu nháp và lỗi.** Nháp ghi vào `survivalKitSchedule` mỗi lần đổi bước nên tải lại vẫn giữ, đóng tab thì mất (đúng tinh thần demo). Lỗi hiện dưới từng trường với `aria-invalid` và `aria-describedby`; tổng lỗi của bước nằm trong vùng `role="alert"`; thành công dùng `role="status"`.

**Cờ tính năng.** Header và footer đã ẩn menu khi `enable_schedule_rescue = false`; layout thêm một dòng "Tính năng chưa mở" thay cho form để truy cập trực tiếp URL không hiện form.

## Send a Rescue: spec chi tiết

Trang `/send-rescue/` chia việc tặng kit thành năm bước: chọn kiểu rescue, chọn kit, nhập người nhận, soạn thiệp có xem trước, xác nhận. Khác Schedule ở chỗ người nhận không phải người đặt, nên có thêm quy tắc về lời nhắn và ẩn danh.

**Bố cục chung.** Giống trang Schedule: cùng partial `rescue-kit-step` và `rescue-summary`, icon `send-rescue.svg`, khung demo. Sidebar hiện kit, người nhận và thiệp thu nhỏ.

**Bước 1: Chọn kiểu rescue**

- Bốn thẻ chọn (radio) đọc từ `gift-types.json`: Bestie Rescue, Love Rescue, Secret Crush Rescue, Team Rescue. Đúng bốn chế độ trong tài liệu ý tưởng và khớp `<option>` ở form trang chủ (`bestie`, `love`, `crush`, `team`).
- Mỗi kiểu có tên, mô tả giọng điệu, category kit mặc định và vài lời nhắn mẫu. Đề xuất category: bestie, love, crush → `care`; team → `club`; chốt trong file dữ liệu và đổi được ở bước sau.

**Bước 2: Chọn kit**

- Dùng lại `rescue-kit-step`; category mặc định theo kiểu rescue, người gửi vẫn đổi được. Nhãn Panic Level ghi rõ là mức của người nhận.

**Bước 3: Người nhận và ngày giao**

- Tên hoặc biệt danh (hiện trên thiệp), số điện thoại, địa chỉ giao hoặc địa điểm (khoa, ký túc xá), ngày giao.
- Ngày giao dùng cùng hàm validate với Schedule: ≥ hôm nay + `prepDays` và không rơi vào ngày nghỉ. Có thêm ô tuỳ chọn "Deadline của người nhận"; nếu điền thì áp luật nhận trước 1–2 ngày.
- Chỉ thu thông tin cần để giao, không hỏi thêm.

**Bước 4: Thiệp và lời nhắn**

- Chọn mẫu thiệp (vài mẫu mỗi kiểu, khai báo trong `gift-types.json`) và hình thức: thiệp kèm hộp (mặc định) hoặc thư giấy. "Thông điệp điện tử" ghi là sắp có vì cần backend.
- Ô lời nhắn tối đa 200 ký tự, có bộ đếm. Nút "Gợi ý lời nhắn" chèn mẫu theo kiểu rescue; nếu ô đã có chữ thì hỏi trước khi thay.
- Tên người gửi hiện trên thiệp, hoặc bật "Gửi ẩn danh" (chỉ kiểu Crush). Khi ẩn danh, người gửi vẫn khai tên và liên hệ riêng cho cửa hàng (không hiện cho người nhận), và trang ghi rõ người nhận có thể từ chối thông điệp ẩn danh.
- Xem trước thiệp trực tiếp bằng khung CSS: "Gửi {người nhận}", lời nhắn, "Từ {người gửi hoặc Một người bạn ẩn danh}". Mọi chữ do người dùng nhập đều gán bằng `textContent`.

**Bước 5: Xác nhận**

- Thẻ tóm tắt: kiểu rescue, kit và tổng tiền, người nhận, ngày giao, thiệp. Hai checkbox bắt buộc: cam kết nội dung không quấy rối hay xúc phạm, và đồng ý Terms.
- Nút "Gửi rescue (demo)" gọi `submitRescue('send', payload)`, ghi `survivalKitCart` + `survivalKitGift`, rồi hiện màn hình thành công: mã đơn demo, thiệp lần cuối, nút "Sao chép lời nhắn", "Xem giỏ", "Gửi thêm một rescue".
- Ghi chú an toàn trên trang: Survival Kit có quyền từ chối giao nội dung quấy rối; người nhận báo cáo qua email trong `site.Params.email`. Cơ chế kiểm duyệt thật cần backend nên thuộc giai đoạn sau.

**Prefill.** Trang nhận `?type=bestie|love|crush|team&recipient=<tên>&message=<lời nhắn>&category=&level=` (form trang chủ chuyển sang). `recipient` cắt ở 60 ký tự, `message` cắt ở 200 ký tự, và cả hai chỉ được đặt vào `value` của ô nhập.

**Quyền riêng tư.** Trong v1 dữ liệu người nhận chỉ nằm trong `sessionStorage` của trình duyệt người gửi và không gửi đi đâu; khi sang giai đoạn gửi thật phải thêm thông báo riêng tư và sự đồng ý rõ ràng của người gửi.

**Cờ tính năng.** Giống Schedule, theo `enable_send_rescue`.

## Dữ liệu, state và validation dùng chung

Mọi quy tắc ngày và dạng dữ liệu nằm ở một chỗ (`rescue-common.js` cùng hai file JSON) để hai trang không lệch nhau và test được bằng Node. Giá trị dưới đây là mặc định đề xuất, chỉnh trong file dữ liệu chứ không sửa code.

**`data/survival_kit/schedule-rules.json`**

```json
{
  "minLeadDays": 1,
  "maxLeadDays": 2,
  "prepDays": 1,
  "changeWindowHours": 24,
  "blackoutDates": ["2027-01-01"],
  "slots": [
    { "id": "morning", "label": "Sáng (8:00–11:00)" },
    { "id": "afternoon", "label": "Chiều (13:00–17:00)" },
    { "id": "evening", "label": "Tối (18:00–21:00)" }
  ],
  "zones": { "enabled": true, "allowed": ["TP. Hồ Chí Minh"] }
}
```

**`data/survival_kit/gift-types.json`**

```json
[
  {
    "id": "bestie",
    "name": "Bestie Rescue",
    "tone": "Ấm áp, chia sẻ, gần gũi",
    "defaultCategory": "care",
    "allowAnonymous": false,
    "samples": [
      "Deadline này để tụi mình cùng gánh. Cố lên bạn thân!",
      "Nạp miếng năng lượng rồi chiến tiếp nào bạn ơi!"
    ],
    "cards": [
      { "id": "bestie-warm", "name": "Ấm áp", "accent": "--color-primary" },
      { "id": "bestie-fun", "name": "Vui vẻ", "accent": "--color-accent" }
    ]
  },
  {
    "id": "love",
    "name": "Love Rescue",
    "tone": "Ngọt ngào, quan tâm, yêu thương",
    "defaultCategory": "care",
    "allowAnonymous": false,
    "samples": [
      "Có anh/em luôn ở đây cổ vũ. Đừng thức khuya quá nhé!",
      "Gửi ngàn cái ôm tiếp sức cho người thương vượt ải deadline."
    ],
    "cards": [
      { "id": "love-heart", "name": "Trái tim", "accent": "--color-primary" },
      { "id": "love-sweet", "name": "Ngọt ngào", "accent": "--color-accent" }
    ]
  },
  {
    "id": "crush",
    "name": "Secret Crush Rescue",
    "tone": "Nhẹ nhàng, dễ thương, bí mật",
    "defaultCategory": "care",
    "allowAnonymous": true,
    "samples": [
      "Cố lên nhé, có người đang âm thầm cổ vũ cậu đó.",
      "Uống chút trà cho đỡ căng thẳng nhé crush ơi!"
    ],
    "cards": [
      { "id": "crush-night", "name": "Đêm sao", "accent": "--color-info" },
      { "id": "crush-blush", "name": "Bẽn lẽn", "accent": "--color-accent" }
    ]
  },
  {
    "id": "team",
    "name": "Team Rescue",
    "tone": "Khí thế, đồng lòng, bùng nổ",
    "defaultCategory": "club",
    "allowAnonymous": false,
    "samples": [
      "Cả nhóm cùng gánh, không ai bị bỏ lại phía sau!",
      "Tập trung cao độ chốt hạ dự án nào cả team!"
    ],
    "cards": [
      { "id": "team-power", "name": "Chiến binh", "accent": "--color-secondary" },
      { "id": "team-fire", "name": "Bùng cháy", "accent": "--color-warning" }
    ]
  }
]
```

## Lộ trình vibe coding theo 6 mốc

- **M1:** Route, menu, trang khung.
- **M2:** Dữ liệu và logic thuần, chưa có giao diện (`schedule-rules.json`, `gift-types.json`, `rescue-common.js`, `rescue.test.js`).
- **M3:** Trang Schedule a Rescue.
- **M4:** Trang Send a Rescue.
- **M5:** Nối vào trang chủ và giỏ hàng demo.
- **M6:** Hoàn thiện và tài liệu.
