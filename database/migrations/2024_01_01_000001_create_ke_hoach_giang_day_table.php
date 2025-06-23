<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ke_hoach_giang_day', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('nguoi_dung_id');
            $table->unsignedBigInteger('hoc_ky_id');
            $table->string('ten_ke_hoach');
            $table->text('mo_ta')->nullable();
            $table->decimal('tong_gio_du_kien', 8, 2)->default(0);
            $table->decimal('phan_tram_giang_day', 5, 2)->default(0);
            $table->decimal('phan_tram_nckh', 5, 2)->default(0);
            $table->decimal('phan_tram_khac', 5, 2)->default(0);
            $table->tinyInteger('trang_thai')->default(1)->comment('1: Active, 0: Inactive');
            $table->timestamp('ngay_tao_ke_hoach')->useCurrent();
            $table->text('ghi_chu')->nullable();
            $table->timestamps();

            $table->foreign('nguoi_dung_id')->references('id')->on('nguoi_dung')->onDelete('cascade');
            $table->foreign('hoc_ky_id')->references('id')->on('hoc_ky')->onDelete('cascade');
            
            $table->index(['nguoi_dung_id', 'hoc_ky_id']);
            $table->index('trang_thai');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ke_hoach_giang_day');
    }
};
