# 🚀 Edu Platform

> Một nền tảng quản lý lớp học trực tuyến (Learning Management System) được xây dựng với ASP.NET Core Web API và ReactJS.

---

<p align="center">
  <img src="https://img.shields.io/badge/.NET-ASP.NET_Core-blueviolet?style=for-the-badge&logo=dotnet" />
  <img src="https://img.shields.io/badge/Frontend-ReactJS-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Database-SQL_Server-red?style=for-the-badge&logo=microsoftsqlserver" />
  <img src="https://img.shields.io/badge/Architecture-Clean_Architecture-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge" />
</p>

---

# 📖 Giới Thiệu

**Edu Platform** là hệ thống quản lý học tập trực tuyến (LMS - Learning Management System) hỗ trợ:

* Quản lý lớp học
* Quản lý bài tập
* Đăng thông báo
* Upload tài liệu
* Theo dõi học tập
* Xác thực JWT
* Phân quyền người dùng

---

# 🏗️ Kiến Trúc Dự Án

```bash
edu-platform/
│
├── backend/
│   ├── src/
│   │   ├── EduPlatform.API
│   │   ├── EduPlatform.Application
│   │   ├── EduPlatform.Domain
│   │   ├── EduPlatform.Infrastructure
│   │   └── EduPlatform.Shared
│   │
│   └── tests/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── components/
│
└── README.md
```

---

# ⚙️ Công Nghệ Sử Dụng

## 🔹 Backend

* ASP.NET Core Web API
* Entity Framework Core
* SQL Server
* JWT Authentication
* AutoMapper
* FluentValidation
* Swagger/OpenAPI
* Dependency Injection
* Repository Pattern
* Clean Architecture

---

## 🔹 Frontend

* ReactJS
* React Router DOM
* Axios
* SCSS
* Context API
* React Hook Form
* Toastify
* Lucide React

---

# ✨ Chức Năng Chính

## 👨‍🏫 Giảng Viên

* Tạo lớp học
* Quản lý lớp học
* Tạo bài tập
* Chấm điểm
* Đăng thông báo
* Upload tài liệu

---

## 👨‍🎓 Học Sinh

* Tham gia lớp học
* Nộp bài tập
* Xem tài liệu
* Nhận thông báo

---

# 🔐 Authentication & Authorization

* Đăng ký
* Đăng nhập
* JWT Token
* Refresh Token
* Role-based Authorization

---

# 🧱 Clean Architecture

## 1️⃣ Domain Layer

* Entities
* Interfaces
* Business Rules

---

## 2️⃣ Application Layer

* DTOs
* Services
* Validators
* CQRS

---

## 3️⃣ Infrastructure Layer

* DbContext
* Repository
* JWT Services
* File Services

---

## 4️⃣ API Layer

* Controllers
* Middleware
* Swagger
* Dependency Injection

---

# 🔑 Authentication Flow

```text
User Login
   ↓
Validate User
   ↓
Generate JWT Token
   ↓
Return Access Token
   ↓
Frontend lưu token
   ↓
Authorization Header
```

---

# 🗄️ Database Tables

* Users
* Roles
* Classrooms
* Assignments
* Submissions
* Announcements
* Materials
* Enrollments

---

# 📦 Cài Đặt Dự Án

# 1️⃣ Clone Repository

```bash
git clone https://github.com/duythai04/edu-flatform.git
```

---

# 2️⃣ Backend Setup

```bash
cd backend
```

## Restore Packages

```bash
dotnet restore
```

## Update Database

```bash
dotnet ef database update
```

## Run API

```bash
dotnet run
```

## Swagger

```bash
https://localhost:5001/swagger
```

---

# 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

## Start Frontend

```bash
npm start
```

Frontend chạy tại:

```bash
http://localhost:3000
```

---

# ⚙️ Environment Variables

## Backend - appsettings.json

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

---

# 📡 API Endpoints

## 🔐 Authentication

| Method | Endpoint                  | Description   |
| ------ | ------------------------- | ------------- |
| POST   | `/api/auth/register`      | Đăng ký       |
| POST   | `/api/auth/login`         | Đăng nhập     |
| POST   | `/api/auth/refresh-token` | Refresh token |

---

## 🏫 Classrooms

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | `/api/classrooms`      |
| POST   | `/api/classrooms`      |
| GET    | `/api/classrooms/{id}` |
| PUT    | `/api/classrooms/{id}` |
| DELETE | `/api/classrooms/{id}` |

---

## 📝 Assignments

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | `/api/assignments` |
| POST   | `/api/assignments` |
| POST   | `/api/submissions` |

---

# 🛡️ Security Features

* JWT Authentication
* Password Hashing
* Role-based Access Control
* Middleware Exception Handling
* CORS Configuration

---

# 🎨 Frontend Features

* Responsive UI
* Dashboard
* Loading State
* Toast Notification
* Error Handling
* Search & Filter

---

# 📸 Screenshots

## Login Page

```text
(Add screenshot here)
```

## Dashboard

```text
(Add screenshot here)
```

## Classroom Page

```text
(Add screenshot here)
```

---

# 🧪 Testing

```bash
dotnet test
```

---

# 🚀 Deployment

## Backend

* Azure
* Railway
* Render
* Docker
* VPS Ubuntu

---

## Frontend

* Vercel
* Netlify
* Firebase Hosting

---

# 🐳 Docker

```bash
docker-compose up --build
```

---

# 📚 Future Features

* Video Call
* Realtime Chat
* Quiz System
* Attendance Tracking
* AI Assistant
* Mobile App

---

# 🤝 Contributing

## Fork project

```bash
git fork
```

## Create branch

```bash
git checkout -b feature/your-feature
```

## Commit

```bash
git commit -m "Add new feature"
```

## Push

```bash
git push origin feature/your-feature
```

---

# 👨‍💻 Author

## Thai Nguyen

* Full Stack Developer
* ASP.NET Core & ReactJS Developer

GitHub:

[https://github.com/duythai04/edu-flatform](https://github.com/duythai04/edu-flatform)

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

Nếu bạn thấy dự án hữu ích hãy cho repository một ⭐ nhé ❤️
