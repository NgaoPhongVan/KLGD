<?php

namespace App\Imports;

use App\Models\NamHoc;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class NamHocImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Nếu là năm hiện hành, reset các năm khác
        if ($row['la_nam_hien_hanh']) {
            NamHoc::where('la_nam_hien_hanh', 1)->update(['la_nam_hien_hanh' => 0]);
        }

        return new NamHoc([
            'ten_nam_hoc' => $row['ten_nam_hoc'],
            'la_nam_hien_hanh' => $row['la_nam_hien_hanh'] ?? 0,
        ]);
    }

    public function rules(): array
    {
        return [
            'ten_nam_hoc' => 'required|unique:nam_hoc,ten_nam_hoc',
            'la_nam_hien_hanh' => 'nullable|boolean',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'ten_nam_hoc.required' => 'Tên năm học là bắt buộc.',
            'ten_nam_hoc.unique' => 'Tên năm học :input đã tồn tại.',
            'la_nam_hien_hanh.boolean' => 'Trạng thái hiện hành phải là 0 hoặc 1.',
        ];
    }
}