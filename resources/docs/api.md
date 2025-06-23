# API Documentation - Hệ thống Quản lý Khối lượng Công việc

## 📋 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Xác thực](#xác-thực)
- [Mã lỗi chung](#mã-lỗi-chung)
- [Auth APIs](#1-auth-apis)
- [Lecturer APIs](#2-lecturer-apis)
- [Manager APIs](#3-manager-apis)
- [Admin APIs](#4-admin-apis)
- [Appendix](#5-appendix)

---

## 📖 Giới thiệu

Hệ thống Quản lý Khối lượng Công việc cho phép giảng viên kê khai, quản lý theo dõi và báo cáo khối lượng công việc theo từng học kỳ. Hệ thống hỗ trợ 3 vai trò chính:

- **Giảng viên (vai_tro: 3)**: Kê khai khối lượng công việc
- **Quản lý (vai_tro: 2)**: Phê duyệt, theo dõi kê khai trong khoa
- **Quản trị viên (vai_tro: 1)**: Quản lý toàn bộ hệ thống

### Base URL
```
https://your-domain.com/api
```

### Content-Type
Tất cả requests đều sử dụng `Content-Type: application/json`

---

## 🔐 Xác thực

Hệ thống sử dụng **Laravel Sanctum** để xác thực. Sau khi đăng nhập thành công, bạn sẽ nhận được token để sử dụng cho các API khác.

### Headers yêu cầu
```http
Authorization: Bearer {your-token}
Accept: application/json
Content-Type: application/json
```

---

## ⚠️ Mã lỗi chung

| Mã lỗi | Ý nghĩa |
|--------|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Yêu cầu không hợp lệ |
| 401 | Chưa xác thực |
| 403 | Không có quyền truy cập |
| 404 | Không tìm thấy |
| 422 | Dữ liệu không hợp lệ |
| 500 | Lỗi server |

---

## 1. Auth APIs

### 1.1 Đăng nhập

```http
POST /api/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "token": "1|abcd1234...",
  "user": {
    "id": 1,
    "ho_ten": "Nguyễn Văn A",
    "email": "user@example.com",
    "vai_tro": 3
  }
}
```

**Response Error (401):**
```json
{
  "message": "Thông tin đăng nhập không chính xác.",
  "errors": {
    "email": ["Thông tin đăng nhập không chính xác."]
  }
}
```

### 1.2 Đăng xuất

```http
POST /api/logout
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Đăng xuất thành công"
}
```

### 1.3 Quên mật khẩu

```http
POST /api/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response Success (200):**
```json
{
  "message": "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.",
  "status": "success",
  "email": "user@example.com"
}
```

### 1.4 Đặt lại mật khẩu

```http
POST /api/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token",
  "email": "user@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

### 1.5 Kiểm tra quyền

```http
GET /api/verify-role?role=manager
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "hasRole": true,
  "message": "Người dùng có quyền quản lý"
}
```

---

## 2. Lecturer APIs

### 2.1 Dashboard

```http
GET /api/lecturer/dashboard?hoc_ky_id=1
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `hoc_ky_id` (optional): ID học kỳ

**Response (200):**
```json
{
  "total_ke_khai": 3,
  "draft": 1,
  "submitted": 1,
  "approved": 1,
  "rejected": 0,
  "total_hours": 245.5,
  "hoc_ky_list": [
    {
      "id": 1,
      "ten_hoc_ky": "Học kỳ 1",
      "nam_hoc": {
        "id": 1,
        "ten_nam_hoc": "2023-2024"
      }
    }
  ],
  "recent_activities": []
}
```

### 2.2 Quản lý Kê khai

#### Lấy danh sách kê khai

```http
GET /api/lecturer/kekhai?hoc_ky_id=1&page=1&per_page=10
```

**Query Parameters:**
- `hoc_ky_id` (optional): ID học kỳ
- `page` (optional): Trang (default: 1)
- `per_page` (optional): Số bản ghi mỗi trang (default: 10)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "hoc_ky": {
        "id": 1,
        "ten_hoc_ky": "Học kỳ 1",
        "nam_hoc": {
          "ten_nam_hoc": "2023-2024"
        }
      },
      "tong_gio_chuan_tam_tinh": 245.5,
      "tong_gio_chuan_duyet": 240.0,
      "trang_thai_phe_duyet": 3,
      "created_at": "2024-01-15T08:30:00.000000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total": 5,
    "per_page": 10
  }
}
```

#### Tạo kê khai mới

```http
POST /api/lecturer/kekhai
```

**Request Body:**
```json
{
  "hoc_ky_id": 1
}
```

**Response (201):**
```json
{
  "message": "Tạo kê khai thành công",
  "ke_khai": {
    "id": 1,
    "hoc_ky_id": 1,
    "trang_thai_phe_duyet": 0
  }
}
```

#### Xem chi tiết kê khai

```http
GET /api/lecturer/kekhai/{id}
```

**Response (200):**
```json
{
  "id": 1,
  "hoc_ky": {
    "id": 1,
    "ten_hoc_ky": "Học kỳ 1"
  },
  "tong_gio_chuan_tam_tinh": 245.5,
  "trang_thai_phe_duyet": 1,
  "ke_khai_giang_day": [
    {
      "id": 1,
      "ten_hoc_phan": "Lập trình Web",
      "so_tiet_thuc_day": 45,
      "gio_chuan_tam_tinh": 60.0
    }
  ],
  "ke_khai_nckh": [],
  "ke_khai_khac": []
}
```

#### Cập nhật kê khai

```http
PUT /api/lecturer/kekhai/{id}
```

**Request Body:**
```json
{
  "tong_gio_chuan_tam_tinh": 250.0,
  "ghi_chu": "Cập nhật thông tin"
}
```

#### Nộp kê khai

```http
POST /api/lecturer/kekhai/{id}/submit
```

**Response (200):**
```json
{
  "message": "Nộp kê khai thành công"
}
```

#### Xóa kê khai

```http
DELETE /api/lecturer/kekhai/{id}
```

**Response (200):**
```json
{
  "message": "Xóa kê khai thành công"
}
```

### 2.3 Kê khai Giảng dạy

#### Lấy danh sách

```http
GET /api/lecturer/kekhai/{ke_khai_id}/giang-day
```

#### Thêm mới

```http
POST /api/lecturer/kekhai/{ke_khai_id}/giang-day
```

**Request Body:**
```json
{
  "hoat_dong_chi_tiet_id": 1,
  "ten_hoc_phan": "Lập trình Web",
  "ma_hoc_phan": "IT101",
  "ma_lop_hoc_phan": "IT101.01",
  "so_tin_chi": 3,
  "so_tiet_thuc_day": 45,
  "so_sinh_vien": 40,
  "ngon_ngu_giang_day": "Tiếng Việt",
  "chuong_trinh_dao_tao": "Đại học chính quy"
}
```

#### Cập nhật

```http
PUT /api/lecturer/kekhai/giang-day/{id}
```

#### Xóa

```http
DELETE /api/lecturer/kekhai/giang-day/{id}
```

### 2.4 Kê khai NCKH

#### Thêm mới

```http
POST /api/lecturer/kekhai/{ke_khai_id}/nckh
```

**Request Body:**
```json
{
  "hoat_dong_chi_tiet_id": 5,
  "ten_san_pham": "Bài báo khoa học về AI",
  "ma_so_isbn_issn": "ISSN 1234-5678",
  "ten_tap_chi_hoi_thao": "Tạp chí Khoa học Máy tính",
  "nha_xuat_ban": "NXB Khoa học",
  "nam_xuat_ban_nghiem_thu": "2024",
  "hang_tap_chi": "Q1",
  "vai_tro_tham_gia": "Tác giả chính"
}
```

### 2.5 Kê khai Hoạt động khác

#### Thêm mới

```http
POST /api/lecturer/kekhai/{ke_khai_id}/khac
```

**Request Body:**
```json
{
  "hoat_dong_chi_tiet_id": 10,
  "mo_ta_cong_viec": "Tham gia hội đồng đánh giá luận văn",
  "so_luong": 5,
  "thoi_gian_thuc_hien": "2024-01-15"
}
```

### 2.6 Quản lý Minh chứng

#### Upload minh chứng

```http
POST /api/lecturer/kekhai/{ke_khai_id}/minh-chung
```

**Request Body (multipart/form-data):**
```
ke_khai_chi_tiet_id: 1
ke_khai_chi_tiet_type: giang_day
files[]: [file1.pdf]
files[]: [file2.jpg]
```

**Response (201):**
```json
{
  "message": "Upload thành công 2 file",
  "files": [
    {
      "id": 1,
      "ten_file": "minh_chung_1.pdf",
      "duong_dan": "minh_chung/2024/01/abc123.pdf"
    }
  ]
}
```

#### Xóa minh chứng

```http
DELETE /api/lecturer/minh-chung/{id}
```

### 2.7 Tính toán Giờ chuẩn

```http
POST /api/lecturer/calculate-gio-chuan
```

**Request Body:**
```json
{
  "nam_hoc_id": 1,
  "hoat_dong_chi_tiet_id": 1,
  "so_luong": 45,
  "so_tin_chi": 3,
  "so_sinh_vien": 40,
  "vai_tro_tham_gia": "Tác giả chính"
}
```

**Response (200):**
```json
{
  "gio_chuan": 60.0,
  "he_so_ap_dung": {
    "he_so_nen": 1.2,
    "he_so_uu_tien": 0.1,
    "he_so_tong_hop": 1.3
  },
  "don_vi_tinh": "Tiết"
}
```

### 2.8 Thống kê cá nhân

```http
GET /api/lecturer/statistics?nam_hoc_id=1
```

**Response (200):**
```json
{
  "tong_gio_chuan": 245.5,
  "dinh_muc": 320.0,
  "ty_le_hoan_thanh": 76.7,
  "phan_bo_theo_loai": {
    "giang_day": 180.0,
    "nckh": 45.5,
    "khac": 20.0
  },
  "bieu_do_theo_thang": [
    {"thang": 1, "gio_chuan": 60.0},
    {"thang": 2, "gio_chuan": 75.5}
  ]
}
```

---

## 3. Manager APIs

### 3.1 Dashboard

```http
GET /api/manager/dashboard?hoc_ky_id=1
```

**Response (200):**
```json
{
  "total_ke_khai": 25,
  "pending": 5,
  "approved": 18,
  "rejected": 2,
  "total_hours": 6150.5,
  "hoc_ky_list": [
    {
      "id": 1,
      "ten_hoc_ky": "Học kỳ 1",
      "nam_hoc": {
        "ten_nam_hoc": "2023-2024"
      }
    }
  ]
}
```

### 3.2 Quản lý Kê khai

#### Lấy danh sách kê khai để phê duyệt

```http
GET /api/manager/kekhai?hoc_ky_id=1&bo_mon_id=2&trang_thai=1&search=nguyen&page=1&per_page=10
```

**Query Parameters:**
- `hoc_ky_id` (optional): ID học kỳ
- `bo_mon_id` (optional): ID bộ môn
- `trang_thai` (optional): Trạng thái (0: Chưa nộp, 1: Chờ duyệt, 2: Từ chối, 3: Đã duyệt)
- `search` (optional): Tìm kiếm theo tên/mã GV
- `page`, `per_page`: Phân trang

**Response (200):**
```json
{
  "ke_khai_list": {
    "data": [
      {
        "id": 1,
        "nguoi_dung": {
          "ho_ten": "Nguyễn Văn A",
          "ma_gv": "GV001",
          "bo_mon": {
            "ten_bo_mon": "Công nghệ thông tin"
          }
        },
        "tong_gio_chuan_tam_tinh": 245.5,
        "trang_thai_phe_duyet": 1,
        "gio_chuan_theo_loai": {
          "giang_day": 180.0,
          "nckh": 45.5,
          "khac": 20.0
        }
      }
    ],
    "current_page": 1,
    "total": 25
  },
  "bo_mon_list": [
    {
      "id": 1,
      "ten_bo_mon": "Công nghệ thông tin"
    }
  ]
}
```

#### Xem chi tiết kê khai

```http
GET /api/manager/kekhai/{id}
```

**Response (200):**
```json
{
  "id": 1,
  "nguoi_dung": {
    "ho_ten": "Nguyễn Văn A",
    "ma_gv": "GV001",
    "email": "nguyenvana@example.com",
    "bo_mon": {
      "ten_bo_mon": "Công nghệ thông tin",
      "khoa": {
        "ten_khoa": "Công nghệ thông tin"
      }
    }
  },
  "chi_tiet_ke_khai": [
    {
      "id": 1,
      "loai": "giang_day",
      "hoat_dong": {
        "ten_hoat_dong": "Giảng dạy lý thuyết"
      },
      "thong_tin_chi_tiet": {
        "ten_hoc_phan": "Lập trình Web",
        "so_tiet_thuc_day": 45
      },
      "gio_chuan_tam_tinh": 60.0,
      "minh_chung": [
        {
          "ten_file": "bang_diem.pdf",
          "duong_dan": "minh_chung/2024/01/abc123.pdf"
        }
      ]
    }
  ],
  "dinh_muc": {
    "tong_gio_chuan": 320.0,
    "ty_le_hoan_thanh": 76.7
  }
}
```

#### Phê duyệt kê khai

```http
POST /api/manager/kekhai/{id}/approve
```

**Response (200):**
```json
{
  "message": "Phê duyệt thành công, email đã được đẩy vào hàng đợi"
}
```

#### Từ chối kê khai

```http
POST /api/manager/kekhai/{id}/reject
```

**Request Body:**
```json
{
  "ly_do_tu_choi": "Thiếu minh chứng cho hoạt động NCKH"
}
```

**Response (200):**
```json
{
  "message": "Từ chối thành công, email đã được đẩy vào hàng đợi"
}
```

#### Phê duyệt hàng loạt

```http
POST /api/manager/kekhai/bulk-approve
```

**Request Body:**
```json
{
  "ke_khai_ids": [1, 2, 3, 4, 5]
}
```

#### Từ chối hàng loạt

```http
POST /api/manager/kekhai/bulk-reject
```

**Request Body:**
```json
{
  "ke_khai_ids": [1, 2, 3],
  "ly_do_tu_choi": "Thiếu minh chứng"
}
```

### 3.3 Thống kê

```http
GET /api/manager/statistics?hoc_ky_id=1&bo_mon_id=2
```

**Response (200):**
```json
{
  "total_ke_khai": 25,
  "total_hours": 6150.5,
  "activity_stats": {
    "giang_day": {
      "total_hours": 4500.0,
      "percentage": 73.2
    },
    "nckh": {
      "total_hours": 1200.5,
      "percentage": 19.5
    },
    "khac": {
      "total_hours": 450.0,
      "percentage": 7.3
    }
  },
  "top_giang_viens": [
    {
      "ho_ten": "Nguyễn Văn A",
      "ma_gv": "GV001",
      "total_hours": 320.5
    }
  ],
  "bo_mon_rankings": [
    {
      "bo_mon": "Công nghệ thông tin",
      "total_hours": 2800.0,
      "teacher_count": 12
    }
  ]
}
```

### 3.4 Báo cáo và Xuất dữ liệu

#### Xuất báo cáo

```http
POST /api/manager/export-report
```

**Request Body:**
```json
{
  "hoc_ky_id": 1,
  "format": "excel",
  "bo_mon_id": 2,
  "trang_thai": 3,
  "search": "nguyen",
  "report_type": "detailed",
  "columns": [
    "ma_giang_vien",
    "ten_giang_vien",
    "email",
    "bo_mon",
    "tong_gio_chuan",
    "gio_chuan_giang_day",
    "gio_chuan_nckh",
    "gio_chuan_khac",
    "ngay_nop",
    "dinh_muc"
  ],
  "paper_size": "a4",
  "orientation": "landscape",
  "font_size": 12,
  "ngay_nop_tu": "2024-01-01",
  "ngay_nop_den": "2024-01-31",
  "preview": false
}
```

**Query Parameters:**
- `format`: `excel`, `pdf`
- `report_type`: `overview`, `detailed`, `statistics`, `comprehensive`
- `orientation`: `portrait`, `landscape`
- `paper_size`: `a4`, `letter`
- `preview`: true để xem trước, false để tải file

**Response Success (200):**
File download hoặc:
```json
{
  "message": "Báo cáo đang được xử lý, bạn sẽ nhận thông báo khi hoàn tất"
}
```

**Response Preview (200):**
```json
{
  "reportData": [...],
  "total": 25,
  "metadata": {
    "hoc_ky": "Học kỳ 1",
    "nam_hoc": "2023-2024"
  }
}
```

### 3.5 Thông báo

#### Gửi thông báo nhắc nhở

```http
POST /api/manager/send-notification
```

**Request Body:**
```json
{
  "hoc_ky_id": 1,
  "title": "Nhắc nhở nộp kê khai",
  "message": "Vui lòng nộp kê khai giờ chuẩn trước hạn chót."
}
```

**Response (200):**
```json
{
  "message": "Đã gửi thông báo và đẩy 15 email vào hàng đợi"
}
```

### 3.6 Lịch sử phê duyệt

```http
GET /api/manager/kekhai/{id}/log
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nguoi_thuc_hien": {
      "ho_ten": "Trần Thị B",
      "ma_gv": "QL001"
    },
    "hanh_dong": "approve",
    "trang_thai_truoc": 1,
    "trang_thai_sau": 3,
    "ghi_chu": "Phê duyệt đơn lẻ",
    "thoi_gian_thuc_hien": "2024-01-20T10:30:00.000000Z"
  }
]
```

---

## 4. Admin APIs

### 4.1 Quản lý người dùng

#### Lấy danh sách người dùng

```http
GET /api/admin/users?page=1&per_page=10&search=nguyen&vai_tro=3
```

**Query Parameters:**
- `page`, `per_page`: Phân trang
- `search`: Tìm kiếm theo tên, email, mã GV
- `vai_tro`: Lọc theo vai trò (1: Admin, 2: Manager, 3: Lecturer)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "ma_gv": "GV001",
      "ho_ten": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "vai_tro": 3,
      "trang_thai": 1,
      "bo_mon": {
        "id": 1,
        "ten_bo_mon": "Công nghệ thông tin",
        "khoa": {
          "id": 1,
          "ten_khoa": "Công nghệ thông tin"
        }
      },
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total": 50,
    "per_page": 10,
    "to": 10
  }
}
```

#### Tạo người dùng mới

```http
POST /api/admin/users
```

**Request Body:**
```json
{
  "ma_gv": "GV002",
  "ho_ten": "Trần Thị B",
  "email": "tranthib@example.com",
  "password": "password123",
  "vai_tro": 3,
  "bo_mon_id": 1,
  "trang_thai": 1
}
```

**Response (201):**
```json
{
  "message": "Tạo người dùng thành công",
  "user": {
    "id": 2,
    "ma_gv": "GV002",
    "ho_ten": "Trần Thị B",
    "email": "tranthib@example.com"
  }
}
```

#### Cập nhật người dùng

```http
PUT /api/admin/users/{id}
```

**Request Body:**
```json
{
  "ma_gv": "GV002",
  "ho_ten": "Trần Thị B Updated",
  "email": "tranthib@example.com",
  "vai_tro": 3,
  "bo_mon_id": 1,
  "trang_thai": 1,
  "password": "newpassword123"
}
```

#### Xóa người dùng

```http
DELETE /api/admin/users/{id}
```

**Response (200):**
```json
{
  "message": "Xóa người dùng thành công"
}
```

#### Import người dùng từ Excel

```http
POST /api/admin/users/import
```

**Request Body (multipart/form-data):**
```
file: users.xlsx
```

**Response (200):**
```json
{
  "message": "Nhập dữ liệu người dùng thành công"
}
```

### 4.2 Quản lý Khoa

#### Lấy danh sách khoa

```http
GET /api/admin/khoa?page=1&per_page=10&search=cong
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "ma_khoa": "CNTT",
      "ten_khoa": "Công nghệ thông tin",
      "bo_mons": [
        {
          "id": 1,
          "ten_bo_mon": "Khoa học máy tính"
        }
      ],
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

#### Tạo khoa mới

```http
POST /api/admin/khoa
```

**Request Body:**
```json
{
  "ma_khoa": "KTXD",
  "ten_khoa": "Kỹ thuật xây dựng"
}
```

#### Cập nhật khoa

```http
PUT /api/admin/khoa/{id}
```

#### Xóa khoa

```http
DELETE /api/admin/khoa/{id}
```

#### Import khoa từ Excel

```http
POST /api/admin/khoa/import
```

### 4.3 Quản lý Bộ môn

#### Lấy danh sách bộ môn

```http
GET /api/admin/bo-mon?page=1&per_page=10&search=khoa
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "ma_bo_mon": "KHMT",
      "ten_bo_mon": "Khoa học máy tính",
      "khoa": {
        "id": 1,
        "ten_khoa": "Công nghệ thông tin"
      }
    }
  ]
}
```

#### Tạo bộ môn mới

```http
POST /api/admin/bo-mon
```

**Request Body:**
```json
{
  "ma_bo_mon": "HTTT",
  "ten_bo_mon": "Hệ thống thông tin",
  "khoa_id": 1
}
```

#### Cập nhật bộ môn

```http
PUT /api/admin/bo-mon/{id}
```

#### Xóa bộ môn

```http
DELETE /api/admin/bo-mon/{id}
```

#### Import bộ môn từ Excel

```http
POST /api/admin/bo-mon/import
```

### 4.4 Quản lý Năm học

#### Lấy danh sách năm học

```http
GET /api/admin/nam-hoc?page=1&per_page=10&search=2024
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "ten_nam_hoc": "2023-2024",
      "la_nam_hien_hanh": true,
      "hoc_kys": [
        {
          "id": 1,
          "ten_hoc_ky": "Học kỳ 1"
        }
      ]
    }
  ]
}
```

#### Tạo năm học mới

```http
POST /api/admin/nam-hoc
```

**Request Body:**
```json
{
  "ten_nam_hoc": "2024-2025",
  "la_nam_hien_hanh": false
}
```

#### Cập nhật năm học

```http
PUT /api/admin/nam-hoc/{id}
```

#### Xóa năm học

```http
DELETE /api/admin/nam-hoc/{id}
```

#### Import năm học từ Excel

```http
POST /api/admin/nam-hoc/import
```

### 4.5 Quản lý Học kỳ

#### Lấy danh sách học kỳ

```http
GET /api/admin/hoc-ky?page=1&per_page=10
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "ten_hoc_ky": "Học kỳ 1",
      "la_ky_hien_hanh": true,
      "nam_hoc": {
        "id": 1,
        "ten_nam_hoc": "2023-2024"
      }
    }
  ]
}
```

#### Tạo học kỳ mới

```http
POST /api/admin/hoc-ky
```

**Request Body:**
```json
{
  "ten_hoc_ky": "Học kỳ 2",
  "nam_hoc_id": 1,
  "la_ky_hien_hanh": false
}
```

#### Import học kỳ từ Excel

```http
POST /api/admin/hoc-ky/import
```

### 4.6 Quản lý Loại hoạt động

#### Lấy danh sách loại hoạt động

```http
GET /api/admin/loai-hoat-dong?page=1&per_page=10&search=giang
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "ten_loai": "Giảng dạy",
      "hoat_dong_chi_tiets": [
        {
          "id": 1,
          "ten_hoat_dong": "Giảng dạy lý thuyết"
        }
      ]
    }
  ]
}
```

#### Tạo loại hoạt động mới

```http
POST /api/admin/loai-hoat-dong
```

**Request Body:**
```json
{
  "ten_loai": "Nghiên cứu khoa học"
}
```

#### Import loại hoạt động từ Excel

```http
POST /api/admin/loai-hoat-dong/import
```

### 4.7 Quản lý Hoạt động chi tiết

#### Lấy danh sách hoạt động chi tiết

```http
GET /api/admin/hoat-dong-chi-tiet?page=1&per_page=10
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "ten_hoat_dong": "Giảng dạy lý thuyết",
      "don_vi_tinh": "Tiết",
      "loai_hoat_dong": {
        "id": 1,
        "ten_loai": "Giảng dạy"
      }
    }
  ]
}
```

#### Tạo hoạt động chi tiết mới

```http
POST /api/admin/hoat-dong-chi-tiet
```

**Request Body:**
```json
{
  "ten_hoat_dong": "Giảng dạy thực hành",
  "loai_hoat_dong_id": 1,
  "don_vi_tinh": "Tiết"
}
```

#### Import hoạt động chi tiết từ Excel

```http
POST /api/admin/hoat-dong-chi-tiet/import
```

### 4.8 Quản lý Thời gian kê khai

#### Lấy danh sách thời gian kê khai

```http
GET /api/admin/ke-khai-thoi-gian?hoc_ky_id=1&page=1&per_page=10
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "hoc_ky": {
        "id": 1,
        "ten_hoc_ky": "Học kỳ 1",
        "nam_hoc": {
          "ten_nam_hoc": "2023-2024"
        }
      },
      "thoi_gian_bat_dau": "2024-01-01",
      "thoi_gian_ket_thuc": "2024-01-31",
      "ghi_chu": "Thời gian kê khai học kỳ 1"
    }
  ]
}
```

#### Tạo thời gian kê khai mới

```http
POST /api/admin/ke-khai-thoi-gian
```

**Request Body:**
```json
{
  "hoc_ky_id": 1,
  "thoi_gian_bat_dau": "2024-01-01",
  "thoi_gian_ket_thuc": "2024-01-31",
  "ghi_chu": "Thời gian kê khai học kỳ 1"
}
```

#### Xem chi tiết thời gian kê khai

```http
GET /api/admin/ke-khai-thoi-gian/{id}
```

#### Cập nhật thời gian kê khai

```http
PUT /api/admin/ke-khai-thoi-gian/{id}
```

#### Xóa thời gian kê khai

```http
DELETE /api/admin/ke-khai-thoi-gian/{id}
```

### 4.9 Quản lý Định mức giờ chuẩn

#### Lấy danh sách định mức

```http
GET /api/admin/dinh-muc?nam_hoc_id=1&page=1&per_page=10
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "nam_hoc": {
        "id": 1,
        "ten_nam_hoc": "2023-2024"
      },
      "chuc_danh": {
        "id": 1,
        "ten_chuc_danh": "Giảng viên"
      },
      "tong_gio_chuan": 320.0,
      "phan_tram_gd_toi_thieu": 60.0,
      "ghi_chu": "Định mức cho giảng viên"
    }
  ]
}
```

#### Tạo định mức mới

```http
POST /api/admin/dinh-muc
```

**Request Body:**
```json
{
  "nam_hoc_id": 1,
  "chuc_danh_id": 1,
  "tong_gio_chuan": 320.0,
  "phan_tram_gd_toi_thieu": 60.0,
  "ghi_chu": "Định mức cho giảng viên"
}
```

#### Import định mức từ Excel

```http
POST /api/admin/dinh-muc/import
```

### 4.10 Quản lý Hệ số quy đổi

#### Lấy danh sách hệ số quy đổi

```http
GET /api/admin/he-so-quy-doi?nam_hoc_id=1&hoat_dong_chi_tiet_id=1&page=1&per_page=10
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "nam_hoc": {
        "id": 1,
        "ten_nam_hoc": "2023-2024"
      },
      "hoat_dong_chi_tiet": {
        "id": 1,
        "ten_hoat_dong": "Giảng dạy lý thuyết",
        "loai_hoat_dong": {
          "ten_loai": "Giảng dạy"
        }
      },
      "gia_tri_he_so": 1.2,
      "min_si_so": 20,
      "max_si_so": 50,
      "uu_tien": 0,
      "loai_gia_tri": 0
    }
  ]
}
```

#### Tạo hệ số quy đổi mới

```http
POST /api/admin/he-so-quy-doi
```

**Request Body:**
```json
{
  "nam_hoc_id": 1,
  "hoat_dong_chi_tiet_id": 1,
  "gia_tri_he_so": 1.2,
  "min_si_so": 20,
  "max_si_so": 50,
  "uu_tien": 0,
  "loai_gia_tri": 0,
  "ghi_chu": "Hệ số cho lớp 20-50 sinh viên"
}
```

### 4.11 Quản lý Chức danh

#### Lấy danh sách chức danh

```http
GET /api/admin/chuc-danh?page=1&per_page=10&search=giang
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "ten_chuc_danh": "Giảng viên",
      "mo_ta": "Chức danh giảng viên"
    }
  ]
}
```

### 4.12 Tính toán giờ chuẩn

```http
POST /api/admin/calculate-gio-chuan
```

**Request Body:**
```json
{
  "nam_hoc_id": 1,
  "hoat_dong_chi_tiet_id": 1,
  "so_luong": 45,
  "so_tin_chi": 3,
  "so_sinh_vien": 40,
  "vai_tro_tham_gia": "Tác giả chính"
}
```

**Response (200):**
```json
{
  "gio_chuan": 60.0,
  "he_so_ap_dung": {
    "he_so_nen": {
      "id": 1,
      "gia_tri_he_so": 1.2,
      "dieu_kien": "20-50 sinh viên"
    },
    "he_so_uu_tien": [],
    "he_so_tong_hop": 1.2
  },
  "don_vi_tinh": "Tiết",
  "cach_tinh": "Hệ số cố định",
  "ghi_chu": "Tính theo hệ số 1.2 cho lớp 20-50 sinh viên"
}
```

---

## 5. Appendix

### 5.1 Trạng thái kê khai

| Giá trị | Ý nghĩa |
|---------|---------|
| 0 | Bản nháp (Chưa nộp) |
| 1 | Chờ phê duyệt |
| 2 | Từ chối |
| 3 | Đã phê duyệt |

### 5.2 Vai trò người dùng

| Giá trị | Vai trò |
|---------|---------|
| 1 | Quản trị viên (Admin) |
| 2 | Quản lý (Manager) |
| 3 | Giảng viên (Lecturer) |

### 5.3 Loại giá trị hệ số

| Giá trị | Ý nghĩa |
|---------|---------|
| 0 | Hệ số nhân với số lượng |
| 1 | Giá trị cố định |

### 5.4 Ưu tiên hệ số

| Giá trị | Ý nghĩa |
|---------|---------|
| 0 | Hệ số nền (bắt buộc) |
| < 0 | Hệ số ưu tiên (cộng dồn) |

### 5.5 Định dạng file hỗ trợ

#### Import Excel
- **Định dạng**: .xlsx, .xls, .csv
- **Kích thước tối đa**: 2MB
- **Encoding**: UTF-8

#### Export
- **Excel**: .xlsx
- **PDF**: .pdf
- **ZIP**: .zip (cho báo cáo toàn diện)

### 5.6 Cấu trúc thư mục minh chứng

```
storage/app/public/minh_chung/
├── 2024/
│   ├── 01/
│   │   ├── abc123_file1.pdf
│   │   └── def456_file2.jpg
│   └── 02/
└── 2023/
```

### 5.7 Queue Jobs

Hệ thống sử dụng Laravel Queue để xử lý:
- **Gửi email**: Thông báo phê duyệt/từ chối
- **Export báo cáo**: Báo cáo lớn (>100 bản ghi)
- **Import dữ liệu**: Import file Excel

### 5.8 Rate Limiting

- **API calls**: 60 requests/phút cho mỗi user
- **Upload files**: 10 files/phút
- **Export**: 5 exports/phút

### 5.9 Validation Rules

#### Email
- Format: RFC 5322 compliant
- Unique: Trong bảng người dùng

#### Password
- Minimum: 8 ký tự
- Bao gồm: Chữ và số

#### File Upload
- **Minh chứng**: pdf, jpg, jpeg, png, doc, docx
- **Import**: xlsx, xls, csv
- **Size**: 10MB/file, 50MB tổng

### 5.10 Error Codes

#### Validation Errors (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Email đã tồn tại."],
    "password": ["Mật khẩu phải có ít nhất 8 ký tự."]
  }
}
```

#### Authentication Errors (401)
```json
{
  "message": "Unauthenticated"
}
```

#### Authorization Errors (403)
```json
{
  "message": "Không có quyền truy cập"
}
```

#### Not Found Errors (404)
```json
{
  "message": "Không tìm thấy tài nguyên"
}
```

#### Server Errors (500)
```json
{
  "message": "Lỗi server nội bộ"
}
```

---

## 📞 Hỗ trợ

- **Email**: support@workload-system.com
- **Documentation**: [https://docs.workload-system.com](https://docs.workload-system.com)
- **Version**: v1.0.0
- **Last Updated**: 2024-01-20

---

*© 2024 Workload Management System. All rights reserved.*
