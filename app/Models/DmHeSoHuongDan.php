<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DmHeSoHuongDan extends Model
{
    use HasFactory;
    protected $table = 'dm_he_so_huong_dan';
    protected $fillable = [
        'trinh_do_dao_tao',
        'loai_huong_dan_ma_hoat_dong',
        'loai_chuong_trinh',
        'he_so_gio_tren_don_vi',
        'don_vi_tinh',
    ];
}