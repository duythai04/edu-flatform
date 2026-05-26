# 🎓 Edu Platform

> Hệ thống quản lý lớp học trực tuyến (LMS) xây dựng với **ASP.NET Core Web API** và **ReactJS**, theo kiến trúc **Clean Architecture**.

<p align="center">
  <img src="https://img.shields.io/badge/.NET-ASP.NET_Core-blueviolet?style=for-the-badge&logo=dotnet" />
  <img src="https://img.shields.io/badge/Frontend-ReactJS-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Database-SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver" />
  <img src="https://img.shields.io/badge/Architecture-Clean_Architecture-2ea44f?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

---

## 📋 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc dự án](#-kiến-trúc-dự-án)
- [Cài đặt](#-cài-đặt)
- [API Endpoints](#-api-endpoints)
- [Bảo mật](#-bảo-mật)
- [Triển khai](#-triển-khai)
- [Tác giả](#-tác-giả)

---

## 🧩 Giới Thiệu

**Edu Platform** là hệ thống quản lý học tập trực tuyến hỗ trợ đầy đủ các nghiệp vụ giáo dục:

- 📚 Quản lý lớp học & bài tập
- 📢 Đăng thông báo
- 📁 Upload & quản lý tài liệu
- 📊 Theo dõi tiến độ học tập
- 🔐 Xác thực JWT & phân quyền người dùng

---

## ✨ Tính Năng

### 👨‍🏫 Giảng Viên

- Tạo và quản lý lớp học
- Tạo bài tập và chấm điểm
- Đăng thông báo cho học sinh
- Upload tài liệu học tập

### 👨‍🎓 Học Sinh

- Tham gia lớp học bằng mã lớp
- Nộp bài tập
- Xem tài liệu và thông báo

### 🔐 Xác Thực & Phân Quyền

- Đăng ký / Đăng nhập
- JWT Access Token + Refresh Token
- Role-based Authorization (Giảng viên / Học sinh)

---

## 🛠️ Công Nghệ Sử Dụng

### Backend

| Công nghệ             | Mô tả           |
| --------------------- | --------------- |
| ASP.NET Core Web API  | Framework chính |
| Entity Framework Core | ORM             |
| SQL Server            | Cơ sở dữ liệu   |
| JWT Authentication    | Xác thực        |
| AutoMapper            | Mapping DTO     |
| FluentValidation      | Validation      |
| Swagger / OpenAPI     | Tài liệu API    |

### Frontend

| Công nghệ        | Mô tả            |
| ---------------- | ---------------- |
| ReactJS          | Framework UI     |
| React Router DOM | Routing          |
| Axios            | HTTP Client      |
| SCSS             | Styling          |
| Context API      | State Management |
| React Hook Form  | Form handling    |
| Lucide React     | Icon library     |
| Toastify         | Thông báo toast  |

---

## 🏗️ Kiến Trúc Dự Án

```
edu-platform/
│
├── backend/
│   ├── src/
│   │   ├── EduPlatform.API            # Controllers, Middleware, Swagger
│   │   ├── EduPlatform.Application    # DTOs, Services, Validators, CQRS
│   │   ├── EduPlatform.Domain         # Entities, Interfaces, Business Rules
│   │   ├── EduPlatform.Infrastructure # DbContext, Repositories, JWT, Files
│   │   └── EduPlatform.Shared         # Shared utilities
│   └── tests/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── components/
│
└── README.md
```

### Clean Architecture

```
┌─────────────────────────────────────────┐
│              API Layer                  │
│   Controllers · Middleware · Swagger    │
├─────────────────────────────────────────┤
│           Application Layer            │
│      DTOs · Services · CQRS            │
├─────────────────────────────────────────┤
│          Infrastructure Layer          │
│   DbContext · Repository · JWT · Files │
├─────────────────────────────────────────┤
│             Domain Layer               │
│    Entities · Interfaces · Rules       │
└─────────────────────────────────────────┘
```

---

## 🗄️ Database Tables

| Bảng            | Mô tả                |
| --------------- | -------------------- |
| `Users`         | Tài khoản người dùng |
| `Roles`         | Phân quyền           |
| `Classrooms`    | Lớp học              |
| `Assignments`   | Bài tập              |
| `Submissions`   | Bài nộp              |
| `Announcements` | Thông báo            |
| `Comments`      | BÌnh luận            |
| `Materials`     | Tài liệu             |

---

## 🚀 Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/duythai04/edu-flatform.git
cd edu-flatform
```

### 2. Backend Setup

```bash
cd backend

# Khôi phục packages
dotnet restore

# Cập nhật database
dotnet ef database update

# Chạy API
dotnet run
```

> Swagger UI: `https://localhost:5001/swagger`

#### Cấu hình `appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=EduPlatform;Trusted_Connection=True;"
  },
  "JwtSettings": {
    "Secret": "YOUR_SECRET_KEY",
    "Issuer": "EduPlatform",
    "Audience": "EduPlatformUsers",
    "ExpiryMinutes": 60
  }
}
```

### 3. Frontend Setup

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

> Frontend chạy tại: `http://localhost:3000`

### 4. Docker (tuỳ chọn)

```bash
docker-compose up --build
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint                  | Mô tả             |
| ------ | ------------------------- | ----------------- |
| `POST` | `/api/auth/register`      | Đăng ký tài khoản |
| `POST` | `/api/auth/login`         | Đăng nhập         |
| `POST` | `/api/auth/refresh-token` | Làm mới token     |

### Classrooms

| Method   | Endpoint               | Mô tả             |
| -------- | ---------------------- | ----------------- |
| `GET`    | `/api/classrooms`      | Danh sách lớp học |
| `POST`   | `/api/classrooms`      | Tạo lớp học       |
| `GET`    | `/api/classrooms/{id}` | Chi tiết lớp học  |
| `PUT`    | `/api/classrooms/{id}` | Cập nhật lớp học  |
| `DELETE` | `/api/classrooms/{id}` | Xoá lớp học       |

### Assignments & Submissions

| Method | Endpoint           | Mô tả             |
| ------ | ------------------ | ----------------- |
| `GET`  | `/api/assignments` | Danh sách bài tập |
| `POST` | `/api/assignments` | Tạo bài tập       |
| `POST` | `/api/submissions` | Nộp bài           |

### Authentication Flow

```
Client                        Server
  │                              │
  │── POST /api/auth/login ──────▶│
  │                              │── Validate credentials
  │                              │── Generate JWT Token
  │◀── { accessToken, ... } ─────│
  │                              │
  │── Request + Authorization ──▶│
  │   Header: Bearer <token>     │── Verify token
  │◀── Protected resource ───────│
```

---

## 🔒 Bảo Mật

- ✅ JWT Authentication + Refresh Token
- ✅ Password Hashing (BCrypt)
- ✅ Role-based Access Control
- ✅ Middleware Exception Handling
- ✅ CORS Configuration

---

## ☁️ Triển Khai

### Backend

| Nền tảng          | Ghi chú                    |
| ----------------- | -------------------------- |
| Azure App Service | Khuyến nghị cho production |
| Railway / Render  | Miễn phí cho dự án nhỏ     |
| VPS Ubuntu        | Tự quản lý                 |
| Docker            | Containerized deployment   |

### Frontend

| Nền tảng         | Ghi chú                             |
| ---------------- | ----------------------------------- |
| Vercel           | Khuyến nghị, tích hợp CI/CD tự động |
| Netlify          | Dễ cấu hình                         |
| Firebase Hosting | Tích hợp với Google Cloud           |

---

## 🧪 Testing

```bash
dotnet test
```

---

## 🔮 Tính Năng Tương Lai

- [ ] Video Call tích hợp
- [ ] Realtime Chat (SignalR)
- [ ] Hệ thống Quiz / Trắc nghiệm
- [ ] Điểm danh tự động
- [ ] AI Assistant hỗ trợ học tập
- [ ] Mobile App (React Native)

---

## 🤝 Contributing

```bash
# 1. Fork dự án
# 2. Tạo branch mới
git checkout -b feature/ten-tinh-nang

# 3. Commit thay đổi
git commit -m "feat: thêm tính năng xyz"

# 4. Push và tạo Pull Request
git push origin feature/ten-tinh-nang
```

---

## 👤 Tác Giả

**Thai Nguyen** — Full Stack Developer

- 🔗 GitHub: [github.com/duythai04/edu-flatform](https://github.com/duythai04/edu-flatform)

---

## 📄 License

Dự án được phân phối theo giấy phép [MIT](LICENSE).

---

<p align="center">Nếu bạn thấy dự án hữu ích, hãy cho repository một ⭐ nhé! ❤️</p>
