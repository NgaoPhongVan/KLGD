<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DmDinhMucVaiTroHdTs extends Model
{
    use HasFactory;
    protected $table = 'dm_dinh_muc_vai_tro_hd_ts';
    protected $fillable = [
        'loai_dao_tao_ts',
        'ten_vai_tro',
        'dinh_muc_gio_tren_ncs',
        'don_vi_tinh',
        'mo_ta',
    ];
}