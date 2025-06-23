<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DinhMucGioChuan extends Model
{
    use HasFactory;

    protected $table = 'dinh_muc_gio_chuan';

    protected $fillable = [
        'nam_hoc_id',
        'chuc_danh_id',
        'loai_dinh_muc',
        'tong_gio_chuan',
        'phan_tram_gd_toi_thieu',
        'ghi_chu',
    ];

    protected $casts = [
        'tong_gio_chuan' => 'decimal:2',
        'phan_tram_gd_toi_thieu' => 'decimal:2',
    ];

    // Quan hệ với bảng nam_hoc
    public function namHoc()
    {
        return $this->belongsTo(NamHoc::class, 'nam_hoc_id');
    }

    // Quan hệ với bảng chuc_danh_gv
    public function chucDanh()
    {
        return $this->belongsTo(ChucDanhGv::class, 'chuc_danh_id');
    }
}