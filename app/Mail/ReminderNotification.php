<?php

namespace App\Mail;

use App\Models\HocKy;
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
    public $hocKy;
    public $keKhaiThoiGian;

    public function __construct($title, $content, HocKy $hocKy, $keKhaiThoiGian = null)
    {
        $this->title = $title;
        $this->content = $content;
        $this->hocKy = $hocKy;
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
                            'hocKy' => $this->hocKy,
                            'keKhaiThoiGian' => $this->keKhaiThoiGian,
                        ]);
        } catch (\Exception $e) {
            Log::error('Error building ReminderNotification: ' . $e->getMessage());
            throw $e;
        }
    }
}