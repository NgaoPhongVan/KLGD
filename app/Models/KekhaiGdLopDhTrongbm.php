<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiGdLopDhTrongbm extends Model
{
    use HasFactory;
    protected $table = 'kekhai_gd_lop_dh_trongbm';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'ten_lop_hoc_phan',
        'hoc_ky_dien_ra',
        'si_so',
        'ky_nang',
        'don_vi_tinh',
        'kl_ke_hoach',
        'he_so_qd',
        'so_tiet_qd',
        'ghi_chu',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHopNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    // KHÔNG CÓ MINH CHỨNG TRỰC TIẾP Ở ĐÂY THEO YÊU CẦU MỚI
}