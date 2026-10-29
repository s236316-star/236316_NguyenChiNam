# 236316_NguyenChiNam

## 1. Giới thiệu

Dự án Auto Food là ứng dụng quản lý món ăn, sử dụng React, Node.js, Express và MongoDB Atlas, phục vụ bài kiểm tra môn Điện toán đám mây.

## 2. Công nghệ sử dụng

- Frontend: React
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Quản lý mã nguồn: Git, GitHub
- Container: Docker
- Lưu trữ image: Docker Hub

## 3. Cấu trúc dự án

```text
236316_NguyenChiNam/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── Food.js
│   ├── routes/
│   │   └── foodRoutes.js
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend/
├── .gitignore
└── README.md
```

## 4. Chạy Backend bằng Node.js

Yêu cầu: Node.js, npm và tài khoản MongoDB Atlas.

### Bước 1: Cấu hình môi trường

Di chuyển vào thư mục backend:

```bash
cd backend
```

Tạo file `.env` dựa trên `.env.example`, sau đó cấu hình các biến cần thiết:

- `PORT`: Cổng chạy Backend, mặc định là `5000`.
- `MONGODB_URI`: Chuỗi kết nối MongoDB Atlas.

Không chia sẻ hoặc commit file `.env` lên GitHub.

### Bước 2: Cài đặt và chạy

```bash
npm install
npm run dev
```

Backend mặc định chạy tại `http://localhost:5000`.

## 5. Các API Backend

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | `/health` | Kiểm tra trạng thái Backend |
| GET | `/api/foods` | Lấy danh sách món ăn |
| GET | `/api/foods/:id` | Xem món ăn theo mã |
| POST | `/api/foods` | Thêm món ăn |
| PUT | `/api/foods/:id` | Cập nhật món ăn |
| DELETE | `/api/foods/:id` | Xóa món ăn |
| GET | `/api/foods?search=pho` | Tìm kiếm món ăn |

Các API trả về dữ liệu JSON và mã trạng thái HTTP phù hợp.

## 6. Đóng gói và chạy Backend bằng Docker

### 6.1. Thông tin Docker Hub

- Repository: `s236316/236316-nguyenchinam-backend`
- Tag: `1.0`
- Image: `s236316/236316-nguyenchinam-backend:1.0`
- Docker Hub: https://hub.docker.com/r/s236316/236316-nguyenchinam-backend

### 6.2. Chuẩn bị biến môi trường

Từ thư mục `backend`, tạo file `.env` dựa trên `.env.example` và cấu hình `MONGODB_URI` cùng các biến môi trường cần thiết.

Không đưa thông tin bí mật vào Docker image hoặc commit file `.env` lên GitHub.

### 6.3. Tải Docker image

```bash
docker pull s236316/236316-nguyenchinam-backend:1.0
```

### 6.4. Chạy container

Đảm bảo Terminal đang ở thư mục `backend` và file `.env` đã được cấu hình.

```bash
docker run -d \
  --name auto-food-container \
  -p 5001:5000 \
  --env-file .env \
  s236316/236316-nguyenchinam-backend:1.0
```

Container sử dụng cổng `5000` bên trong và ánh xạ ra cổng `5001` trên máy host.

### 6.5. Kiểm tra Backend

```bash
docker ps
docker logs auto-food-container
curl http://localhost:5001/health
```

Nếu ứng dụng hoạt động bình thường, API `/health` trả về HTTP `200 OK` và dữ liệu JSON xác nhận trạng thái máy chủ.

### 6.6. Các lệnh quản lý container

```bash
docker stop auto-food-container
docker start auto-food-container
docker logs auto-food-container
```

Nếu container cùng tên đã tồn tại và cần tạo lại, hãy xóa container cũ trước:

```bash
docker rm -f auto-food-container
```

## 7. Bảo mật

- Không đưa mật khẩu hoặc chuỗi kết nối cơ sở dữ liệu lên GitHub.
- Không commit file `.env`.
- Sử dụng biến môi trường để cấu hình ứng dụng.
- Chỉ đặt giá trị mẫu không nhạy cảm trong `.env.example`.
- Sử dụng `.dockerignore` để loại trừ file môi trường và các tệp không cần thiết khỏi Docker build context.
- Truyền thông tin bí mật khi chạy container bằng biến môi trường, không ghi trực tiếp vào Dockerfile.

## 8. Liên kết dự án

- GitHub Repository: https://github.com/s236316-star/236316_NguyenChiNam
- Backend Docker Hub: https://hub.docker.com/r/s236316/236316-nguyenchinam-backend
- Frontend: Cập nhật sau khi hoàn thành.
- Backend API công khai: Chưa triển khai.
