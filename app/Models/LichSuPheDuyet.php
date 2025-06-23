<?php

// app/Models/LichSuPheDuyet.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LichSuPheDuyet extends Model
{
    protected $table = 'lich_su_phe_duyet';
    protected $fillable = [
        'ke_khai_tong_hop_nam_hoc_id',
        'nguoi_thuc_hien_id',
        'hanh_dong',
        'trang_thai_truoc',
        'trang_thai_sau',
        'ghi_chu',
        'thoi_gian_thuc_hien',
    ];

    public function keKhaiTongHopNamHoc()
    {
        return $this->belongsTo(KeKhaiTongHop::class, 'ke_khai_tong_hop_id');
    }

    public function nguoiThucHien()
    {
        return $this->belongsTo(User::class, 'nguoi_thuc_hien_id');
    }
}