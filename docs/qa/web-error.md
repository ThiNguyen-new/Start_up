# 🐛 Báo Cáo Lỗi Web & Đề Xuất Cải Tiến (Bug Report)

> **URL thử nghiệm:** `https://thinguyen-new.github.io/Start_up`  
> **Trạng thái:** Cần xử lý

---

## 📌 1. Danh Sách Lỗi Theo Đường Dẫn (Path)

### 🏠 1.1 Trang chủ (`/`)
- [ ] **Logo:** Logo chưa được cập nhật/thay thế logo chính thức.
- [ ] **Favicon:** Chưa có icon đại diện cho website trên tab trình duyệt.
- [ ] **Ràng buộc thời gian đặt lịch:** Thiếu validation cho ô chọn ngày. Hiện tại test ngày `05/05/5555` hệ thống vẫn chấp nhận.
  - *Yêu cầu:* Giới hạn cho phép đặt trước tối đa **1–2 tháng**.
- [ ] **Footer:** Ở cuối trang vẫn hiển thị nút/link `"Tải setup zip"` *(Lỗi này xuất hiện ở tất cả các path)*.

---

### 📅 1.2 Trang Lịch tiếp sức (`/schedule-rescue`)
- [ ] **Lỗi hiển thị Mobile:** Section **"Khung giờ giao hàng mong muốn"** bị cắt bớt chữ / vỡ giao diện trên thiết bị di động.

---

### 🛒 1.3 Trang Giỏ hàng (`/cart-demo`)
- [ ] **Giới hạn số lượng sản phẩm:** Ô điều chỉnh số lượng (quantity) hiện cho phép tăng vượt mức (vd: `60`).
  - *Yêu cầu:* Giới hạn số lượng tối đa là **20** sản phẩm (Đồng bộ với logic ở trang `/build-your-own-kit`).

---

### 📞 1.4 Trang Liên hệ (`/contact`)
- [ ] **Hình ảnh:** Hình ảnh bị lỗi link/không hiển thị (Broken image).
- [ ] **Form liên hệ:** Nút **Send message** không hoạt động (không gửi được tin nhắn).

---

### ❓ 1.5 Trang Hỏi đáp (`/faq`)
- [ ] **Form câu hỏi:** Không gửi được câu hỏi từ giao diện người dùng.

---

## 💡 2. Đề Xuất Cải Tiến UX/UI & Chức Năng

| STT | Hạng mục | Mô tả chi tiết & Đề xuất giải pháp |
| :---: | :--- | :--- |
| **1** | **Modal Xác nhận** | Thay thế các popup/alert mặc định của trình duyệt (ví dụ: *"Bạn có chắc muốn xóa toàn bộ giỏ hàng?"*) bằng **Custom Modal UI** đồng bộ với thiết kế của website. |
| **2** | **Thông tin Contact** | Đối với phần *Contact with us* ở footer: nếu không dùng thông tin thật, nên tạo đường dẫn tới một trang Demo (thông báo *"Trang này chỉ mang tính chất minh họa"*), đồng thời cập nhật lại địa chỉ trường học chính xác. |
| **3** | **Responsive Mobile** | Kiểm tra và sửa lỗi **đè/che chữ** (text overlap) trên màn hình điện thoại (Ví dụ: Tiêu đề *"Gửi Tặng Kit Cho Người Thương"*, *"Lên Lịch Tiếp Sức Trước Deadline"* bị các icon/element khác đè lên). |

---

## 🛠️ Hướng dẫn dành cho Dev
1. Nhận task và check-out branch tương ứng (`fix/path-bug-name`).
2. Tiến hành sửa và tích (`[x]`) vào các ô checklist tương ứng trong file này.
3. Tạo Pull Request và gắn thẻ người kiểm thử (Tester) để xác nhận lại.