# 🎓 Hệ thống Quản lý Khối lượng Công việc Giảng viên (KLGD)

<div align="center">

[![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![PHP](https://img.shields.io/badge/PHP-8.0+-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![Vite](https://img.shields.io/badge/Vite-4.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Hệ thống phần mềm quản lý và tính toán khối lượng công việc của giảng viên**  
**Trường Đại học Thủy Lợi**

[📖 Tài liệu](#-tài-liệu) • 
[🚀 Cài đặt](#-cài-đặt) • 
[💡 Tính năng](#-tính-năng) • 
[🔧 API](#-api-documentation) • 
[🤝 Đóng góp](#-đóng-góp)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Sử dụng](#-sử-dụng)
- [API Documentation](#-api-documentation)
- [Cơ sở dữ liệu](#-cơ-sở-dữ-liệu)
- [Phân quyền](#-phân-quyền)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Đóng góp](#-đóng-góp)
- [License](#-license)
- [Team](#-team)

## 🎯 Giới thiệu

**Hệ thống Quản lý Khối lượng Công việc Giảng viên (KLGD)** là một giải pháp phần mềm toàn diện được phát triển dành riêng cho **Trường Đại học Thủy Lợi**, nhằm hiện đại hóa và tự động hóa quy trình quản lý, kê khai, phê duyệt và tính toán khối lượng công việc của đội ngũ giảng viên.

### 🎪 **Vấn đề giải quyết**

- ✅ **Tự động hóa** quy trình kê khai thủ công, giảm thiểu sai sót
- ✅ **Minh bạch hóa** việc phê duyệt và đánh giá công việc  
- ✅ **Chuẩn hóa** quy trình tính toán giờ chuẩn theo quy định
- ✅ **Tập trung hóa** dữ liệu và báo cáo thống kê
- ✅ **Số hóa** toàn bộ quy trình quản lý nhân sự

### 🏆 **Mục tiêu dự án**

1. **Phân tích và mô hình hóa** quy trình quản lý khối lượng công việc giảng viên
2. **Xây dựng hệ thống** hỗ trợ kê khai, phê duyệt, tổng hợp và báo cáo  
3. **Đảm bảo bảo mật** với phân quyền rõ ràng (Admin, Manager, Lecturer)
4. **Hỗ trợ xuất báo cáo** phục vụ quản lý và đánh giá hiệu quả
5. **Thiết kế mở rộng** để tích hợp với các hệ thống khác

---

## ✨ Tính năng chính

### 👨‍🏫 **Dành cho Giảng viên (Lecturer)**
- 📝 **Kê khai khối lượng công việc** theo từng học kỳ/năm học
  - Giảng dạy (lý thuyết, thực hành, thí nghiệm)
  - Nghiên cứu khoa học (NCKH)
  - Công tác khác (hội đồng, coi thi, chấm thi)
- 📊 **Dashboard cá nhân** với thống kê trực quan
- 📋 **Xem kết quả phê duyệt** và lịch sử kê khai
- 🔔 **Nhận thông báo** từ hệ thống và quản lý
- 📈 **Theo dõi tiến độ** hoàn thành định mức
- 📄 **Xuất báo cáo cá nhân** (PDF, Excel)

### 👨‍💼 **Dành cho Trưởng bộ môn (Manager)**  
- ✅ **Phê duyệt/từ chối** bản kê khai của giảng viên
- 📊 **Thống kê bộ môn** với biểu đồ chi tiết
- 👥 **Quản lý giảng viên** trong bộ môn
- 💰 **Quản lý lương** và tính toán chi phí
- 📤 **Xuất báo cáo bộ môn** đa dạng format
- 🔔 **Gửi thông báo** cho giảng viên
- 📈 **Phân tích hiệu suất** và xu hướng

### 👨‍💻 **Dành cho Quản trị viên (Admin)**
- 👤 **Quản lý người dùng** và phân quyền
- 🏗️ **Quản lý cấu trúc tổ chức** (khoa, bộ môn)
- ⚙️ **Cấu hình hệ thống** và tham số
- 📊 **Định mức giờ chuẩn** theo chức danh
- 🔍 **Giám sát hoạt động** hệ thống (Admin logs)
- 📈 **Báo cáo tổng hợp toàn trường**
- 🔧 **Quản lý danh mục** hệ số quy đổi

---

## 🛠️ Công nghệ sử dụng

### **Backend Technologies**
- **Framework:** Laravel 9.x (PHP 8.0+)
- **Database:** MySQL 8.0
- **Authentication:** Laravel Sanctum (API Token)
- **API:** RESTful API Architecture
- **Email:** Laravel Mail với queue system
- **PDF Generation:** DomPDF
- **Excel Export/Import:** Maatwebsite Excel

### **Frontend Technologies**  
- **Framework:** React 18.x với Hooks
- **Build Tool:** Vite 4.0
- **UI Library:** Ant Design (antd)
- **Charts:** Chart.js, Recharts
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS + Custom CSS
- **Icons:** React Icons
- **Animations:** Framer Motion

### **Development Tools**
- **Package Manager:** Composer (PHP), NPM (Node.js)
- **Code Quality:** Laravel Pint, ESLint
- **Testing:** PHPUnit, Laravel Feature Tests
- **Version Control:** Git
- **Documentation:** API Documentation (Markdown)

---

## 💻 Yêu cầu hệ thống

### **Server Requirements**
```bash
- PHP >= 8.0
- MySQL >= 8.0
- Composer >= 2.0
- Node.js >= 16.x
- NPM >= 8.x
- Apache/Nginx Web Server
- SSL Certificate (khuyến nghị cho production)
```

### **Development Environment**
```bash
- VS Code hoặc PHPStorm
- Git >= 2.x
- Postman (để test API)
- MySQL Workbench hoặc phpMyAdmin
```

---

## 🚀 Cài đặt

### **1. Clone Repository**
```bash
git clone https://github.com/your-username/KLGD.git
cd KLGD
```

### **2. Backend Setup (Laravel)**
```bash
# Cài đặt dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Cấu hình database trong .env file
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=klgd
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Chạy migrations và seeders
php artisan migrate
php artisan db:seed

# Tạo symbolic link cho storage
php artisan storage:link

# Cấu hình queue (nếu cần)
php artisan queue:table
php artisan migrate
```

### **3. Frontend Setup (React)**
```bash
# Cài đặt Node.js dependencies
npm install

# Build assets cho development
npm run dev

# Hoặc build cho production
npm run build
```

### **4. Khởi chạy ứng dụng**
```bash
# Terminal 1: Khởi chạy Laravel server
php artisan serve

# Terminal 2: Khởi chạy Vite dev server (development)
npm run dev

# Terminal 3: Chạy queue worker (nếu dùng email)
php artisan queue:work
```

Truy cập ứng dụng tại: `http://localhost:8000`

---

## ⚙️ Cấu hình

### **Environment Configuration (.env)**
```env
# Application
APP_NAME="KLGD - Hệ thống Quản lý Khối lượng Công việc"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=klgd
DB_USERNAME=root
DB_PASSWORD=

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@tlu.edu.vn
MAIL_FROM_NAME="${APP_NAME}"

# Queue
QUEUE_CONNECTION=database

# Session & Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
```

### **Tài khoản mặc định**
Sau khi chạy `php artisan db:seed`:

```bash
# Admin Account
Email: admin@tlu.edu.vn
Password: admin123

# Manager Account  
Email: manager@tlu.edu.vn
Password: manager123

# Lecturer Account
Email: lecturer@tlu.edu.vn  
Password: lecturer123
```

---

## 📖 Sử dụng

### **Workflow cơ bản**

#### **Bước 1: Giảng viên kê khai**
1. Đăng nhập vào hệ thống
2. Chọn năm học/học kỳ để kê khai
3. Nhập thông tin:
   - **Giảng dạy:** học phần, số tiết, số sinh viên
   - **NCKH:** đề tài, bài báo, sách, hội thảo
   - **Công tác khác:** hội đồng, coi thi, chấm thi
4. Nộp bản kê khai tổng hợp

#### **Bước 2: Trưởng bộ môn phê duyệt**
1. Xem danh sách kê khai chờ duyệt
2. Kiểm tra chi tiết từng hoạt động
3. Phê duyệt hoặc từ chối với ghi chú
4. Gửi thông báo cho giảng viên

#### **Bước 3: Theo dõi và báo cáo**
1. Xem thống kê cá nhân/bộ môn/toàn trường
2. Xuất báo cáo theo nhiều định dạng
3. Phân tích xu hướng và hiệu suất

---

## 📡 API Documentation

### **Authentication**
```http
POST /api/login
POST /api/logout
POST /api/forgot-password
POST /api/reset-password
```

### **Lecturer APIs**
```http
GET    /api/lecturer/dashboard
GET    /api/lecturer/kekhai
POST   /api/lecturer/kekhai
PUT    /api/lecturer/kekhai/{id}
DELETE /api/lecturer/kekhai/{id}
POST   /api/lecturer/kekhai/{id}/submit
GET    /api/lecturer/statistics
```

### **Manager APIs**
```http
GET    /api/manager/dashboard
GET    /api/manager/kekhai/pending
POST   /api/manager/kekhai/{id}/approve
POST   /api/manager/kekhai/{id}/reject
GET    /api/manager/statistics
GET    /api/manager/reports
```

### **Admin APIs**
```http
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
GET    /api/admin/departments
GET    /api/admin/system-logs
```

**Xem chi tiết:** [📄 API Documentation](resources/docs/api.md)

---

## 🗄️ Cơ sở dữ liệu

### **Sơ đồ ERD chính**

```
nguoi_dung (Users)
├── ke_khai_tong_hop (Main Declarations)
│   ├── ke_khai_giang_day (Teaching)
│   ├── ke_khai_nckh (Research)  
│   └── ke_khai_khac (Other Activities)
├── bo_mon (Departments)
├── khoa (Faculties)
└── luong_giang_vien (Lecturer Salaries)

Configuration Tables:
├── nam_hoc (Academic Years)
├── hoc_ky (Semesters)
├── dinh_muc_ca_nhan_theo_nam (Personal Quotas)
├── dm_he_so_chung (Conversion Factors)
└── hoat_dong_chi_tiet (Activity Details)
```

### **Bảng chính**

| Bảng | Mô tả | Số cột |
|-------|--------|--------|
| `nguoi_dung` | Thông tin người dùng | 8 |
| `ke_khai_tong_hop` | Kê khai tổng hợp | 15 |
| `ke_khai_giang_day` | Chi tiết giảng dạy | 12 |
| `ke_khai_nckh` | Chi tiết NCKH | 10 |
| `bo_mon` | Bộ môn | 6 |
| `luong_giang_vien` | Lương giảng viên | 8 |

---

## 🔐 Phân quyền

### **Role-Based Access Control (RBAC)**

| Vai trò | Mô tả | Quyền chính |
|---------|--------|-------------|
| **Admin (1)** | Quản trị viên hệ thống | Toàn quyền quản lý |
| **Manager (2)** | Trưởng bộ môn | Quản lý bộ môn, phê duyệt |
| **Lecturer (3)** | Giảng viên | Kê khai, xem thống kê cá nhân |

### **Ma trận phân quyền**

| Chức năng | Admin | Manager | Lecturer |
|-----------|-------|---------|----------|
| Quản lý người dùng | ✅ | ❌ | ❌ |
| Cấu hình hệ thống | ✅ | ❌ | ❌ |
| Phê duyệt kê khai | ✅ | ✅ | ❌ |
| Kê khai công việc | ❌ | ❌ | ✅ |
| Xem báo cáo toàn trường | ✅ | ❌ | ❌ |
| Xem báo cáo bộ môn | ✅ | ✅ | ❌ |
| Xem thống kê cá nhân | ✅ | ✅ | ✅ |

---

## 📸 Screenshots

<details>
<summary>🖼️ Xem Screenshots</summary>

### **Dashboard Giảng viên**
![Lecturer Dashboard](docs/images/lecturer-dashboard.png)

### **Kê khai Giảng dạy**  
![Teaching Declaration](docs/images/teaching-declaration.png)

### **Manager Dashboard**
![Manager Dashboard](docs/images/manager-dashboard.png)

### **Admin Panel**
![Admin Panel](docs/images/admin-panel.png)

</details>

---

## 🗺️ Roadmap

### **Phase 1: Core Features ✅**
- [x] Authentication & Authorization
- [x] Basic CRUD Operations  
- [x] Declaration Management
- [x] Approval Workflow
- [x] Basic Reporting

### **Phase 2: Enhanced Features 🔄**
- [x] Advanced Statistics & Charts
- [x] Email Notifications
- [x] PDF/Excel Export
- [ ] Mobile Responsive UI
- [ ] Advanced Search & Filters

### **Phase 3: Advanced Features 📋**
- [ ] Real-time Notifications (WebSocket)
- [ ] Integration with TLU Systems
- [ ] Advanced Analytics & ML
- [ ] API for External Systems
- [ ] Mobile App (React Native)

### **Phase 4: AI & Automation 🤖**
- [ ] AI-powered Recommendations
- [ ] Automated Calculation Validation
- [ ] Predictive Analytics
- [ ] Smart Scheduling
- [ ] NLP for Document Processing

---

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng! 

### **Cách đóng góp**

1. **Fork** repository này
2. **Tạo branch** cho feature mới: `git checkout -b feature/AmazingFeature`
3. **Commit** thay đổi: `git commit -m 'Add some AmazingFeature'`
4. **Push** lên branch: `git push origin feature/AmazingFeature`
5. **Tạo Pull Request**

### **Coding Standards**
- **PHP:** Tuân thủ PSR-12 Coding Standards
- **JavaScript:** ESLint + Prettier configuration
- **Database:** Laravel Migration Conventions
- **Commit:** Conventional Commits format

### **Bug Reports**
Nếu bạn phát hiện lỗi, vui lòng tạo issue với:
- Mô tả chi tiết lỗi
- Các bước để reproduce
- Screenshots (nếu có)
- Environment information

---

## 📄 License

Dự án này được phân phối dưới giấy phép **MIT License**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

```
MIT License

Copyright (c) 2024 Trường Đại học Thủy Lợi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 👥 Team

### **Development Team**

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/your-avatar.png" width="100px;" alt=""/>
      <br />
      <sub><b>Nguyễn Văn A</b></sub>
      <br />
      <sub>Project Lead & Backend Developer</sub>
    </td>
    <td align="center">
      <img src="https://github.com/your-avatar.png" width="100px;" alt=""/>
      <br />
      <sub><b>Trần Thị B</b></sub>
      <br />
      <sub>Frontend Developer & UI/UX</sub>
    </td>
    <td align="center">
      <img src="https://github.com/your-avatar.png" width="100px;" alt=""/>
      <br />
      <sub><b>Lê Văn C</b></sub>
      <br />
      <sub>Database & DevOps</sub>
    </td>
  </tr>
</table>

### **Academic Supervisors**
- **PGS.TS. Nguyễn Văn X** - Giảng viên hướng dẫn
- **TS. Trần Thị Y** - Chuyên gia tư vấn nghiệp vụ
- **ThS. Lê Văn Z** - Chuyên gia công nghệ

---

## 📞 Liên hệ & Hỗ trợ

### **Thông tin liên hệ**
- **Website:** [https://tlu.edu.vn](https://tlu.edu.vn)
- **Email:** support@tlu.edu.vn
- **Phone:** (+84) 24 3825 4859
- **Address:** 175 Tây Sơn, Đống Đa, Hà Nội

### **Hỗ trợ kỹ thuật**
- **Issue Tracker:** [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation:** [Wiki](https://github.com/your-repo/wiki)
- **API Docs:** [Postman Collection](https://documenter.getpostman.com/...)

### **Social Media**
[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://facebook.com/tlu.edu.vn)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/tlu)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/school/tlu)

---

<div align="center">

**🎓 Trường Đại học Thủy Lợi - Water Resources University**

*Phát triển bởi sinh viên ngành Công nghệ Thông tin với ❤️*

**[⭐ Star this repo](https://github.com/your-repo) | [🍴 Fork](https://github.com/your-repo/fork) | [📝 Issues](https://github.com/your-repo/issues)**

---

*Cập nhật lần cuối: Tháng 7, 2025*

</div>
