<?php

namespace App\Imports;

use App\Models\LoaiHoatDong;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class LoaiHoatDongImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new LoaiHoatDong([
            'ten_loai' => $row['ten_loai'],
        ]);
    }

    public function rules(): array
    {
        return [
            'ten_loai' => 'required|unique:loai_hoat_dong,ten_loai',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'ten_loai.required' => 'Tên loại hoạt động là bắt buộc.',
            'ten_loai.unique' => 'Tên loại hoạt động :input đã tồn tại.',
        ];
    }
}