<?php

namespace App\Imports;

use App\Models\DmHeSoChung;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class DmHeSoChungImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new DmHeSoChung([
            'ma_he_so' => $row['ma_he_so'],
            'ten_he_so' => $row['ten_he_so'],
            'gia_tri' => $row['gia_tri'],
            'don_vi_tinh' => $row['don_vi_tinh'] ?? null,
            'mo_ta' => $row['mo_ta'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'ma_he_so' => 'required|string|max:50|unique:dm_he_so_chung,ma_he_so',
            'ten_he_so' => 'required|string|max:255',
            'gia_tri' => 'required|numeric',
            'don_vi_tinh' => 'nullable|string|max:50',
            'mo_ta' => 'nullable|string',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'ma_he_so.required' => 'Mã hệ số là bắt buộc.',
            'ma_he_so.unique' => 'Mã hệ số :input đã tồn tại.',
            'ma_he_so.max' => 'Mã hệ số không được vượt quá 50 ký tự.',
            'ten_he_so.required' => 'Tên hệ số là bắt buộc.',
            'ten_he_so.max' => 'Tên hệ số không được vượt quá 255 ký tự.',
            'gia_tri.required' => 'Giá trị là bắt buộc.',
            'gia_tri.numeric' => 'Giá trị phải là số.',
            'don_vi_tinh.max' => 'Đơn vị tính không được vượt quá 50 ký tự.',
        ];
    }
}