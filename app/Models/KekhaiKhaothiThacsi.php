<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiKhaothiThacsi extends Model
{
    use HasFactory;
    protected $table = 'kekhai_khaothi_thacsi';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'hang_muc',
        'so_ca_bai_mon',
        'dinh_muc_gv_nhap',
        'so_tiet_qd',
        'ghi_chu',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHopNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
}