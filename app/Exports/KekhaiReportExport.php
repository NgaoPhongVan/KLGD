<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class KekhaiReportExport implements WithMultipleSheets
{
    protected $keKhaiTongHops;
    protected $salaryData;
    protected $namHoc;
    protected $boMon;

    public function __construct($keKhaiTongHops, $salaryData, $namHoc, $boMon)
    {
        $this->keKhaiTongHops = $keKhaiTongHops;
        $this->salaryData = $salaryData;
        $this->namHoc = $namHoc;
        $this->boMon = $boMon;
    }

    public function sheets(): array
    {
        $sheets = [
            new OvertimeReportSheet($this->keKhaiTongHops, $this->salaryData, $this->namHoc, $this->boMon),
            new WorkloadReportSheet($this->keKhaiTongHops, $this->namHoc, $this->boMon),
        ];

        return $sheets;
    }
}

class OvertimeReportSheet implements FromCollection, WithTitle, WithHeadings, WithStyles, WithColumnWidths, WithEvents
{
    protected $keKhaiTongHops;
    protected $salaryData;
    protected $namHoc;
    protected $boMon;

    public function __construct($keKhaiTongHops, $salaryData, $namHoc, $boMon)
    {
        $this->keKhaiTongHops = $keKhaiTongHops;
        $this->salaryData = $salaryData;
        $this->namHoc = $namHoc;
        $this->boMon = $boMon;
    }

    public function title(): string
    {
        return 'KLVG - Vượt giờ';
    }

    public function styles(Worksheet $sheet)
    {
        return [];
    }

    public function headings(): array
    {
        return [
            ['BỘ NÔNG NGHIỆP & MT', '', '', '', '', '', '', '', 'BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ', '', '', '', '', '', '', '', ''],
            ['TRƯỜNG ĐẠI HỌC THỦY LỢI', '', '', '', '', '', '', '', 'NĂM HỌC ' . ($this->namHoc->ten_nam_hoc ?? 'N/A'), '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', 'Bộ môn: ' . ($this->boMon->ten_bo_mon ?? 'N/A'), '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            [
                'STT',
                'Họ đệm',
                'Tên',
                'Học hàm',
                'Học vị',
                'Định mức',
                '',
                'Khối lượng thực hiện',
                '',
                '',
                'Khối lượng tính vượt giờ',
                '',
                '',
                '',
                '',
                'Thành tiền',
                'Ghi chú'
            ],
            [
                '',
                '',
                '',
                '',
                '',
                'KHCN',
                'GD',
                'KHCN',
                'GD',
                'Xa trường',
                'Số tiết',
                'Đơn giá',
                'LA',
                'LV',
                'ĐA/KL',
                '',
                ''
            ]
        ];
    }

    public function collection()
    {
        return $this->keKhaiTongHops->map(function ($keKhai, $index) {
            $salaryInfo = $this->salaryData->get($keKhai->nguoi_dung_id);
            $gioVuot = max(0, floatval($keKhai->ket_qua_thua_thieu_gio_gd_tam_tinh ?? 0));
            $mucLuongCoBan = $salaryInfo ? floatval($salaryInfo->muc_luong_co_ban ?? 0) : 0;
            $thanhTien = $gioVuot * $mucLuongCoBan;

            $hoTen = trim($keKhai->nguoiDung->ho_ten ?? '');
            $hoTenArray = explode(' ', $hoTen);
            $ten = count($hoTenArray) > 1 ? array_pop($hoTenArray) : '';
            $hoDem = implode(' ', $hoTenArray);

            return [
                $index + 1,
                $hoDem,
                $ten,
                $keKhai->nguoiDung->hoc_ham ?? '',
                $keKhai->nguoiDung->hoc_vi ?? '',
                floatval($keKhai->dinhmuc_khcn_apdung_tam_tinh ?? 68),
                floatval($keKhai->dinhmuc_gd_apdung_tam_tinh ?? 224),
                floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_giangday_final_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_gdxatruong_tam_tinh ?? 0),
                $gioVuot,
                $mucLuongCoBan,
                intval($keKhai->sl_huongdan_la_conlai_tam_tinh ?? 0),
                intval($keKhai->sl_huongdan_lv_conlai_tam_tinh ?? 0),
                intval($keKhai->sl_huongdan_dakl_conlai_tam_tinh ?? 0),
                $thanhTien,
                $keKhai->ghi_chu_giang_vien ?? ''
            ];
        });
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $sheet->getRowDimension(1)->setRowHeight(20);
                $sheet->getRowDimension(2)->setRowHeight(20);
                $sheet->getRowDimension(3)->setRowHeight(25);
                $sheet->getRowDimension(4)->setRowHeight(15);
                $sheet->getRowDimension(5)->setRowHeight(20);

