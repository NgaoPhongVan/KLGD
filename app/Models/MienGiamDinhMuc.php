<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MienGiamDinhMuc extends Model
{
    protected $table = 'mien_giam_dinh_muc';
    
    protected $fillable = [
        'nguoi_dung_id',
        'nam_hoc_id',
        'ly_do_mien_giam',
        'phan_tram_mien_giam',
        'ghi_chu',
    ];

    protected $casts = [
        'phan_tram_mien_giam' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function namHoc()
    {
        return $this->belongsTo(NamHoc::class, 'nam_hoc_id');
    }
}