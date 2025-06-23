<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NamHoc extends Model
{
    protected $table = 'nam_hoc';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $fillable = ['ten_nam_hoc', 'la_nam_hien_hanh'];

    public function hocKys()
    {
        return $this->hasMany(HocKy::class, 'nam_hoc_id', 'id');
    }
}