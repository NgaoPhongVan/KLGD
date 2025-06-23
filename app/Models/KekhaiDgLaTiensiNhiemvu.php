<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KekhaiDgLaTiensiNhiemvu extends Model
{
    use HasFactory;
    protected $table = 'kekhai_dg_la_tiensi_nhiemvu';
    protected $fillable = [
        'kekhai_dg_la_tiensi_dot_id',
        'ten_nhiem_vu',
        'so_tiet_gv_nhap',
        'ghi_chu',
    ];

    public function kekhaiDgLaTiensiDot()
    {
        return $this->belongsTo(KekhaiDgLaTiensiDot::class, 'kekhai_dg_la_tiensi_dot_id');
    }
}