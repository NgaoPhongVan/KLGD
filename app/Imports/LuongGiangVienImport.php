<?php

namespace App\Imports;

use App\Models\LuongGiangVien;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class LuongGiangVienImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new LuongGiangVien([
            'nguoi_dung_id' => $row['nguoi_dung_id'],
            'nam_hoc_id' => $row['nam_hoc_id'],
            'luong_co_ban' => $row['luong_co_ban'],
            'he_so_luong' => $row['he_so_luong'],
            'phu_cap_chuc_vu' => $row['phu_cap_chuc_vu'] ?? 0,
            'phu_cap_khac' => $row['phu_cap_khac'] ?? 0,
            'gio_vuot_dinh_muc' => $row['gio_vuot_dinh_muc'] ?? 0,
            'don_gia_gio_vuot' => $row['don_gia_gio_vuot'] ?? 0,
            'thuong_khac' => $row['thuong_khac'] ?? 0,
            'khau_tru_khac' => $row['khau_tru_khac'] ?? 0,
            'ghi_chu' => $row['ghi_chu'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'luong_co_ban' => 'required|numeric|min:0',
            'he_so_luong' => 'required|numeric|min:0',
            'phu_cap_chuc_vu' => 'nullable|numeric|min:0',
            'phu_cap_khac' => 'nullable|numeric|min:0',
            'gio_vuot_dinh_muc' => 'nullable|numeric|min:0',
            'don_gia_gio_vuot' => 'nullable|numeric|min:0',
            'thuong_khac' => 'nullable|numeric|min:0',
            'khau_tru_khac' => 'nullable|numeric|min:0',
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
            'luong_co_ban.required' => 'Lương cơ bản là bắt buộc.',
            'luong_co_ban.numeric' => 'Lương cơ bản phải là số.',
            'luong_co_ban.min' => 'Lương cơ bản phải lớn hơn hoặc bằng 0.',
            'he_so_luong.required' => 'Hệ số lương là bắt buộc.',
            'he_so_luong.numeric' => 'Hệ số lương phải là số.',
            'he_so_luong.min' => 'Hệ số lương phải lớn hơn hoặc bằng 0.',
        ];
    }
}