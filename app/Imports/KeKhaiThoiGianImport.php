<?php

namespace App\Imports;

use App\Models\KeKhaiThoiGian;
use App\Models\HocKy;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Carbon\Carbon;

class KeKhaiThoiGianImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use Importable, SkipsFailures;

    public function model(array $row)
    {
        return new KeKhaiThoiGian([
            'hoc_ky_id' => $row['hoc_ky_id'],
            'thoi_gian_bat_dau' => $this->parseDateTime($row['thoi_gian_bat_dau']),
            'thoi_gian_ket_thuc' => $this->parseDateTime($row['thoi_gian_ket_thuc']),
            'ghi_chu' => $row['ghi_chu'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'hoc_ky_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) {
                    if (!HocKy::find($value)) {
                        $fail('Học kỳ với ID ' . $value . ' không tồn tại.');
                    }
                },
                function ($attribute, $value, $fail) {
                    if (KeKhaiThoiGian::where('hoc_ky_id', $value)->exists()) {
                        $fail('Học kỳ với ID ' . $value . ' đã có thời gian kê khai.');
                    }
                },
            ],
            'thoi_gian_bat_dau' => [
                'required',
                function ($attribute, $value, $fail) {
                    if (!$this->isValidDateTime($value)) {
                        $fail('Thời gian bắt đầu phải có định dạng YYYY-MM-DD HH:mm:ss.');
                    }
                },
            ],
            'thoi_gian_ket_thuc' => [
                'required',
                function ($attribute, $value, $fail) {
                    if (!$this->isValidDateTime($value)) {
                        $fail('Thời gian kết thúc phải có định dạng YYYY-MM-DD HH:mm:ss.');
                    }
                },
            ],
            'ghi_chu' => 'nullable|string|max:1000',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'hoc_ky_id.required' => 'Học kỳ ID là bắt buộc.',
            'hoc_ky_id.integer' => 'Học kỳ ID phải là số nguyên.',
            'thoi_gian_bat_dau.required' => 'Thời gian bắt đầu là bắt buộc.',
            'thoi_gian_ket_thuc.required' => 'Thời gian kết thúc là bắt buộc.',
            'ghi_chu.max' => 'Ghi chú không được vượt quá 1000 ký tự.',
        ];
    }

    private function isValidDateTime($value)
    {
        try {
            Carbon::createFromFormat('Y-m-d H:i:s', $value);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function parseDateTime($value)
    {
        try {
            return Carbon::createFromFormat('Y-m-d H:i:s', $value)->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            return $value; // Let validation handle the error
        }
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $data = $validator->getData();
            
            // Validate thời gian kết thúc phải sau thời gian bắt đầu
            if (isset($data['thoi_gian_bat_dau']) && isset($data['thoi_gian_ket_thuc'])) {
                try {
                    $startTime = Carbon::createFromFormat('Y-m-d H:i:s', $data['thoi_gian_bat_dau']);
                    $endTime = Carbon::createFromFormat('Y-m-d H:i:s', $data['thoi_gian_ket_thuc']);
                    
                    if ($endTime->lte($startTime)) {
                        $validator->errors()->add('thoi_gian_ket_thuc', 'Thời gian kết thúc phải sau thời gian bắt đầu.');
                    }
                } catch (\Exception $e) {
                    // Error will be caught by individual field validation
                }
            }
        });
    }
}
