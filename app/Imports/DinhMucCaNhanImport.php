<?php

namespace App\Imports;

use App\Models\DinhMucCaNhanTheoNam;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class DinhMucCaNhanImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new DinhMucCaNhanTheoNam([
            'nguoi_dung_id' => $row['nguoi_dung_id'],
            'nam_hoc_id' => $row['nam_hoc_id'],
            'dinh_muc_gd' => $row['dinh_muc_gd'],
            'dinh_muc_khcn' => $row['dinh_muc_khcn'],
            'ghi_chu' => $row['ghi_chu'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'dinh_muc_gd' => 'required|numeric|min:0',
            'dinh_muc_khcn' => 'required|numeric|min:0',
            'ghi_chu' => 'nullable|string',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nguoi_dung_id.required' => 'ID người dùng là bắt buộc.',
            'nguoi_dung_id.exists' => 'Người dùng với ID :input không tồn tại.',
            'nam_hoc_id.required' => 'ID năm học là bắt buộc.',
            'nam_hoc_id.exists' => 'Năm học với ID :input không tồn tại.',
            'dinh_muc_gd.required' => 'Định mức giảng dạy là bắt buộc.',
            'dinh_muc_gd.numeric' => 'Định mức giảng dạy phải là số.',
            'dinh_muc_gd.min' => 'Định mức giảng dạy phải lớn hơn hoặc bằng 0.',
            'dinh_muc_khcn.required' => 'Định mức KHCN là bắt buộc.',
            'dinh_muc_khcn.numeric' => 'Định mức KHCN phải là số.',
            'dinh_muc_khcn.min' => 'Định mức KHCN phải lớn hơn hoặc bằng 0.',
        ];
    }
}