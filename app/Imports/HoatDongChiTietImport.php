<?php

namespace App\Imports;

use App\Models\HoatDongChiTiet;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class HoatDongChiTietImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new HoatDongChiTiet([
            'ten_hoat_dong' => $row['ten_hoat_dong'],
            'loai_hoat_dong_id' => $row['loai_hoat_dong_id'],
        ]);
    }

    public function rules(): array
    {
        return [
            'ten_hoat_dong' => 'required',
            'loai_hoat_dong_id' => 'required|exists:loai_hoat_dong,id',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'ten_hoat_dong.required' => 'Tên hoạt động chi tiết là bắt buộc.',
            'loai_hoat_dong_id.required' => 'Loại hoạt động là bắt buộc.',
            'loai_hoat_dong_id.exists' => 'Loại hoạt động :input không tồn tại.',
        ];
    }
}