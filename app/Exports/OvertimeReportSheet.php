<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class OvertimeReportSheet implements FromArray, WithTitle, WithHeadings, WithStyles, WithColumnFormatting
{
    private $keKhaiTongHops;
    private $salaryData;
    private $namHoc;
    private $boMon;

    public function __construct($keKhaiTongHops, $salaryData, $namHoc, $boMon)
    {
        $this->keKhaiTongHops = $keKhaiTongHops;
        $this->salaryData = $salaryData;
        $this->namHoc = $namHoc;
        $this->boMon = $boMon;
    }

    public function array(): array
    {
        $data = [];
        
        foreach ($this->keKhaiTongHops as $index => $keKhai) {
            $salaryInfo = $this->salaryData->get($keKhai->nguoi_dung_id);
            $gioVuot = max(0, floatval($keKhai->ket_qua_thua_thieu_gio_gd_tam_tinh ?? 0));
            $donGia = $salaryInfo ? floatval($salaryInfo->don_gia_gio_vuot_muc ?? 0) : 160000;
            $thanhTien = $gioVuot * $donGia;
            
            // Split name properly
            $hoTen = trim($keKhai->nguoiDung->ho_ten ?? '');
            $hoTenArray = explode(' ', $hoTen);
            $ten = count($hoTenArray) > 1 ? array_pop($hoTenArray) : '';
            $hoDem = implode(' ', $hoTenArray);
            
            $data[] = [
                $index + 1, // STT
                $hoDem,
                $ten,
                $keKhai->nguoiDung->hoc_ham ?? '',
                $keKhai->nguoiDung->hoc_vi ?? '',
                floatval($keKhai->dinhmuc_khcn_apdung ?? 0),
                floatval($keKhai->dinhmuc_gd_apdung ?? 0),
                floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_giangday_final_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_gdxatruong_tam_tinh ?? 0),
                $gioVuot,
                $donGia,
                intval($keKhai->sl_huongdan_la_conlai_tam_tinh ?? 0),
                intval($keKhai->sl_huongdan_lv_conlai_tam_tinh ?? 0),
                intval($keKhai->sl_huongdan_dakl_conlai_tam_tinh ?? 0),
                $thanhTien,
                '' // Ghi chú
            ];
        }

        // Add total row
        $totalAmount = array_sum(array_column($data, 15));
        $data[] = [
            '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Tổng cộng', $totalAmount, ''
        ];

        return $data;
    }

    public function headings(): array
    {
        return [
            ['BỘ NÔNG NGHIỆP & PTNT', '', '', '', '', 'BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ', '', '', '', '', '', '', '', '', '', '', ''],
            ['TRƯỜNG ĐẠI HỌC THỦY LỢI', '', '', '', '', 'NĂM HỌC ' . ($this->namHoc->ten_nam_hoc ?? ''), '', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', 'Bộ môn: ' . ($this->boMon->ten_bo_mon ?? ''), '', '', '', '', '', '', '', '', '', '', ''],
            ['STT', 'Họ đệm', 'Tên', 'Học hàm', 'Học vị', 'Định mức', '', 'Khối lượng thực hiện', '', '', 'Khối lượng tính vượt giờ', '', '', '', '', 'Thành tiền', 'Ghi chú'],
            ['', '', '', '', '', 'KHCN', 'GD', 'KHCN', 'GD', 'Xa trường', 'Số tiết', 'Đơn giá', 'LA', 'LV', 'ĐA/KL', '', '']
        ];
    }

    public function title(): string
    {
        return 'KLVG - Khối lượng vượt giờ';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
            2 => ['font' => ['bold' => true, 'size' => 12]],
            3 => ['font' => ['bold' => true, 'size' => 11]],
            4 => ['font' => ['bold' => true]],
            5 => ['font' => ['bold' => true]],
        ];
    }

    public function columnFormats(): array
    {
        return [
            'F' => NumberFormat::FORMAT_NUMBER_00,
            'G' => NumberFormat::FORMAT_NUMBER_00,
            'H' => NumberFormat::FORMAT_NUMBER_00,
            'I' => NumberFormat::FORMAT_NUMBER_00,
            'J' => NumberFormat::FORMAT_NUMBER_00,
            'K' => NumberFormat::FORMAT_NUMBER_00,
            'L' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
            'P' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1,
        ];
    }
}
