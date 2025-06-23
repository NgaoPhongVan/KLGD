<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\Importable;

class UsersImport implements ToModel, WithHeadingRow, WithValidation
{
    use Importable;
    public function model(array $row)
    {
        return new User([
            'ma_gv' => $row['ma_gv'],
            'ho_ten' => $row['ho_ten'],
            'email' => $row['email'],
            'password' => Hash::make($row['password'] ?? 'default123'), // Mật khẩu mặc định nếu không có
            'vai_tro' => $row['vai_tro'],
            'bo_mon_id' => $row['bo_mon_id'],
            'trang_thai' => $row['trang_thai'] ?? 1, // Mặc định là hoạt động
        ]);
    }

    public function rules(): array
    {
        return [
            'ma_gv' => 'required|unique:nguoi_dung,ma_gv',
            'ho_ten' => 'required',
            'email' => 'required|email|unique:nguoi_dung,email',
            'vai_tro' => 'required|in:1,2,3',
            'bo_mon_id' => 'required|exists:bo_mon,id',
            'trang_thai' => 'nullable|in:0,1',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'ma_gv.required' => 'Mã giảng viên là bắt buộc.',
            'ma_gv.unique' => 'Mã giảng viên :input đã tồn tại.',
            'ho_ten.required' => 'Họ tên là bắt buộc.',
            'email.required' => 'Email là bắt buộc.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email :input đã tồn tại.',
            'vai_tro.required' => 'Vai trò là bắt buộc.',
            'vai_tro.in' => 'Vai trò không hợp lệ (chỉ được là 1, 2, hoặc 3).',
            'bo_mon_id.required' => 'Bộ môn là bắt buộc.',
            'bo_mon_id.exists' => 'Bộ môn :input không tồn tại.',
            'trang_thai.in' => 'Trạng thái không hợp lệ (chỉ được là 0 hoặc 1).',
        ];
    }
}