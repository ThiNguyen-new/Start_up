# Hợp đồng template (Người 3) — cần Người 1 / Người 4

Người 3 **không** sửa `config/**`, `i18n/**`, `content/**`. Các điểm dưới đây cần issue/PR từ đúng chủ sở hữu.

## Người 1 — menu hash

Hiện `Schedule Rescue` trỏ `products/`, `Send a Rescue` trỏ `contact/`.

Đề xuất (không tự sửa):

- `Schedule Rescue` → `/#schedule`
- `Send a Rescue` → `/#gifting` (hoặc `contact/#gifting`)

## Người 4 — frontmatter sản phẩm

Ngoài field theme (`price`, `priceBefore`, `productID`, `shortDescription`, `images[].image`, `description`, `type: products`):

- `panic_level`: số 1–7
- `kit_type`: `exam` | `project` | `club` | `care`

Template ẩn badge/filter data nếu thiếu field. Giá Mini/Standard/Premium: 39–59k / 79–129k / 149k+ ₫ (giá mẫu < 1000 được map tương tự).

## Người 4 — i18n keys (`i18n/en.yaml`)

`sk_slogan`, `sk_hero_lede`, `sk_shop_kits`, `sk_featured_kits`, `sk_no_kits`, `sk_filter_empty`, `sk_pick_panic`, `sk_pick_panic_help`, `sk_panic_group`, `sk_level`, `sk_panic_badge`, `sk_schedule_title`, `sk_schedule_help`, `sk_deadline`, `sk_receive`, `sk_schedule_submit`, `sk_gifting_title`, `sk_gifting_help`, `sk_recipient`, `sk_gift_type`, `sk_gift_bestie`, `sk_gift_love`, `sk_gift_crush`, `sk_gift_team`, `sk_gift_note`, `sk_gifting_submit`, `sk_cta_title`, `sk_cta_body`, `sk_cta_button`, `sk_social_proof`, `sk_filter_type`, `sk_filter_all`, `sk_filter_price`, `sk_filter_any_price`, `add_to_cart`, `main_nav`, `toggle_menu`, `cart`, `contact_us`, `your_name`, `your_email`, `your_message`, `send_now`.

Template đã có fallback tiếng Anh nếu key chưa có.
