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
use Illuminate\Support\Facades\Log;

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

        // Add individual lecturer detail sheets
        foreach ($this->keKhaiTongHops as $index => $keKhai) {
            $sheets[] = new LecturerDetailSheet($keKhai, $this->salaryData, $this->namHoc, $this->boMon, $index + 1);
        }

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
            // Row 1: Organization name spans first 8 columns, Title spans last 9 columns
            ['BỘ NÔNG NGHIỆP & PTNT', '', '', '', '', '', '', '', 'BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ', '', '', '', '', '', '', '', ''],
            // Row 2: University name spans first 8 columns, Academic year spans last 9 columns
            ['TRƯỜNG ĐẠI HỌC THỦY LỢI', '', '', '', '', '', '', '', 'NĂM HỌC ' . ($this->namHoc->ten_nam_hoc ?? 'N/A'), '', '', '', '', '', '', '', ''],
            // Row 3: Empty first 8 columns, Department spans last 9 columns
            ['', '', '', '', '', '', '', '', 'Bộ môn: ' . ($this->boMon->ten_bo_mon ?? 'N/A'), '', '', '', '', '', '', '', ''],
            // Row 4: Empty separator
            ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            // Row 5: Main headers with proper grouping
            [
                'STT',
                'Họ đệm',
                'Tên',
                'Học hàm',
                'Học vị',
                'Định mức KHCN',
                'Định mức GD',
                'Thực hiện KHCN',
                'Thực hiện GD',
                'GD xa trường',
                'Số tiết vượt',
                'Mức lương CB',
                'HD LA còn lại',
                'HD LV còn lại',
                'HD ĐA/KL còn lại',
                'Thành tiền',
                'Ghi chú'
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

                // Set row heights for better appearance
                $sheet->getRowDimension(1)->setRowHeight(35);
                $sheet->getRowDimension(2)->setRowHeight(30);
                $sheet->getRowDimension(3)->setRowHeight(25);
                $sheet->getRowDimension(4)->setRowHeight(15);
                $sheet->getRowDimension(5)->setRowHeight(40);

                // Merge cells for header layout
                $sheet->mergeCells('A1:H1'); // Organization name
                $sheet->mergeCells('I1:Q1'); // Report title
                $sheet->mergeCells('A2:H2'); // University name
                $sheet->mergeCells('I2:Q2'); // Academic year
                $sheet->mergeCells('A3:H3'); // Empty space
                $sheet->mergeCells('I3:Q3'); // Department

                // Style organization info section
                $sheet->getStyle('A1:H3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE8F4FD']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF4A90C2']]]
                ]);

                // Style report title section
                $sheet->getStyle('I1:Q3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 14],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE8F4FD']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF4A90C2']]]
                ]);

                // Special styling for main title
                $sheet->getStyle('I1:Q1')->getFont()->setSize(16)->setBold(true);

                // Style column headers
                $sheet->getStyle('A5:Q5')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 10, 'color' => ['argb' => 'FFFFFFFF']],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true
                    ],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2E86AB']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF1B5E7A']]]
                ]);

                // Style data rows
                $dataRowCount = $this->keKhaiTongHops->count();
                if ($dataRowCount > 0) {
                    $dataRange = 'A6:Q' . (5 + $dataRowCount);

                    // Basic data styling
                    $sheet->getStyle($dataRange)->applyFromArray([
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFCCCCCC']]],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                        'font' => ['size' => 9]
                    ]);

                    // Alignment for specific columns
                    $sheet->getStyle('A6:A' . (5 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER); // STT
                    $sheet->getStyle('B6:E' . (5 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT); // Text columns
                    $sheet->getStyle('F6:P' . (5 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT); // Number columns
                    $sheet->getStyle('Q6:Q' . (5 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT); // Notes

                    // Zebra striping for better readability
                    for ($row = 6; $row <= 5 + $dataRowCount; $row++) {
                        if (($row - 6) % 2 == 0) {
                            $sheet->getStyle("A{$row}:Q{$row}")->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()->setARGB('FFF8F9FA');
                        }
                    }

                    // Highlight money column (Thành tiền)
                    $sheet->getStyle('P6:P' . (5 + $dataRowCount))->applyFromArray([
                        'font' => ['bold' => true, 'color' => ['argb' => 'FF0D6EFD']],
                        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFEBF3FF']]
                    ]);
                }

                // Auto-adjust row heights for wrapped text
                foreach (range(1, 5 + $dataRowCount) as $row) {
                    if ($row > 5) { // Data rows
                        $sheet->getRowDimension($row)->setRowHeight(25);
                    }
                }
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
            // Row 1-3: Header layout similar to OvertimeReportSheet
            ['BỘ NÔNG NGHIỆP & PTNT', '', '', '', '', '', 'BẢNG TỔNG HỢP KHỐI LƯỢNG CÔNG TÁC', '', '', '', '', '', '', ''],
            ['TRƯỜNG ĐẠI HỌC THỦY LỢI', '', '', '', '', '', 'NĂM HỌC ' . ($this->namHoc->ten_nam_hoc ?? 'N/A'), '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', 'Bộ môn: ' . ($this->boMon->ten_bo_mon ?? 'N/A'), '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            // Row 5-6: Multi-level headers
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

                // Set row heights
                $sheet->getRowDimension(1)->setRowHeight(35);
                $sheet->getRowDimension(2)->setRowHeight(30);
                $sheet->getRowDimension(3)->setRowHeight(25);
                $sheet->getRowDimension(4)->setRowHeight(15);
                $sheet->getRowDimension(5)->setRowHeight(30);
                $sheet->getRowDimension(6)->setRowHeight(25);

                // Merge header cells
                $sheet->mergeCells('A1:F1'); // Organization
                $sheet->mergeCells('G1:N1'); // Report title
                $sheet->mergeCells('A2:F2'); // University
                $sheet->mergeCells('G2:N2'); // Academic year
                $sheet->mergeCells('A3:F3'); // Empty
                $sheet->mergeCells('G3:N3'); // Department

                // Merge column headers for grouped columns
                $sheet->mergeCells('A5:A6'); // STT
                $sheet->mergeCells('B5:B6'); // Họ đệm
                $sheet->mergeCells('C5:C6'); // Tên
                $sheet->mergeCells('D5:D6'); // KHCN (P9)
                $sheet->mergeCells('E5:E6'); // Công tác khác (P7)
                $sheet->mergeCells('F5:F6'); // Coi chấm thi (P6)
                $sheet->mergeCells('G5:K5'); // Công tác giảng dạy (P3) - spans 5 columns
                $sheet->mergeCells('L5:L6'); // Tổng KHCN
                $sheet->mergeCells('M5:M6'); // Tổng giảng dạy
                $sheet->mergeCells('N5:N6'); // GD xa trường

                // Style header sections
                $sheet->getStyle('A1:F3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 12],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFEAF4EA']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF5CB85C']]]
                ]);

                $sheet->getStyle('G1:N3')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 14],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFEAF4EA']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF5CB85C']]]
                ]);

                // Special styling for main title
                $sheet->getStyle('G1:N1')->getFont()->setSize(16)->setBold(true);

                // Style main column headers
                $sheet->getStyle('A5:N6')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 10, 'color' => ['argb' => 'FFFFFFFF']],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true
                    ],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF5CB85C']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF4A7C59']]]
                ]);

                // Highlight grouped header
                $sheet->getStyle('G5:K5')->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF4A7C59']],
                    'font' => ['bold' => true, 'size' => 11]
                ]);

                // Style data rows
                $dataRowCount = $this->keKhaiTongHops->count();
                if ($dataRowCount > 0) {
                    $dataRange = 'A7:N' . (6 + $dataRowCount);

                    $sheet->getStyle($dataRange)->applyFromArray([
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFCCCCCC']]],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                        'font' => ['size' => 9]
                    ]);

                    // Column-specific alignment
                    $sheet->getStyle('A7:A' . (6 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER); // STT
                    $sheet->getStyle('B7:C' . (6 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT); // Names
                    $sheet->getStyle('D7:N' . (6 + $dataRowCount))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT); // Numbers

                    // Zebra striping
                    for ($row = 7; $row <= 6 + $dataRowCount; $row++) {
                        if (($row - 7) % 2 == 0) {
                            $sheet->getStyle("A{$row}:N{$row}")->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()->setARGB('FFF8F9FA');
                        }
                    }

                    // Highlight total columns
                    $sheet->getStyle('L7:M' . (6 + $dataRowCount))->applyFromArray([
                        'font' => ['bold' => true, 'color' => ['argb' => 'FF0D6EFD']],
                        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFEBF3FF']]
                    ]);
                }
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

class LecturerDetailSheet implements FromCollection, WithTitle, WithHeadings, WithStyles, WithColumnWidths, WithEvents
{
    protected $keKhai;
    protected $salaryData;
    protected $namHoc;
    protected $boMon;
    protected $index;

    public function __construct($keKhai, $salaryData, $namHoc, $boMon, $index)
    {
        $this->keKhai = $keKhai;
        $this->salaryData = $salaryData;
        $this->namHoc = $namHoc;
        $this->boMon = $boMon;
        $this->index = $index;
    }

    public function styles(Worksheet $sheet)
    {
        return [];
    }

    public function title(): string
    {
        $lecturerName = $this->keKhai->nguoiDung->ho_ten ?? 'Unknown';
        $maGV = $this->keKhai->nguoiDung->ma_gv ?? 'NoCode';

        // Clean name for Excel sheet title (max 31 characters)
        $cleanName = preg_replace('/[^a-zA-Z0-9\s]/', '', $lecturerName);
        $cleanName = preg_replace('/\s+/', '_', trim($cleanName));
        $title = sprintf('%02d_%s_%s', $this->index, $cleanName, $maGV);

        return substr($title, 0, 31); // Excel sheet name limit
    }

    public function headings(): array
    {
        return [
            // Row 1: Main title spanning all columns
            ['BÁO CÁO CHI TIẾT KÊ KHAI GIỜ CHUẨN', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            // Row 3-5: Information layout
            ['Giảng viên:', $this->keKhai->nguoiDung->ho_ten ?? 'N/A', '', '', 'Năm học:', $this->namHoc->ten_nam_hoc ?? 'N/A', '', ''],
            ['Mã GV:', $this->keKhai->nguoiDung->ma_gv ?? 'N/A', '', '', 'Bộ môn:', $this->boMon->ten_bo_mon ?? 'N/A', '', ''],
            ['Học hàm:', $this->keKhai->nguoiDung->hoc_ham ?? '', '', '', 'Học vị:', $this->keKhai->nguoiDung->hoc_vi ?? '', '', ''],
            ['', '', '', '', '', '', '', ''],
        ];
    }

    public function collection()
    {
        $data = collect();

        // === PHẦN TỔNG HỢP ===
        $data->push(['═══ TỔNG HỢP KẾT QUẢ ═══', '', '', '', '', '', '', '']);
        $data->push(['', '', '', '', '', '', '', '']);

        // Bảng thông tin định mức và thực hiện
        $data->push(['ĐỊNH MỨC & THỰC HIỆN', '', '', 'KẾT QUẢ', '', '', '', '']);
        $data->push(['Định mức GD:', number_format(floatval($this->keKhai->dinhmuc_gd_apdung_tam_tinh ?? 0), 2), 'giờ', '', 'Định mức KHCN:', number_format(floatval($this->keKhai->dinhmuc_khcn_apdung_tam_tinh ?? 0), 2), 'giờ', '']);
        $data->push(['Thực hiện GD:', number_format(floatval($this->keKhai->tong_gio_giangday_final_tam_tinh ?? 0), 2), 'giờ', '', 'Thực hiện KHCN:', number_format(floatval($this->keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0), 2), 'giờ', '']);

        $ketQua = floatval($this->keKhai->ket_qua_thua_thieu_gio_gd_tam_tinh ?? 0);
        $ketQuaText = $ketQua > 0 ? 'Vượt giờ' : ($ketQua < 0 ? 'Thiếu giờ' : 'Đạt định mức');
        $data->push(['Kết quả:', number_format($ketQua, 2), $ketQuaText, '', 'Tổng giờ thực hiện:', number_format(floatval($this->keKhai->tong_gio_thuc_hien_final_tam_tinh ?? 0), 2), 'giờ', '']);

        $data->push(['', '', '', '', '', '', '', '']);
        $data->push(['', '', '', '', '', '', '', '']);

        // === PHẦN CHI TIẾT ===
        $data->push(['═══ CHI TIẾT HOẠT ĐỘNG ═══', '', '', '', '', '', '', '']);
        $data->push(['', '', '', '', '', '', '', '']);

        // Get detailed data
        $details = $this->getKeKhaiDetails();

        $sectionConfigs = [
            'gd_lop_dh_trong_bm' => [
                'title' => '1. GIẢNG DẠY LỚP ĐẠI HỌC TRONG BỘ MÔN',
                'headers' => ['STT', 'Mã lớp học phần', 'Tên môn học', 'Số tiết LT', 'Số tiết TH', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú'],
                'icon' => '📚'
            ],
            'gd_lop_dh_ngoai_bm' => [
                'title' => '2. GIẢNG DẠY LỚP ĐẠI HỌC NGOÀI BỘ MÔN',
                'headers' => ['STT', 'Mã lớp học phần', 'Tên môn học', 'Số tiết LT', 'Số tiết TH', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú'],
                'icon' => '📖'
            ],
            'gd_lop_dh_ngoai_cs' => [
                'title' => '3. GIẢNG DẠY LỚP ĐẠI HỌC NGOÀI CƠ SỞ',
                'headers' => ['STT', 'Mã lớp học phần', 'Tên môn học', 'Số tiết LT', 'Số tiết TH', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú'],
                'icon' => '🏫'
            ],
            'gd_lop_ths' => [
                'title' => '4. GIẢNG DẠY LỚP THẠC SĨ',
                'headers' => ['STT', 'Mã lớp học phần', 'Tên môn học', 'Số tiết', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', ''],
                'icon' => '🎓'
            ],
            'gd_lop_ts' => [
                'title' => '5. GIẢNG DẠY LỚP TIẾN SĨ',
                'headers' => ['STT', 'Mã lớp học phần', 'Tên môn học', 'Số tiết', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', ''],
                'icon' => '👨‍🎓'
            ],
            'hd_datn_daihoc' => [
                'title' => '6. HƯỚNG DẪN ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC',
                'headers' => ['STT', 'Tên sinh viên', 'Tên đề tài', 'SL SV', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', ''],
                'icon' => '📝'
            ],
            'hd_lv_thacsi' => [
                'title' => '7. HƯỚNG DẪN LUẬN VĂN THẠC SĨ',
                'headers' => ['STT', 'Tên học viên', 'Tên đề tài', 'Vai trò', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', ''],
                'icon' => '📋'
            ],
            'hd_la_tiensi' => [
                'title' => '8. HƯỚNG DẪN LUẬN ÁN TIẾN SĨ',
                'headers' => ['STT', 'Tên nghiên cứu sinh', 'Tên đề tài', 'Vai trò', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', ''],
                'icon' => '🔬'
            ],
            'dg_hp_tn_daihoc' => [
                'title' => '9. ĐÁNH GIÁ HỌC PHẦN TỐT NGHIỆP ĐẠI HỌC',
                'headers' => ['STT', 'Tên sinh viên', 'Tên đề tài', 'Vai trò', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', ''],
                'icon' => '✅'
            ],
            'dg_lv_thacsi' => [
                'title' => '10. ĐÁNH GIÁ LUẬN VĂN THẠC SĨ',
                'headers' => ['STT', 'Tên học viên', 'Tên đề tài', 'Vai trò', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', ''],
                'icon' => '📊'
            ],
            'dg_la_tiensi_dot' => [
                'title' => '11. ĐÁNH GIÁ LUẬN ÁN TIẾN SĨ',
                'headers' => ['STT', 'Thông tin đợt', 'Vai trò', 'Giờ QĐ', 'Ghi chú', '', '', ''],
                'icon' => '🏆'
            ],
            'khao_thi_dh_trong_bm' => [
                'title' => '12. KHẢO THÍ ĐẠI HỌC TRONG BỘ MÔN',
                'headers' => ['STT', 'Tên môn thi', 'Số ca thi', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', '', ''],
                'icon' => '📄'
            ],
            'khao_thi_dh_ngoai_bm' => [
                'title' => '13. KHẢO THÍ ĐẠI HỌC NGOÀI BỘ MÔN',
                'headers' => ['STT', 'Tên môn thi', 'Số ca thi', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', '', ''],
                'icon' => '📃'
            ],
            'khao_thi_thacsi' => [
                'title' => '14. KHẢO THÍ THẠC SĨ',
                'headers' => ['STT', 'Tên môn thi', 'Số ca thi', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', '', ''],
                'icon' => '📜'
            ],
            'khao_thi_tiensi' => [
                'title' => '15. KHẢO THÍ TIẾN SĨ',
                'headers' => ['STT', 'Tên môn thi', 'Số ca thi', 'Hệ số QĐ', 'Giờ QĐ', 'Ghi chú', '', ''],
                'icon' => '📑'
            ],
            'xd_ctdt_va_khac_gd' => [
                'title' => '16. XÂY DỰNG CTĐT & CÔNG TÁC KHÁC GIÁO DỤC',
                'headers' => ['STT', 'Tên hoạt động', 'Vai trò', 'Giờ thực hiện', 'Ghi chú', '', '', ''],
                'icon' => '🏗️'
            ],
            'nckh_nam_hoc' => [
                'title' => '17. NGHIÊN CỨU KHOA HỌC',
                'headers' => ['STT', 'Tên đề tài', 'Vai trò/Kết quả', 'Giờ NCKH', 'Ghi chú', '', '', ''],
                'icon' => '🔬'
            ],
            'congtac_khac_nam_hoc' => [
                'title' => '18. CÔNG TÁC KHÁC',
                'headers' => ['STT', 'Tên công việc', 'Loại công việc', 'Giờ thực hiện', 'Ghi chú', '', '', ''],
                'icon' => '⚙️'
            ]
        ];

        foreach ($sectionConfigs as $sectionKey => $config) {
            if (!empty($details[$sectionKey])) {
                // Section title với icon
                $data->push(['{' . $config['icon'] . '} ' . $config['title'], '', '', '', '', '', '', '']);

                // Headers - đảm bảo 8 cột đầy đủ
                $headers = $config['headers'];
                while (count($headers) < 8) {
                    $headers[] = '';
                }
                $data->push(array_slice($headers, 0, 8));

                // Section data - loại bỏ duplicate bằng cách sử dụng array unique keys
                $sectionTotal = 0;
                $processedKeys = []; // Tránh duplicate
                
                foreach ($details[$sectionKey] as $index => $item) {
                    // Tạo unique key để tránh duplicate
                    $uniqueKey = md5(json_encode($item));
                    if (!in_array($uniqueKey, $processedKeys)) {
                        $processedKeys[] = $uniqueKey;
                        
                        $rowData = $this->formatItemForExcel($item, $sectionKey, $index + 1);
                        while (count($rowData) < 8) {
                            $rowData[] = '';
                        }
                        $data->push(array_slice($rowData, 0, 8));

                        // Calculate section total
                        $sectionTotal += floatval($item['tong_gio_quy_doi'] ?? $item['tong_gio_nckh_gv_nhap'] ?? $item['gio_thuc_hien'] ?? 0);
                    }
                }

                // Subtotal row
                $data->push(['', '', '', '', '', '➤ Tổng cộng:', number_format($sectionTotal, 2) . ' giờ', '']);

                // Empty row for separation
                $data->push(['', '', '', '', '', '', '', '']);
            }
        }

        // === PHẦN TỔNG KẾT CUỐI ===
        $data->push(['═══ TỔNG KẾT CUỐI KỲ ═══', '', '', '', '', '', '', '']);
        $data->push(['', '', '', '', '', '', '', '']);

        $tongGioGD = floatval($this->keKhai->tong_gio_giangday_final_tam_tinh ?? 0);
        $tongGioKHCN = floatval($this->keKhai->tong_gio_khcn_kekhai_tam_tinh ?? 0);
        $tongGioThucHien = floatval($this->keKhai->tong_gio_thuc_hien_final_tam_tinh ?? 0);

        $data->push(['📊 THỐNG KÊ TỔNG HỢP:', '', '', '', '', '', '', '']);
        $data->push(['• Tổng giờ Giảng dạy:', number_format($tongGioGD, 2), 'giờ', '', '• Tổng giờ KHCN:', number_format($tongGioKHCN, 2), 'giờ', '']);
        $data->push(['• Tổng giờ thực hiện:', number_format($tongGioThucHien, 2), 'giờ', '', '• Kết quả:', number_format($ketQua, 2), $ketQuaText, '']);

        $data->push(['', '', '', '', '', '', '', '']);
        $data->push(['🕒 Thời gian báo cáo:', date('d/m/Y H:i:s'), '', '', '', '', '', '']);

        return $data;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // === MAIN TITLE STYLING ===
                $sheet->mergeCells('A1:H1');
                $sheet->getStyle('A1:H1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 16, 'color' => ['argb' => 'FF2C3E50']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFF8F9FA']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF34495E']]]
        ]);
                $sheet->getRowDimension(1)->setRowHeight(40);

                // === LECTURER INFO STYLING ===
                $infoRange = 'A3:H5';
                $sheet->getStyle($infoRange)->applyFromArray([
                    'font' => ['bold' => true, 'size' => 11, 'color' => ['argb' => 'FF2C3E50']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFEF9E7']],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE0E0E0']]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
                ]);

                // Style for info labels (subtle emphasis)
                foreach (['A3', 'A4', 'A5', 'E3', 'E4', 'E5'] as $cell) {
                    $sheet->getStyle($cell)->applyFromArray([
                        'font' => ['bold' => true, 'color' => ['argb' => 'FF1976D2']],
                        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFF3F4F6']]
                    ]);
                }

                // Set proper row heights for info section
                foreach ([3, 4, 5] as $row) {
                    $sheet->getRowDimension($row)->setRowHeight(25);
                }

                // === DYNAMIC CONTENT STYLING ===
                $data = $this->collection();

                foreach ($data as $rowIndex => $row) {
                    $actualRow = $rowIndex + 7; // Offset for headers

                    // Section headers (═══) - Professional dark styling
                    if (isset($row[0]) && strpos($row[0], '═══') !== false) {
                        $sheet->mergeCells("A{$actualRow}:H{$actualRow}");
                        $sheet->getStyle("A{$actualRow}:H{$actualRow}")->applyFromArray([
                            'font' => ['bold' => true, 'size' => 13, 'color' => ['argb' => 'FFFFFFFF']],
                            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF37474F']],
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF263238']]]
                        ]);
                        $sheet->getRowDimension($actualRow)->setRowHeight(32);
                    }

                    // Activity section titles (with icons) - Subtle blue
                    elseif (isset($row[0]) && (strpos($row[0], '{') !== false || preg_match('/^\d+\./', $row[0]))) {
                        $sheet->mergeCells("A{$actualRow}:H{$actualRow}");
                        $sheet->getStyle("A{$actualRow}:H{$actualRow}")->applyFromArray([
                            'font' => ['bold' => true, 'size' => 11, 'color' => ['argb' => 'FF1565C0']],
                            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
                            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE3F2FD']],
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF90CAF9']]]
                        ]);
                        $sheet->getRowDimension($actualRow)->setRowHeight(28);
                    }

                    // Column headers - CHỈ nhận dạng headers THỰC SỰ với logic chặt chẽ hơn
                    elseif (isset($row[0]) && $row[0] === 'STT') {
                        // Đếm số cột có dữ liệu thực sự (không phải cột trống)
                        $realColumns = 0;
                        $columnData = [];
                        
                        for ($i = 0; $i < min(count($row), 8); $i++) {
                            $cellValue = trim($row[$i] ?? '');
                            if ($cellValue !== '') {
                                $realColumns++;
                                $columnData[] = $cellValue;
                            }
                        }
                        
                        // Kiểm tra từ khóa header mạnh mẽ hơn
                        $headerText = implode(' ', $columnData);
                        $strongHeaderKeywords = [
                            'Mã lớp học phần', 'Tên môn học', 'Số tiết LT', 'Số tiết TH', 
                            'Hệ số QĐ', 'Giờ QĐ', 'Tên sinh viên', 'Tên đề tài',
                            'Tên học viên', 'Vai trò', 'Tên môn thi', 'Số ca thi',
                            'Tên hoạt động', 'Giờ thực hiện', 'Loại công việc'
                        ];
                        
                        $hasStrongKeywords = false;
                        $keywordCount = 0;
                        foreach ($strongHeaderKeywords as $keyword) {
                            if (stripos($headerText, $keyword) !== false) {
                                $hasStrongKeywords = true;
                                $keywordCount++;
                            }
                        }
                        
                        // Chỉ style như header khi:
                        // 1. Có ít nhất 4 cột có dữ liệu
                        // 2. Có ít nhất 2 từ khóa header mạnh
                        // 3. Không phải là dòng đầu tiên sau section title
                        $prevRowIndex = $rowIndex - 1;
                        $isPreviousRowSectionTitle = $prevRowIndex >= 0 && 
                            isset($data[$prevRowIndex][0]) && 
                            strpos($data[$prevRowIndex][0], '{') !== false;
                        
                        $isRealHeader = ($realColumns >= 4) && 
                                      ($keywordCount >= 2) && 
                                      $hasStrongKeywords &&
                                      !$isPreviousRowSectionTitle;
                        
                        if ($isRealHeader) {
                            // Style như header thực sự
                            $sheet->getStyle("A{$actualRow}:H{$actualRow}")->applyFromArray([
                                'font' => ['bold' => true, 'size' => 10, 'color' => ['argb' => 'FFFFFFFF']],
                                'alignment' => [
                                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                                    'vertical' => Alignment::VERTICAL_CENTER,
                                    'wrapText' => true
                                ],
                                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2E86AB']],
                                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF1B5E7A']]]
                            ]);
                            $sheet->getRowDimension($actualRow)->setRowHeight(35);
                        } else {
                            // Ẩn hoàn toàn các dòng STT giả
                            $sheet->getRowDimension($actualRow)->setRowHeight(0);
                            $sheet->getRowDimension($actualRow)->setVisible(false);
                        }
                    }

                    // Summary/info rows
                    elseif (isset($row[0]) && (strpos($row[0], 'ĐỊNH MỨC') !== false || strpos($row[0], 'THỐNG KÊ') !== false)) {
                        $sheet->getStyle("A{$actualRow}:H{$actualRow}")->applyFromArray([
                            'font' => ['bold' => true, 'size' => 10, 'color' => ['argb' => 'FF2C3E50']],
                            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFFF3C4']],
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFFBC02D']]],
                            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
                        ]);
                        $sheet->getRowDimension($actualRow)->setRowHeight(25);
                    }

                    // Subtotal rows
                    elseif (isset($row[5]) && strpos($row[5], 'Tổng cộng') !== false) {
                        $sheet->getStyle("A{$actualRow}:H{$actualRow}")->applyFromArray([
                            'font' => ['bold' => true, 'italic' => true, 'color' => ['argb' => 'FF1B5E20']],
                            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE8F5E8']],
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF4CAF50']]],
                            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER]
                        ]);
                        $sheet->getRowDimension($actualRow)->setRowHeight(25);
                    }

                    // Empty rows
                    elseif (count(array_filter($row)) === 0) {
                        $sheet->getRowDimension($actualRow)->setRowHeight(15);
                    }

                    // Data rows (with STT numbers)
                    elseif (isset($row[0]) && is_numeric($row[0])) {
                        $this->styleDataRow($sheet, $actualRow);
                    }

                    // Other rows (default styling)
                    else {
                        $sheet->getRowDimension($actualRow)->setRowHeight(20);
                    }
                }

                // === COLUMN WIDTHS - điều chỉnh để phù hợp hơn ===
                $sheet->getColumnDimension('A')->setWidth(6);   // STT - thu nhỏ
                $sheet->getColumnDimension('B')->setWidth(35);  // Main content - mở rộng
                $sheet->getColumnDimension('C')->setWidth(30);  // Secondary content - mở rộng  
                $sheet->getColumnDimension('D')->setWidth(12);  // Numbers
                $sheet->getColumnDimension('E')->setWidth(12);  // Numbers
                $sheet->getColumnDimension('F')->setWidth(12);  // Coefficients
                $sheet->getColumnDimension('G')->setWidth(15);  // Total hours - mở rộng
                $sheet->getColumnDimension('H')->setWidth(25);  // Notes - thu nhỏ

                // === FREEZE PANES ===
                $sheet->freezePane('A7'); // Freeze at start of data

                // === PRINT SETTINGS ===
                $sheet->getPageSetup()
                    ->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_PORTRAIT)
                    ->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4)
                    ->setFitToPage(true)
                    ->setFitToWidth(1)
                    ->setFitToHeight(0);

                $sheet->getPageMargins()
                    ->setTop(0.75)
                    ->setRight(0.7)
                    ->setLeft(0.7)
                    ->setBottom(0.75);

                // === HEADER/FOOTER ===
                $sheet->getHeaderFooter()
                    ->setOddHeader('&C&B' . ($this->keKhai->nguoiDung->ho_ten ?? 'Giảng viên'))
                    ->setOddFooter('&L&D&T&RPage &P of &N');
            }
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,    // STT
            'B' => 30,   // Main content
            'C' => 25,   // Secondary content
            'D' => 15,   // Numbers
            'E' => 12,   // Coefficients
            'F' => 15,   // Hours/Totals
            'G' => 15,   // Additional totals
            'H' => 30,   // Notes
        ];
    }

    // Thêm method helper để style data rows
    private function styleDataRow($sheet, $actualRow)
    {
        $sheet->getStyle("A{$actualRow}:H{$actualRow}")->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE5E5E5']]],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            'font' => ['size' => 9, 'color' => ['argb' => 'FF2C3E50']]
        ]);

        // Column-specific alignment
        $sheet->getStyle("A{$actualRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER); // STT
        $sheet->getStyle("B{$actualRow}:C{$actualRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT); // Text
        $sheet->getStyle("D{$actualRow}:G{$actualRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT); // Numbers
        $sheet->getStyle("H{$actualRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT); // Notes

        // Very subtle zebra striping
        if (($actualRow - 6) % 2 == 0) {
            $sheet->getStyle("A{$actualRow}:H{$actualRow}")->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setARGB('FFFAFAFA');
        }

        // Highlight important number columns (hours) with very light blue
        $sheet->getStyle("F{$actualRow}:G{$actualRow}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => 'FF1565C0']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFF8FBFF']]
        ]);

        $sheet->getRowDimension($actualRow)->setRowHeight(22);
    }

    private function getKeKhaiDetails()
    {
        // Load necessary relationships if not already loaded
        $this->keKhai->load([
            'kekhaiGdLopDhTrongbms',
            'kekhaiGdLopDhNgoaibms',
            'kekhaiGdLopDhNgoaicss',
            'kekhaiGdLopThss',
            'kekhaiGdLopTss',
            'kekhaiHdDatnDaihoc',
            'kekhaiHdLvThacsis',
            'kekhaiHdLaTiensis',
            'kekhaiDgHpTnDaihoc',
            'kekhaiDgLvThacsis',
            'kekhaiDgLaTiensiDots.nhiemVus',
            'kekhaiKhaothiDaihocTrongbms',
            'kekhaiKhaothiDaihocNgoaibms',
            'kekhaiKhaothiThacsis',
            'kekhaiKhaothiTiensis',
            'kekhaiXdCtdtVaKhacGds',
            'kekhaiNckhNamHocs.minhChungs',
            'kekhaiCongtacKhacNamHocs'
        ]);

        $details = [];

        // Helper function to check if item has meaningful data
        $hasRealData = function ($item, $checkFields) {
            foreach ($checkFields as $field) {
                $value = $item[$field] ?? null;
                if (!empty($value) && $value !== '' && $value !== '0' && $value !== 0) {
                    return true;
                }
            }
            return false;
        };

        // 1. Giảng dạy lớp trong bộ môn
        if ($this->keKhai->kekhaiGdLopDhTrongbms && $this->keKhai->kekhaiGdLopDhTrongbms->count() > 0) {
            $filteredItems = [];
            foreach ($this->keKhai->kekhaiGdLopDhTrongbms as $item) {
                $transformedItem = [
                    'ma_lop' => $item->ten_lop_hoc_phan ?: '',
                    'ten_mon_hoc' => $item->ten_lop_hoc_phan ?: '',
                    'so_tiet_lt' => intval($item->kl_ke_hoach ?: 0),
                    'so_tiet_th' => 0,
                    'he_so' => floatval($item->he_so_qd ?: 1.0),
                    'tong_gio_quy_doi' => floatval($item->so_tiet_qd ?: 0),
                ];

                if ($hasRealData($transformedItem, ['ma_lop', 'ten_mon_hoc']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['gd_lop_dh_trong_bm'] = $filteredItems;
            }
        }

        // 2. Giảng dạy ngoài bộ môn
        if ($this->keKhai->kekhaiGdLopDhNgoaibms && $this->keKhai->kekhaiGdLopDhNgoaibms->count() > 0) {
            $filteredItems = [];
            foreach ($this->keKhai->kekhaiGdLopDhNgoaibms as $item) {
                $transformedItem = [
                    'ma_lop' => $item->ten_lop_hoc_phan ?: '',
                    'ten_mon_hoc' => $item->ten_lop_hoc_phan ?: '',
                    'so_tiet_lt' => intval($item->kl_ke_hoach ?: 0),
                    'so_tiet_th' => 0,
                    'he_so' => floatval($item->he_so_qd ?: 1.0),
                    'tong_gio_quy_doi' => floatval($item->so_tiet_qd ?: 0),
                ];

                if ($hasRealData($transformedItem, ['ma_lop', 'ten_mon_hoc']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['gd_lop_dh_ngoai_bm'] = $filteredItems;
            }
        }

        // 3. Giảng dạy ngoài cơ sở
        if ($this->keKhai->kekhaiGdLopDhNgoaicss && $this->keKhai->kekhaiGdLopDhNgoaicss->count() > 0) {
            $filteredItems = [];
            foreach ($this->keKhai->kekhaiGdLopDhNgoaicss as $item) {
                $transformedItem = [
                    'ma_lop' => $item->ten_lop_hoc_phan ?: '',
                    'ten_mon_hoc' => $item->ten_lop_hoc_phan ?: '',
                    'so_tiet_lt' => intval($item->kl_ke_hoach ?: 0),
                    'so_tiet_th' => 0,
                    'he_so' => floatval($item->he_so_qd ?: 1.0),
                    'tong_gio_quy_doi' => floatval($item->so_tiet_qd ?: 0),
                ];

                if ($hasRealData($transformedItem, ['ma_lop', 'ten_mon_hoc']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['gd_lop_dh_ngoai_cs'] = $filteredItems;
            }
        }

        // 4-5. Giảng dạy thạc sĩ và tiến sĩ
        foreach (['kekhaiGdLopThss' => 'gd_lop_ths', 'kekhaiGdLopTss' => 'gd_lop_ts'] as $relation => $key) {
            if ($this->keKhai->$relation && $this->keKhai->$relation->count() > 0) {
                $filteredItems = [];
                foreach ($this->keKhai->$relation as $item) {
                    $transformedItem = [
                        'ma_lop' => $item->ten_lop_hoc_phan ?: '',
                        'ten_mon_hoc' => $item->ten_lop_hoc_phan ?: '',
                        'so_tiet' => intval($item->kl_ke_hoach ?: 0),
                        'he_so' => floatval($item->he_so_qd ?: 1.0),
                        'tong_gio_quy_doi' => floatval($item->so_tiet_qd ?: 0),
                    ];

                    if ($hasRealData($transformedItem, ['ma_lop', 'ten_mon_hoc']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                        $filteredItems[] = $transformedItem;
                    }
                }
                if (!empty($filteredItems)) {
                    $details[$key] = $filteredItems;
                }
            }
        }

        // 6. Hướng dẫn ĐATN
        if ($this->keKhai->kekhaiHdDatnDaihoc && $this->keKhai->kekhaiHdDatnDaihoc->count() > 0) {
            $filteredItems = [];
            foreach ($this->keKhai->kekhaiHdDatnDaihoc as $item) {
                $transformedItem = [
                    'ten_sinh_vien' => $item->quyet_dinh_dot_hk ?: '',
                    'ten_de_tai' => $item->quyet_dinh_dot_hk ?: '',
                    'so_luong_sv' => intval(($item->so_luong_sv_cttt ?: 0) + ($item->so_luong_sv_dai_tra ?: 0)),
                    'he_so' => 1.0,
                    'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_gv_nhap ?: 0),
                ];

                if ($hasRealData($transformedItem, ['ten_sinh_vien', 'ten_de_tai']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['hd_datn_daihoc'] = $filteredItems;
            }
        }

        // 7-8. Hướng dẫn LV ThS và LA TS
        $hdMapping = [
            'kekhaiHdLvThacsis' => 'hd_lv_thacsi',
            'kekhaiHdLaTiensis' => 'hd_la_tiensi'
        ];

        foreach ($hdMapping as $relation => $key) {
            if ($this->keKhai->$relation && $this->keKhai->$relation->count() > 0) {
                $filteredItems = [];
                foreach ($this->keKhai->$relation as $item) {
                    $transformedItem = [
                        'ten_hoc_vien' => $item->quyet_dinh_dot_hk ?: '',
                        'ten_de_tai' => $key === 'hd_la_tiensi' ? ($item->loai_dao_tao_ts ?: '') : ($item->quyet_dinh_dot_hk ?: ''),
                        'vai_tro' => 'HD',
                        'he_so' => 1.0,
                        'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_gv_nhap ?: 0),
                    ];

                    if ($hasRealData($transformedItem, ['ten_hoc_vien', 'ten_de_tai']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                        $filteredItems[] = $transformedItem;
                    }
                }
                if (!empty($filteredItems)) {
                    $details[$key] = $filteredItems;
                }
            }
        }

        // 9-10. Đánh giá HP TN ĐH và LV ThS
        $dgMapping = [
            'kekhaiDgHpTnDaihoc' => 'dg_hp_tn_daihoc',
            'kekhaiDgLvThacsis' => 'dg_lv_thacsi'
        ];

        foreach ($dgMapping as $relation => $key) {
            if ($this->keKhai->$relation && $this->keKhai->$relation->count() > 0) {
                $filteredItems = [];
                foreach ($this->keKhai->$relation as $item) {
                    $transformedItem = [
                        'ten_sinh_vien' => $item->hoi_dong_dot_hk ?: '',
                        'ten_de_tai' => $item->hoi_dong_dot_hk ?: '',
                        'vai_tro' => 'ĐG',
                        'he_so' => 1.0,
                        'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_gv_nhap ?: 0),
                    ];

                    if ($hasRealData($transformedItem, ['ten_sinh_vien', 'ten_de_tai']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                        $filteredItems[] = $transformedItem;
                    }
                }
                if (!empty($filteredItems)) {
                    $details[$key] = $filteredItems;
                }
            }
        }

        // 11. Đánh giá luận án tiến sĩ theo đợt
        if ($this->keKhai->kekhaiDgLaTiensiDots && $this->keKhai->kekhaiDgLaTiensiDots->count() > 0) {
            $filteredItems = [];
            foreach ($this->keKhai->kekhaiDgLaTiensiDots as $item) {
                $transformedItem = [
                    'thong_tin_dot' => $item->thong_tin_dot ?: $item->hoi_dong_dot_hk ?: '',
                    'vai_tro' => $item->vai_tro ?: 'ĐG',
                    'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_cho_dot ?: 0),
                    'ghi_chu' => $item->ghi_chu ?: '',
                ];
                if (!empty($filteredItems)) {
                    $details[$key] = $filteredItems;
                }
            }
        }

        // 11. Đánh giá luận án tiến sĩ theo đợt
        if ($this->keKhai->kekhaiDgLaTiensiDots && $this->keKhai->kekhaiDgLaTiensiDots->count() > 0) {
            $filteredItems = [];
            foreach ($this->keKhai->kekhaiDgLaTiensiDots as $item) {
                $transformedItem = [
                    'thong_tin_dot' => $item->thong_tin_dot ?: $item->hoi_dong_dot_hk ?: '',
                    'vai_tro' => $item->vai_tro ?: 'ĐG',
                    'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_cho_dot ?: 0),
                    'ghi_chu' => $item->ghi_chu ?: '',
                ];

                if ($hasRealData($transformedItem, ['thong_tin_dot']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['dg_la_tiensi_dot'] = $filteredItems;
            }
        }

        // 12-15. Khảo thí các loại
        $khaoThiMapping = [
            'kekhaiKhaothiDaihocTrongbms' => 'khao_thi_dh_trong_bm',
            'kekhaiKhaothiDaihocNgoaibms' => 'khao_thi_dh_ngoai_bm',
            'kekhaiKhaothiThacsis' => 'khao_thi_thacsi',
            'kekhaiKhaothiTiensis' => 'khao_thi_tiensi'
        ];

        foreach ($khaoThiMapping as $relation => $key) {

            if ($this->keKhai->$relation && $this->keKhai->$relation->count() > 0) {
                $filteredItems = [];
                foreach ($this->keKhai->$relation as $item) {
                    $transformedItem = [
                        'ten_mon_thi' => $item->hang_muc ?: '',
                        'so_ca_thi' => intval($item->so_ca_bai_mon ?: 0),
                        'he_so' => floatval($item->dinh_muc_gv_nhap ?: 1.0),
                        'tong_gio_quy_doi' => floatval($item->so_tiet_qd ?: 0),
                    ];

                    if ($hasRealData($transformedItem, ['ten_mon_thi']) || $transformedItem['so_ca_thi'] > 0 || $transformedItem['tong_gio_quy_doi'] > 0) {

                        $filteredItems[] = $transformedItem;
                    }
                }
                if (!empty($filteredItems)) {
                    $details[$key] = $filteredItems;
                }
            }
        }

        // 16. Xây dựng CTĐT
        if ($this->keKhai->kekhaiXdCtdtVaKhacGds && $this->keKhai->kekhaiXdCtdtVaKhacGds->count() > 0) {
            $filteredItems = [];
            foreach ($this->keKhai->kekhaiXdCtdtVaKhacGds as $item) {
                $transformedItem = [
                    'ten_hoat_dong' => $item->ten_hoat_dong ?: '',
                    'vai_tro' => '',
                    'tong_gio_quy_doi' => floatval($item->tong_gio_quydoi_gv_nhap ?: 0),
                    'ghi_chu' => $item->ghi_chu ?: '',
                ];

                if ($hasRealData($transformedItem, ['ten_hoat_dong']) || $transformedItem['tong_gio_quy_doi'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['xd_ctdt_va_khac_gd'] = $filteredItems;
            }
        }

        // 17. NCKH
        if ($this->keKhai->kekhaiNckhNamHocs && $this->keKhai->kekhaiNckhNamHocs->count() > 0) {
            $filteredItems = [];
            foreach ($this->keKhai->kekhaiNckhNamHocs as $item) {
                $transformedItem = [
                    'ten_de_tai' => $item->ten_hoat_dong_san_pham ?: '',
                    'vai_tro' => $item->ket_qua_dat_duoc_quy_doi ?: '',
                    'tong_gio_nckh_gv_nhap' => floatval($item->tong_gio_nckh_gv_nhap ?: 0),
                    'ghi_chu' => $item->ghi_chu ?: '',
                ];

                if ($hasRealData($transformedItem, ['ten_de_tai']) || $transformedItem['tong_gio_nckh_gv_nhap'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['nckh_nam_hoc'] = $filteredItems;
            }
        }

        // 18. Công tác khác
        if ($this->keKhai->kekhaiCongtacKhacNamHocs && $this->keKhai->kekhaiCongtacKhacNamHocs->count() > 0) {
            $filteredItems = [];
            foreach ($this->keKhai->kekhaiCongtacKhacNamHocs as $item) {
                $transformedItem = [
                    'ten_cong_viec' => $item->ten_cong_tac ?: '',
                    'loai_cong_viec' => $item->loai_gio_quy_doi ?: '',
                    'gio_thuc_hien' => floatval($item->so_gio_quydoi_gv_nhap ?: 0),
                    'ghi_chu' => $item->ghi_chu ?: '',
                ];

                if ($hasRealData($transformedItem, ['ten_cong_viec']) || $transformedItem['gio_thuc_hien'] > 0) {
                    $filteredItems[] = $transformedItem;
                }
            }
            if (!empty($filteredItems)) {
                $details['congtac_khac_nam_hoc'] = $filteredItems;
            }
        }

        // Remove empty sections from details array
        $details = array_filter($details, function ($section) {
            return !empty($section);
        });

        return $details;
    }

    private function formatItemForExcel($item, $sectionKey, $index)
    {
        switch ($sectionKey) {
            case 'gd_lop_dh_trong_bm':
            case 'gd_lop_dh_ngoai_bm':
            case 'gd_lop_dh_ngoai_cs':
                return [
                    $index,
                    $item['ma_lop'] ?? '',
                    $item['ten_mon_hoc'] ?? '',
                    $item['so_tiet_lt'] ?? 0,
                    $item['so_tiet_th'] ?? 0,
                    number_format($item['he_so'] ?? 0, 2),
                    number_format($item['tong_gio_quy_doi'] ?? 0, 2),
                    ''
                ];

            case 'gd_lop_ths':
            case 'gd_lop_ts':
                return [
                    $index,
                    $item['ma_lop'] ?? '',
                    $item['ten_mon_hoc'] ?? '',
                    $item['so_tiet'] ?? 0,
                    number_format($item['he_so'] ?? 0, 2),
                    number_format($item['tong_gio_quy_doi'] ?? 0, 2),
                    '',
                    ''
                ];

            case 'hd_datn_daihoc':
                return [
                    $index,
                    $item['ten_sinh_vien'] ?? '',
                    $item['ten_de_tai'] ?? '',
                    $item['so_luong_sv'] ?? 0,
                    number_format($item['he_so'] ?? 0, 2),
                    number_format($item['tong_gio_quy_doi'] ?? 0, 2),
                    '',
                    ''
                ];

            case 'hd_lv_thacsi':
            case 'hd_la_tiensi':
                return [
                    $index,
                    $item['ten_hoc_vien'] ?? '',
                    $item['ten_de_tai'] ?? '',
                    $item['vai_tro'] ?? '',
                    number_format($item['he_so'] ?? 0, 2),
                    number_format($item['tong_gio_quy_doi'] ?? 0, 2),
                    '',
                    ''
                ];

            case 'dg_hp_tn_daihoc':
            case 'dg_lv_thacsi':
                return [
                    $index,
                    $item['ten_sinh_vien'] ?? '',
                    $item['ten_de_tai'] ?? '',
                    $item['vai_tro'] ?? '',
                    number_format($item['he_so'] ?? 0, 2),
                    number_format($item['tong_gio_quy_doi'] ?? 0, 2),
                    '',
                    ''
                ];

            case 'dg_la_tiensi_dot':
                return [
                    $index,
                    $item['thong_tin_dot'] ?? '',
                    $item['vai_tro'] ?? '',
                    number_format($item['tong_gio_quy_doi'] ?? 0, 2),
                    $item['ghi_chu'] ?? '',
                    '',
                    '',
                    ''
                ];

            case 'khao_thi_dh_trong_bm':
            case 'khao_thi_dh_ngoai_bm':
            case 'khao_thi_thacsi':
            case 'khao_thi_tiensi':
                return [
                    $index,
                    $item['ten_mon_thi'] ?? '',
                    $item['so_ca_thi'] ?? 0,
                    number_format($item['he_so'] ?? 0, 2),
                    number_format($item['tong_gio_quy_doi'] ?? 0, 2),
                    '',
                    '',
                    ''
                ];

            case 'xd_ctdt_va_khac_gd':
                return [
                    $index,
                    $item['ten_hoat_dong'] ?? '',
                    $item['vai_tro'] ?? '',
                    number_format($item['tong_gio_quy_doi'] ?? 0, 2),
                    $item['ghi_chu'] ?? '',
                    '',
                    '',
                    ''
                ];

            case 'nckh_nam_hoc':
                return [
                    $index,
                    $item['ten_de_tai'] ?? '',
                    $item['vai_tro'] ?? '',
                    number_format($item['tong_gio_nckh_gv_nhap'] ?? 0, 2),
                    $item['ghi_chu'] ?? '',
                    '',
                    '',
                    ''
                ];

            case 'congtac_khac_nam_hoc':
                return [
                    $index,
                    $item['ten_cong_viec'] ?? '',
                    $item['loai_cong_viec'] ?? '',
                    number_format($item['gio_thuc_hien'] ?? 0, 2),
                    $item['ghi_chu'] ?? '',
                    '',
                    '',
                    ''
                ];

            default:
                return [
                    $index,
                    json_encode($item),
                    '',
                    '',
                    '',
                    '',
                    '',
                    ''
                ];
        }
    }
}