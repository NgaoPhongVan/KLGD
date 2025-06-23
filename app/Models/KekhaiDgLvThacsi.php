<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiDgLvThacsi extends Model
{
    use HasFactory;
    protected $table = 'kekhai_dg_lv_thacsi';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'hoi_dong_dot_hk',
        'sl_duyet_de_cuong',
        'sl_gop_y_lv',
        'sl_pb1',
        'sl_pb2',
        'sl_ct',
        'sl_uv',
        'sl_uv_tk',
        'tong_gio_quydoi_gv_nhap',
        'ghi_chu',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHopNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
}