<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\KeKhaiTongHopNamHoc;
use App\Models\LuongGiangVien; // Add this import
// Các model chi tiết mới
use App\Models\KekhaiGdLopDhTrongbm;
use App\Models\KekhaiGdLopDhNgoaibm;
use App\Models\KekhaiGdLopDhNgoaics;
use App\Models\KekhaiGdLopThs;
use App\Models\KekhaiGdLopTs;
use App\Models\KekhaiHdDatnDaihoc;
use App\Models\KekhaiHdLvThacsi;
use App\Models\KekhaiHdLaTiensi;
use App\Models\KekhaiDgHpTnDaihoc;
use App\Models\KekhaiDgLvThacsi;
use App\Models\KekhaiDgLaTiensiDot;
use App\Models\KekhaiKhaothiDaihocTrongbm;
use App\Models\KekhaiKhaothiDaihocNgoaibm;
use App\Models\KekhaiKhaothiThacsi;
use App\Models\KekhaiKhaothiTiensi;
use App\Models\KekhaiXdCtdtVaKhacGd;
use App\Models\KekhaiNckhNamHoc;
use App\Models\KekhaiCongtacKhacNamHoc;
use App\Models\MinhChung; // Chỉ cho NCKH
// ---
use App\Models\LichSuPheDuyet;
use App\Models\NamHoc; // Model NamHoc
use App\Models\BoMon;
use App\Models\KeKhaiThoiGian; // Sử dụng nam_hoc_id
use App\Models\Notification; // Model Notification của bạn
use App\Models\DinhMucCaNhanTheoNam; // Model định mức cá nhân mới
use Illuminate\Support\Facades\Auth;
use App\Mail\ReminderNotification; // Nếu còn dùng
use App\Mail\KeKhaiApproved;
use App\Mail\KeKhaiRejected;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\KekhaiReportExport; // Sẽ cần cập nhật Export này
use App\Jobs\ExportReportJob; // Sẽ cần cập nhật Job này
use Carbon\Carbon;
use ZipArchive;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use App\Services\WorkloadService; // Thêm WorkloadService nếu cần gọi lại tính toán

class ManagerController extends Controller
{
    protected $workloadService;

    public function __construct(WorkloadService $workloadService)
    {
        $this->workloadService = $workloadService;
    }

    public function getProfile(Request $request)
    {
        // Giảng viên tự nhập học hàm, học vị nên chỉ cần load boMon.khoa
        return response()->json($request->user()->load('boMon.khoa'));
    }

    // Hàm này có thể không cần thiết nếu Manager chỉ quản lý GV trong bộ môn của mình
    // public function getUsers(Request $request) { ... }
    // public function updateUser(Request $request, $id) { ... }

