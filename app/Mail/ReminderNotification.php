<?php

namespace App\Mail;

use App\Models\NamHoc;
use App\Models\KeKhaiThoiGian;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ReminderNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $title;
    public $content;
    public $namHoc;
    public $keKhaiThoiGian;

    public function __construct($title, $content, NamHoc $namHoc, $keKhaiThoiGian = null)
    {
        $this->title = $title;
        $this->content = $content;
        $this->namHoc = $namHoc;
        $this->keKhaiThoiGian = $keKhaiThoiGian;
    }

    public function build()
    {
        try {
            return $this->subject($this->title)
                        ->view('emails.reminder')
                        ->with([
                            'title' => $this->title,
                            'content' => $this->content,
                            'namHoc' => $this->namHoc,
                            'keKhaiThoiGian' => $this->keKhaiThoiGian,
                        ]);
        } catch (\Exception $e) {
            Log::error('Loi gui mail thong bao: ' . $e->getMessage());
            throw $e;
        }
    }
}