import React, { useState } from "react";
import {
    Card,
    Typography,
    Tree,
    Button,
    Space,
    Divider,
    Tag,
    Collapse,
    Input,
    Row,
    Col,
    Tabs,
    Alert,
    Badge,
    Tooltip,
    Select,
    Anchor,
    BackTop,
    Table
} from 'antd';
import {
    ApiOutlined,
    BookOutlined,
    BranchesOutlined,
    LockOutlined,
    UnlockOutlined,
    UserOutlined,
    SettingOutlined,
    SearchOutlined,
    CopyOutlined,
    DownOutlined,
    RightOutlined,
    SafetyOutlined,
    TeamOutlined,
    DatabaseOutlined,
    FileTextOutlined,
    CodeOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    StopOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

function ApiDocument() {
    const [searchValue, setSearchValue] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const apiData = {
        overview: {
            title: "Tài liệu API - Hệ thống Quản lý Khối lượng Giảng dạy",
            version: "1.0.0",
            baseUrl: "/api",
            description: "Tài liệu API tổng hợp cho hệ thống"
        },
        auth: {
            title: "Xác thực",
            description: "Các API liên quan đến xác thực và phân quyền",
            endpoints: [
                {
                    method: "POST",
                    path: "/login",
                    name: "Đăng nhập",
                    description: "Xác thực người dùng và tạo token",
                    auth: false,
                    params: {
                        ma_can_bo: "string (required) - Mã cán bộ",
                        password: "string (required) - Mật khẩu"
                    },
                    response: {
                        success: "Token Bearer, thông tin user",
                        error: "Thông báo lỗi xác thực"
                    }
                },
                {
                    method: "POST",
                    path: "/logout",
                    name: "Đăng xuất",
                    description: "Hủy token hiện tại",
                    auth: true,
                    response: {
                        success: "Logout successful",
                        error: "Token không hợp lệ"
                    }
                },
                {
                    method: "POST",
                    path: "/forgot-password",
                    name: "Quên mật khẩu",
                    description: "Gửi link reset mật khẩu",
                    auth: false,
                    params: {
                        email: "string (required) - Email người dùng"
                    }
                },
                {
                    method: "POST",
                    path: "/reset-password",
                    name: "Đặt lại mật khẩu",
                    description: "Reset mật khẩu với token",
                    auth: false,
                    params: {
                        token: "string (required) - Token reset",
                        password: "string (required) - Mật khẩu mới",
                        password_confirmation: "string (required) - Xác nhận mật khẩu"
                    }
                },
                {
                    method: "GET",
                    path: "/auth/verify-role",
                    name: "Xác thực vai trò",
                    description: "Kiểm tra vai trò của user hiện tại",
                    auth: true,
                    response: {
                        success: "Thông tin vai trò user",
                        error: "Token không hợp lệ"
                    }
                }
            ]
        },
        admin: {
            title: "APIs Quản trị",
            description: "APIs dành cho quản trị viên (vai_tro = 1)",
            endpoints: [
                // User Management
                {
                    method: "GET",
                    path: "/admin/users",
                    name: "Danh sách người dùng",
                    description: "Lấy danh sách tất cả người dùng",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        page: "integer - Trang hiện tại",
                        per_page: "integer - Số item mỗi trang",
                        search: "string - Tìm kiếm theo tên, mã cán bộ",
                        vai_tro: "integer - Lọc theo vai trò",
                        khoa_id: "integer - Lọc theo khoa"
                    }
                },
                {
                    method: "POST",
                    path: "/admin/users",
                    name: "Tạo người dùng mới",
                    description: "Thêm người dùng mới vào hệ thống",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        ma_can_bo: "string (required) - Mã cán bộ",
                        ho_ten: "string (required) - Họ tên",
                        email: "string (required) - Email",
                        vai_tro: "integer (required) - Vai trò (1,2,3)",
                        bo_mon_id: "integer - ID bộ môn (nếu là GV/TBM)"
                    }
                },
                {
                    method: "PUT",
                    path: "/admin/users/{id}",
                    name: "Cập nhật người dùng",
                    description: "Cập nhật thông tin người dùng",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "DELETE",
                    path: "/admin/users/{id}",
                    name: "Xóa người dùng",
                    description: "Xóa người dùng khỏi hệ thống",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "POST",
                    path: "/admin/user/import",
                    name: "Import người dùng",
                    description: "Import danh sách người dùng từ file Excel",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        file: "file (required) - File Excel (.xlsx)"
                    }
                },
                // Khoa Management
                {
                    method: "GET",
                    path: "/admin/khoa",
                    name: "Danh sách khoa",
                    description: "Lấy danh sách tất cả khoa",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "POST",
                    path: "/admin/khoa",
                    name: "Tạo khoa mới",
                    description: "Thêm khoa mới",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        ma_khoa: "string (required) - Mã khoa",
                        ten_khoa: "string (required) - Tên khoa"
                    }
                },
                {
                    method: "PUT",
                    path: "/admin/khoa/{id}",
                    name: "Cập nhật khoa",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "DELETE",
                    path: "/admin/khoa/{id}",
                    name: "Xóa khoa",
                    auth: true,
                    role: "Quản trị"
                },
                // Bộ môn Management
                {
                    method: "GET",
                    path: "/admin/bo-mon",
                    name: "Danh sách bộ môn",
                    description: "Lấy danh sách tất cả bộ môn",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        khoa_id: "integer - Lọc theo khoa"
                    }
                },
                {
                    method: "POST",
                    path: "/admin/bo-mon",
                    name: "Tạo bộ môn mới",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        ma_bo_mon: "string (required) - Mã bộ môn",
                        ten_bo_mon: "string (required) - Tên bộ môn",
                        khoa_id: "integer (required) - ID khoa"
                    }
                },
                {
                    method: "PUT",
                    path: "/admin/bo-mon/{id}",
                    name: "Cập nhật bộ môn",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "DELETE",
                    path: "/admin/bo-mon/{id}",
                    name: "Xóa bộ môn",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "POST",
                    path: "/admin/bo-mon/import",
                    name: "Import bộ môn",
                    auth: true,
                    role: "Quản trị"
                },
                // Năm học Management
                {
                    method: "GET",
                    path: "/admin/nam-hoc",
                    name: "Danh sách năm học",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "POST",
                    path: "/admin/nam-hoc",
                    name: "Tạo năm học mới",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        ten_nam_hoc: "string (required) - Tên năm học (VD: 2023-2024)",
                        nam_bat_dau: "integer (required) - Năm bắt đầu",
                        nam_ket_thuc: "integer (required) - Năm kết thúc",
                        is_active: "boolean - Có phải năm học hiện tại"
                    }
                },
                {
                    method: "PUT",
                    path: "/admin/nam-hoc/{id}",
                    name: "Cập nhật năm học",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "DELETE",
                    path: "/admin/nam-hoc/{id}",
                    name: "Xóa năm học",
                    auth: true,
                    role: "Quản trị"
                },
                // Học kỳ Management
                {
                    method: "GET",
                    path: "/admin/hoc-ky",
                    name: "Danh sách học kỳ",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "POST",
                    path: "/admin/hoc-ky",
                    name: "Tạo học kỳ mới",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        ten_hoc_ky: "string (required) - Tên học kỳ",
                        nam_hoc_id: "integer (required) - ID năm học",
                        ngay_bat_dau: "date (required) - Ngày bắt đầu",
                        ngay_ket_thuc: "date (required) - Ngày kết thúc"
                    }
                },
                {
                    method: "PUT",
                    path: "/admin/hoc-ky/{id}",
                    name: "Cập nhật học kỳ",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "DELETE",
                    path: "/admin/hoc-ky/{id}",
                    name: "Xóa học kỳ",
                    auth: true,
                    role: "Quản trị"
                },
                // Thời gian kê khai
                {
                    method: "GET",
                    path: "/admin/ke-khai-thoi-gian",
                    name: "Danh sách thời gian kê khai",
                    description: "Lấy danh sách các đợt kê khai",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "POST",
                    path: "/admin/ke-khai-thoi-gian",
                    name: "Tạo đợt kê khai mới",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        ten_dot_ke_khai: "string (required) - Tên đợt kê khai",
                        nam_hoc_id: "integer (required) - ID năm học",
                        ngay_bat_dau: "date (required) - Ngày bắt đầu kê khai",
                        ngay_ket_thuc: "date (required) - Ngày kết thúc kê khai",
                        mo_ta: "text - Mô tả"
                    }
                },
                {
                    method: "GET",
                    path: "/admin/ke-khai-thoi-gian/{id}",
                    name: "Chi tiết đợt kê khai",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "PUT",
                    path: "/admin/ke-khai-thoi-gian/{id}",
                    name: "Cập nhật đợt kê khai",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "DELETE",
                    path: "/admin/ke-khai-thoi-gian/{id}",
                    name: "Xóa đợt kê khai",
                    auth: true,
                    role: "Quản trị"
                },
                // Định mức cá nhân
                {
                    method: "GET",
                    path: "/admin/dinh-muc-ca-nhan",
                    name: "Danh sách định mức cá nhân",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "POST",
                    path: "/admin/dinh-muc-ca-nhan",
                    name: "Tạo định mức cá nhân",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        can_bo_id: "integer (required) - ID cán bộ",
                        nam_hoc_id: "integer (required) - ID năm học",
                        dinh_muc_giang_day: "decimal (required) - Định mức giảng dạy",
                        dinh_muc_nckh: "decimal (required) - Định mức NCKH",
                        dinh_muc_cong_tac_khac: "decimal (required) - Định mức công tác khác"
                    }
                },
                // Hệ số chung
                {
                    method: "GET",
                    path: "/admin/dm-he-so-chung",
                    name: "Danh mục hệ số chung",
                    description: "Quản lý hệ số cho HD LA, LV, DAKL",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "POST",
                    path: "/admin/dm-he-so-chung",
                    name: "Tạo hệ số chung mới",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        ten_he_so: "string (required) - Tên hệ số",
                        gia_tri: "decimal (required) - Giá trị hệ số",
                        mo_ta: "text - Mô tả",
                        loai: "string (required) - Loại (HD_LA, HD_LV, DAKL)"
                    }
                },
                // Miễn giảm định mức
                {
                    method: "GET",
                    path: "/admin/mien-giam-dinh-muc",
                    name: "Danh sách miễn giảm định mức",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "POST",
                    path: "/admin/mien-giam-dinh-muc",
                    name: "Tạo miễn giảm định mức",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        can_bo_id: "integer (required) - ID cán bộ",
                        nam_hoc_id: "integer (required) - ID năm học",
                        loai_mien_giam: "string (required) - Loại miễn giảm",
                        gio_mien_giam: "decimal (required) - Số giờ được miễn giảm",
                        ly_do: "text (required) - Lý do miễn giảm"
                    }
                },
                // Lương giảng viên
                {
                    method: "GET",
                    path: "/admin/luong-giang-vien",
                    name: "Danh sách lương giảng viên",
                    auth: true,
                    role: "Quản trị"
                },
                {
                    method: "POST",
                    path: "/admin/luong-giang-vien",
                    name: "Cập nhật lương giảng viên",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        can_bo_id: "integer (required) - ID cán bộ",
                        nam_hoc_id: "integer (required) - ID năm học",
                        luong_co_ban: "decimal (required) - Lương cơ bản",
                        phu_cap: "decimal - Phụ cấp",
                        he_so_luong: "decimal (required) - Hệ số lương"
                    }
                },
                // Logs
                {
                    method: "GET",
                    path: "/admin/logs",
                    name: "Nhật ký hệ thống",
                    description: "Xem nhật ký hoạt động của admin",
                    auth: true,
                    role: "Quản trị",
                    params: {
                        page: "integer - Trang",
                        per_page: "integer - Số item mỗi trang",
                        action: "string - Lọc theo hành động",
                        date_from: "date - Từ ngày",
                        date_to: "date - Đến ngày"
                    }
                },
                {
                    method: "GET",
                    path: "/admin/logs/stats",
                    name: "Thống kê log",
                    description: "Thống kê hoạt động admin",
                    auth: true,
                    role: "Quản trị"
                }
            ]
        },
        manager: {
            title: "APIs Trưởng bộ môn",
            description: "APIs dành cho trưởng bộ môn (vai_tro = 2)",
            endpoints: [
                {
                    method: "GET",
                    path: "/manager/profile",
                    name: "Thông tin cá nhân",
                    description: "Lấy thông tin profile của trưởng bộ môn",
                    auth: true,
                    role: "Trưởng BM"
                },
                {
                    method: "GET",
                    path: "/manager/ke-khai",
                    name: "Danh sách kê khai cần duyệt",
                    description: "Lấy danh sách kê khai của giảng viên trong bộ môn",
                    auth: true,
                    role: "Trưởng BM",
                    params: {
                        nam_hoc_id: "integer - Lọc theo năm học",
                        trang_thai: "string - Lọc theo trạng thái",
                        can_bo_id: "integer - Lọc theo giảng viên"
                    }
                },
                {
                    method: "GET",
                    path: "/manager/ke-khai/{id}",
                    name: "Chi tiết kê khai",
                    description: "Xem chi tiết kê khai để duyệt",
                    auth: true,
                    role: "Trưởng BM"
                },
                {
                    method: "POST",
                    path: "/manager/ke-khai/{id}/approve",
                    name: "Duyệt kê khai",
                    description: "Phê duyệt kê khai của giảng viên",
                    auth: true,
                    role: "Trưởng BM",
                    params: {
                        ghi_chu: "text - Ghi chú khi duyệt"
                    }
                },
                {
                    method: "POST",
                    path: "/manager/ke-khai/{id}/reject",
                    name: "Từ chối kê khai",
                    description: "Từ chối kê khai của giảng viên",
                    auth: true,
                    role: "Trưởng BM",
                    params: {
                        ly_do_tu_choi: "text (required) - Lý do từ chối"
                    }
                },
                {
                    method: "POST",
                    path: "/manager/ke-khai/{id}/recalculate-before-approve",
                    name: "Tính toán lại trước khi duyệt",
                    description: "Tính toán lại khối lượng trước khi phê duyệt",
                    auth: true,
                    role: "Trưởng BM"
                },
                {
                    method: "GET",
                    path: "/manager/statistics",
                    name: "Thống kê bộ môn",
                    description: "Thống kê khối lượng của bộ môn",
                    auth: true,
                    role: "Trưởng BM",
                    params: {
                        nam_hoc_id: "integer - Năm học cần thống kê"
                    }
                },
                {
                    method: "GET",
                    path: "/manager/export-report",
                    name: "Xuất báo cáo",
                    description: "Xuất báo cáo khối lượng bộ môn",
                    auth: true,
                    role: "Trưởng BM",
                    params: {
                        nam_hoc_id: "integer (required) - Năm học",
                        format: "string - Định dạng file (excel, pdf)"
                    }
                },
                {
                    method: "POST",
                    path: "/manager/notifications/send",
                    name: "Gửi thông báo",
                    description: "Gửi thông báo cho giảng viên trong bộ môn",
                    auth: true,
                    role: "Trưởng BM",
                    params: {
                        can_bo_ids: "array - Danh sách ID cán bộ",
                        tieu_de: "string (required) - Tiêu đề thông báo",
                        noi_dung: "text (required) - Nội dung thông báo"
                    }
                },
                {
                    method: "GET",
                    path: "/manager/nam-hoc-list",
                    name: "Danh sách năm học",
                    description: "Lấy danh sách năm học để filter",
                    auth: true,
                    role: "Trưởng BM"
                },
                {
                    method: "GET",
                    path: "/manager/bo-mon-list",
                    name: "Thông tin bộ môn",
                    description: "Lấy thông tin bộ môn đang quản lý",
                    auth: true,
                    role: "Trưởng BM"
                }
            ]
        },
        lecturer: {
            title: "APIs Giảng viên",
            description: "APIs dành cho giảng viên (vai_tro = 3)",
            endpoints: [
                {
                    method: "GET",
                    path: "/lecturer/profile",
                    name: "Thông tin cá nhân",
                    description: "Lấy thông tin profile của giảng viên",
                    auth: true,
                    role: "Giảng viên"
                },
                {
                    method: "PUT",
                    path: "/lecturer/profile/phone",
                    name: "Cập nhật số điện thoại",
                    description: "Cập nhật số điện thoại cá nhân",
                    auth: true,
                    role: "Giảng viên",
                    params: {
                        dien_thoai: "string (required) - Số điện thoại mới"
                    }
                },
                {
                    method: "GET",
                    path: "/lecturer/nam-hoc",
                    name: "Danh sách năm học",
                    description: "Lấy danh sách năm học để kê khai",
                    auth: true,
                    role: "Giảng viên"
                },
                {
                    method: "GET",
                    path: "/lecturer/ke-khai-thoi-gian",
                    name: "Thời gian kê khai",
                    description: "Lấy danh sách các đợt kê khai",
                    auth: true,
                    role: "Giảng viên"
                },
                {
                    method: "GET",
                    path: "/lecturer/dm-he-so-chung",
                    name: "Danh mục hệ số chung",
                    description: "Lấy danh mục hệ số HD LA, LV, DAKL",
                    auth: true,
                    role: "Giảng viên"
                },
                // Kê khai tổng hợp
                {
                    method: "POST",
                    path: "/lecturer/ke-khai-tong-hop-nam-hoc/start",
                    name: "Bắt đầu/Lấy kê khai tổng hợp",
                    description: "Bắt đầu hoặc lấy bản kê khai tổng hợp theo năm học",
                    auth: true,
                    role: "Giảng viên",
                    params: {
                        nam_hoc_id: "integer (required) - ID năm học"
                    }
                },
                {
                    method: "PUT",
                    path: "/lecturer/ke-khai-tong-hop-nam-hoc/{id}/update-dinhmuc",
                    name: "Cập nhật định mức áp dụng",
                    description: "Cập nhật định mức cho kê khai tổng hợp",
                    auth: true,
                    role: "Giảng viên",
                    params: {
                        dinh_muc_id: "integer (required) - ID định mức áp dụng"
                    }
                },
                {
                    method: "POST",
                    path: "/lecturer/ke-khai-tong-hop-nam-hoc/{id}/submit",
                    name: "Nộp kê khai tổng hợp",
                    description: "Nộp bản kê khai tổng hợp để chờ duyệt",
                    auth: true,
                    role: "Giảng viên"
                },
                {
                    method: "DELETE",
                    path: "/lecturer/ke-khai-tong-hop-nam-hoc/{id}",
                    name: "Xóa kê khai tổng hợp",
                    description: "Xóa bản kê khai nếu được phép",
                    auth: true,
                    role: "Giảng viên"
                },
                // Kê khai chi tiết
                {
                    method: "POST",
                    path: "/lecturer/kekhai-chi-tiet/batch-save",
                    name: "Lưu chi tiết kê khai hàng loạt",
                    description: "Lưu tất cả chi tiết kê khai (giảng dạy, NCKH, công tác khác)",
                    auth: true,
                    role: "Giảng viên",
                    params: {
                        ke_khai_tong_hop_id: "integer (required) - ID kê khai tổng hợp",
                        chi_tiet_data: "object (required) - Dữ liệu chi tiết các loại kê khai"
                    }
                },
                {
                    method: "GET",
                    path: "/lecturer/kekhai-chi-tiet",
                    name: "Lấy chi tiết kê khai",
                    description: "Lấy tất cả chi tiết kê khai để chỉnh sửa",
                    auth: true,
                    role: "Giảng viên",
                    params: {
                        ke_khai_tong_hop_id: "integer (required) - ID kê khai tổng hợp"
                    }
                },
                // Danh sách kê khai
                {
                    method: "GET",
                    path: "/lecturer/ke-khai-nam-hoc",
                    name: "Danh sách kê khai theo năm",
                    description: "Lấy danh sách các bản kê khai đã tạo",
                    auth: true,
                    role: "Giảng viên",
                    params: {
                        nam_hoc_id: "integer - Lọc theo năm học",
                        trang_thai: "string - Lọc theo trạng thái"
                    }
                },
                {
                    method: "GET",
                    path: "/lecturer/ke-khai-nam-hoc/{id}",
                    name: "Chi tiết kê khai",
                    description: "Xem chi tiết một bản kê khai đã tính toán",
                    auth: true,
                    role: "Giảng viên"
                },
                // Thống kê cá nhân
                {
                    method: "GET",
                    path: "/lecturer/statistics/overview",
                    name: "Tổng quan thống kê cá nhân",
                    description: "Thống kê tổng quan khối lượng của giảng viên",
                    auth: true,
                    role: "Giảng viên",
                    params: {
                        nam_hoc_id: "integer - Năm học cần thống kê"
                    }
                },
                {
                    method: "GET",
                    path: "/lecturer/statistics/yearly-detail",
                    name: "Chi tiết thống kê theo năm",
                    description: "Thống kê chi tiết theo từng năm học",
                    auth: true,
                    role: "Giảng viên",
                    params: {
                        nam_hoc_id: "integer (required) - Năm học",
                        loai_thong_ke: "string - Loại thống kê (giang_day, nckh, cong_tac_khac)"
                    }
                }
            ]
        }
    };

    const getMethodColor = (method) => {
        const colors = {
            'GET': 'blue',
            'POST': 'green',
            'PUT': 'orange',
            'DELETE': 'red',
            'PATCH': 'purple'
        };
        return colors[method] || 'default';
    };

    const filterEndpoints = (endpoints) => {
        if (!searchValue) return endpoints;
        return endpoints.filter(endpoint =>
            endpoint.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            endpoint.path.toLowerCase().includes(searchValue.toLowerCase()) ||
            endpoint.description?.toLowerCase().includes(searchValue.toLowerCase())
        );
    };

    const renderEndpointDetail = (endpoint) => (
        <Card className="mb-4" key={`${endpoint.method}-${endpoint.path}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Tag color={getMethodColor(endpoint.method)} className="font-mono font-bold">
                        {endpoint.method}
                    </Tag>
                    <Text code className="text-base">{endpoint.path}</Text>
                </div>
                <div className="flex items-center gap-2">
                    {endpoint.auth && (
                        <Tooltip title="Yêu cầu xác thực">
                            <Tag color="red" icon={<LockOutlined />}>
                                Xác thực
                            </Tag>
                        </Tooltip>
                    )}
                    {endpoint.role && (
                        <Tag color="purple">
                            {endpoint.role}
                        </Tag>
                    )}
                </div>
            </div>
            
            <Title level={5} className="mb-2">{endpoint.name}</Title>
            {endpoint.description && (
                <Paragraph className="mb-3 text-gray-600">
                    {endpoint.description}
                </Paragraph>
            )}                {endpoint.params && (
                <div className="mb-3">
                    <Text strong>Tham số:</Text>
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                        {typeof endpoint.params === 'object' ? (
                            Object.entries(endpoint.params).map(([key, value]) => (
                                <div key={key} className="mb-1">
                                    <Text code>{key}</Text>: <Text type="secondary">{value}</Text>
                                </div>
                            ))
                        ) : (
                            <Text type="secondary">{endpoint.params}</Text>
                        )}
                    </div>
                </div>
            )}

            {endpoint.response && (
                <div>
                    <Text strong>Phản hồi:</Text>
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                        {typeof endpoint.response === 'object' ? (
                            Object.entries(endpoint.response).map(([key, value]) => (
                                <div key={key} className="mb-1">
                                    <Tag color={key === 'success' ? 'green' : 'red'}>{key}</Tag>
                                    <Text type="secondary">{value}</Text>
                                </div>
                            ))
                        ) : (
                            <Text type="secondary">{endpoint.response}</Text>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );

    const apiStats = [
        {
            title: 'Tổng số API',
            value: Object.values(apiData).slice(1).reduce((total, section) => 
                total + (section.endpoints?.length || 0), 0),
            icon: <ApiOutlined className="text-blue-500" />
        },
        {
            title: 'APIs Xác thực',
            value: apiData.auth.endpoints.length,
            icon: <SafetyOutlined className="text-green-500" />
        },
        {
            title: 'APIs Quản trị',
            value: apiData.admin.endpoints.length,
            icon: <SettingOutlined className="text-purple-500" />
        },
        {
            title: 'Số vai trò',
            value: 3,
            icon: <TeamOutlined className="text-orange-500" />
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-8 space-y-6">
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <ApiOutlined className="text-2xl text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-md"></div>
                            </div>
                            <div className="space-y-2">
                                <Title level={2} style={{ margin: 0 }} className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                    Tài liệu API
                                </Title>
                                <Text className="text-gray-500 block">
                                    {apiData.overview.description}
                                </Text>
                                <div className="flex items-center gap-4">
                                    <Tag color="blue">Phiên bản {apiData.overview.version}</Tag>
                                    <Tag color="green">Base URL: {apiData.overview.baseUrl}</Tag>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <Search
                                placeholder="Tìm kiếm endpoint..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                style={{ width: 300 }}
                                className="mb-4"
                            />
                        </div>
                    </div>
                </Card>

                <Row gutter={[24, 24]}>
                    {apiStats.map((stat, index) => (
                        <Col xs={24} sm={12} lg={6} key={index}>
                            <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300" style={{ borderRadius: '12px' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Text className="text-gray-500 text-sm">{stat.title}</Text>
                                        <Title level={3} style={{ margin: 0 }} className="text-gray-800">
                                            {stat.value}
                                        </Title>
                                    </div>
                                    <div className="text-2xl">
                                        {stat.icon}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row gutter={[24, 24]}>
                    {/* <Col xs={24} lg={6}>
                        <Card 
                            title={
                                <div className="flex items-center gap-2">
                                    <BranchesOutlined />
                                    <span>Điều hướng API</span>
                                </div>
                            }
                            className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl sticky top-8" 
                            style={{ borderRadius: '16px', maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
                        >
                            <Tree
                                showIcon
                                defaultExpandedKeys={expandedKeys}
                                treeData={treeData}
                                onSelect={(keys, info) => {
                                    if (info.node.key && !info.node.key.includes('-')) {
                                        setActiveTab(info.node.key);
                                    }
                                }}
                            />
                        </Card>
                    </Col> */}

                    <Col xs={24} lg={24}>
                        <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                            <Tabs 
                                activeKey={activeTab} 
                                onChange={setActiveTab}
                                size="large"
                                type="line"
                            >
                                <TabPane 
                                    tab={
                                        <span className="flex items-center gap-2 p-2">
                                            <InfoCircleOutlined />
                                            Tổng quan
                                        </span>
                                    } 
                                    key="overview"
                                >
                                    <div className="space-y-6">
                                        <Alert
                                            message="Tổng quan API"
                                            description="Tài liệu API tổng hợp cho hệ thống quản lý khối lượng giảng dạy. Hệ thống sử dụng Laravel Sanctum để xác thực và phân quyền."
                                            type="info"
                                            showIcon
                                            className="mb-6"
                                        />

                                        <Card title="Xác thực" size="small" className="mb-4">
                                            <Paragraph>
                                                Hệ thống sử dụng <Text strong>Bearer Token</Text> để xác thực. Sau khi đăng nhập thành công, 
                                                token sẽ được trả về và cần được gửi kèm trong header:
                                            </Paragraph>
                                            <div className="bg-gray-50 p-3 rounded-lg font-mono">
                                                Authorization: Bearer YOUR_TOKEN_HERE
                                            </div>
                                        </Card>

                                        <Card title="Vai trò người dùng" size="small" className="mb-4">
                                            <Row gutter={[16, 16]}>
                                                <Col span={8}>
                                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                                        <SettingOutlined className="text-2xl text-red-500 mb-2" />
                                                        <Title level={5}>Quản trị (1)</Title>
                                                        <Text>Quản trị viên hệ thống</Text>
                                                    </div>
                                                </Col>
                                                <Col span={8}>
                                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                        <TeamOutlined className="text-2xl text-blue-500 mb-2" />
                                                        <Title level={5}>Trưởng bộ môn (2)</Title>
                                                        <Text>Trưởng bộ môn</Text>
                                                    </div>
                                                </Col>
                                                <Col span={8}>
                                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                                        <UserOutlined className="text-2xl text-green-500 mb-2" />
                                                        <Title level={5}>Giảng viên (3)</Title>
                                                        <Text>Giảng viên</Text>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Card title="Định dạng Response" size="small">
                                            <Paragraph>Tất cả API response đều có format chuẩn:</Paragraph>
                                            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                                                {`{
  "success": true/false,
  "message": "Response message",
  "data": {...}, // Response data
  "errors": {...} // Validation errors (if any)
}`}
                                            </div>
                                        </Card>
                                    </div>
                                </TabPane>

                                <TabPane 
                                    tab={
                                        <span className="flex items-center gap-2 p-2">
                                            <SafetyOutlined />
                                            Xác thực
                                            <Badge count={apiData.auth.endpoints.length} size="small" />
                                        </span>
                                    } 
                                    key="auth"
                                >
                                    <div className="space-y-4">
                                        <Alert
                                            message={apiData.auth.title}
                                            description={apiData.auth.description}
                                            type="info"
                                            showIcon
                                            className="mb-6"
                                        />
                                        {filterEndpoints(apiData.auth.endpoints).map(endpoint => renderEndpointDetail(endpoint))}
                                    </div>
                                </TabPane>

                                <TabPane 
                                    tab={
                                        <span className="flex items-center gap-2 p-2">
                                            <SettingOutlined />
                                            Quản trị
                                            <Badge count={apiData.admin.endpoints.length} size="small" />
                                        </span>
                                    } 
                                    key="admin"
                                >
                                    <div className="space-y-4">
                                        <Alert
                                            message={apiData.admin.title}
                                            description={apiData.admin.description}
                                            type="warning"
                                            showIcon
                                            className="mb-6"
                                        />
                                        {filterEndpoints(apiData.admin.endpoints).map(endpoint => renderEndpointDetail(endpoint))}
                                    </div>
                                </TabPane>

                                <TabPane 
                                    tab={
                                        <span className="flex items-center gap-2 p-2">
                                            <TeamOutlined />
                                            Trưởng BM
                                            <Badge count={apiData.manager.endpoints.length} size="small" />
                                        </span>
                                    } 
                                    key="manager"
                                >
                                    <div className="space-y-4">
                                        <Alert
                                            message={apiData.manager.title}
                                            description={apiData.manager.description}
                                            type="info"
                                            showIcon
                                            className="mb-6"
                                        />
                                        {filterEndpoints(apiData.manager.endpoints).map(endpoint => renderEndpointDetail(endpoint))}
                                    </div>
                                </TabPane>

                                <TabPane 
                                    tab={
                                        <span className="flex items-center gap-2 p-2">
                                            <UserOutlined />
                                            Giảng viên
                                            <Badge count={apiData.lecturer.endpoints.length} size="small" />
                                        </span>
                                    } 
                                    key="lecturer"
                                >
                                    <div className="space-y-4">
                                        <Alert
                                            message={apiData.lecturer.title}
                                            description={apiData.lecturer.description}
                                            type="success"
                                            showIcon
                                            className="mb-6"
                                        />
                                        {filterEndpoints(apiData.lecturer.endpoints).map(endpoint => renderEndpointDetail(endpoint))}
                                    </div>
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>
                </Row>
            </div>
            <style jsx>{`
                .ant-tree .ant-tree-node-content-wrapper {
                    padding: 8px 12px;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }
                
                .ant-tree .ant-tree-node-content-wrapper:hover {
                    background-color: rgba(59, 130, 246, 0.1);
                }
                
                .ant-tree .ant-tree-node-selected .ant-tree-node-content-wrapper {
                    background-color: rgba(59, 130, 246, 0.15);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                }
                
                .ant-tabs-tab {
                    border-radius: 8px !important;
                    margin-right: 8px !important;
                    font-weight: 500 !important;
                }
                
                .ant-tabs-tab-active {
                    background: rgba(59, 130, 246, 0.1) !important;
                }
                
                .ant-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                .ant-card:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
                }
            `}</style>
        </div>
    );
}

export default ApiDocument;
