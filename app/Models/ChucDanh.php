<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChucDanh extends Model
{
    use HasFactory;

    protected $table = 'chuc_danh';

    protected $fillable = [
        'ma_chuc_danh',
        'ten_chuc_danh',
        'mo_ta',
        'trang_thai',
    ];

    protected $casts = [
        'trang_thai' => 'boolean',
    ];

    /**
     * Get the users with this chuc danh
     */
    public function nguoiDungs()
    {
        return $this->hasMany(User::class, 'chuc_danh_id');
    }

    /**
     * Get the dinh muc gio chuan for this chuc danh
     */
    public function dinhMucGioChuan()
    {
        return $this->hasMany(DinhMucGioChuan::class, 'chuc_danh_id');
    }

    /**
     * Scope to get active chuc danh
     */
    public function scopeActive($query)
    {
        return $query->where('trang_thai', true);
    }

    /**
     * Get formatted name for display
     */
    public function getFormattedNameAttribute()
    {
        return $this->ma_chuc_danh ? "({$this->ma_chuc_danh}) {$this->ten_chuc_danh}" : $this->ten_chuc_danh;
    }
}
