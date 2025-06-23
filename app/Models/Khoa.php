<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Khoa extends Model
{
    protected $table = 'khoa';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = ['ma_khoa', 'ten_khoa'];

    public function boMons()
    {
        return $this->hasMany(BoMon::class, 'khoa_id', 'id');
    }
}