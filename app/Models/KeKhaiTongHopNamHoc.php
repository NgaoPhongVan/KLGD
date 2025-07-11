<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KeKhaiTongHopNamHoc extends Model
{
    use HasFactory;
    protected $table = 'ke_khai_tong_hop_nam_hoc'; 

    protected $fillable = [
        'nguoi_dung_id',
        'nam_hoc_id',
        'dinhmuc_gd_apdung',
        'dinhmuc_khcn_apdung',
        'phan_tram_mien_giam_tong',
        'tong_gio_gd_danhgia_tam_tinh', 
        'tong_gio_thuc_hien_final_tam_tinh',
        'tong_gio_gd_danhgia_duyet',   
        'tong_gio_thuc_hien_final_duyet',
        'ghi_chu_giang_vien',
        'ghi_chu_quan_ly',
        'thoi_gian_gui',
        'nguoi_duyet_bm_id',
        'thoi_gian_duyet_bm',
        'trang_thai_phe_duyet',
        'ly_do_tu_choi',
        'gio_khcn_conlai_sau_butru_tam_tinh', 
        'gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh', 
        'gio_khcn_conlai_sau_butru_duyet',
        'gio_khcn_hoanthanh_so_voi_dinhmuc_duyet', 
    ];

    protected $casts = [
        'thoi_gian_gui' => 'datetime',
        'thoi_gian_duyet_bm' => 'datetime',
    ];

    public function nguoiDung()
    {
        return $this->belongsTo(User::class, 'nguoi_dung_id');
    }

    public function namHoc()
    {
        return $this->belongsTo(NamHoc::class, 'nam_hoc_id');
    }

    public function nguoiDuyetBm()
    {
        return $this->belongsTo(User::class, 'nguoi_duyet_bm_id');
    }

    public function lichSuPheDuyet()
    {
        return $this->hasMany(LichSuPheDuyet::class, 'ke_khai_tong_hop_nam_hoc_id');
    }

    public function kekhaiGdLopDhTrongbms()
    {
        return $this->hasMany(KekhaiGdLopDhTrongbm::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiGdLopDhNgoaibms()
    {
        return $this->hasMany(KekhaiGdLopDhNgoaibm::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiGdLopDhNgoaicss()
    {
        return $this->hasMany(KekhaiGdLopDhNgoaics::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiGdLopThss()
    {
        return $this->hasMany(KekhaiGdLopThs::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiGdLopTss()
    {
        return $this->hasMany(KekhaiGdLopTs::class, 'ke_khai_tong_hop_nam_hoc_id');
    }

    public function kekhaiHdDatnDaihoc()
    {
        return $this->hasMany(KekhaiHdDatnDaihoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiHdLvThacsis()
    {
        return $this->hasMany(KekhaiHdLvThacsi::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiHdLaTiensis()
    {
        return $this->hasMany(KekhaiHdLaTiensi::class, 'ke_khai_tong_hop_nam_hoc_id');
    }

    public function kekhaiDgHpTnDaihoc()
    {
        return $this->hasMany(KekhaiDgHpTnDaihoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiDgLvThacsis()
    {
        return $this->hasMany(KekhaiDgLvThacsi::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiDgLaTiensiDots()
    {
        return $this->hasMany(KekhaiDgLaTiensiDot::class, 'ke_khai_tong_hop_nam_hoc_id');
    }

    public function kekhaiKhaothiDaihocTrongbms()
    {
        return $this->hasMany(KekhaiKhaothiDaihocTrongbm::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiKhaothiDaihocNgoaibms()
    {
        return $this->hasMany(KekhaiKhaothiDaihocNgoaibm::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiKhaothiThacsis()
    {
        return $this->hasMany(KekhaiKhaothiThacsi::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiKhaothiTiensis()
    {
        return $this->hasMany(KekhaiKhaothiTiensi::class, 'ke_khai_tong_hop_nam_hoc_id');
    }

    public function kekhaiXdCtdtVaKhacGds()
    {
        return $this->hasMany(KekhaiXdCtdtVaKhacGd::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiNckhNamHocs()
    {
        return $this->hasMany(KekhaiNckhNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
    public function kekhaiCongtacKhacNamHocs()
    {
        return $this->hasMany(KekhaiCongtacKhacNamHoc::class, 'ke_khai_tong_hop_nam_hoc_id');
    }
}
