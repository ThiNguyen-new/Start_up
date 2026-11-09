# QA_PLAN — Survival Kit

Bước 1 trong `huong-dan-ai-qa-website.md`: danh sách mọi tính năng người dùng tương tác được, cách test, kết quả mong đợi và mức ưu tiên. **Chưa có code test.** Nhóm duyệt và bổ sung xong thì mới sang Bước 2 (Playwright).

**Mức ưu tiên**
- **P0**: hỏng là mất chức năng chính (mua, đặt lịch, gửi quà, xem sản phẩm).
- **P1**: hỏng thấy rõ nhưng vẫn dùng được.
- **P2**: chi tiết, thẩm mỹ.

**Áp dụng cho mọi mục**
- Viewport: 375px, 768px, 1440px.
- Không có lỗi console, không có request 404.
- Chạy được cả ở gốc (`localhost`) lẫn thư mục con `/Start_up/` như GitHub Pages. Lỗi ảnh vỡ trên github.io từng chỉ xuất hiện ở thư mục con.

---

## 1. Toàn site (header, footer, điều hướng)

| ID | Tính năng | Cách test | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|
| G1 | Menu chính | Bấm từng mục: Survival Kits, Build Your Own Kit, Schedule Rescue, Send A Rescue, Blog, FAQ, Contact | Mỗi link mở đúng trang, mã 200; không còn mục "Tải Setup" | P0 |
| G2 | Menu mobile (☰) | Ở 375/768px, bấm ☰ rồi bấm lại | Menu mở bên dưới, không đè logo/giỏ; đóng lại được | P0 |
| G3 | Nút giỏ hàng ở header | Xem ở 3 viewport; thêm 1 sản phẩm | Nút gọn, cùng hàng với logo và ☰ (không kéo dài như bug cũ); badge hiện số món, ẩn khi giỏ trống | P0 |
| G4 | Footer: link, liên hệ, mạng xã hội | Bấm từng link footer; đọc địa chỉ | Link đúng; địa chỉ "227 Nguyễn Văn Cừ, Phường Chợ Quán, TP. Hồ Chí Minh"; không còn "Tải Setup" | P1 |
| G5 | Form liên hệ ở footer | Gửi form trống, rồi gửi có dữ liệu | Form trống bị chặn (required). `formAction = "#"` nên gửi không đi đâu: **cần nhóm quyết định hành vi mong đợi** | P1 |
| G6 | Font tiêu đề tiếng Việt | Xem tiêu đề in hoa có dấu (bài blog, hero) | Mọi chữ (Ạ, Ộ, Ố…) cùng font Oswald, dấu không đè dòng trên | P1 |
| G7 | Icon | Rà các icon trên mọi trang | Không còn ô vuông trống (icon thiếu trong font theme) | P2 |
| G8 | Trang 404 | Mở `/khong-ton-tai/` | Hiện trang 404 của site, có đường về trang chủ | P2 |
| G9 | Bản `/vi/` | Mở `/vi/` | Trang chủ hiển thị được, không vỡ. Hiện chỉ có trang chủ ở `/vi/`: **cần nhóm quyết định có test sâu không** | P2 |
| G10 | Chế độ tối | Bật `html.dark` (CSS có biến dark) | Chữ đọc được, nút vẫn tương phản. Chưa thấy nút bật dark mode: **cần xác nhận có dùng không** | P2 |

## 2. Trang chủ

