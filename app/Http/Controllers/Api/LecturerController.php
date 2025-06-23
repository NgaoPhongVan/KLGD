<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KeKhaiTongHopNamHoc;
use App\Models\KeKhaiThoiGian;
use App\Models\NamHoc;
use App\Models\MinhChung;
use App\Models\User;
use App\Models\DinhMucCaNhanTheoNam;

// Các model cho bảng kê khai chi tiết mới
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
// Bỏ Mail và các model KeHoach nếu không dùng nữa
// use App\Mail\KeKhaiNotification;
// use App\Models\KeHoachGiangDay;
// use App\Models\KeHoachChiTiet;


class LecturerController extends Controller
{
    protected $workloadService;

    public function __construct(WorkloadService $workloadService)
    {
        $this->workloadService = $workloadService;
    }

    //======================================================================
    // TIỆN ÍCH VÀ LẤY DANH MỤC CƠ BẢN
    //======================================================================
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

    //======================================================================
    // QUẢN LÝ KÊ KHAI TỔNG HỢP THEO NĂM HỌC
    //======================================================================
    public function startOrGetKeKhaiTongHopNamHoc(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
        ]);
        $namHocId = $validated['nam_hoc_id'];

        $keKhaiTongHop = KeKhaiTongHopNamHoc::where('nguoi_dung_id', $user->id)
            ->where('nam_hoc_id', $namHocId)
            ->with(['namHoc', 'nguoiDung']) // Không cần chucDanh ở đây nữa
            ->first();

        $namHoc = NamHoc::find($namHocId);
        if (!$namHoc) {
            return response()->json(['message' => 'Không tìm thấy thông tin năm học.'], 404);
        }

        if ($keKhaiTongHop) {
            // Khi lấy lại bản kê khai, có thể cập nhật lại định mức nếu nó có thể thay đổi từ Admin
            $dinhMucCaNhan = DinhMucCaNhanTheoNam::where('nguoi_dung_id', $user->id)
                ->where('nam_hoc_id', $namHocId)
                ->first();
            if ($dinhMucCaNhan) {
                $keKhaiTongHop->dinhmuc_gd_apdung = $dinhMucCaNhan->dinh_muc_gd;
                $keKhaiTongHop->dinhmuc_khcn_apdung = $dinhMucCaNhan->dinh_muc_khcn;
                // Không còn phan_tram_mien_giam_tong trực tiếp ở đây
                $keKhaiTongHop->saveQuietly();
            } else {
                // Nếu không tìm thấy định mức cá nhân, có thể log cảnh báo hoặc đặt giá trị mặc định
                Log::warning("Không tìm thấy định mức cá nhân cho GV ID: {$user->id}, Năm học ID: {$namHocId}");
                $keKhaiTongHop->dinhmuc_gd_apdung = 0; // Hoặc giá trị mặc định nào đó
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
            // Không còn phan_tram_mien_giam_tong
        ]);

        return response()->json(['ke_khai_tong_hop_nam_hoc' => $newKeKhaiTongHop->load(['namHoc', 'nguoiDung'])], 201);
    }
    public function updateDinhMucKeKhaiTongHop(Request $request, $id)
    {
        $user = auth()->user();
        $keKhaiTongHop = KeKhaiTongHopNamHoc::where('id', $id)
            ->where('nguoi_dung_id', $user->id)
            ->firstOrFail();

        if (!in_array($keKhaiTongHop->trang_thai_phe_duyet, [0, 4])) { // Chỉ cho phép sửa khi là Nháp hoặc BM Trả lại
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
    //======================================================================
    // LƯU VÀ LẤY DỮ LIỆU KÊ KHAI CHI TIẾT
    //======================================================================
    private function xoaTatCaChiTietCu($keKhaiTongHopNamHocId)
    {
        // Xóa minh chứng của NCKH trước
        $nckhIds = KekhaiNckhNamHoc::where('ke_khai_tong_hop_nam_hoc_id', $keKhaiTongHopNamHocId)->pluck('id');
        if ($nckhIds->isNotEmpty()) {
            $minhChungsNCKH = MinhChung::whereIn('kekhai_nckh_nam_hoc_id', $nckhIds)->get();
            foreach ($minhChungsNCKH as $mc) {
                if ($mc->duong_dan) Storage::disk('public')->delete($mc->duong_dan);
                $mc->delete();
            }
        }
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
                // id_database không dùng nữa vì ta xóa cũ thêm mới toàn bộ
                $minhChungFile = $request->file("ke_khai_items_files.{$index}");
                $instance = null; // Để lưu model instance nếu có minh chứng

                // Chuẩn bị data chung, loại bỏ các trường không có trong DB model hoặc chỉ dùng ở frontend
                $commonDataToSave = ['ke_khai_tong_hop_nam_hoc_id' => $keKhaiTongHopNamHocId];
                foreach ($data as $key => $value) {
                    // Chỉ lấy các key có trong $fillable của model tương ứng (cần có cách check hoặc định nghĩa rõ ràng)
                    // Tạm thời, ta sẽ giả định các key trong $data là các cột trong bảng
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
                        // Bỏ nhiem_vu_ts_arr khỏi commonDataToSave cho bảng cha
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
                        // Minh chứng cho dg_la_tiensi sẽ gắn vào $dotCha (nếu có)
                        // Hiện tại logic minh chứng chỉ cho NCKH
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
                    $minhChung = $data['minh_chungs'][0]; // Lấy minh chứng đầu tiên nếu có
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
            ->with(['nhiemVus']) // Chỉ cần load nhiệm vụ, minh chứng (nếu có) sẽ là của Dot
            ->get()
            ->map(function ($dot) {
                $data = $dot->toArray();
                $nhiemVuArr = $data['nhiem_vus'] ?? []; // Lấy mảng nhiệm vụ đã eager load
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

        // Kiểm tra xem có ít nhất một mục chi tiết nào không
        $hasDetails = KekhaiGdLopDhTrongbm::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() ||
                      KekhaiHdDatnDaihoc::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() ||
                      KekhaiNckhNamHoc::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() ||
                      KekhaiCongtacKhacNamHoc::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() ||
                      KekhaiDgHpTnDaihoc::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() || // Thêm các bảng khác
                      KekhaiKhaothiDaihocTrongbm::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists() ||
                      KekhaiXdCtdtVaKhacGd::where('ke_khai_tong_hop_nam_hoc_id', $id)->exists();


        if (!$hasDetails) {
            return response()->json(['message' => 'Vui lòng thêm ít nhất một mục kê khai chi tiết trước khi nộp.'], 400);
        }

        if (!in_array($keKhaiTongHop->trang_thai_phe_duyet, [0, 4])) { /* ... */ }
        if (!$this->checkKeKhaiThoiGian($keKhaiTongHop->nam_hoc_id)) { /* ... */ }

        DB::beginTransaction();
        try {
            // Đảm bảo GV đã nhập định mức
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


    // public function getKeKhaiNamHoc(Request $request)
    // {
    //     $user = auth()->user();
    //     $namHocId = $request->query('nam_hoc_id');

    //     $query = KeKhaiTongHopNamHoc::where('nguoi_dung_id', $user->id)
    //         ->with($this->getEagerLoadRelationsForTongHopListView());

    //     if ($namHocId) {
    //         $query->where('nam_hoc_id', $namHocId);
    //     }
    //     $keKhaiTongHops = $query->orderBy('nam_hoc_id', 'desc')->orderBy('updated_at', 'desc')->get();
    //     return response()->json($keKhaiTongHops);
    // }

//    private function getEagerLoadRelationsForTongHopListView() {
//         return [
//             'namHoc',
//             'nguoiDung:id,ho_ten,ma_gv,hoc_ham,hoc_vi', // Thêm hoc_ham, hoc_vi
//         ];
//     }
//     // Hàm helper để lấy các quan hệ cần eager load cho view chi tiết
//     private function getEagerLoadRelationsForTongHopDetailView() {
//         return [
//             'namHoc', 
//             'nguoiDung:id,ho_ten,ma_gv,hoc_ham,hoc_vi,bo_mon_id', 'nguoiDung.boMon:id,ten_bo_mon', // Thêm hoc_ham, hoc_vi
//             'nguoiDuyetBm:id,ho_ten,hoc_ham,hoc_vi', // Lấy thông tin người duyệt
//             'lichSuPheDuyet.nguoiThucHien:id,ho_ten',
//             // Load tất cả các bảng chi tiết
//             'kekhaiGdLopDhTrongbms', 'kekhaiGdLopDhNgoaibms', 'kekhaiGdLopDhNgoaicss',
//             'kekhaiGdLopThss', 'kekhaiGdLopTss',
//             'kekhaiHdDatnDaihoc', 'kekhaiHdLvThacsis', 'kekhaiHdLaTiensis',
//             'kekhaiDgHpTnDaihoc', 'kekhaiDgLvThacsis',
//             'kekhaiDgLaTiensiDots.nhiemVus',
//             'kekhaiKhaothiDaihocTrongbms', 'kekhaiKhaothiDaihocNgoaibms',
//             'kekhaiKhaothiThacsis', 'kekhaiKhaothiTiensis',
//             'kekhaiXdCtdtVaKhacGds',
//             'kekhaiNckhNamHocs.minhChungs',
//             'kekhaiCongtacKhacNamHocs'
//         ];
//     }

    // Các hàm cũ không còn dùng hoặc đã được thay thế:
    // getHoatDongChiTiet, getDinhMuc, getHeSoQuyDoi (cho lecturer)
    // storeKeKhaiGiangDay (đơn lẻ), updateKeKhaiGiangDay (đơn lẻ)
    // storeKeKhaiNckh (đơn lẻ), updateKeKhaiNckh (đơn lẻ)
    // storeKeKhaiKhac (đơn lẻ), updateKeKhaiKhac (đơn lẻ)
    // deleteKeKhai (đơn lẻ)
    // storeKeKhaiBatch (cũ)
    // tinhGioChuan (cũ)
    // updateTongHop (cũ)

    // Các hàm liên quan đến Kế hoạch giảng dạy (KeHoachGiangDay) sẽ được xem xét riêng
    // nếu nghiệp vụ yêu cầu giữ lại và điều chỉnh theo năm học. Hiện tại bỏ qua.
    public function getKeKhaiNamHoc(Request $request)
    {
        $user = auth()->user();
        $validator = Validator::make($request->all(), [
            'nam_hoc_id' => 'nullable|exists:nam_hoc,id', // nam_hoc_id là tùy chọn
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        $query = KeKhaiTongHopNamHoc::where('nguoi_dung_id', $user->id)
            ->with($this->getEagerLoadRelationsForTongHopListView()); // Chỉ load những gì cần cho danh sách

        if ($request->filled('nam_hoc_id')) {
            $query->where('nam_hoc_id', $request->nam_hoc_id);
        }

        // Sắp xếp để bản kê khai mới nhất hoặc của năm học mới nhất lên đầu
        $keKhaiTongHops = $query->orderBy('nam_hoc_id', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        // Tính toán lại các giá trị hiển thị chính nếu cần (hoặc đảm bảo WorkloadService đã chạy)
        foreach ($keKhaiTongHops as $tongHop) {
            // Ví dụ: đảm bảo các giá trị final _duyet hoặc _tam_tinh là mới nhất
            if($tongHop->trang_thai_phe_duyet !== 3 && $tongHop->trang_thai_phe_duyet !== 1) { // Nếu là nháp hoặc trả lại
               $this->workloadService->calculateAllForKeKhaiTongHop($tongHop->id);
               $tongHop->refresh(); // Tải lại dữ liệu đã được service cập nhật
            }
        }
        // Lưu ý: Việc tính toán lại ở đây có thể làm chậm API nếu có nhiều bản kê khai.
        // Tốt nhất là WorkloadService đã được gọi khi lưu hoặc nộp.

        return response()->json($keKhaiTongHops);
    }

    /**
     * Lấy chi tiết đầy đủ của một bản kê khai tổng hợp theo năm học (bao gồm tất cả các chi tiết con).
     * Được sử dụng cho việc Xem chi tiết/In báo cáo.
     */
    public function getChiTietKeKhaiNamHoc(Request $request, $id) // $id là của ke_khai_tong_hop_nam_hoc
    {
        $user = auth()->user();
        $keKhaiTongHop = KeKhaiTongHopNamHoc::where('id', $id)
            ->where('nguoi_dung_id', $user->id)
            ->with($this->getEagerLoadRelationsForTongHopDetailView()) // Load tất cả chi tiết
            ->firstOrFail();

        // Đảm bảo các giá trị tổng hợp là mới nhất trước khi trả về
        $this->workloadService->calculateAllForKeKhaiTongHop($keKhaiTongHop->id);
        $keKhaiTongHop->refresh()->load($this->getEagerLoadRelationsForTongHopDetailView());

        // Chuẩn bị dữ liệu người duyệt nếu có
        if ($keKhaiTongHop->nguoiDuyetBm) {
            $keKhaiTongHop->ten_nguoi_duyet_bm = $keKhaiTongHop->nguoiDuyetBm->ho_ten;
        }


        return response()->json(['ke_khai_tong_hop_nam_hoc' => $keKhaiTongHop]);
    }


    /**
     * (Tùy chọn) Hàm xóa một bản kê khai tổng hợp và tất cả chi tiết liên quan.
     * Chỉ cho phép xóa nếu ở trạng thái nháp.
     */
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
            $this->xoaTatCaChiTietCu($id); // Gọi lại hàm đã tạo để xóa chi tiết
            $keKhaiTongHop->delete(); // Xóa bản tổng hợp

            DB::commit();
            return response()->json(['message' => 'Đã xóa bản kê khai thành công.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Lỗi xóa KeKhaiTongHopNamHoc ID: {$id} - " . $e->getMessage());
            return response()->json(['message' => 'Lỗi hệ thống khi xóa kê khai.'], 500);
        }
    }

    // Hàm helper để lấy các quan hệ cần eager load cho view chi tiết một bản tổng hợp (để in)
    private function getEagerLoadRelationsForTongHopDetailView()
    {
        return array_merge($this->getEagerLoadRelationsForTongHopListView(), [
            'nguoiDung.boMon:id,ten_bo_mon',
            'nguoiDung:hoc_ham', 

            'nguoiDuyetBm:id,ho_ten,chuc_danh_id', // Chỉ lấy các cột có trong bảng nguoi_dung
            'nguoiDuyetBm:id,hoc_ham,hoc_vi', // Eager load quan hệ chucDanh của nguoiDuyetBm

            // ... các quan hệ chi tiết khác ...
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
            'kekhaiDgLaTiensiDots.nhiemVus', // Đảm bảo nhiemVus không cố select cột không tồn tại
            'kekhaiKhaothiDaihocTrongbms',
            'kekhaiKhaothiDaihocNgoaibms',
            'kekhaiKhaothiThacsis',
            'kekhaiKhaothiTiensis',
            'kekhaiXdCtdtVaKhacGds',
            'kekhaiNckhNamHocs.minhChungs',
            'kekhaiCongtacKhacNamHocs'
        ]);
    }

    // Cũng kiểm tra getEagerLoadRelationsForTongHopListView()
    private function getEagerLoadRelationsForTongHopListView()
    {
        return [
            'namHoc',
            'nguoiDung:id,ho_ten,ma_gv,chuc_danh_id,hoc_ham,hoc_vi', // Thêm chuc_danh_id nếu muốn load chucDanh
            'nguoiDung:hoc_ham', // Ví dụ nếu muốn hiển thị tên chức danh ở list
            'lichSuPheDuyet.nguoiThucHien:id,ho_ten'
        ];
    }

     /**
     * Lấy dữ liệu thống kê tổng hợp của giảng viên qua các năm học.
     * Bao gồm tổng giờ, phân bổ giờ, so sánh với định mức.
     */
    public function getLecturerStatisticsOverview(Request $request)
    {
        $user = auth()->user();

        // Lấy tất cả các bản kê khai đã được duyệt hoặc đang chờ duyệt của giảng viên
        // Để có cái nhìn tổng quan qua các năm, có thể lấy cả những bản chưa được duyệt hoàn toàn
        $keKhaiTongHops = KeKhaiTongHopNamHoc::where('nguoi_dung_id', $user->id)
            ->whereIn('trang_thai_phe_duyet', [0, 1, 3, 4]) // Nháp, Chờ duyệt, Đã duyệt, BM Trả lại
            ->with('namHoc')
            ->orderBy('nam_hoc_id', 'desc') // Sắp xếp theo năm học mới nhất trước
            ->get();

        if ($keKhaiTongHops->isEmpty()) {
            return response()->json([
                'message' => 'Chưa có dữ liệu kê khai nào để thống kê.',
                'statistics_by_year' => [],
                'overall_summary' => null, // Hoặc một cấu trúc rỗng
            ]);
        }

        $statisticsByYear = $keKhaiTongHops->map(function ($tongHop) {
            $namHoc = $tongHop->namHoc->ten_nam_hoc ?? 'Không rõ';
            $dinhMucGD = floatval($tongHop->dinhmuc_gd_apdung ?: 0);
            $dinhMucKHCN = floatval($tongHop->dinhmuc_khcn_apdung ?: 0);

            // Sử dụng giá trị đã duyệt nếu có, nếu không thì dùng tạm tính
            $gdFinal = $tongHop->tong_gio_giangday_final_duyet ?? $tongHop->tong_gio_giangday_final_tam_tinh ?: 0;
            $khcnFinal = $tongHop->tong_gio_khcn_kekhai_duyet ?? $tongHop->tong_gio_khcn_kekhai_tam_tinh ?: 0;
            $khacFinal = $tongHop->tong_gio_congtackhac_quydoi_duyet ?? $tongHop->tong_gio_congtackhac_quydoi_tam_tinh ?: 0;
            $tongGioThucHien = $tongHop->tong_gio_thuc_hien_final_duyet ?? $tongHop->tong_gio_thuc_hien_final_tam_tinh ?: 0;

            // Chi tiết hơn theo các cột đã tính trong WorkloadService
            $gioGDLopVaDanhGia = $tongHop->tong_gio_gd_danhgia_duyet ?? $tongHop->tong_gio_gd_danhgia_tam_tinh ?: 0;
            $gioHuongDan = $tongHop->tong_gio_huongdan_quydoi_duyet ?? $tongHop->tong_gio_huongdan_quydoi_tam_tinh ?: 0;
            $gioCoiThiChamThiDH = $tongHop->tong_gio_coithi_chamthi_dh_duyet ?? $tongHop->tong_gio_coithi_chamthi_dh_tam_tinh ?: 0;
            
            // Tính toán giờ cho từng thành phần của giảng dạy
            // Giờ giảng dạy (bao gồm lớp, đánh giá/HĐ (ko ĐH), khảo thí (ThS, TS), XDCTĐT, CT Khác ra GD)
            $actualGioGD = $gioGDLopVaDanhGia;
            // Giờ hướng dẫn (đã quy đổi theo hệ số chung)
            $actualGioHuongDan = $gioHuongDan;
            // Giờ coi thi, chấm thi ĐH
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

        // Tính toán tổng hợp chung (ví dụ trung bình qua các năm, hoặc tổng cộng)
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
     * Lấy dữ liệu chi tiết cho một năm học cụ thể để vẽ biểu đồ.
     * Được gọi khi người dùng chọn một năm học trên trang thống kê.
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
            ->with('namHoc') // Load tên năm học
            ->first();

        if (!$tongHop) {
            return response()->json(['message' => 'Không tìm thấy dữ liệu kê khai cho năm học này.'], 404);
        }
        
        // Đảm bảo dữ liệu tổng hợp là mới nhất
        // $this->workloadService->calculateAllForKeKhaiTongHop($tongHop->id);
        // $tongHop->refresh(); // Tải lại dữ liệu đã được service cập nhật

        $dinhMucGD = floatval($tongHop->dinhmuc_gd_apdung ?: 0);
        $dinhMucKHCN = floatval($tongHop->dinhmuc_khcn_apdung ?: 0);

        $gdFinal = $tongHop->tong_gio_giangday_final_duyet ?? $tongHop->tong_gio_giangday_final_tam_tinh ?: 0;
        $khcnFinal = $tongHop->tong_gio_khcn_kekhai_duyet ?? $tongHop->tong_gio_khcn_kekhai_tam_tinh ?: 0;
        $khacFinal = $tongHop->tong_gio_congtackhac_quydoi_duyet ?? $tongHop->tong_gio_congtackhac_quydoi_tam_tinh ?: 0;
        // Lưu ý: tong_gio_giangday_final_tam_tinh đã bao gồm GD Lớp, ĐG/HĐ, Khảo thí ThS/TS, XDCTĐT, CT Khác ra GD, VÀ Giờ Hướng dẫn QĐ.
        // tong_gio_khcn_kekhai_tam_tinh đã bao gồm NCKH và CT Khác ra KHCN.
        // Coi chấm thi ĐH là một mục riêng.
        // GD Xa trường cũng là một mục riêng.
        // Cần phân tách rõ hơn các thành phần này nếu muốn vẽ biểu đồ chi tiết hơn nữa.

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
                        'rgba(54, 162, 235, 0.7)', // Blue for GD
                        'rgba(75, 192, 192, 0.7)', // Green for Huong Dan
                        'rgba(255, 206, 86, 0.7)', // Yellow for Coi Thi
                        'rgba(153, 102, 255, 0.7)',// Purple for KHCN
                        'rgba(255, 159, 64, 0.7)', // Orange for Xa Truong
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
