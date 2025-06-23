<?php

namespace App\Imports;

use App\Models\BoMon;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class BoMonImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new BoMon([
            'ma_bo_mon' => $row['ma_bo_mon'],
            'ten_bo_mon' => $row['ten_bo_mon'],
            'khoa_id' => $row['khoa_id'],
        ]);
    }

    public function rules(): array
    {
        return [
            'ma_bo_mon' => 'required|unique:bo_mon,ma_bo_mon',
            'ten_bo_mon' => 'required',
            'khoa_id' => 'required|exists:khoa,id',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'ma_bo_mon.required' => 'Mã bộ môn là bắt buộc.',
            'ma_bo_mon.unique' => 'Mã bộ môn :input đã tồn tại.',
            'ten_bo_mon.required' => 'Tên bộ môn là bắt buộc.',
            'khoa_id.required' => 'Khoa là bắt buộc.',
            'khoa_id.exists' => 'Khoa :input không tồn tại.',
        ];
    }
}