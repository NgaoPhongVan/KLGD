<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HocKy extends Model
{
    protected $table = 'hoc_ky';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = ['ten_hoc_ky', 'nam_hoc_id', 'la_ky_hien_hanh'];

    public function namHoc()
    {
        return $this->belongsTo(NamHoc::class, 'nam_hoc_id', 'id');
    }
    public function keKhaiTongHop()
    {
        return $this->hasMany(KeKhaiTongHop::class, 'hoc_ky_id');
    }
}
