<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class KeKhaiNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $keKhaiList;

    public function __construct($keKhaiList)
    {
        $this->keKhaiList = is_array($keKhaiList) ? $keKhaiList : [$keKhaiList];
    }

    public function build()
    {
        $hocKy = $this->keKhaiList[0]->keKhaiTongHop->hocKy;
        $namHoc = $hocKy ? $hocKy->namHoc : null;

        return $this->subject('Thông báo kê khai hoạt động')
            ->view('emails.ke_khai_notification')
            ->with([
                'ke_khai_list' => $this->keKhaiList,
                'hoc_ky' => $hocKy ? $hocKy->ten_hoc_ky : 'Chưa có học kỳ',
                'nam_hoc' => $namHoc ? $namHoc->ten_nam_hoc : 'Chưa có năm học',
            ]);
    }
}