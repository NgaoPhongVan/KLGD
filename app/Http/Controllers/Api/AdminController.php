<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Khoa;
use App\Models\BoMon;
use App\Models\NamHoc;
use App\Models\HocKy;
use App\Models\KeKhaiThoiGian;
use App\Models\AdminLog;

use App\Models\DinhMucCaNhanTheoNam;
use App\Models\DmHeSoChung;
use App\Models\MienGiamDinhMuc;
use App\Models\LuongGiangVien;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Imports\UsersImport;
use App\Imports\BoMonImport;
use App\Imports\NamHocImport;
use App\Imports\HocKyImport;
use App\Imports\KeKhaiThoiGianImport;
use App\Imports\DinhMucCaNhanImport;
use App\Imports\DmHeSoChungImport;
use App\Imports\MienGiamImport;
use App\Imports\LuongGiangVienImport;

class AdminController extends Controller
{
    private function logActivity($action, $description, $tableName = null, $recordId = null, $recordName = null, $oldData = null, $newData = null)
    {
        try {
            $user = Auth::user();
            $logData = [
                'admin_id' => $user->id,
                'admin_name' => $user->ho_ten,
                'action' => $action,
                'table_name' => $tableName ?? $this->getTableNameFromAction($action),
                'record_id' => $recordId,
                'record_name' => $recordName,
                'old_data' => $oldData ? json_encode($oldData, JSON_UNESCAPED_UNICODE) : null,
                'new_data' => $newData ? json_encode($newData, JSON_UNESCAPED_UNICODE) : null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'description' => $description,
            ];

            $adminLog = AdminLog::create($logData);
        } catch (\Exception $e) {
            Log::error('Lỗi' . $e->getMessage(), [
                'action' => $action,
                'description' => $description,
                'user_id' => Auth::id(),
                'exception' => $e->getTraceAsString()
            ]);
        }
    }

    // Mapping action codes thành tên bảng
    private function getTableNameFromAction($action)
    {
        $actionMap = [
            'CREATE_USER' => 'nguoi_dung',
            'UPDATE_USER' => 'nguoi_dung',
            'DELETE_USER' => 'nguoi_dung',
            'IMPORT_USER' => 'nguoi_dung',
            'CREATE_KHOA' => 'khoa',
            'UPDATE_KHOA' => 'khoa',
            'DELETE_KHOA' => 'khoa',
            'IMPORT_KHOA' => 'khoa',
            'CREATE_BOMON' => 'bo_mon',
            'UPDATE_BOMON' => 'bo_mon',
            'DELETE_BOMON' => 'bo_mon',
            'IMPORT_BOMON' => 'bo_mon',
            'CREATE_NAMHOC' => 'nam_hoc',
            'UPDATE_NAMHOC' => 'nam_hoc',
            'DELETE_NAMHOC' => 'nam_hoc',
            'IMPORT_NAMHOC' => 'nam_hoc',
            'CREATE_KEKHAITHOIGIAN' => 'ke_khai_thoi_gian',
            'UPDATE_KEKHAITHOIGIAN' => 'ke_khai_thoi_gian',
            'DELETE_KEKHAITHOIGIAN' => 'ke_khai_thoi_gian',
            'IMPORT_KEKHAITHOIGIAN' => 'ke_khai_thoi_gian',
            'CREATE_DINHMUCCANHAN' => 'dinh_muc_ca_nhan_theo_nam',
            'UPDATE_DINHMUCCANHAN' => 'dinh_muc_ca_nhan_theo_nam',
            'DELETE_DINHMUCCANHAN' => 'dinh_muc_ca_nhan_theo_nam',
            'IMPORT_DINHMUCCANHAN' => 'dinh_muc_ca_nhan_theo_nam',
            'CREATE_DMHESOCHUNG' => 'dm_he_so_chung',
            'UPDATE_DMHESOCHUNG' => 'dm_he_so_chung',
            'DELETE_DMHESOCHUNG' => 'dm_he_so_chung',
            'IMPORT_DMHESOCHUNG' => 'dm_he_so_chung',
            'CREATE_LUONGGIANGVIEN' => 'luong_giang_vien',
            'UPDATE_LUONGGIANGVIEN' => 'luong_giang_vien',
            'DELETE_LUONGGIANGVIEN' => 'luong_giang_vien',
            'IMPORT_LUONGGIANGVIEN' => 'luong_giang_vien',
            'CREATE_MIENGIAMDINHMUC' => 'mien_giam_dinh_muc',
            'UPDATE_MIENGIAMDINHMUC' => 'mien_giam_dinh_muc',
            'DELETE_MIENGIAMDINHMUC' => 'mien_giam_dinh_muc',
            'IMPORT_MIENGIAMDINHMUC' => 'mien_giam_dinh_muc',
        ];
        return $actionMap[$action] ?? 'unknown_table';
    }

    public function getProfile(Request $request)
    {
        return response()->json($request->user()->load('boMon.khoa'));
    }

