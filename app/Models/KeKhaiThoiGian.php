<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KeKhaiThoiGian extends Model
{
    use HasFactory;

    protected $table = 'ke_khai_thoi_gian';

    protected $fillable = [
        'hoc_ky_id',
        'thoi_gian_bat_dau',
        'thoi_gian_ket_thuc',
        'ghi_chu',
    ];

    protected $casts = [
        'thoi_gian_bat_dau' => 'datetime',
        'thoi_gian_ket_thuc' => 'datetime',
    ];

    public function hocKy()
    {
        return $this->belongsTo(HocKy::class, 'hoc_ky_id');
    }
}