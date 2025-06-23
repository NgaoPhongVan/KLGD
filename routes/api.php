<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ManagerController;
use App\Http\Controllers\Api\LecturerController;
use App\Http\Controllers\Api\Admin\DmHeSoChungController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// === PUBLIC ROUTES ===
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->get('/auth/verify-role', [AuthController::class, 'verifyRole']);

// === AUTHENTICATED ROUTES ===
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- ADMIN ROUTES ---
    Route::middleware('role:1')->prefix('admin')->group(function () {
        Route::get('/profile', [AdminController::class, 'getProfile']); // Thêm route lấy profile Admin nếu cần

        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::post('/users/import', [AdminController::class, 'importUsers']);

        Route::get('/khoa', [AdminController::class, 'getKhoa']);
        Route::post('/khoa', [AdminController::class, 'createKhoa']);
        Route::put('/khoa/{id}', [AdminController::class, 'updateKhoa']);
        Route::delete('/khoa/{id}', [AdminController::class, 'deleteKhoa']);
        Route::post('/khoa/import', [AdminController::class, 'importKhoa']);

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

        // Route::get('/hoc-ky', [AdminController::class, 'getHocKy']); // Giữ lại nếu vẫn dùng học kỳ ở đâu đó
        // Route::post('/hoc-ky', [AdminController::class, 'createHocKy']);
        // Route::put('/hoc-ky/{id}', [AdminController::class, 'updateHocKy']);
        // Route::delete('/hoc-ky/{id}', [AdminController::class, 'deleteHocKy']);
        // Route::post('/hoc-ky/import', [AdminController::class, 'importHocKy']);

        Route::get('/dinh-muc', [AdminController::class, 'getDinhMuc']);
        Route::post('/dinh-muc', [AdminController::class, 'createDinhMuc']);
        Route::put('/dinh-muc/{id}', [AdminController::class, 'updateDinhMuc']);
        Route::delete('/dinh-muc/{id}', [AdminController::class, 'deleteDinhMuc']);
        Route::post('/dinh-muc/import', [AdminController::class, 'importDinhMuc']);

        Route::get('/ke-khai-thoi-gian', [AdminController::class, 'getKeKhaiThoiGian']); // Sẽ query theo năm học
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

        // Miễn giảm định mức routes
        Route::get('/mien-giam-dinh-muc', [AdminController::class, 'getMienGiamDinhMuc']);
        Route::post('/mien-giam-dinh-muc', [AdminController::class, 'createMienGiamDinhMuc']);
        Route::put('/mien-giam-dinh-muc/{id}', [AdminController::class, 'updateMienGiamDinhMuc']);
        Route::delete('/mien-giam-dinh-muc/{id}', [AdminController::class, 'deleteMienGiamDinhMuc']);
        Route::post('/mien-giam-dinh-muc/import', [AdminController::class, 'importMienGiamDinhMuc']);

        // Lương giảng viên routes
        Route::get('/luong-giang-vien', [AdminController::class, 'getLuongGiangVien']);
        Route::post('/luong-giang-vien', [AdminController::class, 'createLuongGiangVien']);
        Route::put('/luong-giang-vien/{id}', [AdminController::class, 'updateLuongGiangVien']);
        Route::delete('/luong-giang-vien/{id}', [AdminController::class, 'deleteLuongGiangVien']);
        Route::post('/luong-giang-vien/import', [AdminController::class, 'importLuongGiangVien']);

        // Admin logs routes
        Route::get('/logs', [AdminController::class, 'getAdminLogs']);
        Route::get('/logs/stats', [AdminController::class, 'getAdminLogStats']);

        // Các routes không còn cần thiết do thay đổi nghiệp vụ (Admin không cấu hình chi tiết hoạt động/hệ số nữa)
        // Route::get('/loai-hoat-dong', ...);
        // Route::get('/hoat-dong-chi-tiet', ...);
        // Route::get('/he-so-quy-doi', ...);
        // Route::post('/calculate-gio-chuan', ...);
    });

    // --- MANAGER ROUTES ---
    Route::middleware('role:2')->prefix('manager')->group(function () {
        Route::get('/profile', [ManagerController::class, 'getProfile']);
        Route::get('/dashboard', [ManagerController::class, 'dashboard']); // Sẽ query theo năm học
        Route::get('/ke-khai', [ManagerController::class, 'keKhaiList']); // Sẽ query theo năm học
        Route::get('/ke-khai/{id}', [ManagerController::class, 'keKhaiShow']); // id là của ke_khai_tong_hop_nam_hoc
        Route::post('/ke-khai/{id}/approve', [ManagerController::class, 'keKhaiApprove']);
        Route::post('/ke-khai/{id}/reject', [ManagerController::class, 'keKhaiReject']);
        Route::post('/ke-khai/{id}/recalculate-before-approve', [ManagerController::class, 'recalculateBeforeApprove']);
        Route::post('/ke-khai/bulk-approve', [ManagerController::class, 'bulkApprove']);
        Route::post('/ke-khai/bulk-reject', [ManagerController::class, 'bulkReject']);
        Route::get('/ke-khai/{id}/log', [ManagerController::class, 'keKhaiLog']);
        Route::get('/statistics', [ManagerController::class, 'statistics']); // Sẽ query theo năm học
        Route::get('/bo-mon_list', [ManagerController::class, 'boMonList']); // Đổi tên route cho rõ ràng
        Route::post('/notifications/send', [ManagerController::class, 'sendNotification']); // Sẽ gửi theo năm học
        Route::get('/export-report', [ManagerController::class, 'exportReport']); // Sẽ query theo năm học
        Route::get('/nam-hoc-list', [ManagerController::class, 'getNamHocList']); // API lấy DS năm học cho Manager
        // Salary management routes
        Route::get('/salary-info', [ManagerController::class, 'getSalaryInfo']);
        Route::put('/salary-info/{id}', [ManagerController::class, 'updateSalaryInfo']);
    });

    // --- LECTURER ROUTES ---
    Route::middleware('role:3')->prefix('lecturer')->group(function () {
        Route::get('/profile', [LecturerController::class, 'getProfile']);
        Route::put('/profile/phone', [LecturerController::class, 'updatePhone']);

        Route::get('/nam-hoc', [LecturerController::class, 'getNamHoc']); // Lấy danh sách năm học
        // Route::get('/hoc-ky', [LecturerController::class, 'getHocKy']); // Có thể không cần nữa

        Route::get('/ke-khai-thoi-gian', [LecturerController::class, 'getKeKhaiThoiGian']); // Sẽ query theo nam_hoc_id

        // API để bắt đầu/lấy bản kê khai tổng hợp cho năm học
        Route::post('/ke-khai-tong-hop-nam-hoc/start', [LecturerController::class, 'startOrGetKeKhaiTongHopNamHoc']);
        // API để giảng viên tự nhập định mức cho bản kê khai tổng hợp
        Route::put('/ke-khai-tong-hop-nam-hoc/{id}/update-dinhmuc', [LecturerController::class, 'updateDinhMucKeKhaiTongHop']);

        // API để lưu batch tất cả các chi tiết kê khai (bao gồm cả giảng dạy, NCKH, công tác khác)
        Route::post('/kekhai-chi-tiet/batch-save', [LecturerController::class, 'storeKekhaiChiTietBatch']);
        // API để lấy tất cả chi tiết kê khai cho một bản tổng hợp (để sửa)
        Route::get('/kekhai-chi-tiet', [LecturerController::class, 'getKekhaiChiTiet']);

        // API để nộp bản kê khai tổng hợp (sau khi đã điền đầy đủ)
        Route::post('/ke-khai-tong-hop-nam-hoc/{id}/submit', [LecturerController::class, 'submitKeKhaiTongHopNamHoc']);

        // API để xem danh sách các bản kê khai tổng hợp đã tạo theo năm
        Route::get('/ke-khai-nam-hoc', [LecturerController::class, 'getKeKhaiNamHoc']);

        // API để xem chi tiết một bản kê khai tổng hợp đã có (bao gồm các chi tiết đã tính toán)
        Route::get('/ke-khai-nam-hoc/{id}', [LecturerController::class, 'getChiTietKeKhaiNamHoc']);

        // API để xóa một bản kê khai tổng hợp (nếu trạng thái cho phép)
        Route::delete('/ke-khai-tong-hop-nam-hoc/{id}', [LecturerController::class, 'deleteKeKhaiTongHopNamHoc']);

        Route::get('/thong-ke', [LecturerController::class, 'getThongKe']); // Sẽ query theo năm học
        Route::get('/dashboard-stats', [LecturerController::class, 'getDashboardStats']); // Sẽ query theo năm học

        Route::get('/dm-he-so-chung', [LecturerController::class, 'getDmHeSoChung']); // Lấy các hệ số chung (HD LA,LV,DAKL)
        Route::get('/statistics/overview', [LecturerController::class, 'getLecturerStatisticsOverview']);
        Route::get('/statistics/yearly-detail', [LecturerController::class, 'getLecturerYearlyStatisticsDetail']); // Nhận nam_hoc_id qua query param

        // --- ROUTES CHO KẾ HOẠCH GIẢNG DẠY ---
        Route::post('/ke-hoach-tong-hop-nam-hoc/start', [LecturerController::class, 'startOrGetKeHoachTongHopNamHoc']);
        Route::put('/ke-hoach-tong-hop-nam-hoc/{id}/update-dinhmuc', [LecturerController::class, 'updateDinhMucKeHoachTongHop']); // Cần tạo hàm này
        Route::post('/ke-hoach-chi-tiet/batch-save', [LecturerController::class, 'storeKeHoachChiTietBatch']);
        Route::get('/ke-hoach-chi-tiet', [LecturerController::class, 'getKeHoachChiTiet']);
        Route::get('/danh-sach-ke-hoach-nam-hoc', [LecturerController::class, 'getDanhSachKeHoachNamHoc']);
        Route::get('/ke-hoach-nam-hoc/{id}', [LecturerController::class, 'getChiTietKeHoachNamHoc']);
        Route::delete('/ke-hoach-tong-hop-nam-hoc/{id}', [LecturerController::class, 'deleteKeHoachTongHopNamHoc']);

        // API để so sánh Kế hoạch với Kê khai thực tế
        Route::get('/ke-hoach/{ke_hoach_id}/compare-with-ke-khai/{ke_khai_id}', [LecturerController::class, 'compareKeHoachWithKeKhai']); // Cần tạo hàm này
    });
});
