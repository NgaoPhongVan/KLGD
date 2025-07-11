<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KeKhaiThoiGian extends Model
{
    use HasFactory;

    protected $table = 'ke_khai_thoi_gian';

    protected $fillable = [
        'nam_hoc_id',
        'thoi_gian_bat_dau',
        'thoi_gian_ket_thuc',
        'ghi_chu',
    ];

    protected $casts = [
        'thoi_gian_bat_dau' => 'datetime',
        'thoi_gian_ket_thuc' => 'datetime',
    ];

    public function namHoc()
    {
        return $this->belongsTo(NamHoc::class, 'nam_hoc_id');
    }
}