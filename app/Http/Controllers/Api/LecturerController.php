<?php

/**
 * LecturerController - Controller chính cho các chức năng liên quan đến giảng viên tự kê khai khối lượng công việc hàng năm.
 * 
 * Chức năng chính:
 * - Quản lý thông tin kê khai tổng hợp và chi tiết theo năm học cho từng giảng viên.
 * - Lưu, cập nhật, xóa, nộp bản kê khai, thống kê tổng hợp, lấy dữ liệu phục vụ báo cáo, biểu đồ.
 * - Đảm bảo các nghiệp vụ về thời gian kê khai, trạng thái phê duyệt, định mức cá nhân, kiểm tra dữ liệu hợp lệ.
 * 
 * Lưu ý quan trọng:
 * - Các hàm helper, hàm private chỉ dùng nội bộ controller, không expose ra ngoài API.
 * - Khi chỉnh sửa nghiệp vụ cần kiểm tra kỹ các hàm liên quan đến trạng thái, định mức, thời gian kê khai.
 * - Đảm bảo các hàm validate dữ liệu đầu vào, kiểm tra quyền truy cập, trạng thái bản ghi trước khi thao tác.
 * - Các thao tác ghi/xóa dữ liệu đều đặt trong transaction để đảm bảo toàn vẹn dữ liệu.
 * - Khi thêm mới nghiệp vụ cần chú thích rõ ràng, cập nhật lại các điểm lưu ý liên quan.
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KeKhaiTongHopNamHoc;
use App\Models\KeKhaiThoiGian;
use App\Models\NamHoc;
use App\Models\MinhChung;
use App\Models\User;
use App\Models\DinhMucCaNhanTheoNam;

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
use App\Models\KekhaiDgLaTiensiNhiemvu;
use App\Models\KekhaiKhaothiDaihocTrongbm;
use App\Models\KekhaiKhaothiDaihocNgoaibm;
use App\Models\KekhaiKhaothiThacsi;
use App\Models\KekhaiKhaothiTiensi;
use App\Models\KekhaiXdCtdtVaKhacGd;
use App\Models\KekhaiNckhNamHoc;
use App\Models\KekhaiCongtacKhacNamHoc;
use App\Models\DmHeSoChung;

use App\Services\WorkloadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class LecturerController extends Controller
{
    protected $workloadService;

    public function __construct(WorkloadService $workloadService)
    {
        $this->workloadService = $workloadService;
    }

    protected function checkKeKhaiThoiGian($namHocId)
    {
        $now = now();
        $thoiGian = KeKhaiThoiGian::where('nam_hoc_id', $namHocId)
            ->where('thoi_gian_bat_dau', '<=', $now)
            ->where('thoi_gian_ket_thuc', '>=', $now)
            ->first();
        return $thoiGian ? true : false;
    }

    public function getKeKhaiThoiGian(Request $request)
    {
        $namHocId = $request->query('nam_hoc_id');
        if (!$namHocId) {
            return response()->json(['message' => 'Vui lòng cung cấp năm học'], 400);
        }
        $thoiGian = KeKhaiThoiGian::where('nam_hoc_id', $namHocId)->first();
        if (!$thoiGian) {
            return response()->json(['message' => 'Không có thời gian kê khai cho năm học này'], 404);
        }
        return response()->json([
            'thoi_gian_bat_dau' => $thoiGian->thoi_gian_bat_dau->toDateTimeString(),
            'thoi_gian_ket_thuc' => $thoiGian->thoi_gian_ket_thuc->toDateTimeString(),
            'ghi_chu' => $thoiGian->ghi_chu,
            'nam_hoc_id' => $thoiGian->nam_hoc_id
        ]);
    }

    public function getProfile(Request $request)
    {
        return response()->json($request->user()->load('boMon.khoa'));
    }

    public function updatePhone(Request $request)
    {
        $user = User::find(auth()->id());
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy thông tin người dùng'], 404);
        }

        try {
            $validated = $request->validate(['dien_thoai' => 'nullable|string|regex:/^[0-9]{10,11}$/|max:20']);
            $user->dien_thoai = $validated['dien_thoai'];
            $user->save();
            return response()->json(['success' => true, 'message' => 'Cập nhật số điện thoại thành công', 'data' => ['dien_thoai' => $user->dien_thoai]]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi cập nhật số điện thoại: ' . $e->getMessage()], 500);
        }
    }

    public function getNamHoc()
    {
        return response()->json(NamHoc::orderBy('ngay_bat_dau', 'desc')->get());
    }

    public function getDmHeSoChung(Request $request)
    {
        try {
            $data = DmHeSoChung::all();
            return response()->json(['data' => $data]);
        } catch (\Exception $e) {
            Log::error("Lỗi lấy DM Hệ số chung: " . $e->getMessage());
            return response()->json(['message' => 'Không thể tải danh mục hệ số chung.'], 500);
        }
    }

    public function startOrGetKeKhaiTongHopNamHoc(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
        ]);
        $namHocId = $validated['nam_hoc_id'];

        $keKhaiTongHop = KeKhaiTongHopNamHoc::where('nguoi_dung_id', $user->id)
            ->where('nam_hoc_id', $namHocId)
            ->with(['namHoc', 'nguoiDung']) 
            ->first();

        $namHoc = NamHoc::find($namHocId);
        if (!$namHoc) {
            return response()->json(['message' => 'Không tìm thấy thông tin năm học.'], 404);
        }

        if ($keKhaiTongHop) {
            $dinhMucCaNhan = DinhMucCaNhanTheoNam::where('nguoi_dung_id', $user->id)
                ->where('nam_hoc_id', $namHocId)
                ->first();
            if ($dinhMucCaNhan) {
                $keKhaiTongHop->dinhmuc_gd_apdung = $dinhMucCaNhan->dinh_muc_gd;
                $keKhaiTongHop->dinhmuc_khcn_apdung = $dinhMucCaNhan->dinh_muc_khcn;
                $keKhaiTongHop->saveQuietly();
            } else {
                $keKhaiTongHop->dinhmuc_gd_apdung = 0; 
                $keKhaiTongHop->dinhmuc_khcn_apdung = 0;
                $keKhaiTongHop->saveQuietly();
            }
            return response()->json(['ke_khai_tong_hop_nam_hoc' => $keKhaiTongHop]);
        }

        if (!$this->checkKeKhaiThoiGian($namHocId)) {
            return response()->json(['message' => 'Thời gian kê khai cho năm học này không hợp lệ hoặc đã hết hạn.'], 403);
        }

        $dinhMucCaNhanKhiTaoMoi = DinhMucCaNhanTheoNam::where('nguoi_dung_id', $user->id)
            ->where('nam_hoc_id', $namHocId)
            ->first();

        $newKeKhaiTongHop = KeKhaiTongHopNamHoc::create([
            'nguoi_dung_id' => $user->id,
            'nam_hoc_id' => $namHocId,
            'trang_thai_phe_duyet' => 0,
            'dinhmuc_gd_apdung' => $dinhMucCaNhanKhiTaoMoi ? $dinhMucCaNhanKhiTaoMoi->dinh_muc_gd : 0,
            'dinhmuc_khcn_apdung' => $dinhMucCaNhanKhiTaoMoi ? $dinhMucCaNhanKhiTaoMoi->dinh_muc_khcn : 0,
        ]);

        return response()->json(['ke_khai_tong_hop_nam_hoc' => $newKeKhaiTongHop->load(['namHoc', 'nguoiDung'])], 201);
    }

    public function updateDinhMucKeKhaiTongHop(Request $request, $id)
    {
        $user = auth()->user();
        $keKhaiTongHop = KeKhaiTongHopNamHoc::where('id', $id)
            ->where('nguoi_dung_id', $user->id)
            ->firstOrFail();

        if (!in_array($keKhaiTongHop->trang_thai_phe_duyet, [0, 4])) {
            return response()->json(['message' => 'Không thể cập nhật định mức cho kê khai ở trạng thái này.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'dinhmuc_gd_apdung' => 'required|numeric|min:0',
            'dinhmuc_khcn_apdung' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu định mức không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        $keKhaiTongHop->dinhmuc_gd_apdung = $request->input('dinhmuc_gd_apdung');
        $keKhaiTongHop->dinhmuc_khcn_apdung = $request->input('dinhmuc_khcn_apdung');
        $keKhaiTongHop->save();

        return response()->json(['message' => 'Cập nhật định mức thành công.', 'ke_khai_tong_hop_nam_hoc' => $keKhaiTongHop]);
    }

    private function xoaTatCaChiTietCu($keKhaiTongHopNamHocId)
    {
        // Xóa các bảng chi tiết
        KekhaiGdLopDhTrongbm::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiGdLopDhNgoaibm::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiGdLopDhNgoaics::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiGdLopThs::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiGdLopTs::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiHdDatnDaihoc::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiHdLvThacsi::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiHdLaTiensi::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiDgHpTnDaihoc::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiDgLvThacsi::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        $danhGiaLaTsDotIds = KekhaiDgLaTiensiDot::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->pluck('id');
        if ($danhGiaLaTsDotIds->isNotEmpty()) {
            KekhaiDgLaTiensiNhiemvu::whereIn('kekhai_dg_la_tiensi_dot_id', $danhGiaLaTsDotIds)->delete();
            KekhaiDgLaTiensiDot::whereIn('id', $danhGiaLaTsDotIds)->delete();
        }
        KekhaiKhaothiDaihocTrongbm::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiKhaothiDaihocNgoaibm::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiKhaothiThacsi::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiKhaothiTiensi::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiXdCtdtVaKhacGd::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiNckhNamHoc::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
        KekhaiCongtacKhacNamHoc::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->delete();
    }

    /**
     * Lưu toàn bộ dữ liệu kê khai chi tiết (batch) cho một bản kê khai tổng hợp.
     * Lưu ý:
     * - Kiểm tra quyền sở hữu bản kê khai, trạng thái, thời gian kê khai trước khi lưu.
     * - Dữ liệu truyền lên dạng JSON, cần validate kỹ cấu trúc và kiểu dữ liệu.
     * - Tất cả thao tác ghi dữ liệu đặt trong transaction để đảm bảo toàn vẹn.
     * - Nếu có lỗi sẽ rollback và log chi tiết lỗi.
     * - Khi lưu thành công sẽ tự động tính toán lại khối lượng qua WorkloadService.
     */
    public function storeKekhaiChiTietBatch(Request $request)
    {
        $user = auth()->user();
        $keKhaiTongHopNamHocId = $request->input('ke_khai_tong_hop_nam_hoc_id');

        $tongHopValidator = Validator::make(['ke_khai_tong_hop_nam_hoc_id' => $keKhaiTongHopNamHocId], [
            'ke_khai_tong_hop_nam_hoc_id' => 'required|exists:ke_khai_tong_hop_nam_hoc,id,nguoi_dung_id,' . $user->id,
        ]);
        if ($tongHopValidator->fails()) {
            return response()->json(['message' => 'ID Kê khai tổng hợp không hợp lệ.', 'errors' => $tongHopValidator->errors()], 422);
        }

        $keKhaiTongHop = KeKhaiTongHopNamHoc::findOrFail($keKhaiTongHopNamHocId);
        if (!$this->checkKeKhaiThoiGian($keKhaiTongHop->nam_hoc_id)) {
            return response()->json(['message' => 'Hết hạn kê khai hoặc thời gian chưa bắt đầu.'], 403);
        }
        if (!in_array($keKhaiTongHop->trang_thai_phe_duyet, [0, 4])) {
            return response()->json(['message' => 'Không thể chỉnh sửa kê khai đã nộp hoặc đang chờ duyệt.'], 403);
        }

        $keKhaiItemsJsonString = $request->input('ke_khai_items_json');
        $keKhaiItemsInput = json_decode($keKhaiItemsJsonString, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($keKhaiItemsInput)) {
            return response()->json(['message' => 'Dữ liệu ke_khai_items_json không hợp lệ.'], 422);
        }

        DB::beginTransaction();
        try {
            $this->xoaTatCaChiTietCu($keKhaiTongHopNamHocId);

            foreach ($keKhaiItemsInput as $index => $item) {
                $data = $item['data'] ?? [];
                $minhChungFile = $request->file("ke_khai_items_files.{$index}");
                $instance = null; 

                $commonDataToSave = ['ke_khai_tong_hop_nam_hoc_id' => $keKhaiTongHopNamHocId];
                foreach ($data as $key => $value) {

                    if (!in_array($key, ['id_temp', 'id_database', 'minh_chung_file', 'minh_chung_existing', 'minh_chung_existing_path', 'ten_hoat_dong', 'don_vi_tinh', 'dinh_muc_gio_tren_don_vi'])) {
                        $commonDataToSave[$key] = $value;
                    }
                }

                switch ($item['type']) {
                    case 'gd_lop_dh_trongbm':
                        $commonDataToSave['so_tiet_qd'] = round(floatval($data['kl_ke_hoach'] ?? 0) * floatval($data['he_so_qd'] ?? 0), 2);
                        KekhaiGdLopDhTrongbm::create($commonDataToSave);
                        break;
                    case 'gd_lop_dh_ngoaibm':
                        $commonDataToSave['so_tiet_qd'] = round(floatval($data['kl_ke_hoach'] ?? 0) * floatval($data['he_so_qd'] ?? 0), 2);
                        KekhaiGdLopDhNgoaibm::create($commonDataToSave);
                        break;
                    case 'gd_lop_dh_ngoaics':
                        $commonDataToSave['so_tiet_qd'] = round(floatval($data['kl_ke_hoach'] ?? 0) * floatval($data['he_so_qd'] ?? 0), 2);
                        KekhaiGdLopDhNgoaics::create($commonDataToSave);
                        break;
                    case 'gd_lop_ths':
                        $commonDataToSave['so_tiet_qd'] = round(floatval($data['kl_ke_hoach'] ?? 0) * floatval($data['he_so_qd'] ?? 0), 2);
                        KekhaiGdLopThs::create($commonDataToSave);
                        break;
                    case 'gd_lop_ts':
                        $commonDataToSave['so_tiet_qd'] = round(floatval($data['kl_ke_hoach'] ?? 0) * floatval($data['he_so_qd'] ?? 0), 2);
                        KekhaiGdLopTs::create($commonDataToSave);
                        break;
                    case 'hd_datn_daihoc':
                        KekhaiHdDatnDaihoc::create($commonDataToSave);
                        break;
                    case 'hd_lv_thacsi':
                        KekhaiHdLvThacsi::create($commonDataToSave);
                        break;
                    case 'hd_la_tiensi':
                        KekhaiHdLaTiensi::create($commonDataToSave);
                        break;
                    case 'dg_hp_tn_daihoc':
                        KekhaiDgHpTnDaihoc::create($commonDataToSave);
                        break;
                    case 'dg_lv_thacsi':
                        KekhaiDgLvThacsi::create($commonDataToSave);
                        break;
                    case 'dg_la_tiensi':
                        $nhiemVuArr = $data['nhiem_vu_ts_arr'] ?? [];
                        $dotChaData = $commonDataToSave;
                        unset($dotChaData['nhiem_vu_ts_arr']);
                        $dotCha = KekhaiDgLaTiensiDot::create($dotChaData);
                        $tongGioDotNay = 0;
                        if (is_array($nhiemVuArr)) {
                            foreach ($nhiemVuArr as $nvData) {
                                KekhaiDgLaTiensiNhiemvu::create([
                                    'kekhai_dg_la_tiensi_dot_id' => $dotCha->id,
                                    'ten_nhiem_vu' => $nvData['ten_nhiem_vu'] ?? 'N/A',
                                    'so_tiet_gv_nhap' => floatval($nvData['so_tiet_gv_nhap'] ?? 0),
                                    'ghi_chu' => $nvData['ghi_chu'] ?? null,
                                ]);
                                $tongGioDotNay += floatval($nvData['so_tiet_gv_nhap'] ?? 0);
                            }
                        }
                        $dotCha->update(['tong_gio_quydoi_cho_dot' => round($tongGioDotNay, 2)]);
                        break;
                    case 'khaothi_dh_trongbm':
                        $commonDataToSave['so_tiet_qd'] = round(floatval($data['so_ca_bai_mon'] ?? 0) * floatval($data['dinh_muc_gv_nhap'] ?? 0), 2);
                        KekhaiKhaothiDaihocTrongbm::create($commonDataToSave);
                        break;
                    case 'khaothi_dh_ngoaibm':
                        $commonDataToSave['so_tiet_qd'] = round(floatval($data['so_ca_bai_mon'] ?? 0) * floatval($data['dinh_muc_gv_nhap'] ?? 0), 2);
                        KekhaiKhaothiDaihocNgoaibm::create($commonDataToSave);
                        break;
                    case 'khaothi_ths':
                        $commonDataToSave['so_tiet_qd'] = round(floatval($data['so_ca_bai_mon'] ?? 0) * floatval($data['dinh_muc_gv_nhap'] ?? 0), 2);
                        KekhaiKhaothiThacsi::create($commonDataToSave);
                        break;
                    case 'khaothi_ts':
                        $commonDataToSave['so_tiet_qd'] = round(floatval($data['so_ca_bai_mon'] ?? 0) * floatval($data['dinh_muc_gv_nhap'] ?? 0), 2);
                        KekhaiKhaothiTiensi::create($commonDataToSave);
                        break;
                    case 'xd_ctdt_va_khac_gd':
                        KekhaiXdCtdtVaKhacGd::create($commonDataToSave);
                        break;
                    case 'nckh':
                        $instance = KekhaiNckhNamHoc::create($commonDataToSave);
                        if ($instance && $minhChungFile instanceof \Illuminate\Http\UploadedFile) {
                            $path = $minhChungFile->store("minh_chung/nckh/{$keKhaiTongHopNamHocId}", 'public');
                            MinhChung::create([
                                'kekhai_nckh_nam_hoc_id' => $instance->id,
                                'duong_dan' => $path,
                                'ten_file' => $minhChungFile->getClientOriginalName(),
                            ]);
                        }
                        break;
                    case 'congtac_khac':
                        KekhaiCongtacKhacNamHoc::create($commonDataToSave);
                        break;
                }
            }

            $this->workloadService->calculateAllForKeKhaiTongHop($keKhaiTongHopNamHocId);
            DB::commit();
            $keKhaiTongHop->refresh()->load($this->getEagerLoadRelationsForTongHopListView());
            return response()->json(['message' => 'Lưu toàn bộ kê khai thành công!', 'ke_khai_tong_hop_nam_hoc' => $keKhaiTongHop]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi lưu kê khai batch: ' . $e->getMessage(), ['trace' => $e->getTraceAsString(), 'request' => $request->except('ke_khai_items_files')]);
            return response()->json(['message' => 'Lỗi hệ thống khi lưu kê khai. Chi tiết: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Lấy toàn bộ chi tiết kê khai cho một bản tổng hợp (dùng cho giao diện chỉnh sửa).
     * Lưu ý: Trả về đầy đủ các loại chi tiết, bao gồm cả minh chứng nếu có.
     */
    public function getKekhaiChiTiet(Request $request)
    {
        $user = auth()->user();
        $validator = Validator::make($request->all(), [
            'ke_khai_tong_hop_nam_hoc_id' => 'required|exists:ke_khai_tong_hop_nam_hoc,id,nguoi_dung_id,' . $user->id,
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }
        $keKhaiTongHopId = $request->ke_khai_tong_hop_nam_hoc_id;
        $allDetails = collect();

        $mapAndConcat = function ($modelClass, $type, $keKhaiTongHopId) use (&$allDetails) {
            $query = $modelClass::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopId);
            if ($type === 'nckh') {
                $query->with('minhChungs');
            }
            $items = $query->get()->map(function ($item) use ($type) {
                $data = $item->toArray();
                $minhChung = null;
                if ($type === 'nckh' && isset($data['minh_chungs']) && !empty($data['minh_chungs'])) {
                    $minhChung = $data['minh_chungs'][0]; 
                }
                unset($data['minh_chungs']);

                return [
                    'type' => $type,
                    'id_database' => $item->id,
                    'id_temp' => $item->id,
                    'data' => $data,
                    'minh_chung_existing' => $minhChung['ten_file'] ?? null,
                    'minh_chung_existing_path' => $minhChung['duong_dan'] ?? null,
                ];
            });
            $allDetails = $allDetails->concat($items);
        };

        $mapAndConcat(KekhaiGdLopDhTrongbm::class, 'gd_lop_dh_trongbm', $keKhaiTongHopId);
        $mapAndConcat(KekhaiGdLopDhNgoaibm::class, 'gd_lop_dh_ngoaibm', $keKhaiTongHopId);
        $mapAndConcat(KekhaiGdLopDhNgoaics::class, 'gd_lop_dh_ngoaics', $keKhaiTongHopId);
        $mapAndConcat(KekhaiGdLopThs::class, 'gd_lop_ths', $keKhaiTongHopId);
        $mapAndConcat(KekhaiGdLopTs::class, 'gd_lop_ts', $keKhaiTongHopId);
        $mapAndConcat(KekhaiHdDatnDaihoc::class, 'hd_datn_daihoc', $keKhaiTongHopId);
        $mapAndConcat(KekhaiHdLvThacsi::class, 'hd_lv_thacsi', $keKhaiTongHopId);
        $mapAndConcat(KekhaiHdLaTiensi::class, 'hd_la_tiensi', $keKhaiTongHopId);
        $mapAndConcat(KekhaiDgHpTnDaihoc::class, 'dg_hp_tn_daihoc', $keKhaiTongHopId);
        $mapAndConcat(KekhaiDgLvThacsi::class, 'dg_lv_thacsi', $keKhaiTongHopId);

        $dgLaTSDots = KekhaiDgLaTiensiDot::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopId)
            ->with(['nhiemVus']) 
            ->get()
            ->map(function ($dot) {
                $data = $dot->toArray();
                $nhiemVuArr = $data['nhiem_vus'] ?? [];
                unset($data['nhiem_vus']);

                return [
                    'type' => 'dg_la_tiensi',
                    'id_database' => $dot->id,
                    'id_temp' => $dot->id,
                    'data' => $data,
                    'nhiem_vu_ts_arr' => collect($nhiemVuArr)->map(function ($ctNv) {
                        return [
                            'id_database_chi_tiet' => $ctNv['id'],
                            'ten_nhiem_vu' => $ctNv['ten_nhiem_vu'],
                            'so_tiet_gv_nhap' => $ctNv['so_tiet_gv_nhap'],
                            'ghi_chu' => $ctNv['ghi_chu'],
                        ];
                    })->toArray(),
                ];
            });
        $allDetails = $allDetails->concat($dgLaTSDots);

        $mapAndConcat(KekhaiKhaothiDaihocTrongbm::class, 'khaothi_dh_trongbm', $keKhaiTongHopId);
        $mapAndConcat(KekhaiKhaothiDaihocNgoaibm::class, 'khaothi_dh_ngoaibm', $keKhaiTongHopId);
        $mapAndConcat(KekhaiKhaothiThacsi::class, 'khaothi_ths', $keKhaiTongHopId);
        $mapAndConcat(KekhaiKhaothiTiensi::class, 'khaothi_ts', $keKhaiTongHopId);
        $mapAndConcat(KekhaiXdCtdtVaKhacGd::class, 'xd_ctdt_va_khac_gd', $keKhaiTongHopId);
        $mapAndConcat(KekhaiNckhNamHoc::class, 'nckh', $keKhaiTongHopId);
        $mapAndConcat(KekhaiCongtacKhacNamHoc::class, 'congtac_khac', $keKhaiTongHopId);

        return response()->json(['all_kekhai_details' => $allDetails->values()->all()]);
    }

    public function submitKeKhaiTongHopNamHoc(Request $request, $id)
    {
        $user = auth()->user();
        $keKhaiTongHop = KeKhaiTongHopNamHoc::where('id', $id)
            ->where('nguoi_dung_id', $user->id)
            ->firstOrFail();

        $hasDetails = KekhaiGdLopDhTrongbm::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() ||
                      KekhaiHdDatnDaihoc::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() ||
                      KekhaiNckhNamHoc::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() ||
                      KekhaiCongtacKhacNamHoc::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() ||
                      KekhaiDgHpTnDaihoc::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() || 
                      KekhaiKhaothiDaihocTrongbm::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() ||
                      KekhaiXdCtdtVaKhacGd::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists();

        if (!$hasDetails) {
            return response()->json(['message' => 'Vui lòng thêm ít nhất một mục kê khai chi tiết trước khi nộp.'], 400);
        }

        if (!in_array($keKhaiTongHop->trang_thai_phe_duyet, [0, 4])) { 
            return response()->json(['message' => 'Không thể nộp kê khai ở trạng thái này.'], 403);
        }
        if (!$this->checkKeKhaiThoiGian($keKhaiTongHop->nam_hoc_id)) { 
            return response()->json(['message' => 'Hết hạn kê khai hoặc thời gian chưa bắt đầu.'], 403);
        }

        DB::beginTransaction();
        try {
            if(is_null($keKhaiTongHop->dinhmuc_gd_apdung) || is_null($keKhaiTongHop->dinhmuc_khcn_apdung) || $keKhaiTongHop->dinhmuc_gd_apdung < 0 || $keKhaiTongHop->dinhmuc_khcn_apdung < 0){
                 DB::rollBack();
                 return response()->json(['message' => 'Vui lòng nhập đầy đủ và hợp lệ định mức GD và KHCN cho năm học này trước khi nộp (trong mục Thông tin chung của bản kê khai).'], 400);
            }

            $this->workloadService->calculateAllForKeKhaiTongHop($keKhaiTongHop->id);
            $keKhaiTongHop->refresh();

            $keKhaiTongHop->trang_thai_phe_duyet = 1;
            $keKhaiTongHop->thoi_gian_gui = now();
            $keKhaiTongHop->save();

            DB::commit();
            return response()->json(['message' => 'Nộp kê khai thành công và đang chờ Trưởng bộ môn phê duyệt.', 'data' => $keKhaiTongHop]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi khi nộp KeKhaiTongHopNamHoc ID: '.$id, ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Lỗi hệ thống khi nộp kê khai. Chi tiết: '. $e->getMessage()], 500);
        }
    }

    public function getKeKhaiNamHoc(Request $request)
    {
        $user = auth()->user();
        $validator = Validator::make($request->all(), [
            'nam_hoc_id' => 'nullable|exists:nam_hoc,id', 
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        $query = KeKhaiTongHopNamHoc::where('nguoi_dung_id', $user->id)
            ->with($this->getEagerLoadRelationsForTongHopListView()); 

        if ($request->filled('nam_hoc_id')) {
            $query->where('nam_hoc_id', $request->nam_hoc_id);
        }

        $keKhaiTongHops = $query->orderBy('nam_hoc_id', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($keKhaiTongHops);
    }

    /**
     * Lấy chi tiết đầy đủ của một bản kê khai tổng hợp theo năm học (bao gồm tất cả các chi tiết con).
     * Được sử dụng cho việc Xem chi tiết/In báo cáo.
     */
    public function getChiTietKeKhaiNamHoc(Request $request, $id) 
    {
        $user = auth()->user();
        $keKhaiTongHop = KeKhaiTongHopNamHoc::where('id', $id)
            ->where('nguoi_dung_id', $user->id)
            ->with($this->getEagerLoadRelationsForTongHopDetailView()) 
            ->firstOrFail();

        $this->workloadService->calculateAllForKeKhaiTongHop($keKhaiTongHop->id);
        $keKhaiTongHop->refresh()->load($this->getEagerLoadRelationsForTongHopDetailView());

        if ($keKhaiTongHop->nguoiDuyetBm) {
            $keKhaiTongHop->ten_nguoi_duyet_bm = $keKhaiTongHop->nguoiDuyetBm->ho_ten;
        }

        return response()->json(['ke_khai_tong_hop_nam_hoc' => $keKhaiTongHop]);
    }

    public function deleteKeKhaiTongHopNamHoc(Request $request, $id)
    {
        $user = auth()->user();
        $keKhaiTongHop = KeKhaiTongHopNamHoc::where('id', $id)
            ->where('nguoi_dung_id', $user->id)
            ->firstOrFail();

        if ($keKhaiTongHop->trang_thai_phe_duyet != 0 && $keKhaiTongHop->trang_thai_phe_duyet != 4) { // 0: Nháp, 4: BM Trả lại
            return response()->json(['message' => 'Chỉ có thể xóa kê khai ở trạng thái Nháp hoặc Bị trả lại.'], 403);
        }

        DB::beginTransaction();
        try {
            $this->xoaTatCaChiTietCu($id); 
            $keKhaiTongHop->delete(); 

            DB::commit();
            return response()->json(['message' => 'Đã xóa bản kê khai thành công.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi xóa KeKhaiTongHopNamHoc ID: {$id} - " . $e->getMessage());
            return response()->json(['message' => 'Lỗi hệ thống khi xóa kê khai.'], 500);
        }
    }

    // Hàm helper lấy các quan hệ cần eager load cho view chi tiết (dùng cho in báo cáo).
    private function getEagerLoadRelationsForTongHopDetailView()
    {
        return array_merge($this->getEagerLoadRelationsForTongHopListView(), [
            'nguoiDung.boMon:id,ten_bo_mon',
            'nguoiDung:hoc_ham', 

            'nguoiDuyetBm:id,ho_ten,chuc_danh_id', 
            'nguoiDuyetBm:id,hoc_ham,hoc_vi', 

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
    }

    // Hàm helper lấy các quan hệ cần eager load cho view danh sách.
    private function getEagerLoadRelationsForTongHopListView()
    {
        return [
            'namHoc',
            'nguoiDung:id,ho_ten,ma_gv,chuc_danh_id,hoc_ham,hoc_vi',
            'nguoiDung:hoc_ham', 
            'lichSuPheDuyet.nguoiThucHien:id,ho_ten'
        ];
    }

     /**
     * API lấy dữ liệu thống kê tổng hợp của giảng viên qua các năm học.
     * Lưu ý:
     * - Chỉ lấy các bản kê khai đã duyệt hoặc đang chờ duyệt.
     * - Tính toán tỷ lệ hoàn thành, tổng giờ, phân bổ giờ theo từng năm.
     * - Nếu chưa có dữ liệu sẽ trả về thông báo phù hợp.
     */
    public function getLecturerStatisticsOverview(Request $request)
    {
        $user = auth()->user();

        $keKhaiTongHops = KeKhaiTongHopNamHoc::where('nguoi_dung_id', $user->id)
            ->whereIn('trang_thai_phe_duyet', [0, 1, 3, 4]) // Nháp, Chờ duyệt, Đã duyệt, BM Trả lại
            ->with('namHoc')
            ->orderBy('nam_hoc_id', 'desc') 
            ->get();

        if ($keKhaiTongHops->isEmpty()) {
            return response()->json([
                'message' => 'Chưa có dữ liệu kê khai nào để thống kê.',
                'statistics_by_year' => [],
                'overall_summary' => null, 
            ]);
        }

        $statisticsByYear = $keKhaiTongHops->map(function ($tongHop) {
            $namHoc = $tongHop->namHoc->ten_nam_hoc ?? 'Không rõ';
            $dinhMucGD = floatval($tongHop->dinhmuc_gd_apdung ?: 0);
            $dinhMucKHCN = floatval($tongHop->dinhmuc_khcn_apdung ?: 0);

            $gdFinal = $tongHop->tong_gio_giangday_final_duyet ?? $tongHop->tong_gio_giangday_final_tam_tinh ?: 0;
            $khcnFinal = $tongHop->tong_gio_khcn_kekhai_duyet ?? $tongHop->tong_gio_khcn_kekhai_tam_tinh ?: 0;
            $khacFinal = $tongHop->tong_gio_congtackhac_quydoi_duyet ?? $tongHop->tong_gio_congtackhac_quydoi_tam_tinh ?: 0;
            $tongGioThucHien = $tongHop->tong_gio_thuc_hien_final_duyet ?? $tongHop->tong_gio_thuc_hien_final_tam_tinh ?: 0;

            $gioGDLopVaDanhGia = $tongHop->tong_gio_gd_danhgia_duyet ?? $tongHop->tong_gio_gd_danhgia_tam_tinh ?: 0;
            $gioHuongDan = $tongHop->tong_gio_huongdan_quydoi_duyet ?? $tongHop->tong_gio_huongdan_quydoi_tam_tinh ?: 0;
            $gioCoiThiChamThiDH = $tongHop->tong_gio_coithi_chamthi_dh_duyet ?? $tongHop->tong_gio_coithi_chamthi_dh_tam_tinh ?: 0;
            
            $actualGioGD = $gioGDLopVaDanhGia;
            $actualGioHuongDan = $gioHuongDan;
            $actualGioKhaoThiDH = $gioCoiThiChamThiDH;

            $thuaThieuGD = $tongHop->ket_qua_thua_thieu_gio_gd_duyet ?? $tongHop->ket_qua_thua_thieu_gio_gd_tam_tinh ?: 0;
            $hoanThanhKHCNSoVoiDM = $tongHop->gio_khcn_hoanthanh_so_voi_dinhmuc_duyet ?? $tongHop->gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh ?: 0;

            return [
                'nam_hoc' => $namHoc,
                'nam_hoc_id' => $tongHop->nam_hoc_id,
                'trang_thai_phe_duyet' => $tongHop->trang_thai_phe_duyet,
                'tong_gio_thuc_hien' => round($tongGioThucHien, 2),
                'phan_bo_gio' => [
                    'giang_day_lop_danhgia_khacgd' => round($actualGioGD, 2), // Gộp các thành phần của C4 Mục I.2
                    'huong_dan' => round($actualGioHuongDan, 2), // C9 Mục I.2
                    'coi_cham_thi_dh' => round($actualGioKhaoThiDH, 2), // C3 Mục I.2
                    'khcn' => round($khcnFinal, 2), // C1 Mục I.2 (bao gồm NCKH + CT Khác ra KHCN)
                    'cong_tac_khac_gd' => round($tongHop->tong_gio_congtackhac_quydoi_duyet ?? $tongHop->tong_gio_congtackhac_quydoi_tam_tinh ?:0,2) // C2 Mục I.2 (chỉ phần CT Khác ra GD, phần này đã được cộng vào actualGioGD)
                ],
                'dinh_muc_gd' => round($dinhMucGD, 2),
                'dinh_muc_khcn' => round($dinhMucKHCN, 2),
                'ty_le_hoanthanh_gd' => $dinhMucGD > 0 ? round((($tongHop->gio_gd_hoanthanh_sau_butru_duyet ?? $tongHop->gio_gd_hoanthanh_sau_butru_tam_tinh ?: 0) / $dinhMucGD) * 100, 1) : 0,
                'ty_le_hoanthanh_khcn' => $dinhMucKHCN > 0 ? round((($tongHop->gio_khcn_conlai_sau_butru_duyet ?? $tongHop->gio_khcn_conlai_sau_butru_tam_tinh ?: 0) / $dinhMucKHCN) * 100, 1) : 0, // KHCN còn lại sau bù cho GD
                'thua_thieu_gd' => round($thuaThieuGD, 2),
                'hoan_thanh_khcn_so_voi_dm' => round($hoanThanhKHCNSoVoiDM, 2), // Có thể âm
            ];
        });

        // Tính toán tổng hợp chung
        $overallSummary = null;
        if ($statisticsByYear->isNotEmpty()) {
            $approvedStats = $statisticsByYear->filter(fn($item) => $item['trang_thai_phe_duyet'] === 3);
            if ($approvedStats->isNotEmpty()) {
                $overallSummary = [
                    'so_nam_thong_ke' => $approvedStats->count(),
                    'tong_gio_thuc_hien_tb' => round($approvedStats->avg('tong_gio_thuc_hien'), 2),
                    'ty_le_hoanthanh_gd_tb' => round($approvedStats->avg('ty_le_hoanthanh_gd'), 1),
                    'ty_le_hoanthanh_khcn_tb' => round($approvedStats->avg('ty_le_hoanthanh_khcn'), 1),
                ];
            }
        }

        return response()->json([
            'statistics_by_year' => $statisticsByYear,
            'overall_summary' => $overallSummary,
            'nam_hoc_list' => NamHoc::orderBy('ngay_bat_dau', 'desc')->get(['id', 'ten_nam_hoc', 'la_nam_hien_hanh']), // Gửi kèm ds năm học để lọc
        ]);
    }


    /**
     * API lấy dữ liệu chi tiết cho một năm học cụ thể để vẽ biểu đồ.
     * Lưu ý: Trả về dữ liệu chi tiết cho từng thành phần để hiển thị biểu đồ cột/tròn.
     */
    public function getLecturerYearlyStatisticsDetail(Request $request)
    {
        $user = auth()->user();
        $validator = Validator::make($request->all(), [
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }
        $namHocId = $request->nam_hoc_id;

        $tongHop = KeKhaiTongHopNamHoc::where('nguoi_dung_id', $user->id)
            ->where('nam_hoc_id', $namHocId)
            ->with('namHoc') 
            ->first();

        if (!$tongHop) {
            return response()->json(['message' => 'Không tìm thấy dữ liệu kê khai cho năm học này.'], 404);
        }
        
        // Đảm bảo dữ liệu tổng hợp là mới nhất
        // $this->workloadService->calculateAllForKeKhaiTongHop($tongHop->id);
        // $tongHop->refresh(); 

        $dinhMucGD = floatval($tongHop->dinhmuc_gd_apdung ?: 0);
        $dinhMucKHCN = floatval($tongHop->dinhmuc_khcn_apdung ?: 0);

        $gdFinal = $tongHop->tong_gio_giangday_final_duyet ?? $tongHop->tong_gio_giangday_final_tam_tinh ?: 0;
        $khcnFinal = $tongHop->tong_gio_khcn_kekhai_duyet ?? $tongHop->tong_gio_khcn_kekhai_tam_tinh ?: 0;
        $khacFinal = $tongHop->tong_gio_congtackhac_quydoi_duyet ?? $tongHop->tong_gio_congtackhac_quydoi_tam_tinh ?: 0;

        // Dữ liệu cho biểu đồ cột/tròn chi tiết của năm được chọn
        $detailedChartData = [
            'labels' => ['GD Lớp, ĐG, Khác GD', 'Hướng dẫn QĐ', 'Coi thi ĐH', 'NCKH & CT Khác ra KHCN', 'GD Xa trường'],
            'datasets' => [
                [
                    'label' => 'Giờ chuẩn',
                    'data' => [
                        round($tongHop->tong_gio_gd_danhgia_duyet ?? $tongHop->tong_gio_gd_danhgia_tam_tinh ?: 0, 2),
                        round($tongHop->tong_gio_huongdan_quydoi_duyet ?? $tongHop->tong_gio_huongdan_quydoi_tam_tinh ?: 0, 2),
                        round($tongHop->tong_gio_coithi_chamthi_dh_duyet ?? $tongHop->tong_gio_coithi_chamthi_dh_tam_tinh ?: 0, 2),
                        round($khcnFinal, 2),
                        round($tongHop->tong_gio_gdxatruong_duyet ?? $tongHop->tong_gio_gdxatruong_tam_tinh ?: 0, 2),
                    ],
                    'backgroundColor' => [
                        'rgba(54, 162, 235, 0.7)', // Blue
                        'rgba(75, 192, 192, 0.7)', // Green
                        'rgba(255, 206, 86, 0.7)', // Yellow
                        'rgba(153, 102, 255, 0.7)',// Purple
                        'rgba(255, 159, 64, 0.7)', // Orange
                    ],
                ],
            ],
        ];
        
        $yearData = [
            'nam_hoc' => $tongHop->namHoc->ten_nam_hoc ?? 'Không rõ',
            'tong_gio_thuc_hien' => round($tongHop->tong_gio_thuc_hien_final_duyet ?? $tongHop->tong_gio_thuc_hien_final_tam_tinh ?: 0, 2),
            'dinh_muc_gd' => round($dinhMucGD, 2),
            'dinh_muc_khcn' => round($dinhMucKHCN, 2),
            'chi_tiet_gio' => $detailedChartData,
            'gio_gd_hoanthanh_sau_butru' => round($tongHop->gio_gd_hoanthanh_sau_butru_duyet ?? $tongHop->gio_gd_hoanthanh_sau_butru_tam_tinh ?: 0, 2),
            'gio_khcn_hoanthanh_so_voi_dm' => round($tongHop->gio_khcn_hoanthanh_so_voi_dinhmuc_duyet ?? $tongHop->gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh ?: 0, 2),
            'thua_thieu_gd' => round($tongHop->ket_qua_thua_thieu_gio_gd_duyet ?? $tongHop->ket_qua_thua_thieu_gio_gd_tam_tinh ?: 0, 2),
            'trang_thai_phe_duyet' => $tongHop->trang_thai_phe_duyet,
        ];

        return response()->json($yearData);
    }
}