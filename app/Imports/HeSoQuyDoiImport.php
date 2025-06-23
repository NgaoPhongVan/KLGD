<?php

namespace App\Imports;

use App\Models\HeSoQuyDoi;
use App\Models\NamHoc;
use App\Models\HoatDongChiTiet;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;

class HeSoQuyDoiImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use Importable, SkipsFailures;

    public function model(array $row)
    {
        // Chuẩn bị dữ liệu
        $data = [
            'nam_hoc_id' => $row['nam_hoc_id'],
            'hoat_dong_chi_tiet_id' => $row['hoat_dong_chi_tiet_id'],
            'gia_tri_he_so' => $row['gia_tri_he_so'],
            'loai_gia_tri' => $row['loai_gia_tri'],
            'uu_tien' => $row['uu_tien'],
        ];

        // Thêm các trường không bắt buộc nếu có giá trị
        $optionalFields = [
            'min_si_so', 'max_si_so', 'ngon_ngu_giang_day', 
            'chuong_trinh_dao_tao', 'hang_tap_chi', 'cap_de_tai',
            'ket_qua_nghiem_thu', 'vai_tro_tham_gia', 'ghi_chu'
        ];

        foreach ($optionalFields as $field) {
            if (!empty($row[$field])) {
                $data[$field] = $row[$field];
            }
        }

        return new HeSoQuyDoi($data);
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
            'hoat_dong_chi_tiet_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) {
                    if (!HoatDongChiTiet::find($value)) {
                        $fail('Hoạt động chi tiết với ID ' . $value . ' không tồn tại.');
                    }
                },
            ],
            'gia_tri_he_so' => 'required|numeric|min:0',
            'loai_gia_tri' => 'required|in:1,2',
            'min_si_so' => 'nullable|integer|min:0',
            'max_si_so' => 'nullable|integer|min:0|gte:min_si_so',
            'ngon_ngu_giang_day' => 'nullable|string|max:20',
            'chuong_trinh_dao_tao' => 'nullable|string|max:50',
            'hang_tap_chi' => 'nullable|string|max:50',
            'cap_de_tai' => 'nullable|string|max:50',
            'ket_qua_nghiem_thu' => 'nullable|string|max:50',
            'vai_tro_tham_gia' => 'nullable|string|max:50',
            'uu_tien' => 'required|integer',
            'ghi_chu' => 'nullable|string|max:1000',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nam_hoc_id.required' => 'Năm học ID là bắt buộc.',
            'nam_hoc_id.integer' => 'Năm học ID phải là số nguyên.',
            'hoat_dong_chi_tiet_id.required' => 'Hoạt động chi tiết ID là bắt buộc.',
            'hoat_dong_chi_tiet_id.integer' => 'Hoạt động chi tiết ID phải là số nguyên.',
            'gia_tri_he_so.required' => 'Giá trị hệ số là bắt buộc.',
            'gia_tri_he_so.numeric' => 'Giá trị hệ số phải là số.',
            'gia_tri_he_so.min' => 'Giá trị hệ số phải lớn hơn hoặc bằng 0.',
            'loai_gia_tri.required' => 'Loại giá trị là bắt buộc.',
            'loai_gia_tri.in' => 'Loại giá trị phải là 1 (giờ cố định) hoặc 2 (hệ số).',
            'min_si_so.integer' => 'Sĩ số tối thiểu phải là số nguyên.',
            'min_si_so.min' => 'Sĩ số tối thiểu phải lớn hơn hoặc bằng 0.',
            'max_si_so.integer' => 'Sĩ số tối đa phải là số nguyên.',
            'max_si_so.min' => 'Sĩ số tối đa phải lớn hơn hoặc bằng 0.',
            'max_si_so.gte' => 'Sĩ số tối đa phải lớn hơn hoặc bằng sĩ số tối thiểu.',
            'ngon_ngu_giang_day.max' => 'Ngôn ngữ giảng dạy không được vượt quá 20 ký tự.',
            'chuong_trinh_dao_tao.max' => 'Chương trình đào tạo không được vượt quá 50 ký tự.',
            'hang_tap_chi.max' => 'Hạng tạp chí không được vượt quá 50 ký tự.',
            'cap_de_tai.max' => 'Cấp đề tài không được vượt quá 50 ký tự.',
            'ket_qua_nghiem_thu.max' => 'Kết quả nghiệm thu không được vượt quá 50 ký tự.',
            'vai_tro_tham_gia.max' => 'Vai trò tham gia không được vượt quá 50 ký tự.',
            'uu_tien.required' => 'Mức ưu tiên là bắt buộc.',
            'uu_tien.integer' => 'Mức ưu tiên phải là số nguyên.',
            'ghi_chu.max' => 'Ghi chú không được vượt quá 1000 ký tự.',
        ];
    }
}
