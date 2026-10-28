# Danh sách cấu hình Site & Metadata đã chốt (Site Configuration)
**Người phụ trách:** Người 1 (Kỹ thuật nền tảng, cấu hình và tích hợp)  
**Tình trạng:** Đã chốt theo Concept Survival Kit & Tài liệu phân công  

---

## 1. Cấu hình cơ bản (Site Metadata)
- **Tên dự án:** Survival Kit
- **Tiêu đề website (`title`):** `Survival Kit | The Deadline Rescue Station`
- **Mô tả SEO (`description`):** `Survival Kit - Trạm cứu hộ deadline dành cho sinh viên. Mô hình kết hợp thương mại điện tử, đặt lịch giao kit theo deadline (Schedule Your Rescue) và tặng quà cá nhân hóa (Send a Rescue).`
- **Tác giả (`author`):** `Survival Kit Team - HCMUS`
- **Múi giờ (`timeZone`):** `Asia/Ho_Chi_Minh` (GMT+7)
- **Ngôn ngữ mặc định (`locale` / `defaultContentLanguage`):** `vi` / `en`
- **Ký hiệu tiền tệ (`currencySymbol`):** `₫`
- **Base URL:** `/` (hỗ trợ preview linh hoạt trên mọi hosting và proxy)

---

## 2. Thông tin liên hệ & Đơn vị (Contact Info)
- **Địa chỉ:** `227 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh (HCMUS)`
- **Tọa độ Google Maps:** Latitude `10.762913`, Longitude `106.682171`
- **Email hỗ trợ:** `contact@survivalkit.vn`
- **Hotline:** `0901 234 567`
- **Bản quyền (`copyright`):** `| Copyright &copy; 2026 [Survival Kit - HCMUS](/) All Rights Reserved |`

---

## 3. Danh sách Feature Toggles (`params.features`)
Các cờ tính năng được quản lý tập trung tại `config/_default/params.toml`:

| Cờ tính năng | Giá trị | Ý nghĩa nghiệp vụ |
|---|---|---|
| `enable_schedule_rescue` | `true` | Bật tính năng đặt lịch giao hàng theo deadline (Schedule Your Rescue) |
| `enable_send_rescue` | `true` | Bật tính năng tặng quà kèm lời nhắn cá nhân hóa (Send a Rescue) |
| `enable_panic_level` | `true` | Bật bộ lọc và gắn thẻ Panic Level từ 1 đến 7 |
| `enable_review` | `true` | Bật hệ thống đánh giá sản phẩm |
| `enable_darkmode` | `false` | Tạm tắt dark mode cho đến khi Người 2 hoàn thành bảng token màu và được duyệt |
| `enable_multilang` | `false` | Tạm tắt chuyển đổi đa ngôn ngữ cho đến khi Người 4 chuẩn bị đầy đủ bản dịch |

---

## 4. Cấu hình Menu (`config/_default/menus.en.toml`)
Chỉ Người 1 được chỉnh sửa cấu hình menu. Các thành viên khác tham chiếu qua URL:

### Menu chính (Header Navigation)
1. **Home:** `/` (Weight: 1)
2. **Survival Kits:** `products/` (Weight: 2)
3. **Schedule Rescue:** `products/` (Weight: 3)
4. **Send a Rescue:** `contact/` (Weight: 4)
5. **Blog:** `blog/` (Weight: 5)
6. **FAQ:** `faq/` (Weight: 6)
7. **Contact:** `contact/` (Weight: 7)

### Menu chân trang (Footer Menu)
1. **Survival Kits:** `products/` (Weight: 1)
2. **Schedule Rescue:** `products/` (Weight: 2)
3. **Send a Rescue:** `contact/` (Weight: 3)
4. **Blog:** `blog/` (Weight: 4)
5. **FAQ:** `faq/` (Weight: 5)
6. **Terms & Conditions:** `terms-conditions/` (Weight: 6)
7. **Contact:** `contact/` (Weight: 7)

---

## 5. Mạng xã hội (`data/social.json` & `params.social`)
- **Facebook:** https://facebook.com/survivalkit.vn (Icon: `ti-facebook`)
- **Instagram:** https://instagram.com/survivalkit.vn (Icon: `ti-instagram`)
- **TikTok:** https://tiktok.com/@survivalkit.vn (Icon: `ti-video-camera`)
- **YouTube:** https://youtube.com/@survivalkit (Icon: `ti-youtube`)
