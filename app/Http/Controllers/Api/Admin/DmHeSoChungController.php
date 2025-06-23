<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DmHeSoChung;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class DmHeSoChungController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 10);
            $search = $request->query('search');
            $sortBy = $request->query('sort_by', 'ma_he_so'); // Mặc định sort theo mã hệ số
            $sortDirection = $request->query('sort_direction', 'asc'); // Mặc định asc

            $query = DmHeSoChung::query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ma_he_so', 'LIKE', "%{$search}%")
                      ->orWhere('ten_he_so', 'LIKE', "%{$search}%")
                      ->orWhere('mo_ta', 'LIKE', "%{$search}%");
                });
            }

            $dmHeSoChungs = $query->orderBy($sortBy, $sortDirection)->paginate($perPage);

            return response()->json([
                'data' => $dmHeSoChungs->items(),
                'pagination' => [
                    'current_page' => $dmHeSoChungs->currentPage(),
                    'per_page' => $dmHeSoChungs->perPage(),
                    'total' => $dmHeSoChungs->total(),
                    'last_page' => $dmHeSoChungs->lastPage(),
                    'from' => $dmHeSoChungs->firstItem(),
                    'to' => $dmHeSoChungs->lastItem(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching DmHeSoChung: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi máy chủ: Không thể lấy danh sách hệ số chung.'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ma_he_so' => 'required|string|max:50|unique:dm_he_so_chung,ma_he_so',
            'ten_he_so' => 'required|string|max:255',
            'gia_tri' => 'required|numeric|min:0',
            'don_vi_tinh' => 'nullable|string|max:50',
            'mo_ta' => 'nullable|string',
        ], [
            'ma_he_so.required' => 'Mã hệ số là bắt buộc.',
            'ma_he_so.unique' => 'Mã hệ số đã tồn tại.',
            'ten_he_so.required' => 'Tên hệ số là bắt buộc.',
            'gia_tri.required' => 'Giá trị là bắt buộc.',
            'gia_tri.numeric' => 'Giá trị phải là một số.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        try {
            $dmHeSoChung = DmHeSoChung::create($request->all());
            return response()->json(['message' => 'Thêm hệ số chung thành công.', 'data' => $dmHeSoChung], 201);
        } catch (\Exception $e) {
            Log::error('Error creating DmHeSoChung: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi máy chủ: Không thể thêm hệ số chung.'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(DmHeSoChung $dmHeSoChung)
    {
        return response()->json(['data' => $dmHeSoChung]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DmHeSoChung $dmHeSoChung)
    {
        $validator = Validator::make($request->all(), [
            'ma_he_so' => 'required|string|max:50|unique:dm_he_so_chung,ma_he_so,' . $dmHeSoChung->id,
            'ten_he_so' => 'required|string|max:255',
            'gia_tri' => 'required|numeric|min:0',
            'don_vi_tinh' => 'nullable|string|max:50',
            'mo_ta' => 'nullable|string',
        ],[
            'ma_he_so.required' => 'Mã hệ số là bắt buộc.',
            'ma_he_so.unique' => 'Mã hệ số đã tồn tại.',
            'ten_he_so.required' => 'Tên hệ số là bắt buộc.',
            'gia_tri.required' => 'Giá trị là bắt buộc.',
            'gia_tri.numeric' => 'Giá trị phải là một số.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $validator->errors()], 422);
        }

        try {
            $dmHeSoChung->update($request->all());
            return response()->json(['message' => 'Cập nhật hệ số chung thành công.', 'data' => $dmHeSoChung]);
        } catch (\Exception $e) {
            Log::error('Error updating DmHeSoChung: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi máy chủ: Không thể cập nhật hệ số chung.'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DmHeSoChung $dmHeSoChung)
    {
        try {
            // Kiểm tra xem hệ số này có đang được sử dụng ở đâu không trước khi xóa (nếu cần)
            // Ví dụ: if ($dmHeSoChung->relatedRecords()->exists()) { ... }
            $dmHeSoChung->delete();
            return response()->json(['message' => 'Xóa hệ số chung thành công.']);
        } catch (\Exception $e) {
            Log::error('Error deleting DmHeSoChung: ' . $e->getMessage());
            // Bắt lỗi khóa ngoại nếu có
            if ($e instanceof \Illuminate\Database\QueryException && str_contains($e->getMessage(), 'foreign key constraint fails')) {
                return response()->json(['message' => 'Không thể xóa hệ số này vì đang được sử dụng ở nơi khác.'], 409); // Conflict
            }
            return response()->json(['message' => 'Lỗi máy chủ: Không thể xóa hệ số chung.'], 500);
        }
    }
}