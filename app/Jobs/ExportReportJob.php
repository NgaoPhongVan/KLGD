<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Exports\KekhaiReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReportExportCompleted;

class ExportReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $managerId;
    protected $params;

    public function __construct($managerId, $params)
    {
        $this->managerId = $managerId;
        $this->params = $params;
    }

    public function handle()
    {
        $manager = User::findOrFail($this->managerId);
        $hocKyId = $this->params['hoc_ky_id'];
        $format = $this->params['format'];
        $reportData = []; // Tái sử dụng logic từ exportReport để lấy reportData
        $hocKy = \App\Models\HocKy::findOrFail($hocKyId);
        $fileName = 'BaoCao_KeKhai_' . str_replace(' ', '_', $hocKy->ten_hoc_ky) . '_' . now()->format('YmdHis');

        try {
            if ($format === 'excel') {
                $filePath = "reports/{$fileName}.xlsx";
                Excel::store(new KekhaiReportExport($reportData, $this->params['report_type'], []), $filePath, 'public');
            } else {
                $filePath = "reports/{$fileName}.pdf";
                $pdf = Pdf::loadView('reports.kekhai', [
                    'reportData' => $reportData,
                    'hocKy' => $hocKy,
                    'logo' => public_path('logo.png'),
                    'font_size' => $this->params['font_size'] ?? 12,
                    'report_type' => $this->params['report_type'] ?? 'overview',
                    'columns' => $this->params['columns'] ?? [],
                    'statistics' => [],
                ])->setPaper($this->params['paper_size'] ?? 'a4', $this->params['orientation'] ?? 'landscape');
                Storage::disk('public')->put($filePath, $pdf->output());
            }

            if ($manager->email && filter_var($manager->email, FILTER_VALIDATE_EMAIL)) {
                Mail::to($manager->email)->queue(new ReportExportCompleted($filePath, $fileName));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to export report in job', [
                'manager_id' => $this->managerId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}