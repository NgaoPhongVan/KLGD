<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiCongtacKhacNamHoc extends Model
{
    use HasFactory;
    protected $table = 'kekhai_congtac_khac_nam_hoc';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'ten_cong_tac',
        'ket_qua_dat_duoc',
        'loai_gio_quy_doi',
        'so_gio_quy_doi_gv_nhap',
        'ghi_chu',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHopNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
}