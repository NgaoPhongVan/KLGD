<?php

namespace App\Imports;

use App\Models\HocKy;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class HocKyImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Nếu là kỳ hiện hành, reset các kỳ khác
        if ($row['la_ky_hien_hanh']) {
            HocKy::where('la_ky_hien_hanh', 1)->update(['la_ky_hien_hanh' => 0]);
        }

        return new HocKy([
            'ten_hoc_ky' => $row['ten_hoc_ky'],
            'nam_hoc_id' => $row['nam_hoc_id'],
            'la_ky_hien_hanh' => $row['la_ky_hien_hanh'] ?? 0,
        ]);
    }

    public function rules(): array
    {
        return [
            'ten_hoc_ky' => 'required',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'la_ky_hien_hanh' => 'nullable|boolean',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'ten_hoc_ky.required' => 'Tên học kỳ là bắt buộc.',
            'nam_hoc_id.required' => 'Năm học là bắt buộc.',
            'nam_hoc_id.exists' => 'Năm học :input không tồn tại.',
            'la_ky_hien_hanh.boolean' => 'Trạng thái hiện hành phải là 0 hoặc 1.',
        ];
    }
}