    public function getUsers(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');

        $query = User::with('boMon.khoa');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ma_gv', 'LIKE', '%' . $search . '%')
                    ->orWhere('ho_ten', 'LIKE', '%' . $search . '%')
                    ->orWhere('email', 'LIKE', '%' . $search . '%');
            });
        }

        $users = $query->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
            ],
        ]);
    }

    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ma_gv' => 'required|unique:nguoi_dung',
            'ho_ten' => 'required',
            'email' => 'required|email|unique:nguoi_dung',
            'password' => 'required|min:8',
            'vai_tro' => 'required|in:1,2,3',
            'bo_mon_id' => 'required|exists:bo_mon,id',
            'trang_thai' => 'required|in:0,1',
        ], [
            'ma_gv.required' => 'Mã giảng viên là bắt buộc.',
            'ma_gv.unique' => 'Mã giảng viên đã tồn tại.',
            'ho_ten.required' => 'Họ tên là bắt buộc.',
            'email.required' => 'Email là bắt buộc.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email đã tồn tại.',
            'password.required' => 'Mật khẩu là bắt buộc.',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự.',
            'vai_tro.required' => 'Vai trò là bắt buộc.',
            'vai_tro.in' => 'Vai trò không hợp lệ (chỉ được là 1, 2, hoặc 3).',
            'bo_mon_id.required' => 'Bộ môn là bắt buộc.',
            'bo_mon_id.exists' => 'Bộ môn không tồn tại.',
            'trang_thai.required' => 'Trạng thái là bắt buộc.',
            'trang_thai.in' => 'Trạng thái không hợp lệ (chỉ được là 0 hoặc 1).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'ma_gv' => $request->ma_gv,
            'ho_ten' => $request->ho_ten,
            'email' => $request->email,
            'password' => Hash::make($request->password), //bcrypt
            'vai_tro' => $request->vai_tro,
            'bo_mon_id' => $request->bo_mon_id,
            'trang_thai' => $request->trang_thai,
        ]);

        $this->logActivity(
            'CREATE_USER',
            "Tạo người dùng mới: {$user->ho_ten} ({$user->ma_gv})",
            'nguoi_dung',
            $user->id,
            "{$user->ho_ten} ({$user->ma_gv})",
            null,
            $user->toArray()
        );

        return response()->json(['message' => 'Tạo người dùng thành công', 'user' => $user], 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $oldData = $user->toArray();

        $validator = Validator::make($request->all(), [
            'ma_gv' => 'required|unique:nguoi_dung,ma_gv,' . $id,
            'ho_ten' => 'required',
            'email' => 'required|email|unique:nguoi_dung,email,' . $id,
            'vai_tro' => 'required|in:1,2,3',
            'bo_mon_id' => 'required|exists:bo_mon,id',
            'trang_thai' => 'required|in:0,1',
        ], [
            'ma_gv.required' => 'Mã giảng viên là bắt buộc.',
            'ma_gv.unique' => 'Mã giảng viên đã tồn tại.',
            'ho_ten.required' => 'Họ tên là bắt buộc.',
            'email.required' => 'Email là bắt buộc.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email đã tồn tại.',
            'vai_tro.required' => 'Vai trò là bắt buộc.',
            'vai_tro.in' => 'Vai trò không hợp lệ (chỉ được là 1, 2, hoặc 3).',
            'bo_mon_id.required' => 'Bộ môn là bắt buộc.',
            'bo_mon_id.exists' => 'Bộ môn không tồn tại.',
            'trang_thai.required' => 'Trạng thái là bắt buộc.',
            'trang_thai.in' => 'Trạng thái không hợp lệ (chỉ được là 0 hoặc 1).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only('ma_gv', 'ho_ten', 'email', 'vai_tro', 'bo_mon_id', 'trang_thai'));
        if ($request->password) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        $this->logActivity(
            'UPDATE_USER',
            "Cập nhật người dùng: {$user->ho_ten} ({$user->ma_gv})",
            'nguoi_dung',
            $user->id,
            "{$user->ho_ten} ({$user->ma_gv})",
            $oldData,
            $user->fresh()->toArray()
        );

        return response()->json(['message' => 'Cập nhật người dùng thành công', 'user' => $user]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $userData = $user->toArray();

        $user->delete();

        $this->logActivity(
            'DELETE_USER',
            "Xóa người dùng: {$userData['ho_ten']} ({$userData['ma_gv']})",
            'nguoi_dung',
            $id,
            "{$userData['ho_ten']} ({$userData['ma_gv']})",
            $userData,
            null
        );

        return response()->json(['message' => 'Xóa người dùng thành công']);
    }

    public function getKhoa(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');

        $query = Khoa::with('boMons');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ma_khoa', 'LIKE', '%' . $search . '%')
                    ->orWhere('ten_khoa', 'LIKE', '%' . $search . '%');
            });
        }

        $khoa = $query->paginate($perPage);

        return response()->json([
            'data' => $khoa->items(),
            'pagination' => [
                'current_page' => $khoa->currentPage(),
                'per_page' => $khoa->perPage(),
                'total' => $khoa->total(),
                'last_page' => $khoa->lastPage(),
                'from' => $khoa->firstItem(),
                'to' => $khoa->lastItem(),
            ],
        ]);
    }

    public function createKhoa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ma_khoa' => 'required|unique:khoa',
            'ten_khoa' => 'required',
        ], [
            'ma_khoa.required' => 'Mã khoa là bắt buộc.',
            'ma_khoa.unique' => 'Mã khoa đã tồn tại.',
            'ten_khoa.required' => 'Tên khoa là bắt buộc.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $khoa = Khoa::create($request->only('ma_khoa', 'ten_khoa'));

        $this->logActivity(
            'CREATE_KHOA',
            "Tạo khoa mới: {$khoa->ten_khoa} ({$khoa->ma_khoa})",
            'khoa',
            $khoa->id,
            "{$khoa->ten_khoa} ({$khoa->ma_khoa})",
            null,
            $khoa->toArray()
        );

        return response()->json(['message' => 'Tạo khoa thành công', 'khoa' => $khoa], 201);
    }

    public function updateKhoa(Request $request, $id)
    {
        $khoa = Khoa::findOrFail($id);
        $oldData = $khoa->toArray();

        $validator = Validator::make($request->all(), [
            'ma_khoa' => 'required|unique:khoa,ma_khoa,' . $id,
            'ten_khoa' => 'required',
        ], [
            'ma_khoa.required' => 'Mã khoa là bắt buộc.',
            'ma_khoa.unique' => 'Mã khoa đã tồn tại.',
            'ten_khoa.required' => 'Tên khoa là bắt buộc.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $khoa->update($request->only('ma_khoa', 'ten_khoa'));

        $this->logActivity(
            'UPDATE_KHOA',
            "Cập nhật khoa: {$khoa->ten_khoa} ({$khoa->ma_khoa})",
            'khoa',
            $khoa->id,
            "{$khoa->ten_khoa} ({$khoa->ma_khoa})",
            $oldData,
            $khoa->fresh()->toArray()
        );

        return response()->json(['message' => 'Cập nhật khoa thành công', 'khoa' => $khoa]);
    }

    public function deleteKhoa($id)
    {
        $khoa = Khoa::findOrFail($id);
        if ($khoa->boMons()->count() > 0) {
            return response()->json(['message' => 'Không thể xóa khoa có bộ môn'], 400);
        }

        $khoaData = $khoa->toArray();
        $khoa->delete();

        $this->logActivity(
            'DELETE_KHOA',
            "Xóa khoa: {$khoaData['ten_khoa']} ({$khoaData['ma_khoa']})",
            'khoa',
            $id,
            "{$khoaData['ten_khoa']} ({$khoaData['ma_khoa']})",
            $khoaData,
            null
        );

        return response()->json(['message' => 'Xóa khoa thành công']);
    }

    public function getBoMon(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');

        $query = BoMon::with('khoa');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ma_bo_mon', 'LIKE', '%' . $search . '%')
                    ->orWhere('ten_bo_mon', 'LIKE', '%' . $search . '%')
                    ->orWhereHas('khoa', function ($khoaQuery) use ($search) {
                        $khoaQuery->where('ten_khoa', 'LIKE', '%' . $search . '%');
                    });
            });
        }

        $boMon = $query->paginate($perPage);

        return response()->json([
            'data' => $boMon->items(),
            'pagination' => [
                'current_page' => $boMon->currentPage(),
                'per_page' => $boMon->perPage(),
                'total' => $boMon->total(),
                'last_page' => $boMon->lastPage(),
                'from' => $boMon->firstItem(),
                'to' => $boMon->lastItem(),
            ],
        ]);
    }

    public function createBoMon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ma_bo_mon' => 'required|unique:bo_mon',
            'ten_bo_mon' => 'required',
            'khoa_id' => 'required|exists:khoa,id',
        ], [
            'ma_bo_mon.required' => 'Mã bộ môn là bắt buộc.',
            'ma_bo_mon.unique' => 'Mã bộ môn đã tồn tại.',
            'ten_bo_mon.required' => 'Tên bộ môn là bắt buộc.',
            'khoa_id.required' => 'Khoa là bắt buộc.',
            'khoa_id.exists' => 'Khoa không tồn tại.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $boMon = BoMon::create($request->only('ma_bo_mon', 'ten_bo_mon', 'khoa_id'));

        $this->logActivity(
            'CREATE_BOMON',
            "Tạo bộ môn mới: {$boMon->ten_bo_mon} ({$boMon->ma_bo_mon})",
            'bo_mon',
            $boMon->id,
            "{$boMon->ten_bo_mon} ({$boMon->ma_bo_mon})",
            null,
            $boMon->toArray()
        );

        return response()->json(['message' => 'Tạo bộ môn thành công', 'bo_mon' => $boMon], 201);
    }

    public function updateBoMon(Request $request, $id)
    {
        $boMon = BoMon::findOrFail($id);
        $oldData = $boMon->toArray();

        $validator = Validator::make($request->all(), [
            'ma_bo_mon' => 'required|unique:bo_mon,ma_bo_mon,' . $id,
            'ten_bo_mon' => 'required',
            'khoa_id' => 'required|exists:khoa,id',
        ], [
            'ma_bo_mon.required' => 'Mã bộ môn là bắt buộc.',
            'ma_bo_mon.unique' => 'Mã bộ môn đã tồn tại.',
            'ten_bo_mon.required' => 'Tên bộ môn là bắt buộc.',
            'khoa_id.required' => 'Khoa là bắt buộc.',
            'khoa_id.exists' => 'Khoa không tồn tại.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $boMon->update($request->only('ma_bo_mon', 'ten_bo_mon', 'khoa_id'));

        $this->logActivity(
            'UPDATE_BOMON',
            "Cập nhật bộ môn: {$boMon->ten_bo_mon} ({$boMon->ma_bo_mon})",
            'bo_mon',
            $boMon->id,
            "{$boMon->ten_bo_mon} ({$boMon->ma_bo_mon})",
            $oldData,
            $boMon->fresh()->toArray()
        );

        return response()->json(['message' => 'Cập nhật bộ môn thành công', 'bo_mon' => $boMon]);
    }

    public function deleteBoMon($id)
    {
        $boMon = BoMon::findOrFail($id);
        if ($boMon->users()->count() > 0) {
            return response()->json(['message' => 'Không thể xóa bộ môn có người dùng'], 400);
        }

        $boMonData = $boMon->toArray();
        $boMon->delete();

        $this->logActivity(
            'DELETE_BOMON',
            "Xóa bộ môn: {$boMonData['ten_bo_mon']} ({$boMonData['ma_bo_mon']})",
            'bo_mon',
            $id,
            "{$boMonData['ten_bo_mon']} ({$boMonData['ma_bo_mon']})",
            $boMonData,
            null
        );

        return response()->json(['message' => 'Xóa bộ môn thành công']);
    }

    public function getNamHoc(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');

        $query = NamHoc::with('hocKys');

        if ($search) {
            $query->where('ten_nam_hoc', 'LIKE', '%' . $search . '%');
        }

        $namHoc = $query->paginate($perPage);

        return response()->json([
            'data' => $namHoc->items(),
            'pagination' => [
                'current_page' => $namHoc->currentPage(),
                'per_page' => $namHoc->perPage(),
                'total' => $namHoc->total(),
                'last_page' => $namHoc->lastPage(),
                'from' => $namHoc->firstItem(),
                'to' => $namHoc->lastItem(),
            ],
        ]);
    }

    public function createNamHoc(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ten_nam_hoc' => 'required|unique:nam_hoc',
            'la_nam_hien_hanh' => 'required|boolean',
        ], [
            'ten_nam_hoc.required' => 'Tên năm học là bắt buộc.',
            'ten_nam_hoc.unique' => 'Tên năm học đã tồn tại.',
            'la_nam_hien_hanh.required' => 'Trạng thái hiện hành là bắt buộc.',
            'la_nam_hien_hanh.boolean' => 'Trạng thái hiện hành phải là 0 hoặc 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->la_nam_hien_hanh) {
            NamHoc::where('la_nam_hien_hanh', 1)->update(['la_nam_hien_hanh' => 0]);
        }

        $namHoc = NamHoc::create($request->only('ten_nam_hoc', 'la_nam_hien_hanh'));

        $this->logActivity(
            'CREATE_NAMHOC',
            "Tạo năm học mới: {$namHoc->ten_nam_hoc}" . ($namHoc->la_nam_hien_hanh ? ' (Hiện hành)' : ''),
            'nam_hoc',
            $namHoc->id,
            $namHoc->ten_nam_hoc,
            null,
            $namHoc->toArray()
        );

        return response()->json(['message' => 'Tạo năm học thành công', 'nam_hoc' => $namHoc], 201);
    }

    public function updateNamHoc(Request $request, $id)
    {
        $namHoc = NamHoc::findOrFail($id);
        $oldData = $namHoc->toArray();

        $validator = Validator::make($request->all(), [
            'ten_nam_hoc' => 'required|unique:nam_hoc,ten_nam_hoc,' . $id,
            'la_nam_hien_hanh' => 'required|boolean',
        ], [
            'ten_nam_hoc.required' => 'Tên năm học là bắt buộc.',
            'ten_nam_hoc.unique' => 'Tên năm học đã tồn tại.',
            'la_nam_hien_hanh.required' => 'Trạng thái hiện hành là bắt buộc.',
            'la_nam_hien_hanh.boolean' => 'Trạng thái hiện hành phải là 0 hoặc 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->la_nam_hien_hanh) {
            NamHoc::where('la_nam_hien_hanh', 1)->update(['la_nam_hien_hanh' => 0]);
        }

        $namHoc->update($request->only('ten_nam_hoc', 'la_nam_hien_hanh'));

        $this->logActivity(
            'UPDATE_NAMHOC',
            "Cập nhật năm học: {$namHoc->ten_nam_hoc}",
            'nam_hoc',
            $namHoc->id,
            $namHoc->ten_nam_hoc,
            $oldData,
            $namHoc->fresh()->toArray()
        );

        return response()->json(['message' => 'Cập nhật năm học thành công', 'nam_hoc' => $namHoc]);
    }

    public function deleteNamHoc($id)
    {
        $namHoc = NamHoc::findOrFail($id);
        if ($namHoc->hocKys()->count() > 0) {
            return response()->json(['message' => 'Không thể xóa năm học có học kỳ'], 400);
        }

        $namHocData = $namHoc->toArray();
        $namHoc->delete();

        $this->logActivity(
            'DELETE_NAMHOC',
            "Xóa năm học: {$namHocData['ten_nam_hoc']}",
            'nam_hoc',
            $id,
            $namHocData['ten_nam_hoc'],
            $namHocData,
            null
        );

        return response()->json(['message' => 'Xóa năm học thành công']);
    }

    public function getHocKy(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');

        $query = HocKy::with('namHoc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ten_hoc_ky', 'LIKE', '%' . $search . '%')
                    ->orWhereHas('namHoc', function ($namHocQuery) use ($search) {
                        $namHocQuery->where('ten_nam_hoc', 'LIKE', '%' . $search . '%');
                    });
            });
        }

        $hocKy = $query->paginate($perPage);

        return response()->json([
            'data' => $hocKy->items(),
            'pagination' => [
                'current_page' => $hocKy->currentPage(),
                'per_page' => $hocKy->perPage(),
                'total' => $hocKy->total(),
                'last_page' => $hocKy->lastPage(),
                'from' => $hocKy->firstItem(),
                'to' => $hocKy->lastItem(),
            ],
        ]);
    }

    public function createHocKy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ten_hoc_ky' => 'required',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'la_ky_hien_hanh' => 'required|boolean',
        ], [
            'ten_hoc_ky.required' => 'Tên học kỳ là bắt buộc.',
            'nam_hoc_id.required' => 'Năm học là bắt buộc.',
            'nam_hoc_id.exists' => 'Năm học không tồn tại.',
            'la_ky_hien_hanh.required' => 'Trạng thái hiện hành là bắt buộc.',
            'la_ky_hien_hanh.boolean' => 'Trạng thái hiện hành phải là 0 hoặc 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->la_ky_hien_hanh) {
            HocKy::where('la_ky_hien_hanh', 1)->update(['la_ky_hien_hanh' => 0]);
        }

        $hocKy = HocKy::create($request->only('ten_hoc_ky', 'nam_hoc_id', 'la_ky_hien_hanh'));

        $this->logActivity(
            'CREATE_HOCKY',
            "Tạo học kỳ mới: {$hocKy->ten_hoc_ky}",
            'hoc_ky',
            $hocKy->id,
            $hocKy->ten_hoc_ky,
            null,
            $hocKy->toArray()
        );

        return response()->json(['message' => 'Tạo học kỳ thành công', 'hoc_ky' => $hocKy], 201);
    }

    public function updateHocKy(Request $request, $id)
    {
        $hocKy = HocKy::findOrFail($id);
        $oldData = $hocKy->toArray();

        $validator = Validator::make($request->all(), [
            'ten_hoc_ky' => 'required',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'la_ky_hien_hanh' => 'required|boolean',
        ], [
            'ten_hoc_ky.required' => 'Tên học kỳ là bắt buộc.',
            'nam_hoc_id.required' => 'Năm học là bắt buộc.',
            'nam_hoc_id.exists' => 'Năm học không tồn tại.',
            'la_ky_hien_hanh.required' => 'Trạng thái hiện hành là bắt buộc.',
            'la_ky_hien_hanh.boolean' => 'Trạng thái hiện hành phải là 0 hoặc 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->la_ky_hien_hanh) {
            HocKy::where('la_ky_hien_hanh', 1)->update(['la_ky_hien_hanh' => 0]);
        }

        $hocKy->update($request->only('ten_hoc_ky', 'nam_hoc_id', 'la_ky_hien_hanh'));

        $this->logActivity(
            'UPDATE_HOCKY',
            "Cập nhật học kỳ: {$hocKy->ten_hoc_ky}",
            'hoc_ky',
            $hocKy->id,
            $hocKy->ten_hoc_ky,
            $oldData,
            $hocKy->fresh()->toArray()
        );

        return response()->json(['message' => 'Cập nhật học kỳ thành công', 'hoc_ky' => $hocKy]);
    }

    public function deleteHocKy($id)
    {
        $hocKy = HocKy::findOrFail($id);
        $hocKyData = $hocKy->toArray();

        $hocKy->delete();

        $this->logActivity(
            'DELETE_HOCKY', "Xóa học kỳ: {$hocKyData['ten_hoc_ky']}", 'hoc_ky', $id, $hocKyData['ten_hoc_ky'], $hocKyData, null
        );

        return response()->json(['message' => 'Xóa học kỳ thành công']);
    }

    public function getKeKhaiThoiGian(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');
        $query = KeKhaiThoiGian::with('namHoc');

        if ($request->has('nam_hoc_id')) {
            $query->where('nam_hoc_id', $request->nam_hoc_id);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ghi_chu', 'LIKE', "%{$search}%")
                    ->orWhereHas('namHoc', fn($nhq) => $nhq->where('ten_nam_hoc', 'LIKE', "%{$search}%"));
            });
        }
        $keKhaiThoiGian = $query->orderBy('nam_hoc_id', 'desc')->paginate($perPage);
        return response()->json(['data' => $keKhaiThoiGian->items(), 'pagination' => $this->transformPagination($keKhaiThoiGian)]);
    }

    public function createKeKhaiThoiGian(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nam_hoc_id' => 'required|exists:nam_hoc,id|unique:ke_khai_thoi_gian,nam_hoc_id',
            'thoi_gian_bat_dau' => 'required|date|before_or_equal:thoi_gian_ket_thuc',
            'thoi_gian_ket_thuc' => 'required|date|after_or_equal:thoi_gian_bat_dau',
            'ghi_chu' => 'nullable|string|max:1000',
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        $keKhaiThoiGian = KeKhaiThoiGian::create($request->all());
        $this->logActivity('CREATE_KEKHAITHOIGIAN', "Tạo thời gian kê khai cho năm học ID: {$keKhaiThoiGian->nam_hoc_id}", 'ke_khai_thoi_gian', $keKhaiThoiGian->id, null, null, $keKhaiThoiGian->toArray());
        return response()->json(['message' => 'Tạo thời gian kê khai thành công', 'data' => $keKhaiThoiGian->load('namHoc')], 201);
    }

    public function getKeKhaiThoiGianById($id)
    {
        $keKhaiThoiGian = KeKhaiThoiGian::with('namHoc')->findOrFail($id);
        return response()->json($keKhaiThoiGian);
    }

    public function updateKeKhaiThoiGian(Request $request, $id)
    {
        $keKhaiThoiGian = KeKhaiThoiGian::findOrFail($id);
        $oldData = $keKhaiThoiGian->toArray();
        $validator = Validator::make($request->all(), [
            'nam_hoc_id' => 'required|exists:nam_hoc,id|unique:ke_khai_thoi_gian,nam_hoc_id,' . $id,
            'thoi_gian_bat_dau' => 'required|date|before_or_equal:thoi_gian_ket_thuc',
            'thoi_gian_ket_thuc' => 'required|date|after_or_equal:thoi_gian_bat_dau',
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }
        $keKhaiThoiGian->update($request->all());
        $this->logActivity('UPDATE_KEKHAITHOIGIAN', "Cập nhật thời gian kê khai cho năm học ID: {$keKhaiThoiGian->nam_hoc_id}", 'ke_khai_thoi_gian', $id, null, $oldData, $keKhaiThoiGian->fresh()->toArray());
        return response()->json(['message' => 'Cập nhật thành công', 'data' => $keKhaiThoiGian->load('namHoc')]);
    }
    public function deleteKeKhaiThoiGian($id)
    {
        $keKhaiThoiGian = KeKhaiThoiGian::findOrFail($id);
        $hasKeKhai = \App\Models\KeKhaiTongHopNamHoc::where('nam_hoc_id', $keKhaiThoiGian->nam_hoc_id)->exists();
        if ($hasKeKhai) {
            return response()->json(['message' => 'Không thể xóa, đã có kê khai trong năm học này.'], 400);
        }
        $data = $keKhaiThoiGian->toArray();
        $keKhaiThoiGian->delete();
        $this->logActivity('DELETE_KEKHAITHOIGIAN', "Xóa thời gian kê khai năm học ID: {$data['nam_hoc_id']}", 'ke_khai_thoi_gian', $id, null, $data);
        return response()->json(['message' => 'Xóa thành công']);
    }

    public function getDinhMucCaNhan(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search_gv');
        $query = DinhMucCaNhanTheoNam::with(['nguoiDung:id,ho_ten,ma_gv', 'namHoc:id,ten_nam_hoc']);

        if ($request->filled('nam_hoc_id')) $query->where('nam_hoc_id', $request->nam_hoc_id);
        if ($search) {
            $query->whereHas('nguoiDung', function ($q) use ($search) {
                $q->where('ho_ten', 'like', "%{$search}%")
                    ->orWhere('ma_gv', 'like', "%{$search}%");
            });
        }

        $dinhMucList = $query->orderBy('nam_hoc_id', 'desc')->orderBy('nguoi_dung_id')->paginate($perPage);
        return response()->json(['data' => $dinhMucList->items(), 'pagination' => $this->transformPagination($dinhMucList)]);
    }

    public function createDinhMucCaNhan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'dinh_muc_gd' => 'required|numeric|min:0',
            'dinh_muc_khcn' => 'required|numeric|min:0',
            'ghi_chu' => 'nullable|string',
        ], [
            'nguoi_dung_id.required' => 'Vui lòng chọn giảng viên.',
            'nguoi_dung_id.exists' => 'Giảng viên không tồn tại.',
            'nam_hoc_id.required' => 'Vui lòng chọn năm học.',
            'nam_hoc_id.exists' => 'Năm học không tồn tại.',
            'dinh_muc_gd.required' => 'Định mức giảng dạy là bắt buộc.',
            'dinh_muc_gd.numeric' => 'Định mức giảng dạy phải là số.',
            'dinh_muc_gd.min' => 'Định mức giảng dạy phải lớn hơn hoặc bằng 0.',
        ]);

        // Unique cho (nguoi_dung_id, nam_hoc_id)
        $validator->sometimes('nam_hoc_id', 'unique:dinh_muc_ca_nhan_theo_nam,nam_hoc_id,NULL,id,nguoi_dung_id,' . $request->nguoi_dung_id, function ($input) {
            return true;
        });

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        $dinhMuc = DinhMucCaNhanTheoNam::create($request->all());
        $this->logActivity('CREATE_DINHMUCCANHAN', "Tạo định mức cho GV ID: {$dinhMuc->nguoi_dung_id}, Năm học ID: {$dinhMuc->nam_hoc_id}", 'dinh_muc_ca_nhan_theo_nam', $dinhMuc->id, null, null, $dinhMuc->toArray());
        return response()->json(['message' => 'Tạo định mức cá nhân thành công', 'data' => $dinhMuc->load(['nguoiDung', 'namHoc'])], 201);
    }

    public function updateDinhMucCaNhan(Request $request, $id)
    {
        $dinhMuc = DinhMucCaNhanTheoNam::findOrFail($id);
        $oldData = $dinhMuc->toArray();

        $validator = Validator::make($request->all(), [
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'dinh_muc_gd' => 'required|numeric|min:0',
            'dinh_muc_khcn' => 'required|numeric|min:0',
            'ghi_chu' => 'nullable|string',
        ]);

        $validator->sometimes('nam_hoc_id', 'unique:dinh_muc_ca_nhan_theo_nam,nam_hoc_id,' . $id . ',id,nguoi_dung_id,' . $request->nguoi_dung_id, function ($input) {
            return true;
        });

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        $dinhMuc->update($request->all());
        $this->logActivity('UPDATE_DINHMUCCANHAN', "Cập nhật định mức ID: {$id}", 'dinh_muc_ca_nhan_theo_nam', $id, null, $oldData, $dinhMuc->fresh()->toArray());
        return response()->json(['message' => 'Cập nhật thành công', 'data' => $dinhMuc->load(['nguoiDung', 'namHoc'])]);
    }

    public function deleteDinhMucCaNhan($id)
    {
        $dinhMuc = DinhMucCaNhanTheoNam::findOrFail($id);
        $data = $dinhMuc->toArray();
        $dinhMuc->delete();
        $this->logActivity('DELETE_DINHMUCCANHAN', "Xóa định mức ID: {$id}", 'dinh_muc_ca_nhan_theo_nam', $id, null, $data);
        return response()->json(['message' => 'Xóa thành công']);
    }

    public function importDinhMucCaNhan(Request $request)
    {
        $validator = Validator::make($request->all(), ['file' => 'required|mimes:xlsx,xls,csv|max:2048']);
        if ($validator->fails()) return response()->json(['message' => 'File không hợp lệ', 'errors' => $validator->errors()], 422);

        try {
            Excel::import(new DinhMucCaNhanImport, $request->file('file'));
            $this->logActivity('IMPORT_DINHMUCCANHAN', 'Import dữ liệu định mức cá nhân từ Excel', 'dinh_muc_ca_nhan_theo_nam');
            return response()->json(['message' => 'Nhập dữ liệu định mức cá nhân thành công']);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            return response()->json(['message' => 'Có lỗi khi nhập dữ liệu', 'errors' => $this->formatImportErrors($e->failures())], 422);
        } catch (\Exception $e) {
            Log::error('Import định mức cá nhân failed: ' . $e->getMessage());
            return response()->json(['message' => 'Có lỗi xảy ra khi nhập dữ liệu: ' . $e->getMessage()], 500);
        }
    }

    public function getDmHeSoChung(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');
        $query = DmHeSoChung::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('ma_he_so', 'like', "%{$search}%")
                    ->orWhere('ten_he_so', 'like', "%{$search}%")
                    ->orWhere('mo_ta', 'like', "%{$search}%");
            });
        }

        $heSoList = $query->orderBy('ma_he_so')->paginate($perPage);
        return response()->json(['data' => $heSoList->items(), 'pagination' => $this->transformPagination($heSoList)]);
    }

    public function createDmHeSoChung(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ma_he_so' => 'required|string|max:50|unique:dm_he_so_chung,ma_he_so',
            'ten_he_so' => 'required|string|max:255',
            'gia_tri' => 'required|numeric',
            'don_vi_tinh' => 'nullable|string|max:50',
            'mo_ta' => 'nullable|string',
        ], [
            'ma_he_so.required' => 'Mã hệ số là bắt buộc.',
            'ma_he_so.unique' => 'Mã hệ số đã tồn tại.',
            'ten_he_so.required' => 'Tên hệ số là bắt buộc.',
            'gia_tri.required' => 'Giá trị là bắt buộc.',
            'gia_tri.numeric' => 'Giá trị phải là số.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        $heSo = DmHeSoChung::create($request->all());
        $this->logActivity('CREATE_DMHESOCHUNG', "Tạo hệ số: {$heSo->ma_he_so}", 'dm_he_so_chung', $heSo->id, $heSo->ten_he_so, null, $heSo->toArray());
        return response()->json(['message' => 'Tạo hệ số chung thành công', 'data' => $heSo], 201);
    }

    public function updateDmHeSoChung(Request $request, $id)
    {
        $heSo = DmHeSoChung::findOrFail($id);
        $oldData = $heSo->toArray();

        $validator = Validator::make($request->all(), [
            'ma_he_so' => 'required|string|max:50|unique:dm_he_so_chung,ma_he_so,' . $id,
            'ten_he_so' => 'required|string|max:255',
            'gia_tri' => 'required|numeric',
            'don_vi_tinh' => 'nullable|string|max:50',
            'mo_ta' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        $heSo->update($request->all());
        $this->logActivity('UPDATE_DMHESOCHUNG', "Cập nhật hệ số ID: {$id}", 'dm_he_so_chung', $id, $heSo->ten_he_so, $oldData, $heSo->fresh()->toArray());
        return response()->json(['message' => 'Cập nhật thành công', 'data' => $heSo]);
    }

    public function deleteDmHeSoChung($id)
    {
        $heSo = DmHeSoChung::findOrFail($id);
        $data = $heSo->toArray();
        $heSo->delete();
        $this->logActivity('DELETE_DMHESOCHUNG', "Xóa hệ số ID: {$id}", 'dm_he_so_chung', $id, $data['ten_he_so'], $data);
        return response()->json(['message' => 'Xóa thành công']);
    }

    public function importDmHeSoChung(Request $request)
    {
        $validator = Validator::make($request->all(), ['file' => 'required|mimes:xlsx,xls,csv|max:2048']);
        if ($validator->fails()) return response()->json(['message' => 'File không hợp lệ', 'errors' => $validator->errors()], 422);

        try {
            Excel::import(new DmHeSoChungImport, $request->file('file'));
            $this->logActivity('IMPORT_DMHESOCHUNG', 'Import dữ liệu hệ số chung từ Excel', 'dm_he_so_chung');
            return response()->json(['message' => 'Nhập dữ liệu hệ số chung thành công']);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            return response()->json(['message' => 'Có lỗi khi nhập dữ liệu', 'errors' => $this->formatImportErrors($e->failures())], 422);
        } catch (\Exception $e) {
            Log::error('Import hệ số chung failed: ' . $e->getMessage());
            return response()->json(['message' => 'Có lỗi xảy ra khi nhập dữ liệu: ' . $e->getMessage()], 500);
        }
    }

    public function getMienGiamDinhMuc(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');
        $query = MienGiamDinhMuc::with(['nguoiDung:id,ho_ten,ma_gv', 'namHoc:id,ten_nam_hoc']);

        if ($request->filled('nam_hoc_id')) {
            $query->where('nam_hoc_id', $request->nam_hoc_id);
        }

        if ($search) {
            $query->whereHas('nguoiDung', function ($q) use ($search) {
                $q->where('ho_ten', 'like', "%{$search}%")
                    ->orWhere('ma_gv', 'like', "%{$search}%");
            });
        }

        $mienGiamList = $query->orderBy('nam_hoc_id', 'desc')->orderBy('nguoi_dung_id')->paginate($perPage);
        return response()->json([
            'data' => $mienGiamList->items(),
            'pagination' => $this->transformPagination($mienGiamList)
        ]);
    }

    public function createMienGiamDinhMuc(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'so_gio_mien_giam' => 'required|numeric|min:0',
            'ly_do' => 'required|string|max:255',
            'ngay_bat_dau' => 'required|date',
            'ngay_ket_thuc' => 'required|date|after_or_equal:ngay_bat_dau',
            'ghi_chu' => 'nullable|string',
        ], [
            'nguoi_dung_id.required' => 'Vui lòng chọn giảng viên.',
            'nguoi_dung_id.exists' => 'Giảng viên không tồn tại.',
            'nam_hoc_id.required' => 'Vui lòng chọn năm học.',
            'nam_hoc_id.exists' => 'Năm học không tồn tại.',
            'so_gio_mien_giam.required' => 'Số giờ miễn giảm là bắt buộc.',
            'so_gio_mien_giam.numeric' => 'Số giờ miễn giảm phải là số.',
            'so_gio_mien_giam.min' => 'Số giờ miễn giảm phải lớn hơn hoặc bằng 0.',
            'ly_do.required' => 'Lý do miễn giảm là bắt buộc.',
            'ngay_bat_dau.required' => 'Ngày bắt đầu là bắt buộc.',
            'ngay_ket_thuc.required' => 'Ngày kết thúc là bắt buộc.',
            'ngay_ket_thuc.after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $mienGiam = MienGiamDinhMuc::create($request->all());
        $this->logActivity(
            'CREATE_MIENGIAMDINHMUC',
            "Tạo miễn giảm cho GV ID: {$mienGiam->nguoi_dung_id}, Năm học ID: {$mienGiam->nam_hoc_id}",
            'mien_giam_dinh_muc',
            $mienGiam->id,
            null,
            null,
            $mienGiam->toArray()
        );

        return response()->json([
            'message' => 'Tạo miễn giảm định mức thành công',
            'data' => $mienGiam->load(['nguoiDung', 'namHoc'])
        ], 201);
    }

    public function updateMienGiamDinhMuc(Request $request, $id)
    {
        $mienGiam = MienGiamDinhMuc::findOrFail($id);
        $oldData = $mienGiam->toArray();

        $validator = Validator::make($request->all(), [
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'so_gio_mien_giam' => 'required|numeric|min:0',
            'ly_do' => 'required|string|max:255',
            'ngay_bat_dau' => 'required|date',
            'ngay_ket_thuc' => 'required|date|after_or_equal:ngay_bat_dau',
            'ghi_chu' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $mienGiam->update($request->all());
        $this->logActivity(
            'UPDATE_MIENGIAMDINHMUC',
            "Cập nhật miễn giảm ID: {$id}",
            'mien_giam_dinh_muc',
            $id,
            null,
            $oldData,
            $mienGiam->fresh()->toArray()
        );

        return response()->json([
            'message' => 'Cập nhật thành công',
            'data' => $mienGiam->load(['nguoiDung', 'namHoc'])
        ]);
    }

    public function deleteMienGiamDinhMuc($id)
    {
        $mienGiam = MienGiamDinhMuc::findOrFail($id);
        $data = $mienGiam->toArray();
        $mienGiam->delete();

        $this->logActivity('DELETE_MIENGIAMDINHMUC', "Xóa miễn giảm ID: {$id}", 'mien_giam_dinh_muc', $id, null, $data);

        return response()->json(['message' => 'Xóa thành công']);
    }

    public function importMienGiamDinhMuc(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls,csv|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'File không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            Excel::import(new MienGiamImport, $request->file('file'));
            $this->logActivity(
                'IMPORT_MIENGIAMDINHMUC',
                'Import dữ liệu miễn giảm định mức từ Excel',
                'mien_giam_dinh_muc'
            );
            return response()->json(['message' => 'Nhập dữ liệu miễn giảm định mức thành công']);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            return response()->json([
                'message' => 'Có lỗi khi nhập dữ liệu',
                'errors' => $this->formatImportErrors($e->failures())
            ], 422);
        } catch (\Exception $e) {
            Log::error('Import miễn giảm định mức failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi nhập dữ liệu: ' . $e->getMessage()
            ], 500);
        }
    }

    private function formatImportErrors($failures)
    {
        $errors = [];
        foreach ($failures as $failure) {
            $errors[] = [
                'row' => $failure->row(),
                'attribute' => $failure->attribute(),
                'errors' => $failure->errors(),
                'values' => $failure->values(),
            ];
        }
        return $errors;
    }

    private function transformPagination($paginatedData)
    {
        return [
            'current_page' => $paginatedData->currentPage(),
            'per_page' => $paginatedData->perPage(),
            'total' => $paginatedData->total(),
            'last_page' => $paginatedData->lastPage(),
            'from' => $paginatedData->firstItem(),
            'to' => $paginatedData->lastItem(),
        ];
    }

    public function getAdminLogs(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search');
        $action = $request->query('action');
        $adminId = $request->query('admin_id');
        $tableName = $request->query('table_name');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $query = AdminLog::query();

        if ($action) {
            $query->where('action', $action);
        }

        if ($tableName) {
            $query->where('table_name', $tableName);
        }

        if ($adminId) {
            $query->where('admin_id', $adminId);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'LIKE', '%' . $search . '%')
                    ->orWhere('admin_name', 'LIKE', '%' . $search . '%')
                    ->orWhere('record_name', 'LIKE', '%' . $search . '%')
                    ->orWhere('ip_address', 'LIKE', '%' . $search . '%');
            });
        }

        $query->orderBy('created_at', 'desc');

        $logs = $query->paginate($perPage);

        return response()->json([
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'last_page' => $logs->lastPage(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ],
        ]);
    }

    public function getAdminLogStats(Request $request)
    {
        $dateFrom = $request->query('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->query('date_to', now()->format('Y-m-d'));

        $query = AdminLog::whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo);

        // Tổng số hoạt động
        $totalActivities = $query->count();

        // Thống kê theo hành động
        $actionStats = $query->select('action', DB::raw('count(*) as count'))
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->get();

        // Thống kê theo bảng
        $tableStats = AdminLog::whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->select('table_name', DB::raw('count(*) as count'))
            ->groupBy('table_name')
            ->orderBy('count', 'desc')
            ->get();

        // Thống kê theo người dùng (top 10)
        $userStats = AdminLog::whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->select('admin_id', 'admin_name', DB::raw('count(*) as count'))
            ->groupBy('admin_id', 'admin_name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Thống kê theo ngày (7 ngày gần nhất)
        $dailyStats = AdminLog::whereDate('created_at', '>=', now()->subDays(7))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get();

        // Thống kê theo giờ trong ngày hôm nay
        $hourlyStats = AdminLog::whereDate('created_at', now()->format('Y-m-d'))
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('count(*) as count')
            )
            ->groupBy(DB::raw('HOUR(created_at)'))
            ->orderBy('hour', 'asc')
            ->get();

        // Hoạt động gần đây (5 hoạt động mới nhất)
        $recentActivities = AdminLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'summary' => [
                'total_activities' => $totalActivities,
                'date_range' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ],
            ],
            'action_stats' => $actionStats,
            'table_stats' => $tableStats,
            'user_stats' => $userStats,
            'daily_stats' => $dailyStats,
            'hourly_stats' => $hourlyStats,
            'recent_activities' => $recentActivities,
        ]);
    }

    public function getLuongGiangVien(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search_gv');
        $query = LuongGiangVien::with(['nguoiDung:id,ho_ten,ma_gv', 'namHoc:id,ten_nam_hoc']);

        if ($request->filled('nam_hoc_id')) $query->where('nam_hoc_id', $request->nam_hoc_id);
        if ($search) {
            $query->whereHas('nguoiDung', function ($q) use ($search) {
                $q->where('ho_ten', 'like', "%{$search}%")
                    ->orWhere('ma_gv', 'like', "%{$search}%");
            });
        }

        $luongList = $query->orderBy('nam_hoc_id', 'desc')->orderBy('nguoi_dung_id')->paginate($perPage);
        return response()->json(['data' => $luongList->items(), 'pagination' => $this->transformPagination($luongList)]);
    }

    public function createLuongGiangVien(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'muc_luong_co_ban' => 'required|numeric|min:0',
            'tong_gio_chuan_thuc_hien' => 'nullable|numeric|min:0',
            'so_gio_vuot_muc' => 'nullable|numeric|min:0',
            'don_gia_gio_vuot_muc' => 'nullable|numeric|min:0',
            'tong_tien_luong_vuot_gio' => 'nullable|numeric|min:0',
            'thanh_tien_nam' => 'nullable|numeric|min:0',
            'ghi_chu' => 'nullable|string',
        ], [
            'nguoi_dung_id.required' => 'Vui lòng chọn giảng viên.',
            'nguoi_dung_id.exists' => 'Giảng viên không tồn tại.',
            'nam_hoc_id.required' => 'Vui lòng chọn năm học.',
            'nam_hoc_id.exists' => 'Năm học không tồn tại.',
            'muc_luong_co_ban.required' => 'Mức lương cơ bản là bắt buộc.',
            'muc_luong_co_ban.numeric' => 'Mức lương cơ bản phải là số.',
            'muc_luong_co_ban.min' => 'Mức lương cơ bản phải lớn hơn hoặc bằng 0.',
        ]);

        // Unique cho (nguoi_dung_id, nam_hoc_id)
        $validator->sometimes('nam_hoc_id', 'unique:luong_giang_vien,nam_hoc_id,NULL,id,nguoi_dung_id,' . $request->nguoi_dung_id, function ($input) {
            return true;
        });

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        $luong = LuongGiangVien::create($request->all());
        $this->logActivity('CREATE_LUONGGIANGVIEN', "Tạo lương cho GV ID: {$luong->nguoi_dung_id}, Năm học ID: {$luong->nam_hoc_id}", 'luong_giang_vien', $luong->id, null, null, $luong->toArray());
        return response()->json(['message' => 'Tạo lương giảng viên thành công', 'data' => $luong->load(['nguoiDung', 'namHoc'])], 201);
    }

    public function updateLuongGiangVien(Request $request, $id)
    {
        $luong = LuongGiangVien::findOrFail($id);
        $oldData = $luong->toArray();

        $validator = Validator::make($request->all(), [
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'muc_luong_co_ban' => 'required|numeric|min:0',
            'tong_gio_chuan_thuc_hien' => 'nullable|numeric|min:0',
            'so_gio_vuot_muc' => 'nullable|numeric|min:0',
            'don_gia_gio_vuot_muc' => 'nullable|numeric|min:0',
            'tong_tien_luong_vuot_gio' => 'nullable|numeric|min:0',
            'thanh_tien_nam' => 'nullable|numeric|min:0',
            'ghi_chu' => 'nullable|string',
        ]);

        $validator->sometimes('nam_hoc_id', 'unique:luong_giang_vien,nam_hoc_id,' . $id . ',id,nguoi_dung_id,' . $request->nguoi_dung_id, function ($input) {
            return true;
        });

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        $luong->update($request->all());
        $this->logActivity('UPDATE_LUONGGIANGVIEN', "Cập nhật lương ID: {$id}", 'luong_giang_vien', $id, null, $oldData, $luong->fresh()->toArray());
        return response()->json(['message' => 'Cập nhật thành công', 'data' => $luong->load(['nguoiDung', 'namHoc'])]);
    }

    public function deleteLuongGiangVien($id)
    {
        $luong = LuongGiangVien::findOrFail($id);
        $data = $luong->toArray();
        $luong->delete();
        $this->logActivity('DELETE_LUONGGIANGVIEN', "Xóa lương ID: {$id}", 'luong_giang_vien', $id, null, $data);
        return response()->json(['message' => 'Xóa thành công']);
    }

    public function importLuongGiangVien(Request $request)
    {
        $validator = Validator::make($request->all(), ['file' => 'required|mimes:xlsx,xls,csv|max:2048']);
        if ($validator->fails()) return response()->json(['message' => 'File không hợp lệ', 'errors' => $validator->errors()], 422);

        try {
            Excel::import(new LuongGiangVienImport, $request->file('file'));
            $this->logActivity('IMPORT_LUONGGIANGVIEN', 'Import dữ liệu lương giảng viên từ Excel', 'luong_giang_vien');
            return response()->json(['message' => 'Nhập dữ liệu lương giảng viên thành công']);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            return response()->json(['message' => 'Có lỗi khi nhập dữ liệu', 'errors' => $this->formatImportErrors($e->failures())], 422);
        } catch (\Exception $e) {
            Log::error('Import lương giảng viên failed: ' . $e->getMessage());
            return response()->json(['message' => 'Có lỗi xảy ra khi nhập dữ liệu: ' . $e->getMessage()], 500);
        }
    }

    public function importUsers(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);
        try {
            $import = new UsersImport();
            $result = Excel::import($import, $request->file('file'));
            $this->logActivity('IMPORT_USERS', 'Import danh sách người dùng từ file', 'nguoi_dung');
            return response()->json(['message' => 'Import người dùng thành công']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Import người dùng thất bại', 'error' => $e->getMessage()], 422);
        }
    }

    public function importNamHoc(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);
        try {
            $import = new NamHocImport();
            $result = Excel::import($import, $request->file('file'));
            $this->logActivity('IMPORT_NAM_HOC', 'Import danh sách năm học từ file', 'nam_hoc');
            return response()->json(['message' => 'Import năm học thành công']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Import năm học thất bại', 'error' => $e->getMessage()], 422);
        }
    }

    public function importHocKy(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);
        try {
            $import = new HocKyImport();
            $result = Excel::import($import, $request->file('file'));
            $this->logActivity('IMPORT_HOC_KY', 'Import danh sách học kỳ từ file', 'hoc_ky');
            return response()->json(['message' => 'Import học kỳ thành công']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Import học kỳ thất bại', 'error' => $e->getMessage()], 422);
        }
    }

    public function importKeKhaiThoiGian(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);
        try {
            $import = new KeKhaiThoiGianImport();
            $result = Excel::import($import, $request->file('file'));
            $this->logActivity('IMPORT_KE_KHAI_THOI_GIAN', 'Import thời gian kê khai từ file', 'ke_khai_thoi_gian');
            return response()->json(['message' => 'Import thời gian kê khai thành công']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Import thời gian kê khai thất bại', 'error' => $e->getMessage()], 422);
        }

    }

    public function importBoMon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls,csv|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'File không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            Excel::import(new BoMonImport, $request->file('file'));
            $this->logActivity(
                'IMPORT_BOMON',
                'Import dữ liệu bộ môn từ Excel',
                'bo_mon'
            );
            return response()->json(['message' => 'Nhập dữ liệu bộ môn thành công']);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            return response()->json([
                'message' => 'Có lỗi khi nhập dữ liệu',
                'errors' => $this->formatImportErrors($e->failures())
            ], 422);
        } catch (\Exception $e) {
            Log::error('Import bộ môn failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra khi nhập dữ liệu: ' . $e->getMessage()
            ], 500);
        }
    }
}
