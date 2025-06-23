<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DmDinhMucVaiTroHdThs extends Model
{
    use HasFactory;
    protected $table = 'dm_dinh_muc_vai_tro_hd_ths';
    protected $fillable = [
        'ten_vai_tro',
        'dinh_muc_gio_tren_hv',
        'don_vi_tinh',
        'mo_ta',
    ];
}