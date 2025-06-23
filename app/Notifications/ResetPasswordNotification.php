<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class ResetPasswordNotification extends Notification
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = url("/reset-password?token={$this->token}&email=" . urlencode($notifiable->email));

        return (new MailMessage)
            ->subject('Đặt lại mật khẩu')
            ->line('Bạn nhận được email này vì chúng tôi nhận được yêu cầu đặt lại mật khẩu.')
            ->action('Đặt lại mật khẩu', $url)
            ->line('Nếu bạn không yêu cầu, vui lòng bỏ qua email này.');
    }
}