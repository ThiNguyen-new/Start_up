# Test Plan — Survival Kit

**Vai trò:** Người 5 — QA, Accessibility và Phát hành  
**Ngày:** 2026-11-09  
**Mục tiêu:** Xác minh các luồng chính trước phát hành mà không chỉnh sửa source code.

## 1. Phạm vi route

| Nhóm | Route cần kiểm tra |
|---|---|
| Trang chính | `/`, `/404` hoặc một URL không tồn tại |
| Sản phẩm | `/products/`, `/products/<slug>/` |
| Mua hàng | `/build-your-own-kit/`, `/cart-demo/` |
| Rescue | `/schedule-rescue/`, `/send-rescue/` |
| Thông tin | `/contact/`, `/faq/`, `/terms-conditions/`, `/blog/` |
| SEO kỹ thuật | `/sitemap.xml`, `/robots.txt` |

## 2. Kịch bản chức năng

### Navigation

- [ ] Logo điều hướng về trang chủ.
- [ ] Menu desktop và mobile mở/đóng được bằng chuột và bàn phím.
- [ ] Mọi liên kết menu, footer và CTA đi tới route hợp lệ.
- [ ] URL không tồn tại trả mã 404 và hiển thị trang lỗi thân thiện.

### Sản phẩm và giỏ hàng

- [ ] Danh sách sản phẩm hiển thị tên, giá, ảnh và CTA.
- [ ] Trang chi tiết sản phẩm mở được từ card.
- [ ] Thêm sản phẩm vào giỏ hàng cập nhật số lượng và tổng tiền.
- [ ] Số lượng bị giới hạn theo rule nghiệp vụ.
- [ ] Giỏ hàng giữ đúng sản phẩm sau khi chuyển route.

### Build Your Own Kit

- [ ] Chọn category và sản phẩm.
- [ ] Tăng/giảm số lượng trong giới hạn.
- [ ] Tổng tiền cập nhật đúng.
- [ ] CTA tạo payload giỏ hàng hợp lệ.
- [ ] Trạng thái thiếu lựa chọn hoặc dữ liệu không hợp lệ được thông báo rõ.

### Schedule Rescue

- [ ] Nhập deadline và ngày nhận.
- [ ] Ngày nhận phải trước deadline theo rule lead time.
- [ ] Ngày quá khứ, ngày blackout và ngày không hợp lệ bị từ chối.
- [ ] Lỗi hiển thị cạnh trường tương ứng.
- [ ] Luồng thành công tạo được thông tin xác nhận/lịch.

### Send a Rescue

- [ ] Nhập người nhận, kiểu rescue và lời nhắn.
- [ ] Kiểm tra bắt buộc, độ dài và bộ đếm ký tự.
- [ ] Chọn ngày tặng hợp lệ.
- [ ] Payload không chứa dữ liệu nhạy cảm ngoài dữ liệu người dùng nhập.

## 3. Responsive

Chạy lại toàn bộ nhóm route và luồng chức năng ở các viewport:

- [ ] Mobile: 390 × 844.
- [ ] Tablet: 768 × 1024.
- [ ] Desktop: 1440 × 900.

Kiểm tra không có overflow ngang, chữ không bị cắt, CTA không chồng lấn, menu mobile hoạt động và form có thể nhập bằng bàn phím.

## 4. Accessibility tối thiểu

- [ ] Mỗi trang nội dung có một `h1` phù hợp và heading tăng theo thứ tự hợp lý.
- [ ] Có landmark chính: `header`/navigation, `main`, `footer`.
- [ ] Tab order hợp lý; focus visible trên link, button, input, select và slider.
- [ ] Mọi input có label hoặc accessible name.
- [ ] Ảnh nội dung có `alt`; ảnh trang trí dùng alt rỗng hoặc cơ chế tương đương.
- [ ] Màu chữ/nền đạt tương phản WCAG AA.
- [ ] Không có thao tác chỉ dùng chuột.

## 5. SEO và release gate

- [ ] Mỗi route có title duy nhất.
- [ ] Mỗi route có meta description phù hợp.
- [ ] Canonical URL có mặt và đúng host.
- [ ] Open Graph title, description và image có mặt.
- [ ] Sitemap tạo được và không chứa URL hỏng.
- [ ] `robots.txt` tồn tại và trỏ sitemap đúng.
- [ ] Production build không có lỗi template/link/image.

## 6. Lệnh kiểm thử chuẩn

```text
pnpm install
pnpm test
pnpm build
pnpm preview
```

Preview xác nhận trong đợt QA này: `http://localhost:3000/`.