    public function dashboard(Request $request)
    {
        $namHocId = $request->query('nam_hoc_id');
        $manager = Auth::user();
        // Giả định Manager là Trưởng bộ môn, nên lấy bo_mon_id của manager
        $boMonIdCuaManager = $manager->bo_mon_id;

        if (!$boMonIdCuaManager) {
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $baseQuery = KeKhaiTongHopNamHoc::whereHas('nguoiDung', function ($query) use ($boMonIdCuaManager) {
            $query->where('bo_mon_id', $boMonIdCuaManager);
        });

        if ($namHocId) {
            $baseQuery->where('nam_hoc_id', $namHocId);
        }

        $totalKeKhai = (clone $baseQuery)->count();
        $pending = (clone $baseQuery)->where('trang_thai_phe_duyet', 1)->count(); // 1: Chờ duyệt BM
        $approved = (clone $baseQuery)->where('trang_thai_phe_duyet', 3)->count(); // 3: Đã duyệt BM
        $rejected = (clone $baseQuery)->where('trang_thai_phe_duyet', 4)->count(); // 4: BM Trả lại

        // Tổng giờ đã duyệt hoặc tạm tính (tùy thuộc bạn muốn hiển thị gì trên dashboard)
        $totalHours = (clone $baseQuery)
            ->whereIn('trang_thai_phe_duyet', [1, 3]) // Chờ duyệt hoặc Đã duyệt
            ->sum(DB::raw('IFNULL(tong_gio_thuc_hien_final_duyet, tong_gio_thuc_hien_final_tam_tinh)'));


        $namHocList = NamHoc::orderBy('ngay_bat_dau', 'desc')->get(['id', 'ten_nam_hoc', 'la_nam_hien_hanh']);

        return response()->json([
            'total_ke_khai' => $totalKeKhai,
            'pending' => $pending,
            'approved' => $approved,
            'rejected' => $rejected,
            'total_hours' => round(floatval($totalHours), 2),
            'nam_hoc_list' => $namHocList,
        ]);
    }

    public function keKhaiList(Request $request)
    {
        $namHocId = $request->query('nam_hoc_id');
        $trangThai = $request->query('trang_thai');
        $search = $request->query('search');
        $page = $request->query('page', 1);
        $perPage = $request->query('per_page', 10);

        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;

        if (!$boMonIdCuaManager) {
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $query = KeKhaiTongHopNamHoc::with([
            'nguoiDung:id,ho_ten,ma_gv,email,hoc_ham,hoc_vi,bo_mon_id', // Lấy học hàm, học vị
            'nguoiDung.boMon:id,ten_bo_mon',
            'namHoc:id,ten_nam_hoc',
        ])
            ->whereHas('nguoiDung', function ($q) use ($boMonIdCuaManager) {
                $q->where('bo_mon_id', $boMonIdCuaManager);
            });

        // Apply filters
        if ($namHocId) {
            $query->where('nam_hoc_id', $namHocId);
        }

        if ($trangThai !== null && $trangThai !== '') {
            $query->where('trang_thai_phe_duyet', $trangThai);
        }

        if ($search) {
            $query->whereHas('nguoiDung', function ($q) use ($search) {
                $q->where('ho_ten', 'like', "%{$search}%")
                    ->orWhere('ma_gv', 'like', "%{$search}%");
            });
        }

        $query->orderBy('nam_hoc_id', 'desc')
            ->orderBy('updated_at', 'desc');

        $keKhaiList = $query->paginate($perPage, ['*'], 'page', $page);

        $boMonTrongKhoa = BoMon::where('khoa_id', $manager->boMon->khoa_id ?? null)->select('id', 'ten_bo_mon')->get();

        // Add debug info to response
        $debugInfo = [
            'total_in_bo_mon' => KeKhaiTongHopNamHoc::whereHas('nguoiDung', function ($q) use ($boMonIdCuaManager) {
                $q->where('bo_mon_id', $boMonIdCuaManager);
            })->count(),
            'filters_applied' => [
                'nam_hoc_id' => $namHocId,
                'trang_thai' => $trangThai,
                'search' => $search
            ]
        ];

        return response()->json([
            'ke_khai_list' => $keKhaiList,
            'bo_mon_list' => $boMonTrongKhoa,
            'debug_info' => $debugInfo,
        ]);
    }

    public function keKhaiShow($id) // $id là của KeKhaiTongHopNamHoc
    {
        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;

        if (!$boMonIdCuaManager) { /* ... */
        }

        $keKhaiTongHop = KeKhaiTongHopNamHoc::with([
            'nguoiDung:id,ho_ten,ma_gv,email,dien_thoai,hoc_ham,hoc_vi,bo_mon_id',
            'nguoiDung.boMon:id,ten_bo_mon',
            'namHoc:id,ten_nam_hoc',
            // Load tất cả các quan hệ chi tiết
            'kekhaiGdLopDhTrongbms',
            'kekhaiGdLopDhNgoaibms',
            'kekhaiGdLopDhNgoaicss',
            'kekhaiGdLopThss',
            'kekhaiGdLopTss',
            'kekhaiHdDatnDaihoc',
            'kekhaiHdLvThacsis',
            'kekhaiHdLaTiensis',
            'kekhaiDgHpTnDaihoc',
            'kekhaiDgLvThacsis',
            'kekhaiDgLaTiensiDots.nhiemVus',
            'kekhaiKhaothiDaihocTrongbms',
            'kekhaiKhaothiDaihocNgoaibms',
            'kekhaiKhaothiThacsis',
            'kekhaiKhaothiTiensis',
            'kekhaiXdCtdtVaKhacGds',
            'kekhaiNckhNamHocs.minhChungs',
            'kekhaiCongtacKhacNamHocs',
            'lichSuPheDuyet.nguoiThucHien:id,ho_ten,ma_gv'
        ])
            ->whereHas('nguoiDung', function ($query) use ($boMonIdCuaManager) {
                $query->where('bo_mon_id', $boMonIdCuaManager);
            })
            ->findOrFail($id);

        // Đảm bảo các giá trị tổng hợp là mới nhất trước khi hiển thị để duyệt
        // $this->workloadService->calculateAllForKeKhaiTongHop($keKhaiTongHop->id);
        // $keKhaiTongHop->refresh()->load(/* các quan hệ đã load ở trên */);

        return response()->json($keKhaiTongHop);
    }


    public function keKhaiApprove(Request $request, $id)
    {
        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;
        
        if (!$boMonIdCuaManager) {
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $keKhai = KeKhaiTongHopNamHoc::whereHas('nguoiDung', function ($query) use ($boMonIdCuaManager) {
            $query->where('bo_mon_id', $boMonIdCuaManager);
        })->findOrFail($id);

        if ($keKhai->trang_thai_phe_duyet !== 1) { // Chỉ duyệt khi đang "Chờ duyệt BM"
            return response()->json(['message' => 'Kê khai không ở trạng thái chờ phê duyệt'], 400);
        }

        DB::beginTransaction();
        try {
            // Tính toán lại lần cuối trước khi duyệt (if WorkloadService exists)
            if (isset($this->workloadService)) {
                try {
                    $this->workloadService->calculateAllForKeKhaiTongHop($keKhai->id);
                    $keKhai->refresh();
                } catch (\Exception $e) {
                    Log::warning("Không thể tính toán lại workload cho kê khai ID {$id}: " . $e->getMessage());
                    // Continue with approval even if recalculation fails
                }
            }

            // Gán các giá trị _duyet bằng giá trị _tam_tinh - chỉ copy những field tồn tại
            $fieldsToCopy = [
                'tong_gio_gd_danhgia',
                'tong_sl_huongdan_la',
                'tong_sl_huongdan_lv',
                'tong_sl_huongdan_dakl',
                'tong_gio_khcn_kekhai',
                'tong_gio_congtackhac_quydoi',
                'tong_gio_coithi_chamthi_dh',
                'tong_gio_giangday_final',
                'tong_gio_gdxatruong',
                'dinhmuc_gd_apdung',  // FIX: Thêm định mức GD
                'dinhmuc_khcn_apdung', // FIX: Thêm định mức KHCN
                'gio_gd_danhgia_xet_dinhmuc',
                'gio_khcn_thuchien_xet_dinhmuc',
                'gio_gdxatruong_xet_dinhmuc',
                'gio_vuot_gd_khong_hd',
                'tong_gio_butru_la',
                'sl_huongdan_la_conlai',
                'tong_gio_butru_lv',
                'sl_huongdan_lv_conlai',
                'tong_gio_butru_dakl',
                'sl_huongdan_dakl_conlai',
                'tong_gio_butru_khcn',
                'gio_khcn_conlai_sau_butru',
                'tong_gio_butru_xatruong',
                'gio_gdxatruong_conlai_sau_butru',
                'gio_gd_hoanthanh_sau_butru',
                'gio_khcn_hoanthanh_so_voi_dinhmuc',
                'ket_qua_thua_thieu_gio_gd',
                'ghi_chu_butru',
                'tong_gio_thuc_hien_final'
            ];

            // Get table schema to check which columns actually exist
            $tableColumns = Schema::getColumnListing('ke_khai_tong_hop_nam_hoc');
            
            foreach ($fieldsToCopy as $field) {
                $tamTinhField = $field . '_tam_tinh';
                $duyetField = $field . '_duyet';
                
                // Only copy if both source and destination columns exist
                if (in_array($tamTinhField, $tableColumns) && in_array($duyetField, $tableColumns)) {
                    $tamTinhValue = $keKhai->{$tamTinhField};
                    $keKhai->{$duyetField} = $tamTinhValue;
                } else {
                    Log::warning("Skipping field copy for {$field}: source ({$tamTinhField}) or destination ({$duyetField}) column not found");
                }
            }

            $keKhai->trang_thai_phe_duyet = 3; // 3: Đã duyệt BM
            $keKhai->nguoi_duyet_bm_id = $manager->id;
            $keKhai->thoi_gian_duyet_bm = now();
            $keKhai->ly_do_tu_choi = null; // Xóa lý do từ chối nếu có
            $keKhai->save();

            // Log approval history
            LichSuPheDuyet::create([
                'ke_khai_tong_hop_nam_hoc_id' => $keKhai->id,
                'nguoi_thuc_hien_id' => $manager->id,
                'hanh_dong' => 'approve_bm',
                'trang_thai_truoc' => 1,
                'trang_thai_sau' => 3,
                'ghi_chu' => $request->input('ghi_chu_quan_ly', 'Trưởng Bộ môn đã duyệt.'),
            ]);

            // FIX: Improve email notification with better error handling
            if ($keKhai->nguoiDung && $keKhai->nguoiDung->email) {
                try {
                    // Load required relationships for email
                    $keKhai->load(['nguoiDung', 'namHoc']);
                    
                    // Send email immediately (not queued) for testing
                    Mail::to($keKhai->nguoiDung->email)->send(new KeKhaiApproved($keKhai, $keKhai->namHoc));
                    Log::info("Email sent successfully to: " . $keKhai->nguoiDung->email . " for approved kekhai ID: " . $keKhai->id);
                    
                } catch (\Exception $e) {
                    Log::error("Failed to send approval email for kekhai ID {$id}: " . $e->getMessage());
                    Log::error("Email error details: " . $e->getTraceAsString());
                    // Continue with approval even if email fails
                }
            } else {
                Log::warning("No email found for user ID: " . ($keKhai->nguoi_dung_id ?? 'N/A') . " for kekhai ID: " . $id);
            }

            DB::commit();
            return response()->json(['message' => 'Phê duyệt thành công.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi phê duyệt kê khai ID {$id}: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return response()->json(['message' => 'Lỗi hệ thống khi phê duyệt: ' . $e->getMessage()], 500);
        }
    }

    public function keKhaiReject(Request $request, $id)
    {
        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;
        
        if (!$boMonIdCuaManager) {
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $keKhai = KeKhaiTongHopNamHoc::whereHas('nguoiDung', function ($query) use ($boMonIdCuaManager) {
            $query->where('bo_mon_id', $boMonIdCuaManager);
        })->findOrFail($id);

        if ($keKhai->trang_thai_phe_duyet !== 1) { // Chỉ từ chối khi đang "Chờ duyệt BM"
            return response()->json(['message' => 'Kê khai không ở trạng thái chờ phê duyệt'], 400);
        }

        $validator = Validator::make($request->all(), [
            'ly_do_tu_choi' => 'required|string|max:1000'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $keKhai->trang_thai_phe_duyet = 4; // 4: BM Trả lại
            $keKhai->ly_do_tu_choi = $request->input('ly_do_tu_choi');
            $keKhai->nguoi_duyet_bm_id = $manager->id; // Vẫn lưu người thực hiện hành động
            $keKhai->thoi_gian_duyet_bm = now(); // Thời gian thực hiện hành động
            $keKhai->save();

            LichSuPheDuyet::create([
                'ke_khai_tong_hop_nam_hoc_id' => $keKhai->id,
                'nguoi_thuc_hien_id' => $manager->id,
                'hanh_dong' => 'reject_bm',
                'trang_thai_truoc' => 1,
                'trang_thai_sau' => 4,
                'ghi_chu' => $request->input('ly_do_tu_choi'),
            ]);

            // FIX: Improve email notification for rejection
            if ($keKhai->nguoiDung && $keKhai->nguoiDung->email) {
                try {
                    // Load required relationships for email
                    $keKhai->load(['nguoiDung', 'namHoc']);
                    
                    // Send email immediately (not queued) for testing
                    Mail::to($keKhai->nguoiDung->email)->send(new KeKhaiRejected($keKhai, $keKhai->namHoc, $request->input('ly_do_tu_choi')));
                    Log::info("Rejection email sent successfully to: " . $keKhai->nguoiDung->email . " for kekhai ID: " . $keKhai->id);
                    
                } catch (\Exception $e) {
                    Log::error("Failed to send rejection email for kekhai ID {$id}: " . $e->getMessage());
                    Log::error("Email error details: " . $e->getTraceAsString());
                    // Continue with rejection even if email fails
                }
            } else {
                Log::warning("No email found for user ID: " . ($keKhai->nguoi_dung_id ?? 'N/A') . " for kekhai ID: " . $id);
            }

            DB::commit();
            return response()->json(['message' => 'Đã trả lại kê khai.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi từ chối kê khai ID {$id}: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return response()->json(['message' => 'Lỗi hệ thống khi từ chối kê khai: ' . $e->getMessage()], 500);
        }
    }

    // Các hàm bulkApprove, bulkReject cần được cập nhật tương tự như keKhaiApprove và keKhaiReject

    public function sendNotification(Request $request)
    {
        $request->validate([
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'send_to' => 'required|in:all,pending,not_submitted',
        ]);

        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;
        
        if (!$boMonIdCuaManager) {
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $namHocId = $request->input('nam_hoc_id');
        $title = $request->input('title');
        $message = $request->input('message');
        $sendTo = $request->input('send_to');

        try {
            // Lấy thông tin năm học và thời gian kê khai
            $namHoc = NamHoc::find($namHocId);
            $keKhaiThoiGian = KeKhaiThoiGian::where('nam_hoc_id', $namHocId)->first();
            
            // Xác định danh sách người nhận
            $nguoiNhanQuery = User::where('bo_mon_id', $boMonIdCuaManager)
                ->where('role', 'lecturer')
                ->whereNotNull('email');

            switch ($sendTo) {
                case 'pending':
                    // Chỉ gửi cho những người đã nộp nhưng chờ duyệt
                    $nguoiNhanQuery->whereHas('keKhaiTongHopNamHocs', function($q) use ($namHocId) {
                        $q->where('nam_hoc_id', $namHocId)
                          ->where('trang_thai_phe_duyet', 1);
                    });
                    break;
                
                case 'not_submitted':
                    // Chỉ gửi cho những người chưa nộp hoặc còn ở trạng thái nháp
                    $nguoiNhanQuery->whereDoesntHave('keKhaiTongHopNamHocs', function($q) use ($namHocId) {
                        $q->where('nam_hoc_id', $namHocId)
                          ->whereIn('trang_thai_phe_duyet', [1, 3]); // Chỉ loại trừ đã nộp và đã duyệt
                    });
                    break;
                
                case 'all':
                default:
                    // Gửi cho tất cả giảng viên trong bộ môn
                    break;
            }

            $nguoiNhanList = $nguoiNhanQuery->get();

            if ($nguoiNhanList->isEmpty()) {
                return response()->json([
                    'message' => 'Không có giảng viên nào phù hợp để gửi thông báo.',
                    'sent_count' => 0
                ]);
            }

            $sentCount = 0;
            $failedEmails = [];

            foreach ($nguoiNhanList as $nguoiNhan) {
                try {
                    Mail::to($nguoiNhan->email)->send(
                        new ReminderNotification($title, $message, $namHoc, $keKhaiThoiGian)
                    );
                    $sentCount++;
                    
                    // Log successful send
                    Log::info("Reminder notification sent to: {$nguoiNhan->email} for nam_hoc_id: {$namHocId}");
                    
                } catch (\Exception $e) {
                    $failedEmails[] = $nguoiNhan->email;
                    Log::error("Failed to send reminder to {$nguoiNhan->email}: " . $e->getMessage());
                    continue;
                }
            }

            $responseMessage = "Đã gửi thông báo thành công tới {$sentCount}/{$nguoiNhanList->count()} giảng viên.";
            if (!empty($failedEmails)) {
                $responseMessage .= " Không thể gửi tới: " . implode(', ', $failedEmails);
            }

            return response()->json([
                'message' => $responseMessage,
                'sent_count' => $sentCount,
                'total_recipients' => $nguoiNhanList->count(),
                'failed_emails' => $failedEmails
            ]);

        } catch (\Exception $e) {
            Log::error("Error sending notifications: " . $e->getMessage());
            return response()->json([
                'message' => 'Lỗi hệ thống khi gửi thông báo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function statistics(Request $request)
    {
        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;
        if (!$boMonIdCuaManager) {
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $namHocId = $request->query('nam_hoc_id'); // Lọc theo năm học

        $baseQuery = KeKhaiTongHopNamHoc::whereHas('nguoiDung', function ($q) use ($boMonIdCuaManager) {
            $q->where('bo_mon_id', $boMonIdCuaManager);
        });
        if ($namHocId) {
            $baseQuery->where('nam_hoc_id', $namHocId);
        }

        // Chỉ thống kê các bản đã duyệt
        $approvedQuery = (clone $baseQuery)->where('trang_thai_phe_duyet', 3);

        $totalApprovedHours = $approvedQuery->sum('tong_gio_thuc_hien_final_duyet');
        $numberOfApprovedTeachers = $approvedQuery->distinct('nguoi_dung_id')->count();

        // Phân bổ giờ đã duyệt
        $activityStats = [
            'giang_day_final' => round(floatval($approvedQuery->sum('tong_gio_giangday_final_duyet')), 2), // C11.I2
            'nckh_final'      => round(floatval($approvedQuery->sum('tong_gio_khcn_kekhai_duyet')), 2),      // C1.I2
            'congtac_khac_gd' => round(floatval($approvedQuery->sum('tong_gio_congtackhac_quydoi_duyet')), 2), // C2.I2
            'coithi_chamthi_dh' => round(floatval($approvedQuery->sum('tong_gio_coithi_chamthi_dh_duyet')), 2), // C3.I2
            'gd_xa_truong'    => round(floatval($approvedQuery->sum('tong_gio_gdxatruong_duyet')), 2)        // C12.I2
        ];
        $totalActivityHours = array_sum($activityStats);
        foreach ($activityStats as $key => $value) {
            $activityStats[$key . '_percentage'] = $totalActivityHours > 0 ? round(($value / $totalActivityHours) * 100, 1) : 0;
        }


        // Xếp hạng giảng viên trong bộ môn (đã duyệt)
        $topGiangViens = (clone $approvedQuery)
            ->select('nguoi_dung_id', DB::raw('SUM(tong_gio_thuc_hien_final_duyet) as total_hours_approved'))
            ->groupBy('nguoi_dung_id')
            ->orderByDesc('total_hours_approved')
            ->take(10)
            ->with('nguoiDung:id,ho_ten,ma_gv')
            ->get()
            ->map(fn($item) => [
                'ho_ten' => $item->nguoiDung->ho_ten,
                'ma_gv' => $item->nguoiDung->ma_gv,
                'total_hours' => round($item->total_hours_approved, 2)
            ]);

        // Xu hướng theo thời gian (nếu không lọc năm học cụ thể)
        $timeTrend = [];
        if (!$namHocId) {
            $timeTrend = KeKhaiTongHopNamHoc::whereHas('nguoiDung', function ($q) use ($boMonIdCuaManager) {
                $q->where('bo_mon_id', $boMonIdCuaManager);
            })
                ->where('trang_thai_phe_duyet', 3) // Chỉ tính đã duyệt
                ->join('nam_hoc', 'ke_khai_tong_hop_nam_hoc.nam_hoc_id', '=', 'nam_hoc.id')
                ->select(
                    'nam_hoc.ten_nam_hoc as period',
                    DB::raw('COUNT(DISTINCT ke_khai_tong_hop_nam_hoc.nguoi_dung_id) as teacher_count'),
                    DB::raw('SUM(ke_khai_tong_hop_nam_hoc.tong_gio_thuc_hien_final_duyet) as total_hours')
                )
                ->groupBy('nam_hoc.ten_nam_hoc', 'nam_hoc.ngay_bat_dau')
                ->orderBy('nam_hoc.ngay_bat_dau')
                ->get();
        }


        $statsData = [
            'total_ke_khai_bm' => (clone $baseQuery)->count(),
            'pending_bm' => (clone $baseQuery)->where('trang_thai_phe_duyet', 1)->count(),
            'approved_bm' => $approvedQuery->count(),
            'rejected_bm' => (clone $baseQuery)->where('trang_thai_phe_duyet', 4)->count(),
            'total_hours_approved_bm' => round($totalApprovedHours, 2),
            'average_hours_per_teacher_bm' => $numberOfApprovedTeachers > 0 ? round($totalApprovedHours / $numberOfApprovedTeachers, 2) : 0,
            'activity_stats_bm' => $activityStats,
            'top_giang_viens_bm' => $topGiangViens,
            'time_trend_bm' => $timeTrend,
        ];

        return response()->json($statsData);
    }

    public function getSalaryInfo(Request $request)
    {
        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;
        $namHocId = $request->query('nam_hoc_id');

        if (!$boMonIdCuaManager) {
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $query = LuongGiangVien::whereHas('nguoiDung', function ($q) use ($boMonIdCuaManager) {
            $q->where('bo_mon_id', $boMonIdCuaManager);
        })
            ->with(['nguoiDung:id,ho_ten,ma_gv,hoc_ham,hoc_vi', 'namHoc:id,ten_nam_hoc']);

        if ($namHocId) {
            $query->where('nam_hoc_id', $namHocId);
        }

        $salaryData = $query->get();

        return response()->json($salaryData);
    }

    public function updateSalaryInfo(Request $request, $id)
    {
        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;

        $validator = Validator::make($request->all(), [
            'muc_luong_co_ban' => 'nullable|numeric|min:0',
            'don_gia_gio_vuot_muc' => 'nullable|numeric|min:0',
            'ghi_chu' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $luongGV = LuongGiangVien::whereHas('nguoiDung', function ($q) use ($boMonIdCuaManager) {
            $q->where('bo_mon_id', $boMonIdCuaManager);
        })->findOrFail($id);

        $luongGV->update($request->only(['muc_luong_co_ban', 'don_gia_gio_vuot_muc', 'ghi_chu']));

        // Recalculate derived fields
        $this->calculateSalaryFields($luongGV);

        return response()->json(['message' => 'Cập nhật thông tin lương thành công.', 'data' => $luongGV]);
    }

    private function calculateSalaryFields(LuongGiangVien $luongGV)
    {
        // Get the corresponding ke khai data
        $keKhai = KeKhaiTongHopNamHoc::where('nguoi_dung_id', $luongGV->nguoi_dung_id)
            ->where('nam_hoc_id', $luongGV->nam_hoc_id)
            ->where('trang_thai_phe_duyet', 3) // Only approved
            ->first();

        if ($keKhai) {
            $luongGV->tong_gio_chuan_thuc_hien = $keKhai->tong_gio_thuc_hien_final_duyet;
            $luongGV->so_gio_vuot_muc = max(0, $keKhai->ket_qua_thua_thieu_gio_gd_duyet ?? 0);

            if ($luongGV->don_gia_gio_vuot_muc && $luongGV->so_gio_vuot_muc) {
                $luongGV->tong_tien_luong_vuot_gio = $luongGV->so_gio_vuot_muc * $luongGV->don_gia_gio_vuot_muc;
            }

            if ($luongGV->muc_luong_co_ban && $luongGV->tong_tien_luong_vuot_gio) {
                $luongGV->thanh_tien_nam = $luongGV->muc_luong_co_ban + $luongGV->tong_tien_luong_vuot_gio;
            }

            $luongGV->save();
        }
    }

    public function exportReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'format' => 'required|in:excel,pdf',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;

        if (!$boMonIdCuaManager) {
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $namHocId = $request->input('nam_hoc_id');
        $format = $request->input('format');
        $trangThaiFilter = $request->input('trang_thai');
        $searchGV = $request->input('search');
        $isPreview = $request->input('preview') === 'true';

        // Build query with debug information
        $query = KeKhaiTongHopNamHoc::where('nam_hoc_id', $namHocId)
            ->whereHas('nguoiDung', function ($q) use ($boMonIdCuaManager, $searchGV) {
                $q->where('bo_mon_id', $boMonIdCuaManager);
                if ($searchGV) {
                    $q->where(function ($sq) use ($searchGV) {
                        $sq->where('ho_ten', 'like', "%{$searchGV}%")
                            ->orWhere('ma_gv', 'like', "%{$searchGV}%");
                    });
                }
            });

        // Apply status filter if provided
        if ($trangThaiFilter !== null && $trangThaiFilter !== '') {
            $query->where('trang_thai_phe_duyet', $trangThaiFilter);
        }

        // Add eager loading
        $query->with($this->getEagerLoadRelationsForReport());

        if ($isPreview) {
            $keKhaiTongHops = $query->take(10)->get();
            $reportData = $this->transformDataForReport($keKhaiTongHops, $namHocId);
            return response()->json([
                'reportData' => $reportData,
                'total_records' => $query->count(),
            ]);
        }

        $keKhaiTongHops = $query->get();

        if ($keKhaiTongHops->isEmpty()) {
            return response()->json([
                'message' => 'Không có dữ liệu kê khai để xuất báo cáo.',
            ], 404);
        }

        // Get salary information for pricing calculation
        $salaryData = LuongGiangVien::where('nam_hoc_id', $namHocId)
            ->whereHas('nguoiDung', function ($q) use ($boMonIdCuaManager) {
                $q->where('bo_mon_id', $boMonIdCuaManager);
            })
            ->with('nguoiDung')
            ->get()
            ->keyBy('nguoi_dung_id');

        $namHoc = NamHoc::find($namHocId);
        $boMon = $manager->boMon;
        $fileName = "BaoCaoKeKhai_" . ($boMon ? $boMon->ten_bo_mon : 'BoMon') . "_{$namHoc->ten_nam_hoc}_" . now()->format('YmdHis');

        try {
            if ($format === 'excel') {
                return $this->exportExcelReport($keKhaiTongHops, $salaryData, $namHoc, $boMon, $fileName);
            } elseif ($format === 'pdf') {
                return $this->exportPdfReport($keKhaiTongHops, $salaryData, $namHoc, $boMon, $fileName, $request);
            }
        } catch (\Exception $e) {
            Log::error('Export error: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi khi xuất báo cáo: ' . $e->getMessage()], 500);
        }
    }

    private function exportExcelReport($keKhaiTongHops, $salaryData, $namHoc, $boMon, $fileName)
    {
        try {
            Log::info("Starting Excel export for {$fileName}");
            $export = new KekhaiReportExport($keKhaiTongHops, $salaryData, $namHoc, $boMon);
            return Excel::download($export, "{$fileName}.xlsx");
        } catch (\Exception $e) {
            Log::error('Excel export error: ' . $e->getMessage());
            throw new \Exception('Lỗi khi xuất Excel: ' . $e->getMessage());
        }
    }

    private function exportPdfReport($keKhaiTongHops, $salaryData, $namHoc, $boMon, $fileName, $request)
    {
        try {
            // Create a temporary directory for PDFs
            $tempDir = storage_path('app/temp/' . Str::random(10));
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $pdfFiles = [];

            // Get the data for different report types
            $overtimeReportData = $this->transformDataForOvertimeReport($keKhaiTongHops, $salaryData);
            $workloadReportData = $this->transformDataForWorkloadReport($keKhaiTongHops);

            Log::info("Starting PDF exports for {$fileName}");

            // 1. First PDF: BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ (KLVG)
            $overtimePdf = Pdf::loadView('reports.manager_overtime_pdf', [
                'reportData' => $overtimeReportData,
                'namHoc' => $namHoc,
                'boMon' => $boMon,
                'fontSize' => $request->input('font_size', 10),
            ])
                ->setPaper($request->input('paper_size', 'a4'), 'landscape')
                ->setOption('default-font', 'DejaVu Sans')
                ->setOption('encoding', 'UTF-8')
                ->setOption('margin-top', 10)
                ->setOption('margin-bottom', 10)
                ->setOption('margin-left', 10)
                ->setOption('margin-right', 10);

            $overtimeFile = $tempDir . '/01_BangTongHopKhoiLuongTinhVuotGio_KLVG.pdf';
            $overtimePdf->save($overtimeFile);
            $pdfFiles[] = $overtimeFile;
            Log::info("Generated overtime report PDF");

            // 2. Second PDF: BẢNG TỔNG HỢP KHỐI LƯỢNG CÔNG TÁC (THKL)
            $workloadPdf = Pdf::loadView('reports.manager_workload_pdf', [
                'reportData' => $workloadReportData,
                'namHoc' => $namHoc,
                'boMon' => $boMon,
                'fontSize' => $request->input('font_size', 10),
            ])
                ->setPaper($request->input('paper_size', 'a4'), 'landscape')
                ->setOption('default-font', 'DejaVu Sans')
                ->setOption('encoding', 'UTF-8')
                ->setOption('margin-top', 10)
                ->setOption('margin-bottom', 10)
                ->setOption('margin-left', 10)
                ->setOption('margin-right', 10);

            $workloadFile = $tempDir . '/02_BangTongHopKhoiLuongCongTac_THKL.pdf';
            $workloadPdf->save($workloadFile);
            $pdfFiles[] = $workloadFile;
            Log::info("Generated workload report PDF");

            // 3. Individual PDFs for each lecturer
            Log::info("Starting individual lecturer PDFs. Total count: " . $keKhaiTongHops->count());

            foreach ($keKhaiTongHops as $index => $keKhai) {
                try {
                    Log::info("Processing lecturer {$index}: " . ($keKhai->nguoiDung->ho_ten ?? 'Unknown'));

                    // Transform data for this specific lecturer
                    $lecturerDetailData = $this->transformDataForLecturerDetail($keKhai, $salaryData);

                    // Create PDF for this lecturer
                    $lecturerPdf = Pdf::loadView('reports.manager_lecturer_detail_pdf', [
                        'keKhaiData' => $lecturerDetailData,
                        'namHoc' => $namHoc,
                        'boMon' => $boMon,
                        'fontSize' => $request->input('font_size', 10),
                    ])
                        ->setPaper($request->input('paper_size', 'a4'), 'portrait')
                        ->setOption('default-font', 'DejaVu Sans')
                        ->setOption('encoding', 'UTF-8')
                        ->setOption('margin-top', 10)
                        ->setOption('margin-bottom', 10)
                        ->setOption('margin-left', 10)
                        ->setOption('margin-right', 10);

                    // Generate safe filename with lecturer name
                    $lecturerName = $keKhai->nguoiDung->ho_ten ?? 'Unknown';
                    $cleanName = preg_replace('/[^a-zA-Z0-9\s]/', '', $lecturerName);
                    $cleanName = preg_replace('/\s+/', '_', trim($cleanName));
                    $maGV = $keKhai->nguoiDung->ma_gv ?? 'NoCode';

                    $lecturerFile = $tempDir . '/' . sprintf('03_%02d_ChiTiet_%s_%s.pdf', $index + 1, $cleanName, $maGV);

                    // Save the PDF
                    $lecturerPdf->save($lecturerFile);
                    $pdfFiles[] = $lecturerFile;

                    Log::info("Generated PDF for lecturer " . ($index + 1) . ": {$lecturerName} ({$maGV}) - File: " . basename($lecturerFile));
                } catch (\Exception $e) {
                    Log::error("Error generating PDF for lecturer at index {$index}: " . $e->getMessage());
                    Log::error("Lecturer data: " . json_encode([
                        'ho_ten' => $keKhai->nguoiDung->ho_ten ?? 'N/A',
                        'ma_gv' => $keKhai->nguoiDung->ma_gv ?? 'N/A',
                        'id' => $keKhai->id ?? 'N/A'
                    ]));
                    // Continue with other lecturers instead of stopping
                    continue;
                }
            }

            Log::info("Completed individual lecturer PDFs. Generated " . (count($pdfFiles) - 2) . " lecturer files");

            // Create ZIP file with all PDFs
            $zipFileName = "{$fileName}.zip";
            $zipPath = storage_path('app/temp/' . $zipFileName);

            Log::info("Creating ZIP archive at: {$zipPath} with " . count($pdfFiles) . " files");

            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE) === TRUE) {
                foreach ($pdfFiles as $file) {
                    if (file_exists($file)) {
                        $zip->addFile($file, basename($file));
                        Log::info("Added to ZIP: " . basename($file) . " (size: " . filesize($file) . " bytes)");
                    } else {
                        Log::warning("File not found for ZIP: " . $file);
                    }
                }
                $zip->close();

                // Clean up temp files
                foreach ($pdfFiles as $file) {
                    if (file_exists($file)) {
                        unlink($file);
                    }
                }
                rmdir($tempDir);

                Log::info("ZIP file created successfully with " . count($pdfFiles) . " files");

                return response()->download($zipPath)->deleteFileAfterSend(true);
            } else {
                Log::error("Failed to create ZIP file at: " . $zipPath);
                throw new \Exception('Could not create ZIP file');
            }
        } catch (\Exception $e) {
            Log::error('Export PDF error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            // Clean up temp directory if it exists
            if (isset($tempDir) && is_dir($tempDir)) {
                $files = glob($tempDir . '/*');
                foreach ($files as $file) {
                    if (is_file($file)) {
                        unlink($file);
                    }
                }
                rmdir($tempDir);
            }

            throw new \Exception('Lỗi khi xuất báo cáo PDF: ' . $e->getMessage());
        }
    }

    private function transformDataForReport($keKhaiTongHops, $namHocId)
    {
        // Get salary data for the preview
        $manager = Auth::user();
        $salaryData = LuongGiangVien::where('nam_hoc_id', $namHocId)
            ->whereHas('nguoiDung', function ($q) use ($manager) {
                $q->where('bo_mon_id', $manager->bo_mon_id);
            })
            ->with('nguoiDung')
            ->get()
            ->keyBy('nguoi_dung_id');

        return $keKhaiTongHops->map(function ($keKhai) use ($salaryData) {
            $salaryInfo = $salaryData->get($keKhai->nguoi_dung_id);
            $mucLuongCoBan = $salaryInfo ? floatval($salaryInfo->muc_luong_co_ban ?? 0) : 0;
            $gioVuot = max(0, floatval($keKhai->ket_qua_thua_thieu_gio_gd_tam_tinh ?? 0));
            $thanhTien = $gioVuot * $mucLuongCoBan;

            $hoTen = trim($keKhai->nguoiDung->ho_ten ?? '');
            $hoTenArray = explode(' ', $hoTen);
            $ten = count($hoTenArray) > 1 ? array_pop($hoTenArray) : '';
            $hoDem = implode(' ', $hoTenArray);

            return [
                'ma_gv' => $keKhai->nguoiDung->ma_gv ?? 'N/A',
                'ho_dem' => $hoDem,
                'ten' => $ten,
                'hoc_ham' => $keKhai->nguoiDung->hoc_ham ?? '',
                'hoc_vi' => $keKhai->nguoiDung->hoc_vi ?? '',
                'dinhmuc_khcn' => floatval($keKhai->dinhmuc_khcn_apdung_tam_tinh ?? 68),
                'dinhmuc_gd' => floatval($keKhai->dinhmuc_gd_apdung_tam_tinh ?? 224),
                'thuc_hien_khcn' => floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0),
                'thuc_hien_gd' => floatval($keKhai->tong_gio_giangday_final_tam_tinh ?? 0),
                'gd_xa_truong' => floatval($keKhai->tong_gio_gdxatruong_tam_tinh ?? 0),
                'so_tiet_vuot' => $gioVuot,
                'muc_luong_co_ban' => $mucLuongCoBan,
                'hd_la' => intval($keKhai->sl_huongdan_la_conlai_tam_tinh ?? 0),
                'hd_lv' => intval($keKhai->sl_huongdan_lv_conlai_tam_tinh ?? 0),
                'hd_da_kl' => intval($keKhai->sl_huongdan_dakl_conlai_tam_tinh ?? 0),
                'thanh_tien' => $thanhTien,
                'trang_thai' => $keKhai->trang_thai_phe_duyet
            ];
        })->toArray();
    }

    private function transformDataForOvertimeReport($keKhaiTongHops, $salaryData)
    {
        return $keKhaiTongHops->map(function ($keKhai) use ($salaryData) {
            $salaryInfo = $salaryData->get($keKhai->nguoi_dung_id);
            $gioVuot = max(0, floatval($keKhai->ket_qua_thua_thieu_gio_gd_tam_tinh ?? 0));
            $mucLuongCoBan = $salaryInfo ? floatval($salaryInfo->muc_luong_co_ban ?? 0) : 0; // Fix: use muc_luong_co_ban
            $thanhTien = $gioVuot * $mucLuongCoBan;

            // Split full name into first name and last name like in KLVG.csv
            $hoTen = trim($keKhai->nguoiDung->ho_ten ?? '');
            $hoTenArray = explode(' ', $hoTen);
            $ten = count($hoTenArray) > 1 ? array_pop($hoTenArray) : '';
            $hoDem = implode(' ', $hoTenArray);

            return [
                'stt' => '',
                'ho_dem' => $hoDem,
                'ten' => $ten,
                'hoc_ham' => $keKhai->nguoiDung->hoc_ham ?? '',
                'hoc_vi' => $keKhai->nguoiDung->hoc_vi ?? '',
                'dinhmuc_khcn' => floatval($keKhai->dinhmuc_khcn_apdung_tam_tinh ?? 68),
                'dinhmuc_gd' => floatval($keKhai->dinhmuc_gd_apdung_tam_tinh ?? 224),
                'thuc_hien_khcn' => floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0),
                'thuc_hien_gd' => floatval($keKhai->tong_gio_giangday_final_tam_tinh ?? 0),
                'gd_xa_truong' => floatval($keKhai->tong_gio_gdxatruong_tam_tinh ?? 0),
                'so_tiet_vuot' => $gioVuot,
                'muc_luong_co_ban' => $mucLuongCoBan, // Use actual salary from database
                'hd_la' => intval($keKhai->sl_huongdan_la_conlai_tam_tinh ?? 0),
                'hd_lv' => intval($keKhai->sl_huongdan_lv_conlai_tam_tinh ?? 0),
                'hd_da' => intval($keKhai->sl_huongdan_dakl_conlai_tam_tinh ?? 0),
                'thanh_tien' => $thanhTien,
                'ghi_chu' => $keKhai->ghi_chu_giang_vien ?? ''
            ];
        })->values()->toArray();
    }

    private function transformDataForWorkloadReport($keKhaiTongHops)
    {
        return $keKhaiTongHops->map(function ($keKhai) {
            // Split full name into first name and last name like in THKL.csv
            $hoTen = trim($keKhai->nguoiDung->ho_ten ?? '');
            $hoTenArray = explode(' ', $hoTen);
            $ten = count($hoTenArray) > 1 ? array_pop($hoTenArray) : '';
            $hoDem = implode(' ', $hoTenArray);

            return [
                'stt' => '',
                'ho_dem' => $hoDem,
                'ten' => $ten,
                'khcn_p9' => floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0),
                'congtac_khac_p7' => floatval($keKhai->tong_gio_congtackhac_quydoi_tam_tinh ?? 0),
                'coi_cham_thi_p6' => floatval($keKhai->tong_gio_coithi_chamthi_dh_tam_tinh ?? 0),
                'giang_day' => floatval($keKhai->tong_gio_gd_danhgia_tam_tinh ?? 0),
                'hd_la' => intval($keKhai->tong_sl_huongdan_la_tam_tinh ?? 0),
                'hd_lv' => intval($keKhai->tong_sl_huongdan_lv_tam_tinh ?? 0),
                'hd_da' => intval($keKhai->tong_sl_huongdan_dakl_tam_tinh ?? 0),
                'so_tiet_hd' => floatval($keKhai->tong_gio_huongdan_quydoi_tam_tinh ?? 0),
                'tong_khcn' => floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0),
                'tong_giang_day' => floatval($keKhai->tong_gio_giangday_final_tam_tinh ?? 0),
                'gd_xa_truong' => floatval($keKhai->tong_gio_gdxatruong_tam_tinh ?? 0),
            ];
        })->values()->toArray();
    }

    private function transformDataForLecturerDetail($keKhai, $salaryData)
    {
        $salaryInfo = $salaryData->get($keKhai->nguoi_dung_id);

        // Fix: Use correct field names for định mức
        $dinhmucGD = floatval($keKhai->dinhmuc_gd_apdung_tam_tinh ?? $keKhai->dinhmuc_gd_apdung ?? 224);
        $dinhmucKHCN = floatval($keKhai->dinhmuc_khcn_apdung_tam_tinh ?? $keKhai->dinhmuc_khcn_apdung ?? 68);

        return [
            'ho_ten' => $keKhai->nguoiDung->ho_ten ?? 'N/A',
            'ma_gv' => $keKhai->nguoiDung->ma_gv ?? 'N/A',
            'hoc_ham' => $keKhai->nguoiDung->hoc_ham ?? '',
            'hoc_vi' => $keKhai->nguoiDung->hoc_vi ?? '',
            'dinhmuc_gd_apdung' => $dinhmucGD,
            'dinhmuc_khcn_apdung' => $dinhmucKHCN,
            'tong_gio_khcn_kekhai_tam_tinh' => floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0),
            'tong_gio_giangday_final_tam_tinh' => floatval($keKhai->tong_gio_giangday_final_tam_tinh ?? 0),
            'ket_qua_thua_thieu_gio_gd_tam_tinh' => floatval($keKhai->ket_qua_thua_thieu_gio_gd_tam_tinh ?? 0),
            'ghi_chu_giang_vien' => $keKhai->ghi_chu_giang_vien ?? '',
            'ghi_chu_quan_ly' => $keKhai->ghi_chu_quan_ly ?? '',
            'nguoi_duyet_bm' => $keKhai->nguoiDuyetBm->ho_ten ?? 'Chưa duyệt',
            'ke_khai_details' => $this->getKeKhaiDetails($keKhai),
        ];
    }

    private function getKeKhaiDetails($keKhai)
    {
        // Ensure the keKhai is loaded with all necessary relationships
        $keKhai->load([
            'kekhaiGdLopDhTrongbms',
            'kekhaiGdLopDhNgoaibms',
            'kekhaiGdLopDhNgoaicss',
            'kekhaiGdLopThss',
            'kekhaiGdLopTss',
            'kekhaiHdDatnDaihoc',
            'kekhaiHdLvThacsis',
            'kekhaiHdLaTiensis',
            'kekhaiDgHpTnDaihoc',
            'kekhaiDgLvThacsis',
            'kekhaiDgLaTiensiDots.nhiemVus',
            'kekhaiKhaothiDaihocTrongbms',
            'kekhaiKhaothiDaihocNgoaibms',
            'kekhaiKhaothiThacsis',
            'kekhaiKhaothiTiensis',
            'kekhaiXdCtdtVaKhacGds',
            'kekhaiNckhNamHocs.minhChungs',
            'kekhaiCongtacKhacNamHocs'
        ]);

        $details = [
            'gd_lop_dh_trong_bm' => [],
            'gd_lop_dh_ngoai_bm' => [],
            'gd_lop_dh_ngoai_cs' => [],
            'gd_lop_ths' => [],
            'gd_lop_ts' => [],
            'hd_datn_daihoc' => [],
            'hd_lv_thacsi' => [],
            'hd_la_tiensi' => [],
            'dg_hp_tn_daihoc' => [],
            'dg_lv_thacsi' => [],
            'dg_la_tiensi_dot' => [],
            'khao_thi_dh_trong_bm' => [],
            'khao_thi_dh_ngoai_bm' => [],
            'khao_thi_thacsi' => [],
            'khao_thi_tiensi' => [],
            'xd_ctdt_va_khac_gd' => [],
            'nckh_nam_hoc' => [],
            'congtac_khac_nam_hoc' => [],
        ];

        // Helper function to check if item has meaningful data
        $hasRealData = function($item, $checkFields) {
            foreach ($checkFields as $field) {
                $value = $item[$field] ?? null;
                if (!empty($value) && $value !== '' && $value !== '0' && $value !== 0) {
                    return true;
                }
            }
            return false;
        };

        // Debug logging
        Log::info("Processing ke khai details for user: " . ($keKhai->nguoiDung->ho_ten ?? 'Unknown'));

        // 1. Giảng dạy lớp trong bộ môn
        if ($keKhai->kekhaiGdLopDhTrongbms && $keKhai->kekhaiGdLopDhTrongbms->count() > 0) {
            $filteredItems = [];
            foreach ($keKhai->kekhaiGdLopDhTrongbms as $item) {
                $transformedItem = [
                    'ma_lop' => $item->ten_lop_hoc_phan ?: '',
                    'ten_mon_hoc' => $item->ten_lop_hoc_phan ?: '',
                    'so_tiet_lt' => intval($item->kl_ke_hoach ?: 0),
                    'so_tiet_th' => 0,
                    'he_so' => floatval($item->he_so_qd ?: 1.0),
                    'tong_gio_quy_doi' => floatval($item->so_tiet_qd ?: 0),
                ];
                
                if ($hasRealData($transformedItem, ['ma_lop', 'ten_mon_hoc']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['gd_lop_dh_trong_bm'] = $filteredItems;
            }
        }

        // 2. Giảng dạy ngoài bộ môn
        if ($keKhai->kekhaiGdLopDhNgoaibms && $keKhai->kekhaiGdLopDhNgoaibms->count() > 0) {
            $filteredItems = [];
            foreach ($keKhai->kekhaiGdLopDhNgoaibms as $item) {
                $transformedItem = [
                    'ma_lop' => $item->ten_lop_hoc_phan ?: '',
                    'ten_mon_hoc' => $item->ten_lop_hoc_phan ?: '',
                    'so_tiet_lt' => intval($item->kl_ke_hoach ?: 0),
                    'so_tiet_th' => 0,
                    'he_so' => floatval($item->he_so_qd ?: 1.0),
                    'tong_gio_quy_doi' => floatval($item->so_tiet_qd ?: 0),
                ];
                
                if ($hasRealData($transformedItem, ['ma_lop', 'ten_mon_hoc']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['gd_lop_dh_ngoai_bm'] = $filteredItems;
            }
        }

        // 3. Giảng dạy ngoài cơ sở
        if ($keKhai->kekhaiGdLopDhNgoaicss && $keKhai->kekhaiGdLopDhNgoaicss->count() > 0) {
            $filteredItems = [];
            foreach ($keKhai->kekhaiGdLopDhNgoaicss as $item) {
                $transformedItem = [
                    'ma_lop' => $item->ten_lop_hoc_phan ?: '',
                    'ten_mon_hoc' => $item->ten_lop_hoc_phan ?: '',
                    'so_tiet_lt' => intval($item->kl_ke_hoach ?: 0),
                    'so_tiet_th' => 0,
                    'he_so' => floatval($item->he_so_qd ?: 1.0),
                    'tong_gio_quy_doi' => floatval($item->so_tiet_qd ?: 0),
                ];
                
                if ($hasRealData($transformedItem, ['ma_lop', 'ten_mon_hoc']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['gd_lop_dh_ngoai_cs'] = $filteredItems;
            }
        }

        // 4-5. Giảng dạy thạc sĩ và tiến sĩ
        foreach (['kekhaiGdLopThss' => 'gd_lop_ths', 'kekhaiGdLopTss' => 'gd_lop_ts'] as $relation => $key) {
            if ($keKhai->$relation && $keKhai->$relation->count() > 0) {
                $filteredItems = [];
                foreach ($keKhai->$relation as $item) {
                    $transformedItem = [
                        'ma_lop' => $item->ten_lop_hoc_phan ?: '',
                        'ten_mon_hoc' => $item->ten_lop_hoc_phan ?: '',
                        'so_tiet' => intval($item->kl_ke_hoach ?: 0),
                        'he_so' => floatval($item->he_so_qd ?: 1.0),
                        'tong_gio_quy_doi' => floatval($item->so_tiet_qd ?: 0),
                    ];
                    
                    if ($hasRealData($transformedItem, ['ma_lop', 'ten_mon_hoc']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                        $filteredItems[] = $transformedItem;
                    }
                }
                if (!empty($filteredItems)) {
                    $details[$key] = $filteredItems;
                }
            }
        }

        // 6. Hướng dẫn ĐATN
        if ($keKhai->kekhaiHdDatnDaihoc && $keKhai->kekhaiHdDatnDaihoc->count() > 0) {
            $filteredItems = [];
            foreach ($keKhai->kekhaiHdDatnDaihoc as $item) {
                $transformedItem = [
                    'ten_sinh_vien' => $item->quyet_dinh_dot_hk ?: '',
                    'ten_de_tai' => $item->quyet_dinh_dot_hk ?: '',
                    'so_luong_sv' => intval(($item->so_luong_sv_cttt ?: 0) + ($item->so_luong_sv_dai_tra ?: 0)),
                    'he_so' => 1.0,
                    'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_gv_nhap ?: 0),
                ];
                
                if ($hasRealData($transformedItem, ['ten_sinh_vien', 'ten_de_tai']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['hd_datn_daihoc'] = $filteredItems;
            }
        }

        // 7-8. Hướng dẫn LV ThS và LA TS
        $hdMapping = [
            'kekhaiHdLvThacsis' => 'hd_lv_thacsi',
            'kekhaiHdLaTiensis' => 'hd_la_tiensi'
        ];
        
        foreach ($hdMapping as $relation => $key) {
            if ($keKhai->$relation && $keKhai->$relation->count() > 0) {
                $filteredItems = [];
                foreach ($keKhai->$relation as $item) {
                    $transformedItem = [
                        'ten_hoc_vien' => $item->quyet_dinh_dot_hk ?: '',
                        'ten_de_tai' => $key === 'hd_la_tiensi' ? ($item->loai_dao_tao_ts ?: '') : ($item->quyet_dinh_dot_hk ?: ''),
                        'vai_tro' => 'HD',
                        'he_so' => 1.0,
                        'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_gv_nhap ?: 0),
                    ];
                    
                    if ($hasRealData($transformedItem, ['ten_hoc_vien', 'ten_de_tai']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                        $filteredItems[] = $transformedItem;
                    }
                }
                if (!empty($filteredItems)) {
                    $details[$key] = $filteredItems;
                }
            }
        }

        // 9-10. Đánh giá HP TN ĐH và LV ThS
        $dgMapping = [
            'kekhaiDgHpTnDaihoc' => 'dg_hp_tn_daihoc',
            'kekhaiDgLvThacsis' => 'dg_lv_thacsi'
        ];
        
        foreach ($dgMapping as $relation => $key) {
            if ($keKhai->$relation && $keKhai->$relation->count() > 0) {
                $filteredItems = [];
                foreach ($keKhai->$relation as $item) {
                    $transformedItem = [
                        'ten_sinh_vien' => $item->hoi_dong_dot_hk ?: '',
                        'ten_de_tai' => $item->hoi_dong_dot_hk ?: '',
                        'vai_tro' => 'ĐG',
                        'he_so' => 1.0,
                        'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_gv_nhap ?: 0),
                    ];
                    
                    if ($hasRealData($transformedItem, ['ten_sinh_vien', 'ten_de_tai']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                        $filteredItems[] = $transformedItem;
                    }
                }
                if (!empty($filteredItems)) {
                    $details[$key] = $filteredItems;
                }
            }
        }

        // 11-14. Khảo thí các loại
        $khaoThiMapping = [
            'kekhaiKhaothiDaihocTrongbms' => 'khao_thi_dh_trong_bm',
            'kekhaiKhaothiDaihocNgoaibms' => 'khao_thi_dh_ngoai_bm',
            'kekhaiKhaothiThacsis' => 'khao_thi_thacsi',
            'kekhaiKhaothiTiensis' => 'khao_thi_tiensi'
        ];
        
        foreach ($khaoThiMapping as $relation => $key) {
            if ($keKhai->$relation && $keKhai->$relation->count() > 0) {
                $filteredItems = [];
                foreach ($keKhai->$relation as $item) {
                    $transformedItem = [
                        'ten_mon_thi' => $item->hang_muc ?: '',
                        'so_ca_thi' => intval($item->so_ca_bai_mon ?: 0),
                        'he_so' => floatval($item->dinh_muc_gv_nhap ?: 1.0),
                        'tong_gio_quy_doi' => floatval($item->so_tiet_qd ?: 0),
                    ];
                    
                    if ($hasRealData($transformedItem, ['ten_mon_thi']) || $transformedItem['so_ca_thi'] > 0 || $transformedItem['tong_gio_quy_doi'] > 0) {
                        $filteredItems[] = $transformedItem;
                    }
                }
                if (!empty($filteredItems)) {
                    $details[$key] = $filteredItems;
                }
            }
        }

        // 15. Đánh giá luận án tiến sĩ theo đợt
        if ($keKhai->kekhaiDgLaTiensiDots && $keKhai->kekhaiDgLaTiensiDots->count() > 0) {
            $filteredItems = [];
            foreach ($keKhai->kekhaiDgLaTiensiDots as $item) {
                $transformedItem = [
                    'thong_tin_dot' => $item->thong_tin_dot ?: $item->hoi_dong_dot_hk ?: '',
                    'vai_tro' => $item->vai_tro ?: 'ĐG',
                    'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_cho_dot ?: 0),
                    'ghi_chu' => $item->ghi_chu ?: '',
                ];
                
                if ($hasRealData($transformedItem, ['thong_tin_dot']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['dg_la_tiensi_dot'] = $filteredItems;
            }
        }

        // 16. Xây dựng CTĐT
        if ($keKhai->kekhaiXdCtdtVaKhacGds && $keKhai->kekhaiXdCtdtVaKhacGds->count() > 0) {
            $filteredItems = [];
            foreach ($keKhai->kekhaiXdCtdtVaKhacGds as $item) {
                $transformedItem = [
                    'ten_hoat_dong' => $item->ten_hoat_dong ?: '',
                    'vai_tro' => '',
                    'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_gv_nhap ?: 0),
                    'ghi_chu' => $item->ghi_chu ?: '',
                ];
                
                if ($hasRealData($transformedItem, ['ten_hoat_dong']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['xd_ctdt_va_khac_gd'] = $filteredItems;
            }
        }

        // 17. NCKH
        if ($keKhai->kekhaiNckhNamHocs && $keKhai->kekhaiNckhNamHocs->count() > 0) {
            $filteredItems = [];
            foreach ($keKhai->kekhaiNckhNamHocs as $item) {
                $transformedItem = [
                    'ten_de_tai' => $item->ten_hoat_dong_san_pham ?: '',
                    'vai_tro' => $item->ket_qua_dat_duoc_quy_doi ?: '',
                    'tong_gio_nckh_gv_nhap' => floatval($item->tong_gio_nckh_gv_nhap ?: 0),
                    'ghi_chu' => $item->ghi_chu ?: '',
                ];
                
                if ($hasRealData($transformedItem, ['ten_de_tai']) || $transformedItem['tong_gio_nckh_gv_nhap'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['nckh_nam_hoc'] = $filteredItems;
            }
        }

        // 18. Công tác khác
        if ($keKhai->kekhaiCongtacKhacNamHocs && $keKhai->kekhaiCongtacKhacNamHocs->count() > 0) {
            $filteredItems = [];
            foreach ($keKhai->kekhaiCongtacKhacNamHocs as $item) {
                $transformedItem = [
                    'ten_cong_viec' => $item->ten_cong_tac ?: '',
                    'loai_cong_viec' => $item->loai_gio_quy_doi ?: '',
                    'gio_thuc_hien' => floatval($item->so_gio_quy_doi_gv_nhap ?: 0),
                    'ghi_chu' => $item->ghi_chu ?: '',
                ];
                
                if ($hasRealData($transformedItem, ['ten_cong_viec']) || $transformedItem['gio_thuc_hien'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['congtac_khac_nam_hoc'] = $filteredItems;
            }
        }

        // Remove empty sections from details array
        $details = array_filter($details, function($section) {
            return !empty($section);
        });

        Log::info("Final filtered details summary: " . json_encode(array_map('count', $details)));

        return $details;
    }

    private function getEagerLoadRelationsForReport()
    {
        // Tương tự như getEagerLoadRelationsForTongHopDetailView trong LecturerController
        // nhưng có thể cần thêm thông tin của User.BoMon.Khoa
        return [
            'namHoc',
            'nguoiDung:id,ho_ten,ma_gv,hoc_ham,hoc_vi,bo_mon_id',
            'nguoiDung.boMon:id,ten_bo_mon,khoa_id',
            'nguoiDung.boMon.khoa:id,ten_khoa', // Thêm thông tin Khoa
            'lichSuPheDuyet.nguoiThucHien:id,ho_ten',
            'kekhaiGdLopDhTrongbms',
            'kekhaiGdLopDhNgoaibms',
            'kekhaiGdLopDhNgoaicss',
            'kekhaiGdLopThss',
            'kekhaiGdLopTss',
            'kekhaiHdDatnDaihoc',
            'kekhaiHdLvThacsis',
            'kekhaiHdLaTiensis',
            'kekhaiDgHpTnDaihoc',
            'kekhaiDgLvThacsis',
            'kekhaiDgLaTiensiDots.nhiemVus',
            'kekhaiKhaothiDaihocTrongbms',
            'kekhaiKhaothiDaihocNgoaibms',
            'kekhaiKhaothiThacsis',
            'kekhaiKhaothiTiensis',
            'kekhaiXdCtdtVaKhacGds',
            'kekhaiNckhNamHocs.minhChungs',
            'kekhaiCongtacKhacNamHocs'
        ];
    }

    private function getDefaultReportColumns($reportType)
    {
        // Trả về mảng các cột mặc định cho từng loại báo cáo nếu người dùng không chọn
        if ($reportType === 'overview_csv_format' || $reportType === 'detailed_csv_format' || $reportType === 'comprehensive_csv_format') {
            // Các cột tương ứng với file CSV bạn cung cấp
           
            // Ví dụ cho bảng "Tổng hợp khối lượng" (Mục I.2)
            return [
                'ma_gv',
                'ho_ten',
                'hoc_ham',
                'hoc_vi', // Thông tin GV
                // Cột 1->12 của Mục I.2 (Tổng hợp khối lượng)
                'tong_gio_khcn_kekhai_tam_tinh', // C1
                'tong_gio_congtackhac_quydoi_tam_tinh', // C2
                'tong_gio_coithi_chamthi_dh_tam_tinh', // C3
                'tong_gio_gd_danhgia_tam_tinh', // C4
                'tong_sl_huongdan_la_tam_tinh', // C6
                'tong_sl_huongdan_lv_tam_tinh', // C7
                'tong_sl_huongdan_dakl_tam_tinh', // C8
                'tong_gio_huongdan_quy_doi_tam_tinh', // C9
                'tong_gio_khcn_kekhai_tam_tinh', // C10 (trùng C1)
                'tong_gio_giangday_final_tam_tinh', // C11
                'tong_gio_gdxatruong_tam_tinh', // C12
                // Thêm các cột cho Mục I.1 (Khối lượng vượt giờ)
                'dinhmuc_gd_apdung',
                'dinhmuc_khcn_apdung',
                'gio_khcn_thuchien_xet_dinhmuc_tam_tinh', // C3.I1
                'gio_gd_danhgia_xet_dinhmuc_tam_tinh', // C4.I1
                'gio_gdxatruong_xet_dinhmuc_tam_tinh', // C5.I1
                'gio_gd_hoanthanh_sau_butru_tam_tinh', // C6.I1
                'sl_huongdan_la_conlai_tam_tinh', // C7.I1
                'sl_huongdan_lv_conlai_tam_tinh', // C8.I1
                'sl_huongdan_dakl_conlai_tam_tinh', // C9.I1
                'gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh', // Hoàn thành KHCN so với ĐM (Bảng bổ sung)
                'gio_vuot_gd_khong_hd_tam_tinh', // Số tiết vượt (không tính HD)
                'ket_qua_thua_thieu_gio_gd_tam_tinh', // Thừa/thiếu cuối cùng
                'trang_thai_phe_duyet',
                'thoi_gian_gui',
                'thoi_gian_duyet_bm'
            ];
        }
        // Mặc định cho các loại báo cáo khác
        return ['ma_gv', 'ho_ten', 'tong_gio_thuc_hien_final_duyet', 'trang_thai_phe_duyet'];
    }

    // Các hàm cũ: getHocKy, getBoMon (nếu Manager là Trưởng Khoa và cần xem các bộ môn)
    // có thể được thay bằng các hàm lấy danh sách chung (ví dụ: getNamHocList)
    public function getNamHocList()
    {
        return response()->json(NamHoc::orderBy('ngay_bat_dau', 'desc')->get(['id', 'ten_nam_hoc', 'la_nam_hien_hanh']));
    }

    public function boMonList()
    {
        $manager = Auth::user();
        $khoaId = $manager->boMon ? $manager->boMon->khoa_id : null;

        if (!$khoaId) {
            return response()->json(['message' => 'Manager không thuộc khoa nào'], 403);
        }

        $boMonList = BoMon::where('khoa_id', $khoaId)->select('id', 'ten_bo_mon')->get();
        return response()->json($boMonList);
    }

    public function recalculateBeforeApprove(Request $request, $id)
    {
        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;
        
        if (!$boMonIdCuaManager) {
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $keKhai = KeKhaiTongHopNamHoc::whereHas('nguoiDung', function ($query) use ($boMonIdCuaManager) {
            $query->where('bo_mon_id', $boMonIdCuaManager);
        })->findOrFail($id);

        if ($keKhai->trang_thai_phe_duyet !== 1) { // Chỉ tính lại khi đang "Chờ duyệt BM"
            return response()->json(['message' => 'Kê khai không ở trạng thái chờ phê duyệt'], 400);
        }

        try {
            // Check if WorkloadService is available
            if (!isset($this->workloadService)) {
                return response()->json(['message' => 'WorkloadService không khả dụng'], 500);
            }

            // Tính toán lại khối lượng công việc
            $this->workloadService->calculateAllForKeKhaiTongHop($keKhai->id);
            
            // Refresh the model để lấy dữ liệu mới nhất
            $keKhai->refresh();
            
            // Load relationships for response
            $keKhai->load([
                'nguoiDung:id,ho_ten,ma_gv,email,hoc_ham,hoc_vi,bo_mon_id',
                'nguoiDung.boMon:id,ten_bo_mon',
                'namHoc:id,ten_nam_hoc',
                'lichSuPheDuyet.nguoiThucHien:id,ho_ten,ma_gv'
            ]);

            return response()->json([
                'message' => 'Tính toán lại khối lượng công việc thành công.',
                'data' => $keKhai
            ]);
            
        } catch (\Exception $e) {
            Log::error("Lỗi tính toán lại khối lượng cho kê khai ID {$id}: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return response()->json(['message' => 'Lỗi hệ thống khi tính toán lại khối lượng: ' . $e->getMessage()], 500);
        }
    }
}
