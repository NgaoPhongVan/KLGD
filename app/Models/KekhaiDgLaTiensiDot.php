<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiDgLaTiensiDot extends Model
{
    use HasFactory;
    protected $table = 'kekhai_dg_la_tiensi_dot';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'loai_hoat_dong_ts',
        'ten_ncs_hoac_ten_cd',
        'hoi_dong_dot_hk',
        'tong_gio_quydoi_cho_dot',
        'ghi_chu',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHopNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }

    public function nhiemVus() // Đổi tên quan hệ cho dễ hiểu
    {
        return $this->hasMany(KekhaiDgLaTiensiNhiemvu::class, 'kekhai_dg_la_tiensi_dot_id');
    }
}