| ID | Tính năng | Cách test | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|
| H1 | Hero + nút "Browse Survival Kits" | Bấm nút | Sang `products/` | P1 |
| H2 | Slider Panic Level `#panic-meter-range` | Kéo 1→7 từng nấc; dùng phím ← → | Tiêu đề "LEVEL n: …", badge, câu mô tả, `aria-valuenow` đổi đúng; thanh màu đi theo núm | P0 |
| H3 | Nút mode 1–7 dưới slider | Bấm từng nút | Slider nhảy đúng level; nút đang chọn đổi màu theo level; chữ không tràn viền | P0 |
| H4 | Khung slider đổi màu theo level | Đổi level 1→7 | Nền khung ngả nhẹ xanh → đỏ, chuyển mượt | P2 |
| H5 | Chọn loại kit (Mùa thi / Đồ án / CLB & nhóm / Chăm sóc) | Bấm từng loại ở mỗi level | Card "Kit gợi ý" đổi tên, món, ảnh chip, tổng tiền; ảnh chip không vỡ | P0 |
| H6 | Nút "Xây kit này" | Bấm | Sang `build-your-own-kit/` với đúng level và loại kit | P0 |
| H7 | Featured Survival Kits | Xem section | Đúng 3 kit theo `bestseller_rank` (Mini Rescue #1, Exam #2, Club #3), có nhãn "Bán chạy #n", giá dạng `49.000₫` | P1 |
| H8 | Form "Lên lịch tiếp sức" | Chọn 2 ngày, bấm "Tiếp tục đặt lịch" | Sang `schedule-rescue/?deadline=…&receive=…`, wizard điền sẵn ngày | P0 |
| H9 | Form "Gửi tặng kit" | Nhập người nhận, chọn kiểu, lời nhắn, bấm "Tiếp tục gửi" | Sang `send-rescue/?type=…&recipient=…&message=…`, wizard điền sẵn | P0 |
| H10 | Testimonial slider | Bấm ‹ ›, đợi autoplay | Chuyển slide, ảnh đại diện hiện đủ | P2 |
| H11 | CTA "Get a Survival Kit" | Bấm | Sang `products/`; chữ nút đọc được trên nền gradient | P1 |

## 3. Sản phẩm và giỏ hàng

| ID | Tính năng | Cách test | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|
| P1 | Danh sách `products/` | Mở trang | 7 kit, ảnh hiện, giá dạng `39.000₫` | P0 |
| P2 | Trang chi tiết `products/<kit>/` | Mở 7 trang; bấm chấm/ảnh nhỏ dưới slider | Ảnh chính và ảnh nhỏ hiện (từng vỡ trên GitHub Pages); tab Description/Reviews chuyển được | P0 |
| P3 | "Add to cart" (trang chủ, danh sách, chi tiết) | Bấm ở cả 3 nơi | Hiện thông báo "Đã thêm … vào giỏ" có link xem giỏ; badge tăng; **không tải Snipcart** | P0 |
| P4 | Thêm trùng sản phẩm | Bấm 2 lần cùng kit | 1 dòng, số lượng 2 | P1 |
| P5 | Giỏ: +/−, Xóa, Xóa giỏ | Thao tác từng nút | Tổng tiền cập nhật; − bị khóa ở 1; Xóa giỏ hỏi xác nhận; giỏ trống hiện màn "Giỏ hàng đang trống" | P0 |
| P6 | Ảnh trong giỏ | Thêm kit rồi mở giỏ | Ảnh vuông thấy trọn hộp (cắt giữa, không lệch) | P2 |
| P7 | Giỏ giữ qua trang | Thêm kit, chuyển vài trang, quay lại | Giỏ vẫn còn (sessionStorage `survivalKitCart`) | P1 |
| P8 | Thông tin giao hàng: validate | Bấm "Đặt hàng" khi để trống; nhập SĐT sai (`12345`), email sai | 6 lỗi hiện dưới đúng ô; focus nhảy tới ô lỗi đầu | P0 |
| P9 | "Điền dữ liệu mẫu" | Bấm | Điền đủ dữ liệu giả, xóa lỗi | P1 |
| P10 | Tỉnh/Thành phố | Mở dropdown | Đúng 34 đơn vị (sau sáp nhập 2025) | P2 |
| P11 | Phí giao hàng | Đơn < 150.000₫ và ≥ 150.000₫; chọn Hỏa tốc | Tiêu chuẩn 20.000₫ hoặc Miễn phí; Hỏa tốc 35.000₫ | P1 |
| P12 | Mã giảm giá | `DEADLINE10`, `FREESHIP`, mã sai, ô trống | −10% tối đa 30.000₫; miễn phí ship; báo "Mã không hợp lệ" / "Bạn chưa nhập mã" | P1 |
| P13 | Thanh toán MoMo / ZaloPay mô phỏng | Chọn từng ví, đặt hàng | Màn đúng màu ví, chữ "MÔ PHỎNG", QR giả có chữ DEMO, đếm ngược 05:00; **không hỏi mật khẩu/OTP** | P0 |
| P14 | Hết hạn mã, tạo mã mới | Tua đồng hồ quá 5 phút | Báo hết hạn, khóa nút thành công; "Tạo mã mới" đổi mã đơn và chạy lại đồng hồ | P2 |
| P15 | Hủy thanh toán | Bấm "Hủy, quay lại…" | Về bước thông tin, dữ liệu form còn nguyên | P1 |
| P16 | Hoàn tất + quyền riêng tư | Bấm "Giả lập: thanh toán thành công" | Hiện mã đơn `SKyyMMdd-XXXX`, ví, tổng tiền; form bị xóa; **sessionStorage rỗng**; không có request mạng nào gửi dữ liệu form | P0 |

## 4. Build Your Own Kit

| ID | Tính năng | Cách test | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|
| B1 | Panic Level (nút radio 1–7) | Chọn từng level | Câu mô tả đổi; khung đổi màu theo level | P0 |
| B2 | Nhớ level từ trang chủ | Chọn level 5 ở trang chủ rồi sang Build | Build đang ở level 5 (sessionStorage `survivalKitPanicLevel`; hoặc `?level=5` trên URL) | P0 |
| B3 | Card "Kit gợi ý" + "Áp dụng kit này" | Đổi level và loại kit, bấm Áp dụng | Ảnh chip hiện (từng vỡ ở `/Start_up/`); số lượng các món được điền; tổng bên phải khớp | P0 |
| B4 | Chọn số lượng món | +/−, gõ số, gõ > 20, gõ chữ | Giới hạn 0–20; tổng tiền và "Bộ Kit Của Bạn" cập nhật | P0 |
| B5 | Chọn mẫu ảnh (hộp kraft, thiệp) | Bấm từng mẫu | Ảnh chính đổi; mẫu đã chọn được ghi vào giỏ | P1 |
| B6 | Bộ lọc nhóm | Bấm từng nút nhóm | Chỉ còn nhóm đó; dòng "Đang hiển thị n/15 món"; cuộn lên thanh lọc nếu đang ở sâu | P1 |
| B7 | Tìm kiếm | Gõ "ca phe", "STICKER", từ không tồn tại | Không dấu vẫn khớp; chờ ~300ms mới lọc; không khớp thì hiện "Không tìm thấy món đồ phù hợp…" và nút "Xóa bộ lọc" | P1 |
| B8 | Sắp xếp | Từng lựa chọn | Phổ biến (theo số kit gợi ý chứa món), giá tăng/giảm, tên A→Z; đúng trong từng nhóm | P1 |
| B9 | Lọc không làm mất số lượng | Chọn 2 cà phê, lọc/tìm/xóa lọc | Vẫn 2 cà phê, tổng không đổi | P0 |
| B10 | Lời nhắn (120 ký tự) | Gõ > 120 ký tự; gõ `<b>x</b>` | Dừng ở 120, đếm ký tự đúng; preview hiện nguyên văn, không chạy HTML | P1 |
| B11 | "Thêm kit vào giỏ hàng (demo)" + thanh dưới ở mobile | Chọn món, bấm | Sang giỏ; kit đã thêm trước đó bằng "Add to cart" **vẫn còn** | P0 |
| B12 | Giá trên thẻ món | Xem | Dạng `25.000 ₫` (không phải `25,000`) | P2 |

## 5. Schedule Rescue (4 bước)

| ID | Tính năng | Cách test | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|
| S1 | Nhận dữ liệu từ trang chủ | Mở bằng `?deadline=…&receive=…` | Hai ô ngày điền sẵn | P0 |
| S2 | Bước 1: chọn bộ kit | Chọn kit gợi ý / tự chọn | Đi tiếp được; kit hiện ở tóm tắt | P0 |
| S3 | Bước 2: ngày và khung giờ | Ngày nhận sau deadline; ngày quá khứ; nút "Nhận trước 1/2 ngày"; chọn khung giờ | Báo lỗi khi ngày sai; nút nhanh tính đúng ngày; bắt buộc chọn khung giờ | P0 |
| S4 | Bước 3: người nhận | Bỏ trống; SĐT sai | Lỗi rõ ràng; dữ liệu hợp lệ thì đi tiếp | P0 |
| S5 | Sửa bước | Bấm "Sửa" ở bước đã qua | Quay lại đúng bước, dữ liệu còn | P1 |
| S6 | Bước 4: xác nhận | Bấm xác nhận | Màn "Đặt Lịch Tiếp Sức Thành Công!", có mã đơn; giỏ có ô "Lịch Giao Cứu Hộ Đã Đặt" | P0 |
| S7 | Tải file lịch `.ics` | Bấm tải | Tải `<mã đơn>.ics`, mở được trong Calendar, đúng ngày | P1 |

## 6. Send a Rescue (5 bước)

| ID | Tính năng | Cách test | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|
| R1 | Nhận dữ liệu từ trang chủ | Mở bằng `?type=love&recipient=…&message=…` | Kiểu rescue, tên, lời nhắn điền sẵn | P0 |
| R2 | Bước 1–2: kiểu rescue, bộ kit | Chọn từng kiểu (bestie / love / crush / team) | Kit gợi ý đổi theo kiểu | P0 |
| R3 | Bước 3: người nhận và ngày giao | Bỏ trống; ngày quá khứ; nút "Giao trước 1/2 ngày" | Validate giống S3/S4 | P0 |
| R4 | Bước 4: thiệp và lời nhắn | Đổi mẫu thiệp; gõ lời nhắn có HTML | Preview cập nhật ngay; HTML hiện dạng chữ | P1 |
| R5 | Gửi ẩn danh | Chỉ có ở Crush Rescue: bật ẩn danh | Preview ghi "Một người bạn ẩn danh"; kiểu khác không có lựa chọn này | P1 |
| R6 | Cam kết không quấy rối | Xác nhận khi chưa tick | Bị chặn | P0 |
| R7 | Copy lời nhắn, đặt lại wizard | Bấm từng nút | Lời nhắn vào clipboard; reset về bước 1, form trống | P2 |
| R8 | Xác nhận | Bấm gửi | Màn "Gửi Tiếp Sức Thành Công!"; giỏ có ô "Quà Tặng Tiếp Sức Đã Đặt" | P0 |

## 7. Nội dung

| ID | Tính năng | Cách test | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|
| C1 | FAQ: thẻ câu hỏi | Xem trang | 7 thẻ, 2 cột ở desktop, 1 cột ở mobile | P1 |
| C2 | FAQ: accordion | Bấm từng câu | Mở/đóng, mũi tên xoay, chỉ 1 câu mở cùng lúc | P1 |
| C3 | FAQ: form hỏi đáp | Giống G5 | Giống G5 | P1 |
| C4 | Blog: danh sách + 3 bài | Mở từng bài | Ảnh và tiêu đề tiếng Việt hiển thị đúng | P1 |
| C5 | Contact, Terms | Mở trang | Nội dung đọc được; địa chỉ Phường Chợ Quán | P2 |

## 8. Kiểm tra tự động "miễn phí" (Bước 4 của hướng dẫn)

| ID | Kiểm tra | Công cụ | Ghi chú |
|---|---|---|---|
| A1 | Link hỏng | `lychee` hoặc `htmltest` trên `public/` | Chạy cả bản build ở `/Start_up/` |
| A2 | Build không cảnh báo | `hugo --panicOnWarning` | Hiện còn 1 cảnh báo `.Site.Data` deprecated, phải sửa trước khi bật |
| A3 | Lighthouse (hiệu năng, a11y, SEO) | Lighthouse CI | Trang chủ, Build, giỏ hàng |
| A4 | HTML hợp lệ | `html-validate` | |

---

## Cần nhóm quyết định trước Bước 2

1. **Lệnh chạy server.** Hướng dẫn ghi `hugo server` (cổng 1313), nhưng `AGENTS.md` của repo yêu cầu dùng `pnpm dev`. Đề xuất: Playwright tự chạy `pnpm dev`.
2. **Trình duyệt.** Playwright tải Chromium khoảng 150MB; có thể dùng Edge có sẵn trên máy (`channel: 'msedge'`) cho nhanh. CI (GitHub Actions) dùng Chromium.
3. **Form liên hệ (G5, C3)** đang gửi về `#`: mong đợi là gì?
4. **`/vi/` (G9) và dark mode (G10)** có nằm trong phạm vi test không?
5. **Test cũ.** `test/*.test.js` (22 test Node) giữ nguyên; Playwright đặt riêng trong `tests/e2e/` để không lẫn.
