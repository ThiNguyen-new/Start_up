# Bảng ghi nhận phiên bản công cụ & môi trường (Toolchain Versions)
**Mốc:** M0 – Chuẩn hóa Workspace & M1 – Khung cấu hình nền tảng  
**Người thực hiện:** Người 1 (Kỹ thuật nền tảng, cấu hình và tích hợp)  
**Ngày cập nhật:** 28/10/2026  

---

## 1. Bảng phiên bản công cụ bắt buộc

| Công cụ | Phiên bản yêu cầu | Phiên bản đã kiểm tra | Trạng thái | Ghi chú |
|---|---|---|---|---|
| **Hugo** | Extended `0.163.3` | `v0.163.3+extended linux/amd64` |  Đạt | Yêu cầu bản Extended để biên dịch Sass/SCSS và xử lý ảnh |
| **Node.js** | `>= 20.x` (LTS) | `v22.23.4` |  Đạt | Runtime chạy các script tiện ích và server development |
| **pnpm** | `12.15.0` | `12.15.0` |  Đạt | Khớp trường `packageManager` trong `package.json` |
| **Go** | `>= 1.23.x` | `go1.23.4 linux/amd64` |  Đạt | Bắt buộc để tải và biên dịch Hugo Modules (`hugo-modules/images`, `open-remark`) |
| **Git** | `>= 2.30.x` | `2.39.5` |  Đạt | Quản lý phiên bản mã nguồn phân tán cho 5 thành viên |

---

## 2. Hướng dẫn thiết lập môi trường cho thành viên (Người 2, 3, 4, 5)

### Cách 1: Sử dụng `mise` (Khuyến nghị cao)
Dự án đã cấu hình sẵn file `mise.toml` ở thư mục gốc:
```bash
# Cài đặt toàn bộ toolchain tự động theo đúng phiên bản chốt
mise install

# Kiểm tra các phiên bản
mise exec -- node -v
mise exec -- pnpm -v
mise exec -- hugo version
mise exec -- go version
```

### Cách 2: Thiết lập thủ công
1. **Node.js & pnpm:**
   ```bash
   corepack enable
   corepack prepare pnpm@12.15.0 --activate
   ```
2. **Hugo Extended 0.163.3:**
   - Linux: Tải `hugo_extended_0.163.3_linux-amd64.tar.gz` từ GitHub Releases của Hugo.
   - macOS: `brew install hugo` hoặc tải gói binary tương ứng.
   - Windows: Tải gói `hugo_extended_0.163.3_windows-amd64.zip` và gán PATH.
3. **Go (>= 1.23):**
   - Tải từ https://go.dev/dl/ và cài đặt vào máy.

---

## 3. Các lệnh script chuẩn hóa trong `package.json`
Theo quy định mục 2.7 của tài liệu phân công: **Không chạy `hugo server` trực tiếp**, chỉ sử dụng các script dự án:

```bash
# 1. Cài đặt dependencies (chạy 1 lần ban đầu)
pnpm install

# 2. Chạy môi trường phát triển (tự động mở port 3000)
pnpm dev

# 3. Biên dịch bản production (output tại public/)
pnpm build

# 4. Chạy preview bản build production
pnpm preview

# 5. Kiểm tra build test
pnpm test
```
