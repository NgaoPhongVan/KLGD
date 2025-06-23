<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DmHeSoChung extends Model
{
    use HasFactory;
    protected $table = 'dm_he_so_chung';
    protected $fillable = [
        'ma_he_so',
        'ten_he_so',
        'gia_tri',
        'don_vi_tinh',
        'mo_ta',
    ];
}