# Inventory nội dung Survival Kit

Rà soát: 2026-11-01. Mức giá và thành phần trong trang sản phẩm là giả định concept theo PDF ý tưởng, không phải thông tin bán hàng đã xác nhận.

## Giữ URL, thay nội dung mẫu

| Khu vực | URL giữ nguyên | Cập nhật |
| --- | --- | --- |
| Danh mục sản phẩm | `/products/` | Giới thiệu concept, Panic Level và tình trạng giá/sản phẩm. |
| Blog | `/blog/` | Mô tả tiếng Việt, tập trung vào hướng dẫn cho sinh viên. |
| Bài blog 1 | `/blog/post-1/` | Giữ slug; viết lại thành 5 gợi ý chuẩn bị mùa thi; thêm ngày ISO, mô tả SEO, tác giả, category, tags và ảnh phù hợp. |
| Bài blog 2 | `/blog/post-2/` | Giữ slug; viết lại thành 5 bước làm mới kế hoạch đồ án; thêm metadata SEO và ảnh phù hợp. |
| FAQ | `/faq/` | Giải thích Panic Level, lịch giao trước deadline 1–2 ngày là ý tưởng, dịch vụ quà tặng và giá/contents chưa chốt. |
| Liên hệ | `/contact/` | Giữ URL; cung cấp email hỗ trợ, nêu rõ chưa nhận đơn. |
| Điều khoản | `/terms-conditions/` | Giữ URL; bỏ nội dung mẫu Themefisher, PayPal/Stripe và chính sách giả định. Ghi rõ trang chưa mở bán. |

## Sản phẩm được thêm

| URL | Kit | Panic Level | Giá concept |
| --- | --- | --- | --- |
| `/products/exam-survival-kit/` | Exam Survival Kit | 3 (Nervous Mode) | 89.000₫ |
| `/products/project-survival-kit/` | Project Survival Kit | 4 (Panic Mode) | 119.000₫ |
| `/products/mini-rescue-kit/` | Mini Rescue Kit | 2 (Mild Mode) | 49.000₫ |
| `/products/break-care-kit/` | Break & Care Kit | 1 (Chill Mode) | 99.000₫ |
| `/products/club-survival-kit/` | Club Survival Kit | 4 (Panic Mode) | 99.000₫ |

Mini Rescue nằm trong khung concept 39.000–59.000₫; các kit còn lại dùng mức giả định trong khung Standard Rescue 79.000–129.000₫. Không mức giá nào được xem là giá bán đã xác nhận.

## Ngừng xuất bản

Chín file Taba skincare (`taba-cream*`, `taba-facewash*`, `taba-shampoo*`) là nội dung mẫu không liên quan, được giữ trong lịch sử làm việc nhưng đặt `draft: true`. Slug sản phẩm mới dùng kebab-case theo tên kit. Inventory hiện không thấy liên kết nội bộ đến các slug Taba cũ.

## Quy ước nội dung và SEO

- Bài blog đã xuất bản có ngày ISO 8601, `draft: false`, mô tả ngắn, tác giả khớp trang tác giả, category và tags.
- Ảnh minh họa sản phẩm và blog nằm trong `assets/images/products/` và `assets/images/blog/`, tham chiếu bằng đường dẫn `/images/...`.
- Thành phần có snack/đồ uống chỉ là gợi ý; thông tin dị ứng và nhãn hàng phải dựa trên sản phẩm thật nếu dự án mở bán.
- Schedule Your Rescue mô tả đề xuất giao trước deadline 1–2 ngày; hiện chưa nhận lịch hoặc xác nhận giao hàng.
- Send a Rescue và thiệp cá nhân hóa là ý tưởng; hiện chưa nhận thông tin người nhận hay đơn quà.
