<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\KeKhaiTongHopNamHoc;
use App\Models\NamHoc;

class KeKhaiRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $keKhai;
    public $namHoc;
    public $lyDoTuChoi;

    public function __construct(KeKhaiTongHopNamHoc $keKhai, NamHoc $namHoc, string $lyDoTuChoi)
    {
        $this->keKhai = $keKhai;
        $this->namHoc = $namHoc;
        $this->lyDoTuChoi = $lyDoTuChoi;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kê khai bị từ chối - ' . ($this->namHoc->ten_nam_hoc ?? 'N/A'),
            from: config('mail.from.address'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ke_khai_rejected',
            with: [
                'keKhai' => $this->keKhai,
                'namHoc' => $this->namHoc,
                'lyDoTuChoi' => $this->lyDoTuChoi,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}