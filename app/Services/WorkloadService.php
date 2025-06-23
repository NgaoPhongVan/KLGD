<?php

namespace App\Services;

use App\Models\KeKhaiTongHopNamHoc; // Đổi tên model
// ... (Thêm các model chi tiết như đã làm ở lần trước)
use App\Models\KekhaiGdLopDhTrongbm;
use App\Models\KekhaiGdLopDhNgoaibm;
use App\Models\KekhaiGdLopDhNgoaics;
use App\Models\KekhaiGdLopThs;
use App\Models\KekhaiGdLopTs;
use App\Models\KekhaiHdDatnDaihoc;
use App\Models\KekhaiHdLvThacsi;
use App\Models\KekhaiHdLaTiensi;
use App\Models\KekhaiDgHpTnDaihoc;
use App\Models\KekhaiDgLvThacsi;
use App\Models\KekhaiDgLaTiensiDot;
use App\Models\KekhaiKhaothiDaihocTrongbm;
use App\Models\KekhaiKhaothiDaihocNgoaibm;
use App\Models\KekhaiKhaothiThacsi;
use App\Models\KekhaiKhaothiTiensi;
use App\Models\KekhaiXdCtdtVaKhacGd;
use App\Models\KekhaiNckhNamHoc;
use App\Models\KekhaiCongtacKhacNamHoc;
use App\Models\DmHeSoChung; // Để lấy các hệ số cố định
use App\Models\User;
use App\Models\NamHoc;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WorkloadService
{
   private function resetTongHopValues(KeKhaiTongHopNamHoc $keKhaiTongHop)
    {
        $fieldsToReset_tam_tinh = [
            'tong_gio_gd_danhgia_tam_tinh',
            'tong_sl_huongdan_la_tam_tinh', 'tong_sl_huongdan_lv_tam_tinh', 'tong_sl_huongdan_dakl_tam_tinh',
            'tong_gio_huongdan_quydoi_tam_tinh',
            'tong_gio_khcn_kekhai_tam_tinh', 'tong_gio_congtackhac_quydoi_tam_tinh',
            'tong_gio_coithi_chamthi_dh_tam_tinh', 'tong_gio_giangday_final_tam_tinh',
            'tong_gio_gdxatruong_tam_tinh',
            'gio_gd_danhgia_xet_dinhmuc_tam_tinh', 'gio_khcn_thuchien_xet_dinhmuc_tam_tinh',
            'gio_gdxatruong_xet_dinhmuc_tam_tinh', 'gio_vuot_gd_khong_hd_tam_tinh',
            'tong_gio_butru_la_tam_tinh', 'sl_huongdan_la_conlai_tam_tinh',
            'tong_gio_butru_lv_tam_tinh', 'sl_huongdan_lv_conlai_tam_tinh',
            'tong_gio_butru_dakl_tam_tinh', 'sl_huongdan_dakl_conlai_tam_tinh',
            'tong_gio_butru_khcn_tam_tinh', 'gio_khcn_conlai_sau_butru_tam_tinh', // Giờ KHCN còn lại sau khi bù cho GD
            'tong_gio_butru_xatruong_tam_tinh', 'gio_gdxatruong_conlai_sau_butru_tam_tinh',
            'gio_gd_hoanthanh_sau_butru_tam_tinh',
            'gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh', // ĐÃ THAY ĐỔI TÊN
            'ket_qua_thua_thieu_gio_gd_tam_tinh', 'ghi_chu_butru_tam_tinh',
            'tong_gio_thuc_hien_final_tam_tinh'
        ];

        foreach ($fieldsToReset_tam_tinh as $field) {
            if (str_contains($field, 'sl_')) {
                $keKhaiTongHop->$field = 0;
            } elseif (str_contains($field, 'ghi_chu_')) {
                 $keKhaiTongHop->$field = null;
            } else {
                $keKhaiTongHop->$field = 0.00;
            }
        }
    }

    public function calculateAllForKeKhaiTongHop($keKhaiTongHopNamHocId)
    {
        $keKhaiTongHop = KeKhaiTongHopNamHoc::with([
            'nguoiDung', 'namHoc',
            'kekhaiGdLopDhTrongbms', 'kekhaiGdLopDhNgoaibms', 'kekhaiGdLopDhNgoaicss',
            'kekhaiGdLopThss', 'kekhaiGdLopTss',
            'kekhaiHdDatnDaihoc', 'kekhaiHdLvThacsis', 'kekhaiHdLaTiensis',
            'kekhaiDgHpTnDaihoc', 'kekhaiDgLvThacsis',
            'kekhaiDgLaTiensiDots.nhiemVus',
            'kekhaiKhaothiDaihocTrongbms', 'kekhaiKhaothiDaihocNgoaibms',
            'kekhaiKhaothiThacsis', 'kekhaiKhaothiTiensis',
            'kekhaiXdCtdtVaKhacGds',
            'kekhaiNckhNamHocs',
            'kekhaiCongtacKhacNamHocs',
        ])->find($keKhaiTongHopNamHocId);

        if (!$keKhaiTongHop) {
            Log::error("WorkloadService: Không tìm thấy KeKhaiTongHopNamHoc ID: {$keKhaiTongHopNamHocId}");
            return false;
        }

        $this->resetTongHopValues($keKhaiTongHop);
        $dinhMucGD = floatval($keKhaiTongHop->dinhmuc_gd_apdung ?: 0);
        $dinhMucKHCN = floatval($keKhaiTongHop->dinhmuc_khcn_apdung ?: 0);

        // --- TÍNH GIỜ CHI TIẾT VÀ GOM VÀO BIẾN TẠM ---
        $tam_tong_gd_lop = 0;
        $tam_tong_gd_danhgia_hoithao_khong_dh = 0;
        $tam_sl_hd_la = 0; $tam_sl_hd_lv = 0; $tam_sl_hd_dakl = 0;
        $tam_tong_gio_coithi_chamthi_dh = 0;
        $tam_tong_gio_nckh_thuc_hien = 0;
        $tam_tong_gio_congtac_khac_ra_gd = 0;
        $tam_tong_gio_congtac_khac_ra_khcn = 0;
        $tam_tong_gio_gd_xa_truong = 0;

        // 1. Giảng dạy lớp
        $tam_tong_gd_lop += $keKhaiTongHop->kekhaiGdLopDhTrongbms->sum('so_tiet_qd');
        $tam_tong_gd_lop += $keKhaiTongHop->kekhaiGdLopDhNgoaibms->sum('so_tiet_qd');
        $tam_tong_gd_lop += $keKhaiTongHop->kekhaiGdLopDhNgoaicss->sum('so_tiet_qd');
        $tam_tong_gd_lop += $keKhaiTongHop->kekhaiGdLopThss->sum('so_tiet_qd');
        $tam_tong_gd_lop += $keKhaiTongHop->kekhaiGdLopTss->sum('so_tiet_qd');

        // 2. Hướng dẫn (lấy số lượng)
        $tam_sl_hd_dakl = $keKhaiTongHop->kekhaiHdDatnDaihoc->sum(fn($i) => ($i->so_luong_sv_cttt ?:0) + ($i->so_luong_sv_dai_tra ?:0) );
        $tam_sl_hd_lv = $keKhaiTongHop->kekhaiHdLvThacsis->sum(fn($i) => ($i->so_luong_hd_doc_lap ?:0) + ($i->so_luong_hd1 ?:0) + ($i->so_luong_hd2 ?:0) );
        $tam_sl_hd_la = $keKhaiTongHop->kekhaiHdLaTiensis->sum(fn($i) => ($i->so_luong_hd_chinh ?:0) + ($i->so_luong_hd_phu1 ?:0) + ($i->so_luong_hd_phu2 ?:0) );

        // 3. Đánh giá/Hội đồng
        $tam_tong_gd_danhgia_hoithao_khong_dh += $keKhaiTongHop->kekhaiDgHpTnDaihoc->sum('tong_gio_quydoi_gv_nhap');
        $tam_tong_gd_danhgia_hoithao_khong_dh += $keKhaiTongHop->kekhaiDgLvThacsis->sum('tong_gio_quydoi_gv_nhap');
        $tam_tong_gd_danhgia_hoithao_khong_dh += $keKhaiTongHop->kekhaiDgLaTiensiDots->sum('tong_gio_quydoi_cho_dot');

        // 4. Khảo thí
        $tam_tong_gio_coithi_chamthi_dh += $keKhaiTongHop->kekhaiKhaothiDaihocTrongbms->sum('so_tiet_qd');
        $tam_tong_gio_coithi_chamthi_dh += $keKhaiTongHop->kekhaiKhaothiDaihocNgoaibms->sum('so_tiet_qd');
        $tam_tong_gd_danhgia_hoithao_khong_dh += $keKhaiTongHop->kekhaiKhaothiThacsis->sum('so_tiet_qd');
        $tam_tong_gd_danhgia_hoithao_khong_dh += $keKhaiTongHop->kekhaiKhaothiTiensis->sum('so_tiet_qd');

        // 5. XD CTĐT & HĐ GD khác
        $tam_tong_gd_danhgia_hoithao_khong_dh += $keKhaiTongHop->kekhaiXdCtdtVaKhacGds->sum('tong_gio_quydoi_gv_nhap');

        // 6. NCKH (Giờ thực hiện)
        $tam_tong_gio_nckh_thuc_hien = $keKhaiTongHop->kekhaiNckhNamHocs->sum('tong_gio_nckh_gv_nhap');

        // 7. Công tác khác
        foreach ($keKhaiTongHop->kekhaiCongtacKhacNamHocs as $ctKhac) {
            if ($ctKhac->loai_gio_quy_doi === 'GD') {
                $tam_tong_gio_congtac_khac_ra_gd += ($ctKhac->so_gio_quy_doi_gv_nhap ?: 0);
            } elseif ($ctKhac->loai_gio_quy_doi === 'KHCN') {
                $tam_tong_gio_congtac_khac_ra_khcn += ($ctKhac->so_gio_quy_doi_gv_nhap ?: 0);
            }
        }

        // --- CẬP NHẬT BẢNG ke_khai_tong_hop_nam_hoc (Mục I.2 file CSV) ---
        $keKhaiTongHop->tong_gio_gd_danhgia_tam_tinh = round($tam_tong_gd_lop + $tam_tong_gd_danhgia_hoithao_khong_dh + $tam_tong_gio_congtac_khac_ra_gd, 2);
        $keKhaiTongHop->tong_sl_huongdan_la_tam_tinh = $tam_sl_hd_la;
        $keKhaiTongHop->tong_sl_huongdan_lv_tam_tinh = $tam_sl_hd_lv;
        $keKhaiTongHop->tong_sl_huongdan_dakl_tam_tinh = $tam_sl_hd_dakl;

        $hs_la = floatval(DmHeSoChung::where('ma_he_so', 'HS_HUONGDAN_LA')->value('gia_tri') ?: 0);
        $hs_lv = floatval(DmHeSoChung::where('ma_he_so', 'HS_HUONGDAN_LV')->value('gia_tri') ?: 0);
        $hs_dakl = floatval(DmHeSoChung::where('ma_he_so', 'HS_HUONGDAN_DAKL')->value('gia_tri') ?: 0);
        $keKhaiTongHop->tong_gio_huongdan_quydoi_tam_tinh = round(($tam_sl_hd_la * $hs_la) + ($tam_sl_hd_lv * $hs_lv) + ($tam_sl_hd_dakl * $hs_dakl), 2);

        $keKhaiTongHop->tong_gio_khcn_kekhai_tam_tinh = round($tam_tong_gio_nckh_thuc_hien + $tam_tong_gio_congtac_khac_ra_khcn, 2);
        $keKhaiTongHop->tong_gio_congtackhac_quydoi_tam_tinh = round($tam_tong_gio_congtac_khac_ra_gd, 2);
        $keKhaiTongHop->tong_gio_coithi_chamthi_dh_tam_tinh = round($tam_tong_gio_coithi_chamthi_dh, 2);
        $keKhaiTongHop->tong_gio_giangday_final_tam_tinh = round($keKhaiTongHop->tong_gio_gd_danhgia_tam_tinh + $keKhaiTongHop->tong_gio_huongdan_quydoi_tam_tinh, 2);
        $keKhaiTongHop->tong_gio_gdxatruong_tam_tinh = round($tam_tong_gio_gd_xa_truong, 2);


        // --- TÍNH TOÁN CÁC CỘT CHO MỤC I.1 (Khối lượng vượt giờ) ---
        $keKhaiTongHop->gio_gd_danhgia_xet_dinhmuc_tam_tinh = $keKhaiTongHop->tong_gio_gd_danhgia_tam_tinh;
        $keKhaiTongHop->gio_khcn_thuchien_xet_dinhmuc_tam_tinh = $keKhaiTongHop->tong_gio_khcn_kekhai_tam_tinh;
        $keKhaiTongHop->gio_gdxatruong_xet_dinhmuc_tam_tinh = $keKhaiTongHop->tong_gio_gdxatruong_tam_tinh;

        $gioVuotGdKhongHD = ($keKhaiTongHop->gio_gd_danhgia_xet_dinhmuc_tam_tinh ?: 0) - $dinhMucGD;
        $keKhaiTongHop->gio_vuot_gd_khong_hd_tam_tinh = round(max(0, $gioVuotGdKhongHD), 2);

        $gioThieuGDSoVoiDinhMuc = $dinhMucGD - ($keKhaiTongHop->gio_gd_danhgia_xet_dinhmuc_tam_tinh ?: 0);
        $ghiChuBuTruArray = [];
        $gioDaBuTruChoGD = 0;

        $keKhaiTongHop->sl_huongdan_la_conlai_tam_tinh = $keKhaiTongHop->tong_sl_huongdan_la_tam_tinh ?: 0;
        $keKhaiTongHop->sl_huongdan_lv_conlai_tam_tinh = $keKhaiTongHop->tong_sl_huongdan_lv_tam_tinh ?: 0;
        $keKhaiTongHop->sl_huongdan_dakl_conlai_tam_tinh = $keKhaiTongHop->tong_sl_huongdan_dakl_tam_tinh ?: 0;
        $gio_khcn_co_the_bu = $keKhaiTongHop->gio_khcn_thuchien_xet_dinhmuc_tam_tinh ?: 0;
        $keKhaiTongHop->gio_khcn_conlai_sau_butru_tam_tinh = $gio_khcn_co_the_bu; // Khởi tạo trước khi bù
        $gio_gdxatruong_co_the_bu = $keKhaiTongHop->gio_gdxatruong_xet_dinhmuc_tam_tinh ?: 0;
        $keKhaiTongHop->gio_gdxatruong_conlai_sau_butru_tam_tinh = $gio_gdxatruong_co_the_bu; // Khởi tạo

        if ($gioThieuGDSoVoiDinhMuc > 0) {
            // Bù từ LA, ĐA/KL, LV (logic như cũ)
            // ...
            // Bù từ KHCN (chỉ bù)
            if ($gioThieuGDSoVoiDinhMuc > 0 && $keKhaiTongHop->gio_khcn_conlai_sau_butru_tam_tinh > 0) {
                $gioBuThucTeKHCN = min($gioThieuGDSoVoiDinhMuc, $keKhaiTongHop->gio_khcn_conlai_sau_butru_tam_tinh);
                $keKhaiTongHop->tong_gio_butru_khcn_tam_tinh = round($gioBuThucTeKHCN, 2);
                $keKhaiTongHop->gio_khcn_conlai_sau_butru_tam_tinh -= $gioBuThucTeKHCN;
                $gioThieuGDSoVoiDinhMuc -= $gioBuThucTeKHCN;
                $gioDaBuTruChoGD += $gioBuThucTeKHCN;
                $ghiChuBuTruArray[] = "Bù " . round($gioBuThucTeKHCN, 2) . "h từ KHCN.";
            }
            // Bù từ GD Xa trường (chỉ bù)
            if ($gioThieuGDSoVoiDinhMuc > 0 && $keKhaiTongHop->gio_gdxatruong_conlai_sau_butru_tam_tinh > 0) {
                // ... (logic như cũ)
            }
        }
        // ... (cập nhật sl_conlai cho hướng dẫn) ...
        $keKhaiTongHop->gio_khcn_conlai_sau_butru_tam_tinh = round(max(0, $keKhaiTongHop->gio_khcn_conlai_sau_butru_tam_tinh), 2);
        $keKhaiTongHop->gio_gdxatruong_conlai_sau_butru_tam_tinh = round(max(0, $keKhaiTongHop->gio_gdxatruong_conlai_sau_butru_tam_tinh), 2);

        // Cột 6 Mục I.1 ("Hoàn thành GD" sau bù trừ)
        $keKhaiTongHop->gio_gd_hoanthanh_sau_butru_tam_tinh = round(($keKhaiTongHop->gio_gd_danhgia_xet_dinhmuc_tam_tinh ?: 0) + $gioDaBuTruChoGD, 2);

        // Cột "Hoàn thành KHCN" (Mục I.1 file CSV) VÀ "Hoàn thành KHCN (giờ)" (Bảng bổ sung)
        // = Giờ KHCN còn lại sau khi bù cho GD (nếu có) TRỪ ĐI Định mức KHCN
        $keKhaiTongHop->gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh = round($keKhaiTongHop->gio_khcn_conlai_sau_butru_tam_tinh - $dinhMucKHCN, 2);


        // Cột "Thừa/thiếu" Mục I.1:
        $gioHuongDanConLaiKhongBu_QuyDoi = ($keKhaiTongHop->sl_huongdan_la_conlai_tam_tinh * $hs_la) +
                                           ($keKhaiTongHop->sl_huongdan_lv_conlai_tam_tinh * $hs_lv) +
                                           ($keKhaiTongHop->sl_huongdan_dakl_conlai_tam_tinh * $hs_dakl);
        
        $thuaThieuGDTamThoi = ($keKhaiTongHop->gio_gd_hoanthanh_sau_butru_tam_tinh) - $dinhMucGD;

        // ĐIỀU CHỈNH QUAN TRỌNG: Nếu KHCN thiếu, thì trừ vào phần thừa/thiếu của GD
        if ($keKhaiTongHop->gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh < 0) {
            $thuaThieuGDTamThoi += $keKhaiTongHop->gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh; // Cộng số âm tức là trừ đi
            // Có thể thêm vào ghi chú bù trừ nếu muốn rõ ràng hơn nữa
            $ghiChuBuTruArray[] = "Điều chỉnh do thiếu " . abs($keKhaiTongHop->gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh) . "h KHCN.";
        }
        $keKhaiTongHop->ket_qua_thua_thieu_gio_gd_tam_tinh = round($thuaThieuGDTamThoi, 2);

        $keKhaiTongHop->ghi_chu_butru_tam_tinh = count($ghiChuBuTruArray) > 0 ? implode(" ", $ghiChuBuTruArray) : null;

        // tong_gio_thuc_hien_final_tam_tinh: Tổng các giờ được công nhận cuối cùng
        // Bao gồm: (GD hoàn thành sau bù) + (HD còn lại không bù) + (KHCN hoàn thành so với định mức - chỉ tính phần dương nếu muốn)
        // + (GD Xa trường còn lại) + (Coi chấm thi ĐH) + (Công tác khác quy ra GD)
        // Theo file CSV, có vẻ như tổng giờ cuối cùng (để tính vượt giờ/lương) là cột "Thừa/thiếu" cộng với định mức GD.
        // Hoặc chính là cột 6 ("Số tiết GD thực hiện" của Mục I.1) cộng với giờ hướng dẫn còn lại (C7,8,9 * hệ số)
        // và có thể cộng thêm phần KHCN vượt (nếu có).
        // Cách tính này cần thống nhất dựa trên quy định của trường.
        // Hiện tại, tôi sẽ tính dựa trên các thành phần đã được công nhận và không bị dùng để bù trừ.
        $tongFinal = ($keKhaiTongHop->gio_gd_hoanthanh_sau_butru_tam_tinh ?: 0) +
                     round($gioHuongDanConLaiKhongBu_QuyDoi, 2) +
                     // Chỉ cộng phần KHCN vượt định mức (nếu có) vào tổng cuối, không cộng phần âm
                     max(0, $keKhaiTongHop->gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh ?: 0) +
                     ($keKhaiTongHop->gio_gdxatruong_conlai_sau_butru_tam_tinh ?: 0) +
                     ($keKhaiTongHop->tong_gio_coithi_chamthi_dh_tam_tinh ?: 0) +
                     ($keKhaiTongHop->tong_gio_congtackhac_quydoi_tam_tinh ?: 0);

        $keKhaiTongHop->tong_gio_thuc_hien_final_tam_tinh = round($tongFinal, 2);

        $keKhaiTongHop->save();
        Log::info("WorkloadService: Đã tính toán xong cho KeKhaiTongHopNamHoc ID: {$keKhaiTongHopNamHocId}");
        return true;
    }
    /**
     * Helper để tính tổng giờ quy đổi cho một số lượng hướng dẫn cụ thể.
     * Hàm này sẽ lấy hệ số từ bảng dm_he_so_chung.
     *
     * @param int $soLuong Số lượng SV/HV/NCS
     * @param string $trinhDo 'Đại học', 'Thạc sĩ', 'Tiến sĩ'
     * @param User $user (Không dùng trong logic này nữa vì hệ số là chung)
     * @param int $namHocId (Không dùng trong logic này nữa vì hệ số là chung)
     * @param string|null $loaiDaoTaoTS (Ví dụ: '3 năm', '4 năm' - hiện tại chưa dùng vì hệ số chung)
     * @param string|null $vaiTroCuThe (Ví dụ: 'HĐ độc lập', 'HĐ chính' - hiện tại chưa dùng vì hệ số chung)
     * @param bool $laCTTT (Hiện tại chưa dùng vì hệ số chung)
     * @return float
     */
    private function calculateGioHuongDanTheoSoLuong($soLuong, $trinhDo, User $user = null, $namHocId = null, $loaiDaoTaoTS = null, $vaiTroCuThe = null, $laCTTT = false)
    {
        if ($soLuong <= 0) return 0.00;

        $maHeSo = '';
        if ($trinhDo === 'Đại học') { // ĐA/KL
            $maHeSo = 'HS_HUONGDAN_DAKL';
        } elseif ($trinhDo === 'Thạc sĩ') { // LV
            $maHeSo = 'HS_HUONGDAN_LV';
        } elseif ($trinhDo === 'Tiến sĩ') { // LA
            $maHeSo = 'HS_HUONGDAN_LA';
        }

        if (empty($maHeSo)) {
            Log::warning("WorkloadService: Không tìm thấy mã hệ số cho hướng dẫn trình độ {$trinhDo}");
            return 0.00;
        }

        $heSoGio = floatval(DmHeSoChung::where('ma_he_so', $maHeSo)->value('gia_tri') ?: 0);

        return round(floatval($soLuong) * $heSoGio, 2);
    }

    /**
     * Helper để tính số lượng đơn vị (SV/HV/NCS) từ số giờ đã bù.
     * Hàm này sẽ lấy hệ số từ bảng dm_he_so_chung.
     *
     * @param float $gioDaBu Số giờ đã dùng để bù
     * @param string $trinhDo 'Đại học', 'Thạc sĩ', 'Tiến sĩ'
     * @param User $user (Không dùng)
     * @param int $namHocId (Không dùng)
     * @param string|null $loaiDaoTaoTS (Không dùng)
     * @param string|null $vaiTroCuThe (Không dùng)
     * @param bool $laCTTT (Không dùng)
     * @return int Số lượng SV/HV/NCS tương ứng (làm tròn lên)
     */
    private function calculateSoLuongTuGio($gioDaBu, $trinhDo, User $user = null, $namHocId = null, $loaiDaoTaoTS = null, $vaiTroCuThe = null, $laCTTT = false)
    {
        if ($gioDaBu <= 0) return 0;

        $maHeSo = '';
        if ($trinhDo === 'Đại học') {
            $maHeSo = 'HS_HUONGDAN_DAKL';
        } elseif ($trinhDo === 'Thạc sĩ') {
            $maHeSo = 'HS_HUONGDAN_LV';
        } elseif ($trinhDo === 'Tiến sĩ') {
            $maHeSo = 'HS_HUONGDAN_LA';
        }

        if (empty($maHeSo)) {
            Log::warning("WorkloadService: Không tìm thấy mã hệ số để tính số lượng từ giờ cho trình độ {$trinhDo}");
            return 0;
        }

        $heSoGio = floatval(DmHeSoChung::where('ma_he_so', $maHeSo)->value('gia_tri') ?: 0);

        if ($heSoGio <= 0) {
            Log::warning("WorkloadService: Hệ số giờ cho {$maHeSo} là 0 hoặc không hợp lệ.");
            return 0; // Tránh chia cho 0
        }

        return ceil($gioDaBu / $heSoGio);
    }
}
