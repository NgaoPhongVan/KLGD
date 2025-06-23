<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiHdDatnDaihoc extends Model
{
    use HasFactory;
    protected $table = 'kekhai_hd_datn_daihoc';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'quyet_dinh_dot_hk',
        'so_luong_sv_cttt',
        'so_luong_sv_dai_tra',
        'tong_sv_quy_doi',
        'tong_gio_quydoi_gv_nhap',
        'ghi_chu',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHopNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
}