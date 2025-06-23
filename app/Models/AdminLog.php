<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminLog extends Model
{
    use HasFactory;

    protected $table = 'admin_logs';

    protected $fillable = [
        'admin_id',
        'admin_name',
        'action',
        'table_name',
        'record_id',
        'record_name',
        'old_data',
        'new_data',
        'ip_address',
        'user_agent',
        'description',
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id', 'id');
    }
}
