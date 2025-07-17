<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\KeKhaiTongHopNamHoc;
use App\Models\LuongGiangVien; 
use App\Models\LichSuPheDuyet;
use App\Models\NamHoc; 
use App\Models\BoMon;
use App\Models\KeKhaiThoiGian; 
use Illuminate\Support\Facades\Auth;
use App\Mail\ReminderNotification; 
use App\Mail\KeKhaiApproved;
use App\Mail\KeKhaiRejected;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\KekhaiReportExport; 
use ZipArchive;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use App\Services\WorkloadService; 

class ManagerController extends Controller
{
    protected $workloadService;

    public function __construct(WorkloadService $workloadService)
    {
        $this->workloadService = $workloadService;
    }

    public function getProfile(Request $request)
    {
        return response()->json($request->user()->load('boMon.khoa'));
    }

    // API lấy danh sách kê khai tổng hợp của giảng viên trong bộ môn
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
            'nguoiDung:id,ho_ten,ma_gv,email,hoc_ham,hoc_vi,bo_mon_id',
            'nguoiDung.boMon:id,ten_bo_mon',
            'namHoc:id,ten_nam_hoc',
        ])
            ->whereHas('nguoiDung', function ($q) use ($boMonIdCuaManager) {
                $q->where('bo_mon_id', $boMonIdCuaManager);
            });

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

        return response()->json([
            'ke_khai_list' => $keKhaiList,
            'bo_mon_list' => $boMonTrongKhoa,
        ]);
    }

    // API lấy chi tiết một bản kê khai tổng hợp (bao gồm tất cả chi tiết con)
    public function keKhaiShow($id) 
    {
        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;

        if (!$boMonIdCuaManager) { 
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $keKhaiTongHop = KeKhaiTongHopNamHoc::with([
            'nguoiDung:id,ho_ten,ma_gv,email,dien_thoai,hoc_ham,hoc_vi,bo_mon_id',
            'nguoiDung.boMon:id,ten_bo_mon',
            'namHoc:id,ten_nam_hoc',
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

        // $this->workloadService->calculateAllForKeKhaiTongHop($keKhaiTongHop->id);
        // $keKhaiTongHop->refresh()->load();

        return response()->json($keKhaiTongHop);
    }

    // API phê duyệt bản kê khai tổng hợp (chuyển trạng thái sang Đã duyệt BM)
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

        if ($keKhai->trang_thai_phe_duyet !== 1) { 
            return response()->json(['message' => 'Kê khai không ở trạng thái chờ phê duyệt'], 400);
        }

        DB::beginTransaction();
        try {
            if (isset($this->workloadService)) {
                try {
                    $this->workloadService->calculateAllForKeKhaiTongHop($keKhai->id);
                    $keKhai->refresh();
                } catch (\Exception $e) {
                    return response()->json(['message' => 'Lỗi hệ thống khi tính toán khối lượng: ' . $e->getMessage()], 500);}
            }

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
                'dinhmuc_gd_apdung',  
                'dinhmuc_khcn_apdung', 
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

            $tableColumns = Schema::getColumnListing('ke_khai_tong_hop_nam_hoc');
            
            foreach ($fieldsToCopy as $field) {
                $tamTinhField = $field . '_tam_tinh';
                $duyetField = $field . '_duyet';
                
                if (in_array($tamTinhField, $tableColumns) && in_array($duyetField, $tableColumns)) {
                    $tamTinhValue = $keKhai->{$tamTinhField};
                    $keKhai->{$duyetField} = $tamTinhValue;
                } else {
                    Log::warning("Lỗi copy các trường: {$tamTinhField} hoặc {$duyetField} không tồn tại trong bảng ke_khai_tong_hop_nam_hoc");
                }
            }

            $keKhai->trang_thai_phe_duyet = 3; 
            $keKhai->nguoi_duyet_bm_id = $manager->id;
            $keKhai->thoi_gian_duyet_bm = now();
            $keKhai->ly_do_tu_choi = null; 
            $keKhai->save();

            LichSuPheDuyet::create([
                'ke_khai_tong_hop_nam_hoc_id' => $keKhai->id,
                'nguoi_thuc_hien_id' => $manager->id,
                'hanh_dong' => 'approve_bm',
                'trang_thai_truoc' => 1,
                'trang_thai_sau' => 3,
                'ghi_chu' => $request->input('ghi_chu_quan_ly', 'Trưởng Bộ môn đã duyệt.'),
            ]);

            if ($keKhai->nguoiDung && $keKhai->nguoiDung->email) {
                try {
                    $keKhai->load(['nguoiDung', 'namHoc']);
                    
                    Mail::to($keKhai->nguoiDung->email)->send(new KeKhaiApproved($keKhai, $keKhai->namHoc));
                } catch (\Exception $e) {
                    
                }
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

    // API từ chối bản kê khai tổng hợp (chuyển trạng thái sang BM Trả lại)
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

        if ($keKhai->trang_thai_phe_duyet !== 1) { 
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
            $keKhai->trang_thai_phe_duyet = 4; 
            $keKhai->ly_do_tu_choi = $request->input('ly_do_tu_choi');
            $keKhai->nguoi_duyet_bm_id = $manager->id; 
            $keKhai->thoi_gian_duyet_bm = now(); 
            $keKhai->save();

            LichSuPheDuyet::create([
                'ke_khai_tong_hop_nam_hoc_id' => $keKhai->id,
                'nguoi_thuc_hien_id' => $manager->id,
                'hanh_dong' => 'reject_bm',
                'trang_thai_truoc' => 1,
                'trang_thai_sau' => 4,
                'ghi_chu' => $request->input('ly_do_tu_choi'),
            ]);

            if ($keKhai->nguoiDung && $keKhai->nguoiDung->email) {
                try {
                    $keKhai->load(['nguoiDung', 'namHoc']);
                    
                    Mail::to($keKhai->nguoiDung->email)->send(new KeKhaiRejected($keKhai, $keKhai->namHoc, $request->input('ly_do_tu_choi')));                    
                } catch (\Exception $e) {
                    
                }
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
            $namHoc = NamHoc::find($namHocId);
            $keKhaiThoiGian = KeKhaiThoiGian::where('nam_hoc_id', $namHocId)->first();
            
            $nguoiNhanQuery = User::where('bo_mon_id', $boMonIdCuaManager)
                ->where('vai_tro', '3')
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
                    
                    Log::info("Thông báo đã được gửi đến: {$nguoiNhan->email} cho nam_hoc_id: {$namHocId}");
                    
                } catch (\Exception $e) {
                    $failedEmails[] = $nguoiNhan->email;
                    Log::error("Gửi mail thất bại cho {$nguoiNhan->email}: " . $e->getMessage());
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

    // API thống kê tổng hợp khối lượng, xếp hạng, xu hướng theo thời gian trong bộ môn
    public function statistics(Request $request)
    {
        $manager = Auth::user();
        $boMonIdCuaManager = $manager->bo_mon_id;
        if (!$boMonIdCuaManager) {
            return response()->json(['message' => 'Quản lý không thuộc bộ môn nào.'], 403);
        }

        $namHocId = $request->query('nam_hoc_id'); 

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
            'giang_day_final' => round(floatval((clone $baseQuery)->where('trang_thai_phe_duyet', 3)->sum('tong_gio_giangday_final_duyet')), 2), // C11.I2
            'nckh_final'      => round(floatval((clone $baseQuery)->where('trang_thai_phe_duyet', 3)->sum('tong_gio_khcn_kekhai_duyet')), 2),      // C1.I2
            'congtac_khac_gd' => round(floatval((clone $baseQuery)->where('trang_thai_phe_duyet', 3)->sum('tong_gio_congtackhac_quydoi_duyet')), 2), // C2.I2
            'coithi_chamthi_dh' => round(floatval((clone $baseQuery)->where('trang_thai_phe_duyet', 3)->sum('tong_gio_coithi_chamthi_dh_duyet')), 2), // C3.I2
            'gd_xa_truong'    => round(floatval((clone $baseQuery)->where('trang_thai_phe_duyet', 3)->sum('tong_gio_gdxatruong_duyet')), 2)        // C12.I2
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
                ->where('trang_thai_phe_duyet', 3) 
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

    // API xuất báo cáo tổng hợp, chi tiết, vượt giờ (Excel/PDF)
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
        $searchGV = is_array($searchGV) ? $searchGV[0] ?? null : $searchGV;
        $isPreview = $request->input('preview') === 'true';

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

        if ($trangThaiFilter !== null && $trangThaiFilter !== '') {
            $query->where('trang_thai_phe_duyet', $trangThaiFilter);
        }

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
            return response()->json(['message' => 'Lỗi khi xuất báo cáo: ' . $e->getMessage()], 500);
        }
    }

    private function exportExcelReport($keKhaiTongHops, $salaryData, $namHoc, $boMon, $fileName)
    {
        try {
            $export = new KekhaiReportExport($keKhaiTongHops, $salaryData, $namHoc, $boMon);
            return Excel::download($export, "{$fileName}.xlsx");
        } catch (\Exception $e) {
            throw new \Exception('Lỗi khi xuất Excel: ' . $e->getMessage());
        }
    }

    private function exportPdfReport($keKhaiTongHops, $salaryData, $namHoc, $boMon, $fileName, $request)
    {
        try {
            $tempDir = storage_path('app/temp/' . Str::random(10));
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $pdfFiles = [];

            $overtimeReportData = $this->transformDataForOvertimeReport($keKhaiTongHops, $salaryData);
            $workloadReportData = $this->transformDataForWorkloadReport($keKhaiTongHops);

            // 1: BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ (KLVG)
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

            // 2: BẢNG TỔNG HỢP KHỐI LƯỢNG CÔNG TÁC (THKL)
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

            foreach ($keKhaiTongHops as $index => $keKhai) {
                try {
                    $lecturerDetailData = $this->transformDataForLecturerDetail($keKhai, $salaryData);

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

                    $lecturerName = $keKhai->nguoiDung->ho_ten ?? 'Unknown';
                    // $cleanName = preg_replace('/[^a-zA-Z0-9\s]/', '', $lecturerName);
                    // $cleanName = preg_replace('/\s+/', '_', trim($cleanName));
                    $maGV = $keKhai->nguoiDung->ma_gv ?? 'NoCode';

                    $lecturerFile = $tempDir . '/' . sprintf('03_%02d_ChiTiet_%s_%s.pdf', $index + 1, $lecturerName, $maGV);

                    $lecturerPdf->save($lecturerFile);
                    $pdfFiles[] = $lecturerFile;

                } catch (\Exception $e) {
                    Log::error("Dữ liệu kê khai: " . json_encode([
                        'ho_ten' => $keKhai->nguoiDung->ho_ten ?? 'N/A',
                        'ma_gv' => $keKhai->nguoiDung->ma_gv ?? 'N/A',
                        'id' => $keKhai->id ?? 'N/A'
                    ]));
                    continue;
                }
            }

            $zipFileName = "{$fileName}.zip";
            $zipPath = storage_path('app/temp/' . $zipFileName);

            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE) === TRUE) {
                foreach ($pdfFiles as $file) {
                    if (file_exists($file)) {
                        $zip->addFile($file, basename($file));
                        Log::info("Thêm zip: " . basename($file) . " (size: " . filesize($file) . " bytes)");
                    } else {
                        Log::warning("Không tìm thấy file để zip: " . $file);
                    }
                }
                $zip->close();

                foreach ($pdfFiles as $file) {
                    if (file_exists($file)) {
                        unlink($file);
                    }
                }
                rmdir($tempDir);

                return response()->download($zipPath)->deleteFileAfterSend(true);
            } else {
                throw new \Exception('Không thể tạo file ZIP.');
            }
        } catch (\Exception $e) {
            Log::error('Stack trace: ' . $e->getTraceAsString());

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
            $mucLuongCoBan = $salaryInfo ? floatval($salaryInfo->muc_luong_co_ban ?? 0) : 0;
            $thanhTien = $gioVuot * $mucLuongCoBan;

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
                'muc_luong_co_ban' => $mucLuongCoBan, 
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

        $hasRealData = function($item, $checkFields) {
            foreach ($checkFields as $field) {
                $value = $item[$field] ?? null;
                if (!empty($value) && $value !== '' && $value !== '0' && $value !== 0) {
                    return true;
                }
            }
            return false;
        };

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

        $details = array_filter($details, function($section) {
            return !empty($section);
        });

        return $details;
    }

    private function getEagerLoadRelationsForReport()
    {
        return [
            'namHoc',
            'nguoiDung:id,ho_ten,ma_gv,hoc_ham,hoc_vi,bo_mon_id',
            'nguoiDung.boMon:id,ten_bo_mon,khoa_id',
            'nguoiDung.boMon.khoa:id,ten_khoa', 
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

    // API tính toán lại khối lượng công việc trước khi duyệt
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

        if ($keKhai->trang_thai_phe_duyet !== 1) { 
            return response()->json(['message' => 'Kê khai không ở trạng thái chờ phê duyệt'], 400);
        }

        try {
            if (!isset($this->workloadService)) {
                return response()->json(['message' => 'WorkloadService không khả dụng'], 500);
            }

            $this->workloadService->calculateAllForKeKhaiTongHop($keKhai->id);
            
            $keKhai->refresh();
            
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
