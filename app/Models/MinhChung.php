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
        'kekhai_nckh_nam_hoc_id', // Khóa ngoại trực tiếp
        'duong_dan',
        'ten_file',
        'ngay_tai_len',
        // 'trang_thai_duyet', // Có thể không cần nếu duyệt NCKH dựa trên tổng giờ
    ];

    protected $casts = [
        'ngay_tai_len' => 'datetime',
        // 'trang_thai_duyet' => 'boolean',
    ];

    public function kekhaiNckhNamHoc()
    {
        return $this->belongsTo(KekhaiNckhNamHoc::class, 'kekhai_nckh_nam_hoc_id');
    }

    // Xóa file vật lý khi xóa bản ghi minh chứng
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