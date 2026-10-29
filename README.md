# 236316_NguyenChiNam
# 236316_NguyenChiNam

## 1. Giới thiệu
Dự án quản lý món ăn được xây dựng bằng React, Node.js, Express và MongoDB Atlas, phục vụ bài kiểm tra môn Điện toán đám mây.

## 2. Công nghệ sử dụng
- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Quản lý mã nguồn:** Git, GitHub
- **Container:** Docker, Docker Hub
- **Triển khai:** Render

## 3. Cấu trúc dự án
```text
236316_NguyenChiNam/
├── backend/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend/
│   └── .gitignore
├── .gitignore
└── README.md
```

## 4. Cài đặt và chạy Backend

Yêu cầu: Node.js và npm.

```bash
cd backend
npm install
npm run dev
```

Mặc định, backend chạy tại `http://localhost:5000`.

## 5. API kiểm tra trạng thái

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| GET | `/health` | Kiểm tra trạng thái máy chủ |

Kết quả thành công: HTTP `200 OK`.

```json
{
  "success": true,
  "message": "Auto Food API is running"
}
```

## 6. Bảo mật
- Không đưa mật khẩu, chuỗi kết nối hoặc thông tin bí mật lên GitHub.
- Sử dụng biến môi trường để quản lý cấu hình.
- Không commit các tệp `.env`.
- Tệp `.env.example` chỉ chứa tên biến và giá trị mẫu không nhạy cảm.

## 7. Liên kết dự án
- **GitHub Repository:** https://github.com/s236316-star/236316_NguyenChiNam
- **Frontend:** Sẽ cập nhật sau khi triển khai.
- **Backend API:** Sẽ cập nhật sau khi triển khai.
- **Docker Hub:** Sẽ cập nhật sau khi tạo và đẩy image.
