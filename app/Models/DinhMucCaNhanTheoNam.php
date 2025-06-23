<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DinhMucCaNhanTheoNam extends Model
{
    use HasFactory;

    protected $table = 'dinh_muc_ca_nhan_theo_nam';

    protected $fillable = [
        'nguoi_dung_id',
        'nam_hoc_id',
        'dinh_muc_gd',
        'dinh_muc_khcn',
        'ghi_chu',
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