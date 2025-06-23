<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DmHoatDongGiangDayKhac extends Model
{
    use HasFactory;
    protected $table = 'dm_hoat_dong_giang_day_khac';
    protected $fillable = [
        'ma_hoat_dong',
        'ten_hoat_dong',
        'nhom_hoat_dong',
        'trinh_do_dao_tao_ap_dung',
        'don_vi_tinh',
        'dinh_muc_gio_tren_don_vi',
        'mo_ta',
        'can_minh_chung',
        'thu_tu_hien_thi',
        'trang_thai_apdung',
    ];
}