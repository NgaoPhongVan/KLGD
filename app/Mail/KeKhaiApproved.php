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

class KeKhaiApproved extends Mailable
{
    use Queueable, SerializesModels;

    public $keKhai;
    public $namHoc;

    /**
     * Create a new message instance.
     */
    public function __construct(KeKhaiTongHopNamHoc $keKhai, NamHoc $namHoc)
    {
        $this->keKhai = $keKhai;
        $this->namHoc = $namHoc;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kê khai đã được phê duyệt - ' . ($this->namHoc->ten_nam_hoc ?? 'N/A'),
            from: config('mail.from.address'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.ke_khai_approved',
            with: [
                'keKhai' => $this->keKhai,
                'namHoc' => $this->namHoc,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}