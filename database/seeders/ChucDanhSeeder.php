<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ChucDanh;

class ChucDanhSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $chucDanhs = [
            [
                'ma_chuc_danh' => 'GS',
                'ten_chuc_danh' => 'Giáo sư',
                'mo_ta' => 'Chức danh cao nhất trong giảng viên đại học',
                'trang_thai' => true,
            ],
            [
                'ma_chuc_danh' => 'PGS',
                'ten_chuc_danh' => 'Phó giáo sư',
                'mo_ta' => 'Chức danh phó giáo sư',
                'trang_thai' => true,
            ],
            [
                'ma_chuc_danh' => 'GVCS',
                'ten_chuc_danh' => 'Giảng viên chính',
                'mo_ta' => 'Giảng viên chính',
                'trang_thai' => true,
            ],
            [
                'ma_chuc_danh' => 'GV',
                'ten_chuc_danh' => 'Giảng viên',
                'mo_ta' => 'Giảng viên thường',
                'trang_thai' => true,
            ],
            [
                'ma_chuc_danh' => 'TGDD',
                'ten_chuc_danh' => 'Trợ giảng - Điều dưỡng',
                'mo_ta' => 'Trợ giảng và điều dưỡng',
                'trang_thai' => true,
            ],
        ];

        foreach ($chucDanhs as $chucDanh) {
            ChucDanh::updateOrCreate(
                ['ma_chuc_danh' => $chucDanh['ma_chuc_danh']],
                $chucDanh
            );
        }
    }
}
