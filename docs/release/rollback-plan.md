# Rollback Plan — Survival Kit

## Điều kiện rollback

Rollback nếu sau release xảy ra một trong các tình huống:

- Production build hoặc deploy fail.
- Route chính trả lỗi 5xx hoặc điều hướng sai.
- Luồng giỏ hàng, Schedule Rescue hoặc Send a Rescue làm mất dữ liệu người dùng.
- Lỗi accessibility nghiêm trọng chặn keyboard hoặc form chính.
- Lỗi SEO/deployment làm sitemap hoặc toàn bộ metadata phát hành mất hiệu lực.

## Quy trình

1. Người phát hiện ghi URL, thời điểm, bước tái hiện và ảnh/chứng cứ vào bug report.
2. Người 1 dừng promotion bản đang lỗi và xác định commit release cuối cùng đã được chấp thuận.
3. Người 1 rollback deployment về artifact/commit ổn định gần nhất; không rollback bằng cách sửa trực tiếp generated output.
4. Người 5 chạy lại `pnpm install`, `pnpm test`, `pnpm build` và smoke test các route chính.
5. Chỉ phát hành lại sau khi `qa-approval.md` được cập nhật trạng thái đạt hoặc nhóm ghi nhận chấp nhận rủi ro.

## Kiểm tra sau rollback

- [ ] Trang chủ và `/products/` trả 200.
- [ ] `/cart-demo/`, `/schedule-rescue/`, `/send-rescue/` mở được.
- [ ] URL không tồn tại trả 404.
- [ ] Sitemap và robots kiểm tra được.
- [ ] Không có lỗi build/template/link/image mới.
- [ ] Preview URL được xác nhận lại với nhóm.
