<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DmDinhMucVaiTroDanhGia extends Model
{
    use HasFactory;
    protected $table = 'dm_dinh_muc_vai_tro_danh_gia';
    protected $fillable = [
        'trinh_do_dao_tao',
        'nhom_danh_gia',
        'ten_vai_tro',
        'dinh_muc_gio',
        'don_vi_tinh_dinh_muc',
        'mo_ta',
    ];

    public static function getDinhMuc($trinhDo, $nhom, $vaiTro)
    {
        return static::where('trinh_do_dao_tao', $trinhDo)
            ->where('nhom_danh_gia', $nhom)
            ->where('ten_vai_tro', $vaiTro)
            ->value('dinh_muc_gio') ?: 0;
    }
}
