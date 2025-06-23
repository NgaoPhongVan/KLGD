<?php

namespace App\Imports;

use App\Models\DinhMucGioChuan;
use App\Models\NamHoc;
use App\Models\ChucDanhGV;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;

class DinhMucImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use Importable, SkipsFailures;

    public function model(array $row)
    {
        // Kiểm tra xem định mức đã tồn tại chưa
        $exists = DinhMucGioChuan::where('nam_hoc_id', $row['nam_hoc_id'])
            ->where('chuc_danh_id', $row['chuc_danh_id'])
            ->exists();

        if ($exists) {
            // Bỏ qua nếu đã tồn tại
            return null;
        }

        return new DinhMucGioChuan([
            'nam_hoc_id' => $row['nam_hoc_id'],
            'chuc_danh_id' => $row['chuc_danh_id'],
            'tong_gio_chuan' => $row['tong_gio_chuan'],
            'phan_tram_gd_toi_thieu' => $row['phan_tram_gd_toi_thieu'],
            'ghi_chu' => $row['ghi_chu'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'nam_hoc_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) {
                    if (!NamHoc::find($value)) {
                        $fail('Năm học với ID ' . $value . ' không tồn tại.');
                    }
                },
            ],
            'chuc_danh_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) {
                    if (!ChucDanhGV::find($value)) {
                        $fail('Chức danh với ID ' . $value . ' không tồn tại.');
                    }
                },
            ],
            'tong_gio_chuan' => 'required|numeric|min:0',
            'phan_tram_gd_toi_thieu' => 'required|numeric|between:0,100',
            'ghi_chu' => 'nullable|string|max:1000',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nam_hoc_id.required' => 'Năm học ID là bắt buộc.',
            'nam_hoc_id.integer' => 'Năm học ID phải là số nguyên.',
            'chuc_danh_id.required' => 'Chức danh ID là bắt buộc.',
            'chuc_danh_id.integer' => 'Chức danh ID phải là số nguyên.',
            'tong_gio_chuan.required' => 'Tổng giờ chuẩn là bắt buộc.',
            'tong_gio_chuan.numeric' => 'Tổng giờ chuẩn phải là số.',
            'tong_gio_chuan.min' => 'Tổng giờ chuẩn phải lớn hơn hoặc bằng 0.',
            'phan_tram_gd_toi_thieu.required' => 'Phần trăm GD tối thiểu là bắt buộc.',
            'phan_tram_gd_toi_thieu.numeric' => 'Phần trăm GD tối thiểu phải là số.',
            'phan_tram_gd_toi_thieu.between' => 'Phần trăm GD tối thiểu phải từ 0 đến 100.',
            'ghi_chu.max' => 'Ghi chú không được vượt quá 1000 ký tự.',
        ];
    }
}
