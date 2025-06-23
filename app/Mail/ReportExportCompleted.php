<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ReportExportCompleted extends Mailable
{
    use Queueable, SerializesModels;

    protected $filePath;
    protected $fileName;

    public function __construct($filePath, $fileName)
    {
        $this->filePath = $filePath;
        $this->fileName = $fileName;
    }

    public function build()
    {
        return $this->subject('Báo cáo Kê khai Đã Hoàn tất')
            ->view('emails.report_export_completed')
            ->with([
                'file_url' => Storage::url($this->filePath),
                'file_name' => $this->fileName,
            ]);
    }
}