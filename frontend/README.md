# Auto Food — Quản lý món ăn

Ứng dụng web quản lý danh sách món ăn, được xây dựng bằng React và Vite ở frontend, Node.js/Express ở backend và MongoDB Atlas để lưu trữ dữ liệu.

## 1. Công nghệ sử dụng

### Frontend
- React
- Vite
- JavaScript
- CSS
- Nginx
- Docker

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- REST API
- Docker

## 2. Chức năng chính

- Hiển thị danh sách món ăn.
- Tìm kiếm món ăn.
- Lọc món ăn theo danh mục.
- Thêm món ăn mới.
- Xem chi tiết món ăn.
- Chỉnh sửa thông tin món ăn.
- Xóa món ăn.
- Thống kê dữ liệu món ăn.

## 3. Cấu trúc thư mục

```text
236316_NguyenChiNam/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── ...
│   ├── nginx/
│   │   └── default.conf.template
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env
└── README.md
```

## 4. Cài đặt và chạy Frontend

### Yêu cầu
- Node.js
- npm

### Cài đặt thư viện

```bash
cd frontend
npm install
```

### Chạy môi trường phát triển

```bash
npm run dev
```

Vite sẽ hiển thị địa chỉ truy cập trong terminal, thường là `http://localhost:5173`.

Frontend sử dụng proxy trong `vite.config.js` để chuyển yêu cầu `/api` đến backend đang chạy tại `http://localhost:5001`.

### Build production

```bash
npm run build
```

Các file build được tạo trong thư mục `dist/`.

## 5. Cài đặt và chạy Backend

### Cài đặt thư viện

```bash
cd backend
npm install
```

### Cấu hình biến môi trường

Tạo file `.env` trong thư mục `backend/`:

```env
MONGODB_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
PORT=5000
```

Thay `<YOUR_MONGODB_ATLAS_CONNECTION_STRING>` bằng chuỗi kết nối MongoDB Atlas của bạn. Không chia sẻ hoặc commit thông tin xác thực lên GitHub.

### Chạy backend

```bash
npm start
```

Nếu dự án chưa có script `start`, kiểm tra `backend/package.json` và sử dụng lệnh chạy phù hợp, chẳng hạn:

```bash
node server.js
```

## 6. API Endpoints

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/health` | Kiểm tra trạng thái backend |
| GET | `/api/foods` | Lấy danh sách món ăn |
| GET | `/api/foods/:id` | Lấy chi tiết món ăn |
| POST | `/api/foods` | Thêm món ăn |
| PUT | `/api/foods/:id` | Cập nhật món ăn |
| DELETE | `/api/foods/:id` | Xóa món ăn |

Các endpoint chi tiết cần được đối chiếu với mã nguồn thực tế của backend.

## 7. Docker Hub

### Frontend

- Repository: https://hub.docker.com/r/s236316/236316-nguyenchinam-frontend
- Image: `s236316/236316-nguyenchinam-frontend:1.0`

### Backend

- Repository: https://hub.docker.com/r/s236316/236316-nguyenchinam-backend
- Image: `s236316/236316-nguyenchinam-backend:1.0`

### Build và chạy Frontend bằng Docker

Tại thư mục gốc dự án:

```bash
docker build -t s236316/236316-nguyenchinam-frontend:1.0 ./frontend
```

### Build và chạy Backend bằng Docker

```bash
docker build -t s236316/236316-nguyenchinam-backend:1.0 ./backend
```

Để chạy backend, cần cung cấp biến môi trường `MONGODB_URI` hợp lệ.

## 8. Triển khai trên Render

### Backend API

https://two36316-nguyenchinam-backend-1-0.onrender.com

Kiểm tra trạng thái backend:

https://two36316-nguyenchinam-backend-1-0.onrender.com/health

Kiểm tra danh sách món ăn:

https://two36316-nguyenchinam-backend-1-0.onrender.com/api/foods

### Frontend Website

https://web-236316.onrender.com

Frontend được triển khai bằng Docker image trên Docker Hub và sử dụng Nginx để chuyển tiếp các yêu cầu `/api/` đến backend.

## 9. Bảo mật

- Không commit file `.env` chứa thông tin xác thực.
- Không công khai mật khẩu MongoDB Atlas hoặc các token.
- Cấu hình biến môi trường riêng cho từng môi trường triển khai.
- Kiểm tra và xác thực dữ liệu đầu vào từ client.

## 10. Tác giả

**Họ tên:** Nguyễn Chí Nam  
**Mã sinh viên:** 236316

Dự án được thực hiện phục vụ mục đích học tập.
