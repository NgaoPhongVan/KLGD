<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiHdLaTiensi extends Model
{
    use HasFactory;
    protected $table = 'kekhai_hd_la_tiensi';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'quyet_dinh_dot_hk',
        'loai_dao_tao_ts',
        'so_luong_hd_chinh',
        'so_luong_hd_phu1',
        'so_luong_hd_phu2',
        'tong_gio_quydoi_gv_nhap',
        'ghi_chu',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHopNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
}