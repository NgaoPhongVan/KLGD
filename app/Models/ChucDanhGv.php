<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChucDanhGv extends Model
{
    use HasFactory;

    protected $table = 'chuc_danh_gv';

    protected $fillable = [
        'ten_chuc_danh',
        'ma_chuc_danh',
        'hoc_vi',
        'mo_ta',
    ];

    // Quan hệ với định mức giờ chuẩn
    public function dinhMucGioChuans()
    {
        return $this->hasMany(DinhMucGioChuan::class, 'chuc_danh_id');
    }

    // Quan hệ với người dùng (giảng viên)
    public function nguoiDungs()
    {
        return $this->hasMany(User::class, 'chuc_danh_id');
    }
}