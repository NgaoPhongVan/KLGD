<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\CustomResetPasswordNotification;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'nguoi_dung';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = [
        'ma_gv',
        'ho_ten',
        'email',
        'hoc_ham',     
        'hoc_vi',
        'password',
        'vai_tro',
        'trang_thai'
    ];
    protected $hidden = ['password', 'remember_token'];

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPasswordNotification($token));
    }
    
    public function boMon()
    {
        return $this->belongsTo(BoMon::class, 'bo_mon_id', 'id');
    }
      public function dinhMucCaNhanTheoNams()
    {
        return $this->hasMany(DinhMucCaNhanTheoNam::class, 'nguoi_dung_id');
    }

    public function keKhaiTongHopNamHocs()
    {
        return $this->hasMany(KeKhaiTongHopNamHoc::class, 'nguoi_dung_id');
    }
}
