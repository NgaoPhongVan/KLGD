<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiNckhNamHoc extends Model
{
    use HasFactory;
    protected $table = 'kekhai_nckh_nam_hoc';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'ten_hoat_dong_san_pham',
        'ket_qua_dat_duoc_quy_doi',
        'tong_gio_nckh_gv_nhap',
        'ghi_chu',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHopNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }

    public function minhChungs()
    {
        return $this->hasMany(MinhChung::class, 'kekhai_nckh_nam_hoc_id');
    }
}