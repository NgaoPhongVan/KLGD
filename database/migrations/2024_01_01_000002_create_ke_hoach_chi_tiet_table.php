<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ke_hoach_chi_tiet', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ke_hoach_giang_day_id');
            $table->unsignedBigInteger('hoat_dong_chi_tiet_id');
            $table->unsignedBigInteger('he_so_quy_doi_id');
            $table->string('ten_hoat_dong_du_kien');
            $table->decimal('so_luong_du_kien', 8, 2);
            $table->decimal('gio_du_kien', 8, 2);
            $table->text('ghi_chu_ke_hoach')->nullable();
            $table->integer('uu_tien')->default(1);
            $table->tinyInteger('trang_thai')->default(1);
            $table->timestamps();

            $table->foreign('ke_hoach_giang_day_id')->references('id')->on('ke_hoach_giang_day')->onDelete('cascade');
            $table->foreign('hoat_dong_chi_tiet_id')->references('id')->on('hoat_dong_chi_tiet')->onDelete('cascade');
            $table->foreign('he_so_quy_doi_id')->references('id')->on('he_so_quy_doi')->onDelete('cascade');
            
            $table->index(['ke_hoach_giang_day_id']);
            $table->index(['hoat_dong_chi_tiet_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('ke_hoach_chi_tiet');
    }
};
