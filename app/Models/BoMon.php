<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoMon extends Model
{
    protected $table = 'bo_mon';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = ['ma_bo_mon', 'ten_bo_mon', 'khoa_id'];

    public function khoa()
    {
        return $this->belongsTo(Khoa::class, 'khoa_id', 'id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'bo_mon_id', 'id');
    }
    public function nguoiDung()
    {
        return $this->hasMany(User::class, 'bo_mon_id');
    }
}
