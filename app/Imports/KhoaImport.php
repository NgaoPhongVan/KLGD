<?php

namespace App\Imports;

use App\Models\Khoa;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class KhoaImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new Khoa([
            'ma_khoa' => $row['ma_khoa'],
            'ten_khoa' => $row['ten_khoa'],
        ]);
    }

    public function rules(): array
    {
        return [
            'ma_khoa' => 'required|unique:khoa,ma_khoa',
            'ten_khoa' => 'required',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'ma_khoa.required' => 'Mã khoa là bắt buộc.',
            'ma_khoa.unique' => 'Mã khoa :input đã tồn tại.',
            'ten_khoa.required' => 'Tên khoa là bắt buộc.',
        ];
    }
}