<?php

// database/migrations/2025_04_18_add_ly_do_tu_choi_to_ke_khai_tong_hop.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLyDoTuChoiToKeKhaiTongHop extends Migration
{
    public function up()
    {
        Schema::table('ke_khai_tong_hop', function (Blueprint $table) {
            $table->text('ly_do_tu_choi')->nullable()->after('trang_thai_phe_duyet');
        });
    }

    public function down()
    {
        Schema::table('ke_khai_tong_hop', function (Blueprint $table) {
            $table->dropColumn('ly_do_tu_choi');
        });
    }
}