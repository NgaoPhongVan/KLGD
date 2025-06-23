<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiXdCtdtVaKhacGd extends Model
{
    use HasFactory;
    protected $table = 'kekhai_xd_ctdt_va_khac_gd';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'ten_hoat_dong',
        'so_luong_don_vi',
        'don_vi_tinh',
        'tong_gio_quydoi_gv_nhap',
        'ghi_chu',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHopNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
}