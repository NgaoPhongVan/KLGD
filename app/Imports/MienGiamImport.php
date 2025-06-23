<?php

namespace App\Imports;

use App\Models\MienGiamDinhMuc;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class MienGiamImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new MienGiamDinhMuc([
            'nguoi_dung_id' => $row['nguoi_dung_id'],
            'nam_hoc_id' => $row['nam_hoc_id'],
            'so_gio_mien_giam' => $row['so_gio_mien_giam'],
            'ly_do' => $row['ly_do'],
            'ngay_bat_dau' => $row['ngay_bat_dau'],
            'ngay_ket_thuc' => $row['ngay_ket_thuc'],
            'ghi_chu' => $row['ghi_chu'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'nguoi_dung_id' => 'required|exists:nguoi_dung,id',
            'nam_hoc_id' => 'required|exists:nam_hoc,id',
            'so_gio_mien_giam' => 'required|numeric|min:0',
            'ly_do' => 'required|string|max:255',
            'ngay_bat_dau' => 'required|date',
            'ngay_ket_thuc' => 'required|date|after:ngay_bat_dau',
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
            'so_gio_mien_giam.required' => 'Số giờ miễn giảm là bắt buộc.',
            'so_gio_mien_giam.numeric' => 'Số giờ miễn giảm phải là số.',
            'so_gio_mien_giam.min' => 'Số giờ miễn giảm phải lớn hơn hoặc bằng 0.',
            'ly_do.required' => 'Lý do miễn giảm là bắt buộc.',
            'ngay_bat_dau.required' => 'Ngày bắt đầu là bắt buộc.',
            'ngay_bat_dau.date' => 'Ngày bắt đầu phải là ngày hợp lệ.',
            'ngay_ket_thuc.required' => 'Ngày kết thúc là bắt buộc.',
            'ngay_ket_thuc.date' => 'Ngày kết thúc phải là ngày hợp lệ.',
            'ngay_ket_thuc.after' => 'Ngày kết thúc phải sau ngày bắt đầu.',
        ];
    }
}