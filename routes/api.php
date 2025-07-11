<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ManagerController;
use App\Http\Controllers\Api\LecturerController;


// ROUTES CÔNG KHAI (KHÔNG CẦN ĐĂNG NHẬP) 
Route::post('/login', [AuthController::class, 'login']); 
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']); 

// Xác thực vai trò người dùng (yêu cầu đăng nhập)
Route::middleware('auth:sanctum')->get('/auth/verify-role', [AuthController::class, 'verifyRole']);

// ROUTES YÊU CẦU ĐĂNG NHẬ
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // ROUTES DÀNH CHO ADMIN (vai_tro = 1)
    Route::middleware('role:1')->prefix('admin')->group(function () {
        Route::get('/profile', [AdminController::class, 'getProfile']); 

        Route::get('/users', [AdminController::class, 'getUsers']); 
        Route::post('/users', [AdminController::class, 'createUser']); 
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']); 
        Route::post('/user/import', [AdminController::class, 'importUsers']);

        Route::get('/khoa', [AdminController::class, 'getKhoa']); 
        Route::post('/khoa', [AdminController::class, 'createKhoa']); 
        Route::put('/khoa/{id}', [AdminController::class, 'updateKhoa']); 
        Route::delete('/khoa/{id}', [AdminController::class, 'deleteKhoa']);

        Route::get('/bo-mon', [AdminController::class, 'getBoMon']);
        Route::post('/bo-mon', [AdminController::class, 'createBoMon']); 
        Route::put('/bo-mon/{id}', [AdminController::class, 'updateBoMon']); 
        Route::delete('/bo-mon/{id}', [AdminController::class, 'deleteBoMon']); 
        Route::post('/bo-mon/import', [AdminController::class, 'importBoMon']);

        Route::get('/nam-hoc', [AdminController::class, 'getNamHoc']);
        Route::post('/nam-hoc', [AdminController::class, 'createNamHoc']);
        Route::put('/nam-hoc/{id}', [AdminController::class, 'updateNamHoc']);
        Route::delete('/nam-hoc/{id}', [AdminController::class, 'deleteNamHoc']);
        Route::post('/nam-hoc/import', [AdminController::class, 'importNamHoc']);

        Route::get('/hoc-ky', [AdminController::class, 'getHocKy']); 
        Route::post('/hoc-ky', [AdminController::class, 'createHocKy']);
        Route::put('/hoc-ky/{id}', [AdminController::class, 'updateHocKy']);
        Route::delete('/hoc-ky/{id}', [AdminController::class, 'deleteHocKy']);

        Route::get('/ke-khai-thoi-gian', [AdminController::class, 'getKeKhaiThoiGian']); 
        Route::post('/ke-khai-thoi-gian', [AdminController::class, 'createKeKhaiThoiGian']); 
        Route::get('/ke-khai-thoi-gian/{id}', [AdminController::class, 'getKeKhaiThoiGianById']); 
        Route::put('/ke-khai-thoi-gian/{id}', [AdminController::class, 'updateKeKhaiThoiGian']); 
        Route::delete('/ke-khai-thoi-gian/{id}', [AdminController::class, 'deleteKeKhaiThoiGian']); 
        Route::post('/ke-khai-thoi-gian/import', [AdminController::class, 'importKeKhaiThoiGian']);

        Route::get('/dinh-muc-ca-nhan', [AdminController::class, 'getDinhMucCaNhan']); 
        Route::post('/dinh-muc-ca-nhan', [AdminController::class, 'createDinhMucCaNhan']); 
        Route::put('/dinh-muc-ca-nhan/{id}', [AdminController::class, 'updateDinhMucCaNhan']); 
        Route::delete('/dinh-muc-ca-nhan/{id}', [AdminController::class, 'deleteDinhMucCaNhan']); 
        Route::post('/dinh-muc-ca-nhan/import', [AdminController::class, 'importDinhMucCaNhan']);

        Route::get('/dm-he-so-chung', [AdminController::class, 'getDmHeSoChung']); 
        Route::post('/dm-he-so-chung', [AdminController::class, 'createDmHeSoChung']); 
        Route::put('/dm-he-so-chung/{id}', [AdminController::class, 'updateDmHeSoChung']); 
        Route::delete('/dm-he-so-chung/{id}', [AdminController::class, 'deleteDmHeSoChung']);
        Route::post('/dm-he-so-chung/import', [AdminController::class, 'importDmHeSoChung']);

        Route::get('/mien-giam-dinh-muc', [AdminController::class, 'getMienGiamDinhMuc']); 
        Route::post('/mien-giam-dinh-muc', [AdminController::class, 'createMienGiamDinhMuc']);
        Route::put('/mien-giam-dinh-muc/{id}', [AdminController::class, 'updateMienGiamDinhMuc']);
        Route::delete('/mien-giam-dinh-muc/{id}', [AdminController::class, 'deleteMienGiamDinhMuc']);
        Route::post('/mien-giam-dinh-muc/import', [AdminController::class, 'importMienGiamDinhMuc']);

        Route::get('/luong-giang-vien', [AdminController::class, 'getLuongGiangVien']);
        Route::post('/luong-giang-vien', [AdminController::class, 'createLuongGiangVien']);
        Route::put('/luong-giang-vien/{id}', [AdminController::class, 'updateLuongGiangVien']);
        Route::delete('/luong-giang-vien/{id}', [AdminController::class, 'deleteLuongGiangVien']);
        Route::post('/luong-giang-vien/import', [AdminController::class, 'importLuongGiangVien']);

        Route::get('/logs', [AdminController::class, 'getAdminLogs']);
        Route::get('/logs/stats', [AdminController::class, 'getAdminLogStats']);
    });

    // ROUTES DÀNH CHO MANAGER - TRƯỞNG BỘ MÔN (vai_tro = 2)
    Route::middleware('role:2')->prefix('manager')->group(function () {
        Route::get('/profile', [ManagerController::class, 'getProfile']);

        // Quản lý Kê khai của giảng viên
        Route::get('/ke-khai', [ManagerController::class, 'keKhaiList']); // Danh sách kê khai cần duyệt theo năm học
        Route::get('/ke-khai/{id}', [ManagerController::class, 'keKhaiShow']); // Chi tiết kê khai để duyệt
        Route::post('/ke-khai/{id}/approve', [ManagerController::class, 'keKhaiApprove']);
        Route::post('/ke-khai/{id}/reject', [ManagerController::class, 'keKhaiReject']);
        Route::post('/ke-khai/{id}/recalculate-before-approve', [ManagerController::class, 'recalculateBeforeApprove']);

        // Thống kê và báo cáo
        Route::get('/statistics', [ManagerController::class, 'statistics']);
        Route::get('/export-report', [ManagerController::class, 'exportReport']);

        Route::post('/notifications/send', [ManagerController::class, 'sendNotification']);

        Route::get('/nam-hoc-list', [ManagerController::class, 'getNamHocList']);
        Route::get('/bo-mon-list', [ManagerController::class, 'boMonList']);
    });

    // ROUTES DÀNH CHO LECTURER - GIẢNG VIÊN (vai_tro = 3)
    Route::middleware('role:3')->prefix('lecturer')->group(function () {
        Route::get('/profile', [LecturerController::class, 'getProfile']);
        Route::put('/profile/phone', [LecturerController::class, 'updatePhone']);

        Route::get('/nam-hoc', [LecturerController::class, 'getNamHoc']);
        Route::get('/ke-khai-thoi-gian', [LecturerController::class, 'getKeKhaiThoiGian']);
        Route::get('/dm-he-so-chung', [LecturerController::class, 'getDmHeSoChung']); // Danh mục hệ số chung (HD LA,LV,DAKL)

        // Quản lý Kê khai tổng hợp theo năm học
        Route::post('/ke-khai-tong-hop-nam-hoc/start', [LecturerController::class, 'startOrGetKeKhaiTongHopNamHoc']); // Bắt đầu/lấy bản kê khai tổng hợp
        Route::put('/ke-khai-tong-hop-nam-hoc/{id}/update-dinhmuc', [LecturerController::class, 'updateDinhMucKeKhaiTongHop']); // Cập nhật định mức áp dụng
        Route::post('/ke-khai-tong-hop-nam-hoc/{id}/submit', [LecturerController::class, 'submitKeKhaiTongHopNamHoc']); // Nộp bản kê khai tổng hợp
        Route::delete('/ke-khai-tong-hop-nam-hoc/{id}', [LecturerController::class, 'deleteKeKhaiTongHopNamHoc']); // Xóa bản kê khai (nếu cho phép)

        Route::post('/kekhai-chi-tiet/batch-save', [LecturerController::class, 'storeKekhaiChiTietBatch']); // Lưu tất cả chi tiết kê khai (giảng dạy, NCKH, công tác khác)
        Route::get('/kekhai-chi-tiet', [LecturerController::class, 'getKekhaiChiTiet']); // Lấy tất cả chi tiết kê khai để chỉnh sửa

        Route::get('/ke-khai-nam-hoc', [LecturerController::class, 'getKeKhaiNamHoc']); // Danh sách các bản kê khai đã tạo theo năm
        Route::get('/ke-khai-nam-hoc/{id}', [LecturerController::class, 'getChiTietKeKhaiNamHoc']); // Chi tiết một bản kê khai (đã tính toán)

        // Thống kê cá nhân
        Route::get('/statistics/overview', [LecturerController::class, 'getLecturerStatisticsOverview']); // Tổng quan thống kê cá nhân
        Route::get('/statistics/yearly-detail', [LecturerController::class, 'getLecturerYearlyStatisticsDetail']); // Chi tiết thống kê theo năm học
    });
});
