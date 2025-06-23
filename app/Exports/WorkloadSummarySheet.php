<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class WorkloadSummarySheet implements FromArray, WithTitle, WithHeadings, WithStyles, WithColumnFormatting
{
    private $keKhaiTongHops;
    private $namHoc;
    private $boMon;

    public function __construct($keKhaiTongHops, $namHoc, $boMon)
    {
        $this->keKhaiTongHops = $keKhaiTongHops;
        $this->namHoc = $namHoc;
        $this->boMon = $boMon;
    }

    public function array(): array
    {
        $data = [];
        
        foreach ($this->keKhaiTongHops as $index => $keKhai) {
            // Split name properly
            $hoTen = trim($keKhai->nguoiDung->ho_ten ?? '');
            $hoTenArray = explode(' ', $hoTen);
            $ten = count($hoTenArray) > 1 ? array_pop($hoTenArray) : '';
            $hoDem = implode(' ', $hoTenArray);
            
            $data[] = [
                $index + 1, // TT
                $hoDem,
                $ten,
                floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0), // KHCN (P9)
                floatval($keKhai->tong_gio_congtackhac_quydoi_tam_tinh ?? 0), // QĐ giờ KHCN
                floatval($keKhai->tong_gio_congtackhac_quydoi_tam_tinh ?? 0), // Quy đổi tiết
                floatval($keKhai->tong_gio_coithi_chamthi_dh_tam_tinh ?? 0), // Coi chấm thi
                floatval($keKhai->tong_gio_gd_danhgia_tam_tinh ?? 0), // Giảng dạy
                intval($keKhai->tong_sl_huongdan_la_tam_tinh ?? 0), // LA
                intval($keKhai->tong_sl_huongdan_lv_tam_tinh ?? 0), // LV
                intval($keKhai->tong_sl_huongdan_dakl_tam_tinh ?? 0), // ĐA
                floatval($keKhai->tong_gio_huongdan_quydoi_tam_tinh ?? 0), // Số tiết
                floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0), // Tổng số giờ KHCN
                floatval($keKhai->tong_gio_giangday_final_tam_tinh ?? 0), // Tổng số giờ giảng dạy
                floatval($keKhai->tong_gio_gdxatruong_tam_tinh ?? 0), // Số tiết GD xa trường
            ];
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            ['BỘ NÔNG NGHIỆP & PTNT', '', '', '', 'BẢNG TỔNG HỢP KHỐI LƯỢNG CÔNG TÁC', '', '', '', '', '', '', '', '', '', ''],
            ['TRƯỜNG ĐẠI HỌC THỦY LỢI', '', '', '', 'NĂM HỌC ' . ($this->namHoc->ten_nam_hoc ?? ''), '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', 'Bộ môn: ' . ($this->boMon->ten_bo_mon ?? ''), '', '', '', '', '', '', '', '', '', ''],
            ['TT', 'Họ đệm', 'Tên', 'KHCN (P9)', 'Công tác khác (P7)', '', 'Coi chấm thi (P6)', 'Công tác giảng dạy (P3)', '', '', '', '', 'Tổng số giờ KHCN', 'Tổng số giờ giảng dạy', 'Số tiết GD xa trường'],
            ['', '', '', '', 'QĐ giờ KHCN', 'Quy đổi tiết', '', 'Giảng dạy', 'LA', 'LV', 'ĐA', 'Số tiết', '', '', '']
        ];
    }

    public function title(): string
    {
        return 'THKL - Tổng hợp khối lượng';
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
            'D' => NumberFormat::FORMAT_NUMBER_00,
            'E' => NumberFormat::FORMAT_NUMBER_00,
            'F' => NumberFormat::FORMAT_NUMBER_00,
            'G' => NumberFormat::FORMAT_NUMBER_00,
            'H' => NumberFormat::FORMAT_NUMBER_00,
            'L' => NumberFormat::FORMAT_NUMBER_00,
            'M' => NumberFormat::FORMAT_NUMBER_00,
            'N' => NumberFormat::FORMAT_NUMBER_00,
            'O' => NumberFormat::FORMAT_NUMBER_00,
        ];
    }
}
