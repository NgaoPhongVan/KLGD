<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class MinhChung extends Model
{
    use HasFactory;
    protected $table = 'minh_chung';
    protected $fillable = [
        'kekhai_nckh_nam_hoc_id',
        'duong_dan',
        'ten_file',
        'ngay_tai_len',
    ];

    protected $casts = [
        'ngay_tai_len' => 'datetime',
    ];

    public function kekhaiNckhNamHoc()
    {
        return $this->belongsTo(KekhaiNckhNamHoc::class, 'kekhai_nckh_nam_hoc_id');
    }

    protected static function boot()
    {
        parent::boot();
        static::deleting(function ($minhChung) {
            if ($minhChung->duong_dan && Storage::disk('public')->exists($minhChung->duong_dan)) {
                Storage::disk('public')->delete($minhChung->duong_dan);
            }
        });
    }
}