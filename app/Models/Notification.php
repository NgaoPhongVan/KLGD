<?php

// app/Models/Notification.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'notifications';
    public $timestamps = false;
    protected $fillable = [
        'nguoi_dung_id',
        'manager_id',
        'title',
        'message',
        'sent_at',
        'read_at',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }
}