                $sheet->mergeCells('A1:H1');
                $sheet->mergeCells('I1:Q1');
                $sheet->mergeCells('A2:H2');
                $sheet->mergeCells('I2:Q2');
                $sheet->mergeCells('A3:H3');
                $sheet->mergeCells('I3:Q3');
                $sheet->mergeCells('F5:G5');
                $sheet->mergeCells('H5:J5');
                $sheet->mergeCells('K5:O5');
                $sheet->mergeCells('A5:A6');
                $sheet->mergeCells('B5:B6');
                $sheet->mergeCells('C5:C6');
                $sheet->mergeCells('D5:D6');
                $sheet->mergeCells('E5:E6');
                $sheet->mergeCells('P5:P6');
                $sheet->mergeCells('Q5:Q6');

                $sheet->getStyle('A1:H3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                $sheet->getStyle('I1:Q3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 14],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                $sheet->getStyle('I1:Q1')->getFont()->setSize(16)->setBold(true);

                $sheet->getStyle('A5:Q6')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 9, 'color' => ['argb' => '00000000']],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true
                    ],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF1B5E7A']]]
                ]);

                $dataRowCount = $this->keKhaiTongHops->count();                
                if ($dataRowCount > 0) {
                    $dataRange = 'A6:Q' . (6 + $dataRowCount);

                    $sheet->getStyle($dataRange)->applyFromArray([
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFCCCCCC']]],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                        'font' => ['size' => 8],
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF1B5E7A']]]

                    ]);

                    $sheet->getStyle('A7:A' . (6 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('A7:E' . (6 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $sheet->getStyle('A7:P' . (6 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle('A7:Q' . (6 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                    for ($row = 7; $row <= 6 + $dataRowCount; $row++) {
                        if (($row - 6) % 2 == 0) {
                            $sheet->getStyle("A{$row}:Q{$row}")->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()->setARGB('FFF8F9FA');
                        }
                    }
                }

                $signatureRowStart = 6 + $dataRowCount + 2; 

                $sheet->setCellValue('A' . $signatureRowStart, 'Hà Nội, ngày     tháng     năm     ');
                $sheet->mergeCells('A' . $signatureRowStart . ':Q' . $signatureRowStart);
                $sheet->getStyle('A' . $signatureRowStart)->applyFromArray([
                    'font' => ['italic' => true, 'size' => 10],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]
                ]);

                $signatureRow = $signatureRowStart + 1;
                $sheet->setCellValue('A' . $signatureRow, 'Hiệu trưởng');
                $sheet->setCellValue('D' . $signatureRow, 'Phòng TC-KT');
                $sheet->setCellValue('G' . $signatureRow, 'Phòng Tổ chức Cán bộ');
                $sheet->setCellValue('K' . $signatureRow, 'Phòng Đào tạo');
                $sheet->setCellValue('N' . $signatureRow, 'Trưởng Bộ môn');

                $sheet->mergeCells('A' . $signatureRow . ':C' . $signatureRow);
                $sheet->mergeCells('D' . $signatureRow . ':F' . $signatureRow);
                $sheet->mergeCells('G' . $signatureRow . ':J' . $signatureRow);
                $sheet->mergeCells('K' . $signatureRow . ':M' . $signatureRow);
                $sheet->mergeCells('N' . $signatureRow . ':Q' . $signatureRow);

                $sheet->getStyle('A' . $signatureRow . ':Q' . $signatureRow)->applyFromArray([
                    'font' => ['bold' => true, 'size' => 10],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
                ]);

                foreach (range(1, 6 + $dataRowCount) as $row) {
                    if ($row > 5) {
                        $sheet->getRowDimension($row)->setRowHeight(25);
                    }
                }
            }
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 4,     // STT
            'B' => 12,    // Họ đệm
            'C' => 8,     // Tên
            'D' => 7,     // Học hàm
            'E' => 7,     // Học vị
            'F' => 8,     // Định mức KHCN
            'G' => 8,     // Định mức GD
            'H' => 8,     // Thực hiện KHCN
            'I' => 8,     // Thực hiện GD
            'J' => 8,     // GD xa trường
            'K' => 8,     // Số tiết vượt
            'L' => 10,    // Mức lương CB
            'M' => 7,     // HD LA còn lại
            'N' => 7,     // HD LV còn lại
            'O' => 8,     // HD ĐA/KL còn lại
            'P' => 10,    // Thành tiền
            'Q' => 17,    // Ghi chú


        ];
    }
}

class WorkloadReportSheet implements FromCollection, WithTitle, WithHeadings, WithStyles, WithColumnWidths, WithEvents
{
    protected $keKhaiTongHops;
    protected $namHoc;
    protected $boMon;

    public function __construct($keKhaiTongHops, $namHoc, $boMon)
    {
        $this->keKhaiTongHops = $keKhaiTongHops;
        $this->namHoc = $namHoc;
        $this->boMon = $boMon;
    }

    public function title(): string
    {
        return 'THKL - Khối lượng công tác';
    }

    public function styles(Worksheet $sheet)
    {
        return [];
    }

    public function headings(): array
    {
        return [
            ['BỘ NÔNG NGHIỆP & MT', '', '', '', '', '', 'BẢNG TỔNG HỢP KHỐI LƯỢNG CÔNG TÁC', '', '', '', '', '', '', ''],
            ['TRƯỜNG ĐẠI HỌC THỦY LỢI', '', '', '', '', '', 'NĂM HỌC ' . ($this->namHoc->ten_nam_hoc ?? 'N/A'), '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', 'Bộ môn: ' . ($this->boMon->ten_bo_mon ?? 'N/A'), '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            [
                'STT',
                'Họ đệm',
                'Tên',
                'KHCN (P9)',
                'Công tác khác (P7)',
                'Coi chấm thi (P6)',
                'Công tác giảng dạy (P3)',
                '',
                '',
                '',
                '',
                'Tổng KHCN',
                'Tổng giảng dạy',
                'GD xa trường'
            ],
            [
                '',
                '',
                '',
                '',
                '',
                '',
                'Giảng dạy',
                'HD LA',
                'HD LV',
                'HD ĐA',
                'Số tiết HD',
                '',
                '',
                ''
            ]
        ];
    }

    public function collection()
    {
        return $this->keKhaiTongHops->map(function ($keKhai, $index) {
            $hoTen = trim($keKhai->nguoiDung->ho_ten ?? '');
            $hoTenArray = explode(' ', $hoTen);
            $ten = count($hoTenArray) > 1 ? array_pop($hoTenArray) : '';
            $hoDem = implode(' ', $hoTenArray);

            return [
                $index + 1,
                $hoDem,
                $ten,
                floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_congtackhac_quydoi_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_coithi_chamthi_dh_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_gd_danhgia_tam_tinh ?? 0),
                intval($keKhai->tong_sl_huongdan_la_tam_tinh ?? 0),
                intval($keKhai->tong_sl_huongdan_lv_tam_tinh ?? 0),
                intval($keKhai->tong_sl_huongdan_dakl_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_huongdan_quydoi_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_giangday_final_tam_tinh ?? 0),
                floatval($keKhai->tong_gio_gdxatruong_tam_tinh ?? 0),
            ];
        });
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $sheet->getRowDimension(1)->setRowHeight(20);
                $sheet->getRowDimension(2)->setRowHeight(20);
                $sheet->getRowDimension(3)->setRowHeight(25);
                $sheet->getRowDimension(4)->setRowHeight(15);
                $sheet->getRowDimension(5)->setRowHeight(30);
                $sheet->getRowDimension(6)->setRowHeight(25);

                $sheet->mergeCells('A1:F1');
                $sheet->mergeCells('G1:N1');
                $sheet->mergeCells('A2:F2');
                $sheet->mergeCells('G2:N2');
                $sheet->mergeCells('A3:F3');
                $sheet->mergeCells('G3:N3');

                $sheet->mergeCells('A5:A6');
                $sheet->mergeCells('B5:B6');
                $sheet->mergeCells('C5:C6');
                $sheet->mergeCells('D5:D6');
                $sheet->mergeCells('E5:E6');
                $sheet->mergeCells('F5:F6');
                $sheet->mergeCells('G5:K5');
                $sheet->mergeCells('L5:L6');
                $sheet->mergeCells('M5:M6');
                $sheet->mergeCells('N5:N6');

                $sheet->getStyle('A1:F3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                $sheet->getStyle('G1:N3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 14],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                $sheet->getStyle('G1:N1')->getFont()->setSize(16)->setBold(true);

                $sheet->getStyle('A5:N6')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 10, 'color' => ['argb' => '00000000']],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true
                    ],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF4A7C59']]]
                ]);

                $sheet->getStyle('G5:K5')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 11]
                ]);

                $dataRowCount = $this->keKhaiTongHops->count();
                if ($dataRowCount > 0) {
                    $dataRange = 'A7:N' . (6 + $dataRowCount);

                    $sheet->getStyle($dataRange)->applyFromArray([
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFCCCCCC']]],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                        'font' => ['size' => 9],
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF4A7C59']]]
                    ]);

                    $sheet->getStyle('A7:A' . (6 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('B7:C' . (6 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $sheet->getStyle('D7:N' . (6 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                    for ($row = 7; $row <= 6 + $dataRowCount; $row++) {
                        if (($row - 7) % 2 == 0) {
                            $sheet->getStyle("A{$row}:N{$row}")->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()->setARGB('FFF8F9FA');
                        }
                    }
                }

                $signatureRowStart = 6 + $dataRowCount + 2; 
                
                $sheet->setCellValue('A' . $signatureRowStart, 'Hà Nội, ngày     tháng     năm     ');
                $sheet->mergeCells('A' . $signatureRowStart . ':N' . $signatureRowStart);
                $sheet->getStyle('A' . $signatureRowStart)->applyFromArray([
                    'font' => ['italic' => true, 'size' => 10],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]
                ]);
                
                $signatureRow = $signatureRowStart + 1;
                $sheet->setCellValue('A' . $signatureRow, 'Phòng đào tạo');
                $sheet->setCellValue('C' . $signatureRow, 'Phòng QLKH&HTQT');
                $sheet->setCellValue('F' . $signatureRow, 'Phòng CTSV');
                $sheet->setCellValue('I' . $signatureRow, 'Phòng khảo thí');
                $sheet->setCellValue('L' . $signatureRow, 'Trưởng Bộ môn');
                
                $sheet->mergeCells('A' . $signatureRow . ':B' . $signatureRow);
                $sheet->mergeCells('C' . $signatureRow . ':E' . $signatureRow);
                $sheet->mergeCells('F' . $signatureRow . ':H' . $signatureRow);
                $sheet->mergeCells('I' . $signatureRow . ':K' . $signatureRow);
                $sheet->mergeCells('L' . $signatureRow . ':N' . $signatureRow);
                
                $sheet->getStyle('A' . $signatureRow . ':N' . $signatureRow)->applyFromArray([
                    'font' => ['bold' => true, 'size' => 10],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
                ]);
            }
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,    // STT
            'B' => 18,   // Họ đệm
            'C' => 12,   // Tên
            'D' => 10,   // Học hàm
            'E' => 10,   // Học vị
            'F' => 12,   // Định mức KHCN
            'G' => 12,   // Định mức GD
            'H' => 12,   // Thực hiện KHCN
            'I' => 12,   // Thực hiện GD
            'J' => 12,   // GD xa trường
            'K' => 12,   // Số tiết vượt
            'L' => 15,   // Mức lương CB
            'M' => 10,   // HD LA còn lại
            'N' => 10,   // HD LV còn lại
            'O' => 12,   // HD ĐA/KL còn lại
            'P' => 15,   // Thành tiền
            'Q' => 25,   // Ghi chú
        ];
    }
}
