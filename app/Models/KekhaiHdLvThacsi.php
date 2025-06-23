<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiHdLvThacsi extends Model
{
    use HasFactory;
    protected $table = 'kekhai_hd_lv_thacsi';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'quyet_dinh_dot_hk',
        'so_luong_hd_doc_lap',
        'so_luong_hd1',
        'so_luong_hd2',
        'tong_gio_quydoi_gv_nhap',
        'ghi_chu',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHopNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
}