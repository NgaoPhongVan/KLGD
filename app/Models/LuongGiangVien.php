<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LuongGiangVien extends Model
{
    use HasFactory;

    protected $table = 'luong_giang_vien';
    
    protected $fillable = [
        'nguoi_dung_id',
        'nam_hoc_id',
        'muc_luong_co_ban',
        'tong_gio_chuan_thuc_hien',
        'so_gio_vuot_muc',
        'don_gia_gio_vuot_muc',
        'tong_tien_luong_vuot_gio',
        'thanh_tien_nam',
        'ghi_chu'
    ];

    protected $casts = [
        'muc_luong_co_ban' => 'decimal:2',
        'tong_gio_chuan_thuc_hien' => 'decimal:2',
        'so_gio_vuot_muc' => 'decimal:2',
        'don_gia_gio_vuot_muc' => 'decimal:2',
        'tong_tien_luong_vuot_gio' => 'decimal:2',
        'thanh_tien_nam' => 'decimal:2',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function namHoc()
    {
        return $this->belongsTo(NamHoc::class, 'nam_hoc_id');
    }
}