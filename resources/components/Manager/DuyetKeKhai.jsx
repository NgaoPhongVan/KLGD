import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Card, Select, Input, Button, Table, Space, Tag, Modal, Form,
    Typography, Row, Col, Checkbox, Pagination, Spin, Alert, Divider, Tooltip, message, Empty, Tabs
} from 'antd';
import {
    SearchOutlined, BellOutlined, CheckOutlined, CloseOutlined, EyeOutlined, FilterOutlined,
    UserOutlined, BookOutlined, ClockCircleOutlined, FileTextOutlined, CalendarOutlined,
    SyncOutlined, ExclamationCircleOutlined, PrinterOutlined, DownloadOutlined,
    ExperimentOutlined, CarryOutOutlined, BuildOutlined, TeamOutlined, UserSwitchOutlined, AuditOutlined,
    PaperClipOutlined, SolutionOutlined, DashboardOutlined, SettingOutlined, MailOutlined
} from '@ant-design/icons';
import moment from 'moment';
import SendNotificationModal from './SendNotificationModal';

const { TextArea } = Input;
const { Text, Paragraph, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select; // Keep this import

// =======================================================================================
// COMPONENT CHI TIẾT KÊ KHAI CHO MANAGER VỚI BẢNG THỐNG KÊ ĐẦY ĐỦ
// =======================================================================================
const BaoCaoKeKhaiPreviewManager = ({ keKhaiData, onApprove, onReject, isLoading }) => {
    if (!keKhaiData) {
        return <Empty description="Không có dữ liệu chi tiết để hiển thị." />;
    }

    // Xử lý cấu trúc dữ liệu đúng
    const nguoiDung = keKhaiData.nguoi_dung || keKhaiData.nguoiDung;
    const namHoc = keKhaiData.nam_hoc || keKhaiData.namHoc;
    
    if (!nguoiDung) {
        return <Empty description="Không có thông tin người dùng để hiển thị báo cáo." />;
    }

    const getValue = (value, defaultValue = 0, toFixed = 2) => {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue.toFixed(toFixed) : num.toFixed(toFixed);
    };

    const namHocDisplay = namHoc?.ten_nam_hoc || 'N/A';
    const giangVienDisplay = nguoiDung?.ho_ten || 'N/A';
    const maGvDisplay = nguoiDung?.ma_gv || 'N/A';
    const hocHamDisplay = nguoiDung?.hoc_ham || 'N/A';
    const hocViDisplay = nguoiDung?.hoc_vi || 'N/A';
    const boMonDisplay = nguoiDung?.boMon?.ten_bo_mon || nguoiDung?.bo_mon?.ten_bo_mon || 'N/A';

    // Dữ liệu cho bảng (ưu tiên đã duyệt nếu có)
    const isApproved = keKhaiData.trang_thai_phe_duyet === 3;
    
    const dataMucI1 = {
        dmGD: getValue(isApproved ? keKhaiData.dinhmuc_gd_apdung_duyet : keKhaiData.dinhmuc_gd_apdung),
        dmKHCN: getValue(isApproved ? keKhaiData.dinhmuc_khcn_apdung_duyet : keKhaiData.dinhmuc_khcn_apdung),
        gdThucHienKHCN: getValue(isApproved ? keKhaiData.gio_khcn_thuchien_xet_dinhmuc_duyet : keKhaiData.gio_khcn_thuchien_xet_dinhmuc_tam_tinh),
        gdCongDG: getValue(isApproved ? keKhaiData.gio_gd_danhgia_xet_dinhmuc_duyet : keKhaiData.gio_gd_danhgia_xet_dinhmuc_tam_tinh),
        gdXaTruong: getValue(isApproved ? keKhaiData.gio_gdxatruong_xet_dinhmuc_duyet : keKhaiData.gio_gdxatruong_xet_dinhmuc_tam_tinh),
        gdHoanThanhSauBuTru: getValue(isApproved ? keKhaiData.gio_gd_hoanthanh_sau_butru_duyet : keKhaiData.gio_gd_hoanthanh_sau_butru_tam_tinh),
        laConLai: getValue(isApproved ? keKhaiData.sl_huongdan_la_conlai_duyet : keKhaiData.sl_huongdan_la_conlai_tam_tinh, 0, 0),
        lvConLai: getValue(isApproved ? keKhaiData.sl_huongdan_lv_conlai_duyet : keKhaiData.sl_huongdan_lv_conlai_tam_tinh, 0, 0),
        daklConLai: getValue(isApproved ? keKhaiData.sl_huongdan_dakl_conlai_duyet : keKhaiData.sl_huongdan_dakl_conlai_tam_tinh, 0, 0),
        ghiChuBuTru: isApproved ? keKhaiData.ghi_chu_butru_duyet : keKhaiData.ghi_chu_butru_tam_tinh,
        gdVuotKhongHD: getValue(isApproved ? keKhaiData.gio_vuot_gd_khong_hd_duyet : keKhaiData.gio_vuot_gd_khong_hd_tam_tinh),
        thuaThieuCuoiCung: getValue(isApproved ? keKhaiData.ket_qua_thua_thieu_gio_gd_duyet : keKhaiData.ket_qua_thua_thieu_gio_gd_tam_tinh),
        khcnHoanThanhSoVoiDM: getValue(isApproved ? keKhaiData.gio_khcn_hoanthanh_so_voi_dinhmuc_duyet : keKhaiData.gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh)
    };

    const dataMucI2 = {
        c1: getValue(isApproved ? keKhaiData.tong_gio_khcn_kekhai_duyet : keKhaiData.tong_gio_khcn_kekhai_tam_tinh),
        c2: getValue(isApproved ? keKhaiData.tong_gio_congtackhac_quydoi_duyet : keKhaiData.tong_gio_congtackhac_quydoi_tam_tinh),
        c3: getValue(isApproved ? keKhaiData.tong_gio_coithi_chamthi_dh_duyet : keKhaiData.tong_gio_coithi_chamthi_dh_tam_tinh),
        c4: getValue(isApproved ? keKhaiData.tong_gio_gd_danhgia_duyet : keKhaiData.tong_gio_gd_danhgia_tam_tinh),
        c6: getValue(isApproved ? keKhaiData.tong_sl_huongdan_la_duyet : keKhaiData.tong_sl_huongdan_la_tam_tinh, 0, 0),
        c7: getValue(isApproved ? keKhaiData.tong_sl_huongdan_lv_duyet : keKhaiData.tong_sl_huongdan_lv_tam_tinh, 0, 0),
        c8: getValue(isApproved ? keKhaiData.tong_sl_huongdan_dakl_duyet : keKhaiData.tong_sl_huongdan_dakl_tam_tinh, 0, 0),
        c9: getValue(isApproved ? keKhaiData.tong_gio_huongdan_quydoi_duyet : keKhaiData.tong_gio_huongdan_quydoi_tam_tinh),
        c10: getValue(isApproved ? keKhaiData.tong_gio_khcn_kekhai_duyet : keKhaiData.tong_gio_khcn_kekhai_tam_tinh),
        c11: getValue(isApproved ? keKhaiData.tong_gio_giangday_final_duyet : keKhaiData.tong_gio_giangday_final_tam_tinh),
        c12: getValue(isApproved ? keKhaiData.tong_gio_gdxatruong_duyet : keKhaiData.tong_gio_gdxatruong_tam_tinh),
    };

    // Render chi tiết bảng cho từng loại hoạt động
    const renderChiTietTable = (title, dataSource, columns, icon, type) => {
        if (!dataSource || dataSource.length === 0) return null;
        
        return (
            <div className="mb-6">
                <Title level={5} style={{ color: '#003a8c', marginBottom: 16 }}>
                    <Space>{icon} {title} ({dataSource.length} mục)</Space>
                </Title>
                <Table
                    columns={columns}
                    dataSource={dataSource.map((item, index) => ({ 
                        ...item, 
                        key: item.id || `${type}-${index}`,
                        stt: index + 1
                    }))}
                    pagination={false}
                    size="small"
                    bordered
                    className="detail-table"
                    scroll={{ x: 'max-content' }}
                />
            </div>
        );
    };

    // Định nghĩa columns cho các bảng chi tiết
    const colGdLop = [
        { title: 'STT', dataIndex: 'stt', width: 50, align: 'center' },
        { title: 'Tên LHP', dataIndex: 'ten_lop_hoc_phan', ellipsis: true, width: 200 },
        { title: 'HK', dataIndex: 'hoc_ky_dien_ra', width: 60, align: 'center' },
        { title: 'Sĩ số', dataIndex: 'si_so', width: 70, align: 'center' },
        { title: 'Kỹ năng', dataIndex: 'ky_nang', width: 80, align: 'center' },
        { title: 'KLKH', dataIndex: 'kl_ke_hoach', width: 80, align: 'center' },
        { title: 'HSQĐ', dataIndex: 'he_so_qd', width: 80, align: 'center' },
        { title: 'Tiết QĐ', dataIndex: 'so_tiet_qd', width: 90, align: 'center', 
          render: (val) => <Text strong>{getValue(val)}</Text> },
    ];

    const colHdDatn = [
        { title: 'STT', dataIndex: 'stt', width: 50, align: 'center' },
        { title: 'Quyết định/Đợt', dataIndex: 'quyet_dinh_dot_hk', ellipsis: true, width: 200 },
        { title: 'SL CTTT', dataIndex: 'so_luong_sv_cttt', width: 90, align: 'center' },
        { title: 'SL Đại trà', dataIndex: 'so_luong_sv_dai_tra', width: 90, align: 'center' },
        { title: 'Tổng Giờ QĐ', dataIndex: 'tong_gio_quydoi_gv_nhap', width: 120, align: 'center',
          render: (val) => <Text strong>{getValue(val)}</Text> },
    ];

    const colDgHpTn = [
        { title: 'STT', dataIndex: 'stt', width: 50, align: 'center' },
        { title: 'Hội đồng/Đợt', dataIndex: 'hoi_dong_dot_hk', ellipsis: true, width: 150 },
        { title: 'PB1', dataIndex: 'sl_pb1', width: 60, align: 'center' },
        { title: 'PB2', dataIndex: 'sl_pb2', width: 60, align: 'center' },
        { title: 'CT', dataIndex: 'sl_ct', width: 60, align: 'center' },
        { title: 'UV', dataIndex: 'sl_uv', width: 60, align: 'center' },
        { title: 'UVTK', dataIndex: 'sl_uv_tk', width: 70, align: 'center' },
        { title: 'Giờ QĐ', dataIndex: 'tong_gio_quydoi_gv_nhap', width: 100, align: 'center',
          render: (val) => <Text strong>{getValue(val)}</Text> },
    ];

    const colKhaoThi = [
        { title: 'STT', dataIndex: 'stt', width: 50, align: 'center' },
        { title: 'Hạng mục', dataIndex: 'hang_muc', ellipsis: true, width: 150 },
        { title: 'Số Ca/Bài', dataIndex: 'so_ca_bai_mon', width: 100, align: 'center' },
        { title: 'ĐM GV Nhập', dataIndex: 'dinh_muc_gv_nhap', width: 110, align: 'center',
          render: (val) => getValue(val) },
        { title: 'Tiết QĐ', dataIndex: 'so_tiet_qd', width: 90, align: 'center',
          render: (val) => <Text strong>{getValue(val)}</Text> },
    ];

    const colXdCtdt = [
        { title: 'STT', dataIndex: 'stt', width: 50, align: 'center' },
        { title: 'Tên Hoạt động', dataIndex: 'ten_hoat_dong', ellipsis: true, width: 200 },
        { title: 'SL', dataIndex: 'so_luong_don_vi', width: 60, align: 'center' },
        { title: 'ĐVT', dataIndex: 'don_vi_tinh', width: 80, align: 'center' },
        { title: 'Giờ QĐ', dataIndex: 'tong_gio_quydoi_gv_nhap', width: 100, align: 'center',
          render: (val) => <Text strong>{getValue(val)}</Text> },
    ];

    const colNckh = [
        { title: 'STT', dataIndex: 'stt', width: 50, align: 'center' },
        { title: 'Tên HĐ/Sản phẩm', dataIndex: 'ten_hoat_dong_san_pham', ellipsis: true, width: 200 },
        { title: 'Kết quả/Quy đổi', dataIndex: 'ket_qua_dat_duoc_quy_doi', width: 180, ellipsis: true },
        { title: 'Giờ NCKH', dataIndex: 'tong_gio_nckh_gv_nhap', width: 120, align: 'center',
          render: (val) => <Text strong>{getValue(val)}</Text> },
        { title: 'Minh chứng', dataIndex: 'minhChungs', width: 120, align: 'center',
          render: (minhChungs) => minhChungs && minhChungs.length > 0 ?
            <Tag color="green" icon={<PaperClipOutlined />}>Có ({minhChungs.length})</Tag> : 
            <Tag>Không có</Tag>
        },
    ];

    const colCongTacKhac = [
        { title: 'STT', dataIndex: 'stt', width: 50, align: 'center' },
        { title: 'Tên Công tác', dataIndex: 'ten_cong_tac', ellipsis: true, width: 200 },
        { title: 'Kết quả', dataIndex: 'ket_qua_dat_duoc', width: 180, ellipsis: true },
        { title: 'Loại QĐ', dataIndex: 'loai_gio_quy_doi', width: 100, align: 'center',
          render: (type) => type === 'GD' ? <Tag color="blue">GD</Tag> : <Tag color="purple">KHCN</Tag>
        },
        { title: 'Giờ QĐ', dataIndex: 'so_gio_quy_doi_gv_nhap', width: 100, align: 'center',
          render: (val) => <Text strong>{getValue(val)}</Text> },
    ];

    return (
        <div className="print-preview-content bg-white">
            <style>{`
                .print-table-kq { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
                .print-table-kq th, .print-table-kq td { border: 1px solid #ccc; padding: 6px; text-align: center; vertical-align: middle; }
                .print-table-kq th { background-color: #f2f2f2; font-weight: bold; }
                .print-table-kq .header-row-1 th { height: 30px; }
                .print-table-kq .header-row-2 th { height: 50px; word-wrap: break-word; white-space: normal; }
                .print-table-kq .header-row-3 th { height: 20px; font-style: italic; }
                .print-table-kq .data-row td { height: 25px; }
                .print-table-kq .text-left { text-align: left; }
                .print-table-kq .font-bold { font-weight: bold; }
                
                .detail-table .ant-table-thead > tr > th {
                    background: #fafafa !important;
                    font-weight: 600 !important;
                    font-size: 12px !important;
                }
                .detail-table .ant-table-tbody > tr > td {
                    font-size: 12px !important;
                    padding: 8px !important;
                }
                .detail-table .ant-table-tbody > tr:hover > td {
                    background: #f0f8ff !important;
                }
                
                @media print {
                    body * { visibility: hidden; }
                    .print-preview-content, .print-preview-content * { visibility: visible; }
                    .print-preview-content { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 10mm; }
                }
            `}</style>

            <div className="p-6">
                {/* Header thông tin */}
                <div className="mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/50 mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Title level={3} className="mb-2 text-gray-800">
                                    BÁO CÁO KẾT QUẢ KÊ KHAI GIỜ CHUẨN NĂM HỌC {namHocDisplay}
                                </Title>
                                <div className="space-y-1">
                                    <Text className="block text-gray-600">
                                        <span className="font-medium">Giảng viên:</span> {giangVienDisplay} - 
                                        <span className="font-medium ml-2">Mã GV:</span> {maGvDisplay}
                                    </Text>
                                    <Text className="block text-gray-600">
                                        <span className="font-medium">Bộ môn:</span> {boMonDisplay}
                                    </Text>
                                    <Text className="block text-gray-600">
                                        <span className="font-medium">Học hàm:</span> {hocHamDisplay} - 
                                        <span className="font-medium ml-2">Học vị:</span> {hocViDisplay}
                                    </Text>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    <FileTextOutlined className="mr-2" />
                                    Trạng thái: {getTrangThaiTag(keKhaiData.trang_thai_phe_duyet)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bảng 1: Khối lượng vượt giờ */}
                <div className="mb-8">
                    <Title level={4} className="mb-4 text-blue-700">1. Khối lượng vượt giờ</Title>
                    <div className="overflow-x-auto">
                        <table className="print-table-kq">
                            <thead>
                                <tr className="header-row-1">
                                    <th colSpan="2">Định mức</th>
                                    <th rowSpan="2">Số tiết GD thực hiện KHCN (C3)</th>
                                    <th rowSpan="2">GD+Đgiá (C4)</th>
                                    <th rowSpan="2">Số tiết GD xa trường (C5)</th>
                                    <th colSpan="4">Khối lượng giảng dạy đã hoàn thành / SL Hướng dẫn còn lại</th>
                                </tr>
                                <tr className="header-row-2">
                                    <th>GD (C1)</th>
                                    <th>KHCN (C2)</th>
                                    <th>Số tiết GD đã HT (Sau bù trừ) (C6)</th>
                                    <th>LA còn lại (C7)</th>
                                    <th>LV còn lại (C8)</th>
                                    <th>ĐA/KL còn lại (C9)</th>
                                </tr>
                                <tr className="header-row-3">
                                    <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="data-row">
                                    <td>{dataMucI1.dmGD}</td>
                                    <td>{dataMucI1.dmKHCN}</td>
                                    <td>{dataMucI1.gdThucHienKHCN}</td>
                                    <td>{dataMucI1.gdCongDG}</td>
                                    <td>{dataMucI1.gdXaTruong}</td>
                                    <td>{dataMucI1.gdHoanThanhSauBuTru}</td>
                                    <td>{dataMucI1.laConLai}</td>
                                    <td>{dataMucI1.lvConLai}</td>
                                    <td>{dataMucI1.daklConLai}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <Text strong>Số giờ GD vượt (chỉ tính GD+ĐG, không tính HD):</Text>
                                <Text strong className={dataMucI1.gdVuotKhongHD > 0 ? 'text-green-600' : 'text-red-500'}>
                                    {dataMucI1.gdVuotKhongHD}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between">
                                <Text>Ghi chú bù trừ:</Text>
                                <Text italic className="text-gray-600">{dataMucI1.ghiChuBuTru || "Không có"}</Text>
                            </div>
                            <div className="flex items-center justify-between font-bold">
                                <Text strong>Kết quả thừa/thiếu giờ GD cuối cùng:</Text>
                                <Text strong className={dataMucI1.thuaThieuCuoiCung >= 0 ? 'text-green-600' : 'text-red-500'}>
                                    {dataMucI1.thuaThieuCuoiCung}
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bảng 2: Tổng hợp khối lượng */}
                <div className="mb-8">
                    <Title level={4} className="mb-4 text-blue-700">2. Tổng hợp khối lượng</Title>
                    <div className="overflow-x-auto">
                        <table className="print-table-kq">
                            <thead>
                                <tr className="header-row-1">
                                    <th>KHCN (P9)</th>
                                    <th>Công tác khác (P7)</th>
                                    <th>Coi chấm thi (CT đại học) - P6</th>
                                    <th colSpan="4">Công tác giảng dạy (P3)</th>
                                    <th rowSpan="2">Tổng số giờ KHCN (Cột 10)</th>
                                    <th rowSpan="2">Tổng số giờ giảng dạy (Cột 11)</th>
                                    <th rowSpan="2">Số tiết GD xa trường (Cột 12)</th>
                                </tr>
                                <tr className="header-row-2">
                                    <th>QĐ giờ KHCN (Cột 1)</th>
                                    <th>Quy đổi tiết (Cột 2)</th>
                                    <th>(Cột 3)</th>
                                    <th>Giảng dạy, đánh giá (Cột 4)</th>
                                    <th>LA (SL) (Cột 6)</th>
                                    <th>LV (SL) (Cột 7)</th>
                                    <th>ĐA/KL (SL) (Cột 8)</th>
                                    <th>Giờ Hướng dẫn QĐ (Cột 9)</th>
                                </tr>
                                <tr className="header-row-3">
                                    <th>1</th><th>2</th><th>3</th><th>4</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="data-row">
                                    <td>{dataMucI2.c1}</td>
                                    <td>{dataMucI2.c2}</td>
                                    <td>{dataMucI2.c3}</td>
                                    <td>{dataMucI2.c4}</td>
                                    <td>{dataMucI2.c6}</td>
                                    <td>{dataMucI2.c7}</td>
                                    <td>{dataMucI2.c8}</td>
                                    <td>{dataMucI2.c9}</td>
                                    <td>{dataMucI2.c10}</td>
                                    <td>{dataMucI2.c11}</td>
                                    <td>{dataMucI2.c12}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <Divider className="my-8">
                    <Title level={4} className="text-indigo-600">
                        <FileTextOutlined className="mr-2" />
                        CHI TIẾT CÁC MỤC KÊ KHAI
                    </Title>
                </Divider>

                {/* Tabs hiển thị chi tiết các hoạt động */}
                <div className="mb-6">
                    <Tabs defaultActiveKey="giang-day" type="card" size="small" className="detail-tabs">
                        <TabPane tab={<><BookOutlined /> Giảng dạy</>} key="giang-day">
                            {renderChiTietTable("Giảng dạy Lớp ĐH (Trong BM)", 
                                keKhaiData.kekhaiGdLopDhTrongbms || keKhaiData.kekhai_gd_lop_dh_trongbms || [], 
                                colGdLop, <BookOutlined />, "gd-dh-trongbm")}
                            {renderChiTietTable("Giảng dạy Lớp ĐH (Ngoài BM)", 
                                keKhaiData.kekhaiGdLopDhNgoaibms || keKhaiData.kekhai_gd_lop_dh_ngoaibms || [], 
                                colGdLop, <BookOutlined />, "gd-dh-ngoaibm")}
                            {renderChiTietTable("Giảng dạy Lớp ĐH (Ngoài CS)", 
                                keKhaiData.kekhaiGdLopDhNgoaicss || keKhaiData.kekhai_gd_lop_dh_ngoaicss || [], 
                                colGdLop, <BookOutlined />, "gd-dh-ngoaics")}
                            {renderChiTietTable("Giảng dạy Lớp Thạc sĩ", 
                                keKhaiData.kekhaiGdLopThss || keKhaiData.kekhai_gd_lop_thss || [], 
                                colGdLop, <BookOutlined />, "gd-ths")}
                            {renderChiTietTable("Giảng dạy Lớp Tiến sĩ", 
                                keKhaiData.kekhaiGdLopTss || keKhaiData.kekhai_gd_lop_tss || [], 
                                colGdLop, <BookOutlined />, "gd-ts")}
                        </TabPane>

                        <TabPane tab={<><UserSwitchOutlined /> Hướng dẫn</>} key="huong-dan">
                            {renderChiTietTable("Hướng dẫn ĐATN Đại học", 
                                keKhaiData.kekhaiHdDatnDaihoc || keKhaiData.kekhai_hd_datn_daihoc || [], 
                                colHdDatn, <UserSwitchOutlined />, "hd-datn-dh")}
                            {renderChiTietTable("Hướng dẫn LV Thạc sĩ", 
                                keKhaiData.kekhaiHdLvThacsi || keKhaiData.kekhai_hd_lv_thacsi || [], 
                                colHdDatn, <UserSwitchOutlined />, "hd-lv-ths")}
                            {renderChiTietTable("Hướng dẫn LA Tiến sĩ", 
                                keKhaiData.kekhaiHdLaTiensi || keKhaiData.kekhai_hd_la_tiensi || [], 
                                colHdDatn, <UserSwitchOutlined />, "hd-la-ts")}
                        </TabPane>

                        <TabPane tab={<><AuditOutlined /> Đánh giá</>} key="danh-gia">
                            {renderChiTietTable("Đánh giá HP Tốt nghiệp ĐH", 
                                keKhaiData.kekhaiDgHpTnDaihoc || keKhaiData.kekhai_dg_hp_tn_daihoc || [], 
                                colDgHpTn, <AuditOutlined />, "dg-hp-tn-dh")}
                            {renderChiTietTable("Đánh giá LV Thạc sĩ", 
                                keKhaiData.kekhaiDgLvThacsi || keKhaiData.kekhai_dg_lv_thacsi || [], 
                                colDgHpTn, <AuditOutlined />, "dg-lv-ths")}
                            {renderChiTietTable("Đánh giá LA Tiến sĩ", 
                                keKhaiData.kekhaiDgLaTiensi || keKhaiData.kekhai_dg_la_tiensi || [], 
                                colDgHpTn, <AuditOutlined />, "dg-la-ts")}
                        </TabPane>

                        <TabPane tab={<><CarryOutOutlined /> Khảo thí</>} key="khao-thi">
                            {renderChiTietTable("Khảo thí ĐH (Trong BM)", 
                                keKhaiData.kekhaiKhaothiDaihocTrongbms || keKhaiData.kekhai_khaothi_daihoc_trongbms || [], 
                                colKhaoThi, <CarryOutOutlined />, "kt-dh-trongbm")}
                            {renderChiTietTable("Khảo thí ĐH (Ngoài BM)", 
                                keKhaiData.kekhaiKhaothiDaihocNgoaibms || keKhaiData.kekhai_khaothi_daihoc_ngoaibms || [], 
                                colKhaoThi, <CarryOutOutlined />, "kt-dh-ngoaibm")}
                            {renderChiTietTable("Khảo thí Thạc sĩ", 
                                keKhaiData.kekhaiKhaothiThacsi || keKhaiData.kekhai_khaothi_thacsi || [], 
                                colKhaoThi, <CarryOutOutlined />, "kt-ths")}
                            {renderChiTietTable("Khảo thí Tiến sĩ", 
                                keKhaiData.kekhaiKhaothiTiensi || keKhaiData.kekhai_khaothi_tiensi || [], 
                                colKhaoThi, <CarryOutOutlined />, "kt-ts")}
                        </TabPane>

                        <TabPane tab={<><BuildOutlined /> XD CTĐT & Khác</>} key="xd-ctdt">
                            {renderChiTietTable("XD CTĐT & Hoạt động GD Khác", 
                                keKhaiData.kekhaiXdCtdtVaKhacGds || keKhaiData.kekhai_xd_ctdt_va_khac_gds || [], 
                                colXdCtdt, <BuildOutlined />, "xd-ctdt")}
                        </TabPane>

                        <TabPane tab={<><ExperimentOutlined /> NCKH</>} key="nckh">
                            {renderChiTietTable("Nghiên cứu Khoa học", 
                                keKhaiData.kekhaiNckhNamHocs || keKhaiData.kekhai_nckh_nam_hocs || [], 
                                colNckh, <ExperimentOutlined />, "nckh")}
                        </TabPane>

                        <TabPane tab={<><TeamOutlined /> Công tác khác</>} key="cong-tac-khac">
                            {renderChiTietTable("Công tác khác", 
                                keKhaiData.kekhaiCongtacKhacNamHocs || keKhaiData.kekhai_congtac_khac_nam_hocs || [], 
                                colCongTacKhac, <TeamOutlined />, "cong-tac-khac")}
                        </TabPane>
                    </Tabs>
                </div>

                {/* Hiển thị thông báo nếu không có dữ liệu chi tiết */}
                {Object.keys(keKhaiData).filter(key => 
                    (key.startsWith('kekhai') || key.includes('kekhai')) && 
                    Array.isArray(keKhaiData[key]) && 
                    keKhaiData[key].length > 0
                ).length === 0 && (
                    <div className="text-center py-12">
                        <Empty 
                            description="Chưa có dữ liệu chi tiết các hoạt động kê khai" 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                )}

                {/* Action buttons cho duyệt/từ chối */}
                {keKhaiData.trang_thai_phe_duyet === 1 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex justify-center space-x-4">
                            <Button
                                type="primary"
                                size="large"
                                icon={<CheckOutlined />}
                                onClick={onApprove}
                                loading={isLoading}
                                className="px-8 bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                            >
                                Phê duyệt kê khai
                            </Button>
                            <Button
                                danger
                                size="large"
                                icon={<CloseOutlined />}
                                onClick={onReject}
                                loading={isLoading}
                                className="px-8"
                            >
                                Từ chối kê khai
                            </Button>
                        </div>
                    </div>
                )}

                {/* Phần ký tên */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="text-center">
                            <Text strong className="block mb-2">NGƯỜI KÊ KHAI</Text>
                            <Text className="block text-sm text-gray-500 mb-8">(Ký, ghi rõ họ tên)</Text>
                            <Text strong className="text-lg">{giangVienDisplay}</Text>
                        </div>
                        <div className="text-center">
                            <Text strong className="block mb-2">TRƯỞNG BỘ MÔN</Text>
                            <Text className="block text-sm text-gray-500 mb-8">(Ký, ghi rõ họ tên)</Text>
                            <Text strong className="text-lg">
                                {keKhaiData.nguoiDuyetBm?.ho_ten || 
                                 (keKhaiData.trang_thai_phe_duyet === 3 ? "Đã duyệt" : "Chưa duyệt")}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add missing getTrangThaiTag function
const getTrangThaiTag = (status) => {
    switch (status) {
        case 0:
            return <Tag color="default">Nháp</Tag>;
        case 1:
            return <Tag color="orange">Chờ duyệt BM</Tag>;
        case 3:
            return <Tag color="green">Đã duyệt BM</Tag>;
        case 4:
            return <Tag color="red">BM Trả lại</Tag>;
        default:
            return <Tag>Không xác định</Tag>;
    }
};

// Add debounce function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

function DuyetKeKhai() {
    const [keKhaiListData, setKeKhaiListData] = useState({ data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 });
    const [namHocList, setNamHocList] = useState([]);
    const [boMonTrongKhoaList, setBoMonTrongKhoaList] = useState([]); // Đổi tên cho rõ ràng
    const [isLoading, setIsLoading] = useState(false); // Chỉ dùng 1 state loading chung
    const [selectedNamHocId, setSelectedNamHocId] = useState("");
    const [selectedBoMonId, setSelectedBoMonId] = useState("");
    const [filterTrangThai, setFilterTrangThai] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const [selectedKeKhaiIds, setSelectedKeKhaiIds] = useState([]);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [currentDetailKeKhai, setCurrentDetailKeKhai] = useState(null); // Đây sẽ là keKhaiTongHopNamHoc đầy đủ chi tiết
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectingKeKhaiId, setRejectingKeKhaiId] = useState(null);
    const [isBulkRejectModalVisible, setIsBulkRejectModalVisible] = useState(false);
    const [bulkRejectReason, setBulkRejectReason] = useState("");
    const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);


    const [managerProfile, setManagerProfile] = useState(null);

    useEffect(() => {
        fetchManagerProfileAndInitialData();
    }, []);

    const fetchManagerProfileAndInitialData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        try {
            const profileResPromise = axios.get("/api/manager/profile", { headers: { Authorization: `Bearer ${token}` } });
            const namHocResPromise = axios.get("/api/manager/nam-hoc-list", { headers: { Authorization: `Bearer ${token}` } });
            // Chỉ fetch boMonList nếu manager là Trưởng Khoa (ví dụ, nếu managerProfile.bo_mon_id là null hoặc có thuộc tính isTruongKhoa)
            // Tạm thời vẫn fetch, logic hiển thị Select Bộ môn sẽ kiểm tra sau
            const boMonResPromise = axios.get("/api/manager/bo-mon-list", { headers: { Authorization: `Bearer ${token}` } });

            const [profileRes, namHocRes, boMonRes] = await Promise.all([profileResPromise, namHocResPromise, boMonResPromise]);
            
            setManagerProfile(profileRes.data);
            const nhs = namHocRes.data || [];
            setNamHocList(nhs);
            setBoMonTrongKhoaList(boMonRes.data || []);

            const currentNamHoc = nhs.find(nh => nh.la_nam_hien_hanh === 1);
            const initialNamHocId = currentNamHoc ? currentNamHoc.id.toString() : (nhs.length > 0 ? nhs[0].id.toString() : "");
            setSelectedNamHocId(initialNamHocId);
            if (initialNamHocId) {
                 fetchKeKhaiList(1, initialNamHocId, filterTrangThai, searchTerm, selectedBoMonId);
            } else {
                setIsLoading(false); // Không có năm học nào thì không fetch list
            }

        } catch (error) {
            message.error("Lỗi tải dữ liệu ban đầu cho quản lý.");
            console.error("Lỗi tải dữ liệu ban đầu:", error);
            setIsLoading(false);
        }
    };

    const fetchKeKhaiList = useCallback(async (page = 1, namHocIdForFetch = selectedNamHocId, trangThaiForFetch = filterTrangThai, searchForFetch = searchTerm, boMonIdForFetch = selectedBoMonId) => {
        if (!managerProfile) return; // Đảm bảo có thông tin manager

        setIsLoading(true);
        const token = localStorage.getItem("token");
        try {
            const params = {
                page,
                per_page: pagination.pageSize,
                nam_hoc_id: namHocIdForFetch,
                trang_thai: trangThaiForFetch,
                search: searchForFetch,
            };
            // Nếu manager là trưởng khoa, họ có thể lọc theo bộ môn.
            // Giả sử vai trò trưởng khoa có 1 bo_mon_id đặc biệt hoặc không có bo_mon_id
            if (managerProfile && managerProfile.bo_mon_id && boMonIdForFetch) { // Chỉ gửi bo_mon_id nếu manager là trưởng khoa và đã chọn
                 params.bo_mon_id = boMonIdForFetch;
            }


            const response = await axios.get("/api/manager/ke-khai", {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            setKeKhaiListData(response.data.ke_khai_list || { data: [], current_page: 1, last_page: 1, total: 0 });
             if (response.data.bo_mon_list) { // Cập nhật lại danh sách bộ môn nếu API trả về
                setBoMonTrongKhoaList(response.data.bo_mon_list);
            }
            setPagination(prev => ({
                ...prev,
                current: response.data.ke_khai_list.current_page || 1,
                total: response.data.ke_khai_list.total || 0,
            }));
        } catch (error) {
            message.error(error.response?.data?.message || "Không thể tải danh sách kê khai.");
        } finally {
            setIsLoading(false);
        }
    }, [managerProfile, selectedNamHocId, filterTrangThai, searchTerm, selectedBoMonId, pagination.pageSize]);


    useEffect(() => {
        if (managerProfile) { // Đảm bảo managerProfile đã được load
            fetchKeKhaiList(1);
        }
    }, [selectedNamHocId, filterTrangThai, selectedBoMonId]); // Không bao gồm searchTerm

    // Fix the debounced search handler
    const handleSearchDebounced = useCallback(
        debounce(() => {
            if (managerProfile) {
                fetchKeKhaiList(1);
            }
        }, 500),
        [managerProfile, fetchKeKhaiList]
    );

    useEffect(() => {
        if (searchTerm !== undefined) { // Check if searchTerm is defined
            handleSearchDebounced();
        }
    }, [searchTerm, handleSearchDebounced]);


    const handleApprove = async (id) => {
        const token = localStorage.getItem("token");
        message.loading({ content: 'Đang xử lý phê duyệt...', key: `approve-${id}` });
        try {
            // Gọi lại service để tính toán trước khi duyệt
            await axios.post(`/api/manager/ke-khai/${id}/recalculate-before-approve`, {}, { // API mới
                 headers: { Authorization: `Bearer ${token}` }
            });

            await axios.post(`/api/manager/ke-khai/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success({ content: 'Phê duyệt kê khai thành công!', key: `approve-${id}`, duration: 2 });
            fetchKeKhaiList(pagination.current);
            setSelectedKeKhaiIds(prev => prev.filter(selectedId => selectedId !== id));
            if (currentDetailKeKhai && currentDetailKeKhai.id === id) {
                 // Tải lại chi tiết nếu đang xem
                handleViewDetail(id, true); // Thêm tham số để biết là refresh
            }
        } catch (error) {
            message.error({ content: error.response?.data?.message || "Lỗi khi phê duyệt.", key: `approve-${id}`, duration: 2 });
        }
    };

    const handleShowRejectModal = (id) => {
        setRejectingKeKhaiId(id);
        setRejectReason(""); // Reset lý do
        setIsRejectModalVisible(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectReason.trim()) {
            message.warning("Vui lòng nhập lý do từ chối.");
            return;
        }
        if (!rejectingKeKhaiId) return;

        const token = localStorage.getItem("token");
        message.loading({ content: 'Đang xử lý từ chối...', key: `reject-${rejectingKeKhaiId}` });
        try {
            await axios.post(`/api/manager/ke-khai/${rejectingKeKhaiId}/reject`,
                { ly_do_tu_choi: rejectReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success({ content: 'Đã từ chối kê khai!', key: `reject-${rejectingKeKhaiId}`, duration: 2 });
            fetchKeKhaiList(pagination.current);
            setSelectedKeKhaiIds(prev => prev.filter(id => id !== rejectingKeKhaiId));
             if (currentDetailKeKhai && currentDetailKeKhai.id === rejectingKeKhaiId) {
                // Tải lại chi tiết nếu đang xem
                handleViewDetail(rejectingKeKhaiId, true);
            }
            setIsRejectModalVisible(false);
            setRejectReason("");
            setRejectingKeKhaiId(null);
        } catch (error) {
            message.error({ content: error.response?.data?.message || "Lỗi khi từ chối kê khai.", key: `reject-${rejectingKeKhaiId}`, duration: 2 });
        }
    };

    const handleBulkApprove = async () => {
        const itemsToApprove = selectedKeKhaiIds.filter(id => {
            const item = keKhaiListData.data.find(k => k.id === id);
            return item && item.trang_thai_phe_duyet === 1;
        });
        if (itemsToApprove.length === 0) {
            message.info("Vui lòng chọn các kê khai ở trạng thái 'Chờ duyệt BM'.");
            return;
        }
        const token = localStorage.getItem("token");
        message.loading({ content: `Đang phê duyệt ${itemsToApprove.length} mục...`, key: 'bulkApprove' });
        try {
             // Gọi recalculate cho từng mục trước
            for (const id of itemsToApprove) {
                 await axios.post(`/api/manager/ke-khai/${id}/recalculate-before-approve`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            const response = await axios.post('/api/manager/ke-khai/bulk-approve',
                { ke_khai_ids: itemsToApprove },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success({ content: response.data.message || 'Phê duyệt hàng loạt thành công!', key: 'bulkApprove', duration: 3 });
            fetchKeKhaiList(pagination.current);
            setSelectedKeKhaiIds([]);
        } catch (error) {
            message.error({ content: error.response?.data?.message || "Lỗi khi phê duyệt hàng loạt.", key: 'bulkApprove', duration: 3 });
        }
    };

    const handleShowBulkRejectModal = () => {
        const itemsToReject = selectedKeKhaiIds.filter(id => {
            const item = keKhaiListData.data.find(k => k.id === id);
            return item && item.trang_thai_phe_duyet === 1;
        });
        if (itemsToReject.length === 0) {
            message.info("Vui lòng chọn các kê khai ở trạng thái 'Chờ duyệt BM' để từ chối.");
            return;
        }
        setBulkRejectReason("");
        setIsBulkRejectModalVisible(true);
    };

    const handleConfirmBulkReject = async () => {
        if (!bulkRejectReason.trim()) { message.warning("Vui lòng nhập lý do từ chối hàng loạt."); return; }
        const itemsToReject = selectedKeKhaiIds.filter(id => {
            const item = keKhaiListData.data.find(k => k.id === id);
            return item && item.trang_thai_phe_duyet === 1;
        });
        if (itemsToReject.length === 0) return;

        const token = localStorage.getItem("token");
        message.loading({ content: `Đang từ chối ${itemsToReject.length} mục...`, key: 'bulkReject' });
        try {
            const response = await axios.post('/api/manager/ke-khai/bulk-reject',
                { ke_khai_ids: itemsToReject, ly_do_tu_choi: bulkRejectReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success({ content: response.data.message || 'Từ chối hàng loạt thành công!', key: 'bulkReject', duration: 3 });
            fetchKeKhaiList(pagination.current);
            setSelectedKeKhaiIds([]);
            setIsBulkRejectModalVisible(false);
            setBulkRejectReason("");
        } catch (error) {
            message.error({ content: error.response?.data?.message || "Lỗi khi từ chối hàng loạt.", key: 'bulkReject', duration: 3 });
        }
    };

    const handleSendNotification = async (values) => {
        const token = localStorage.getItem("token");
        message.loading({content: 'Đang gửi thông báo...', key: 'sendNotif'});
        try {
            const response = await axios.post('/api/manager/notifications/send', values, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success({content: response.data.message || "Gửi thông báo thành công!", key: 'sendNotif', duration: 2});
            setIsNotificationModalVisible(false);
        } catch (error) {
            message.error({content: error.response?.data?.message || "Lỗi gửi thông báo.", key: 'sendNotif', duration: 2});
        }
    };


    const handleViewDetail = async (id, isRefresh = false) => {
        if (!isRefresh) {
            message.loading({ content: 'Đang tải chi tiết kê khai...', key: 'viewDetail' });
        }
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`/api/manager/ke-khai/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('API Response:', response.data); // Debug log
            
            setCurrentDetailKeKhai(response.data);
            if (!isRefresh) {
                setIsDetailModalVisible(true);
                message.success({ content: 'Tải chi tiết thành công!', key: 'viewDetail', duration: 1 });
            }
        } catch (error) {
            console.error("Lỗi tải chi tiết kê khai:", error);
            if (!isRefresh) {
                message.error({ content: "Không thể tải chi tiết kê khai.", key: 'viewDetail', duration: 2 });
            }
        }
    };

    // Add missing modal handlers
    const handleModalApprove = async () => {
        if (!currentDetailKeKhai?.id) return;
        await handleApprove(currentDetailKeKhai.id);
        setIsDetailModalVisible(false);
    };

    const handleModalReject = () => {
        if (!currentDetailKeKhai?.id) return;
        setIsDetailModalVisible(false);
        handleShowRejectModal(currentDetailKeKhai.id);
    };
    
    const onTableChange = (newPagination) => {
        fetchKeKhaiList(newPagination.current); // pageSize đã được set trong state pagination
    };

    const columns = [
        {
            title: (
                <div className="flex items-center space-x-2 text-gray-700">
                    <UserOutlined className="text-sm opacity-70" />
                    <span className="font-semibold">Thông tin Giảng viên</span>
                </div>
            ), 
            dataIndex: 'nguoi_dung', 
            key: 'nguoi_dung', 
            width: 280, 
            fixed: 'left',
            render: (nguoiDung) => (
                <div className="py-2 px-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-600">
                                {nguoiDung?.ho_ten?.charAt(0) || 'N'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                {nguoiDung?.ho_ten || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                                {nguoiDung?.ma_gv || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                                {nguoiDung?.bo_mon?.ten_bo_mon || 'N/A'}
                            </div>
                            {(nguoiDung?.hoc_ham || nguoiDung?.hoc_vi) && (
                                <div className="flex space-x-1 mt-1">
                                    {nguoiDung?.hoc_ham && (
                                        <span className="inline-block px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded border">
                                            {nguoiDung.hoc_ham}
                                        </span>
                                    )}
                                    {nguoiDung?.hoc_vi && (
                                        <span className="inline-block px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded border">
                                            {nguoiDung.hoc_vi}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: (
                <div className="flex items-center space-x-2 text-gray-700">
                    <CalendarOutlined className="text-sm opacity-70" />
                    <span className="font-semibold">Năm học</span>
                </div>
            ), 
            dataIndex: ['namHoc', 'ten_nam_hoc'], 
            key: 'namHoc', 
            width: 120, 
            align: 'center',
            render: (text) => (
                <div className="text-center py-2">
                    <div className="text-sm font-medium text-gray-800">{text || 'N/A'}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Academic Year</div>
                </div>
            )
        },
        {
            title: (
                <div className="flex items-center space-x-2 text-gray-700">
                    <BookOutlined className="text-sm opacity-70" />
                    <span className="font-semibold">ĐM GD</span>
                </div>
            ), 
            dataIndex: 'dinhmuc_gd_apdung', 
            key: 'dinhmuc_gd_apdung', 
            width: 110, 
            align: 'center',
            render: (text, record) => {
                const value = parseFloat(record.trang_thai_phe_duyet === 3 ? 
                    record.dinhmuc_gd_apdung_duyet : record.dinhmuc_gd_apdung || 0);
                return (
                    <div className="text-center py-2">
                        <div className="text-lg font-bold text-gray-800 mb-0.5">
                            {value.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-400">giờ chuẩn</div>
                        <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mt-1 overflow-hidden">
                            <div 
                                className="h-full bg-blue-400 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${Math.min((value / 400) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: (
                <div className="flex items-center space-x-2 text-gray-700">
                    <ExperimentOutlined className="text-sm opacity-70" />
                    <span className="font-semibold">ĐM KHCN</span>
                </div>
            ), 
            dataIndex: 'dinhmuc_khcn_apdung', 
            key: 'dinhmuc_khcn_apdung', 
            width: 110, 
            align: 'center',
            render: (text, record) => {
                const value = parseFloat(record.trang_thai_phe_duyet === 3 ? 
                    record.dinhmuc_khcn_apdung_duyet : record.dinhmuc_khcn_apdung || 0);
                return (
                    <div className="text-center py-2">
                        <div className="text-lg font-bold text-gray-800 mb-0.5">
                            {value.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-400">giờ KHCN</div>
                        <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mt-1 overflow-hidden">
                            <div 
                                className="h-full bg-purple-400 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${Math.min((value / 300) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: (
                <div className="flex items-center space-x-2 text-gray-700">
                    <ClockCircleOutlined className="text-sm opacity-70" />
                    <span className="font-semibold">Tổng thực hiện</span>
                </div>
            ), 
            dataIndex: 'tong_gio_thuc_hien_final_duyet', 
            key: 'tong_gio_final', 
            width: 140, 
            align: 'center',
            render: (text, record) => {
                const value = parseFloat(record.trang_thai_phe_duyet === 3 ? 
                    text : record.tong_gio_thuc_hien_final_tam_tinh || 0);
                const isDraft = record.trang_thai_phe_duyet !== 3;
                return (
                    <div className="text-center py-2">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                            <div className={`w-2 h-2 rounded-full ${isDraft ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                            <div className="text-lg font-bold text-gray-800">
                                {value.toFixed(2)}
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">tổng giờ</div>
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${
                            isDraft ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                            {isDraft ? 'Tạm tính' : 'Đã duyệt'}
                        </span>
                    </div>
                );
            }
        },
        {
            title: (
                <div className="flex items-center space-x-2 text-gray-700">
                    <SyncOutlined className="text-sm opacity-70" />
                    <span className="font-semibold">Chênh lệch GD</span>
                </div>
            ), 
            dataIndex: 'ket_qua_thua_thieu_gio_gd_duyet', 
            key: 'thua_thieu_gd', 
            width: 140, 
            align: 'center',
            render: (text, record) => {
                const value = parseFloat(record.trang_thai_phe_duyet === 3 ? 
                    text : record.ket_qua_thua_thieu_gio_gd_tam_tinh || 0);
                const isPositive = value >= 0;
                return (
                    <div className="text-center py-2">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                            <div className={`text-sm ${isPositive ? '↗️' : '↘️'}`}></div>
                            <div className={`text-lg font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                {value >= 0 ? '+' : ''}{value.toFixed(2)}
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">giờ chênh lệch</div>
                        <div className="w-16 h-1 bg-gray-100 rounded-full mx-auto overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                    isPositive ? 'bg-emerald-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${Math.min(Math.abs(value) / 50 * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: (
                <div className="flex items-center space-x-2 text-gray-700">
                    <CalendarOutlined className="text-sm opacity-70" />
                    <span className="font-semibold">Thời gian gửi</span>
                </div>
            ), 
            dataIndex: 'thoi_gian_gui', 
            key: 'thoi_gian_gui', 
            width: 140, 
            align: 'center',
            render: (text) => {
                if (!text) {
                    return (
                        <div className="text-center py-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                                <ClockCircleOutlined className="text-gray-400 text-xs" />
                            </div>
                            <span className="inline-block px-2 py-0.5 text-xs bg-gray-50 text-gray-500 rounded border">
                                Chưa gửi
                            </span>
                        </div>
                    );
                }
                return (
                    <div className="text-center py-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-full mx-auto mb-2 flex items-center justify-center border border-blue-100">
                            <CalendarOutlined className="text-blue-500 text-xs" />
                        </div>
                        <div className="text-sm font-medium text-gray-800 mb-0.5">
                            {moment(text).format('DD/MM/YYYY')}
                        </div>
                        <div className="text-xs text-gray-400">
                            {moment(text).format('HH:mm')}
                        </div>
                    </div>
                );
            }
        },
        {
            title: (
                <div className="flex items-center space-x-2 text-gray-700">
                    <CheckOutlined className="text-sm opacity-70" />
                    <span className="font-semibold">Trạng thái</span>
                </div>
            ), 
            dataIndex: 'trang_thai_phe_duyet', 
            key: 'trang_thai_phe_duyet', 
            width: 140, 
            align: 'center', 
            fixed: 'right',
            render: (status) => {
                const statusConfig = {
                    0: { 
                        color: 'gray', 
                        bg: 'bg-gray-50', 
                        text: 'text-gray-700', 
                        border: 'border-gray-200',
                        icon: '📝', 
                        label: 'Nháp'
                    },
                    1: { 
                        color: 'orange', 
                        bg: 'bg-orange-50', 
                        text: 'text-orange-700', 
                        border: 'border-orange-200',
                        icon: '⏰', 
                        label: 'Chờ duyệt BM'
                    },
                    3: { 
                        color: 'emerald', 
                        bg: 'bg-emerald-50', 
                        text: 'text-emerald-700', 
                        border: 'border-emerald-200',
                        icon: '✅', 
                        label: 'Đã duyệt BM'
                    },
                    4: { 
                        color: 'red', 
                        bg: 'bg-red-50', 
                        text: 'text-red-700', 
                        border: 'border-red-200',
                        icon: '❌', 
                        label: 'BM Trả lại'
                    }
                };
                
                const config = statusConfig[status] || statusConfig[0];
                
                return (
                    <div className="text-center py-2">
                        <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.bg} ${config.text} ${config.border}`}>
                            <span className="text-sm">{config.icon}</span>
                            <span className="text-xs font-medium">{config.label}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            title: (
                <div className="flex items-center space-x-2 text-gray-700">
                    <SettingOutlined className="text-sm opacity-70" />
                    <span className="font-semibold">Thao tác</span>
                </div>
            ), 
            key: 'action', 
            width: 160, 
            align: 'center', 
            fixed: 'right',
            render: (_, record) => (
                <div className="py-2 px-2">
                    <div className="flex flex-col space-y-1.5">
                        <Tooltip title="Xem chi tiết đầy đủ">
                            <Button 
                                icon={<EyeOutlined />} 
                                onClick={() => handleViewDetail(record.id)} 
                                size="small"
                                className="w-full h-7 text-xs font-medium bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                                style={{ borderRadius: '6px' }}
                            >
                                Chi tiết
                            </Button>
                        </Tooltip>
                        {record.trang_thai_phe_duyet === 1 && (
                            <div className="flex space-x-1">
                                <Tooltip title="Phê duyệt">
                                    <Button 
                                        icon={<CheckOutlined />} 
                                        onClick={() => handleApprove(record.id)} 
                                        size="small" 
                                        className="flex-1 h-7 text-xs font-medium bg-white border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200"
                                        style={{ borderRadius: '6px' }}
                                    >
                                        Duyệt
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Từ chối">
                                    <Button 
                                        icon={<CloseOutlined />} 
                                        onClick={() => handleShowRejectModal(record.id)} 
                                        size="small"
                                        className="flex-1 h-7 text-xs font-medium bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                        style={{ borderRadius: '6px' }}
                                    >
                                        Từ chối
                                    </Button>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    ];


    return (
         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
            {/* Enhanced animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/8 to-indigo-400/8 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 p-6 space-y-6">
                {/* Enhanced Header with glass morphism */}
                <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10" style={{ borderRadius: '24px' }}>
                    <div className="relative overflow-hidden bg-gradient-to-r from-slate-50/90 via-blue-50/60 to-indigo-50/90 px-8 py-6 -mx-6 -mt-6 mb-8 rounded-t-3xl border-b border-gray-200/50">
                        {/* Header decoration */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                        
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center space-x-8">
                                <div className="relative group">
                                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-all duration-500 ease-out">
                                        <FileTextOutlined className="text-3xl text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full border-3 border-white shadow-lg animate-bounce"></div>
                                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full border-2 border-white shadow-md"></div>
                                </div>
                                <div className="space-y-3">
                                    <Title level={1} style={{ margin: 0 }} className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 bg-clip-text text-transparent">
                                        Quản lý & Duyệt Kê khai
                                    </Title>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                                            <Text type="secondary" className="text-base">
                                                Hệ thống phê duyệt và quản lý kê khai khối lượng công việc
                                            </Text>
                                        </div>
                                        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-full border border-blue-200/50">
                                            <DashboardOutlined className="text-blue-500 text-sm" />
                                            <Text className="text-sm font-medium text-gray-700">
                                                Manager Dashboard
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <Button 
                                    icon={<SyncOutlined />} 
                                    onClick={() => fetchKeKhaiList(pagination.current)} 
                                    loading={isLoading}
                                    size="large"
                                    className="bg-white/80 border-blue-200/60 hover:border-blue-400 hover:bg-blue-50/80 shadow-lg hover:shadow-xl transition-all duration-300"
                                    style={{ borderRadius: '12px' }}
                                >
                                    Làm mới
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Filters Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <FilterOutlined className="text-white text-sm" />
                                                               </div>
                                <Title level={4} className="mb-0 text-gray-800">
                                    Bộ lọc & Tìm kiếm
                                </Title>
                            </div>
                        </div>

                        <Row gutter={[20, 20]} align="bottom">
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item label={
                                    <span className="flex items-center space-x-2 font-medium text-gray-700">
                                        <CalendarOutlined className="text-blue-500" />
                                        <span>Năm học</span>
                                    </span>
                                } style={{marginBottom: 0}}>
                                    <Select
                                        value={selectedNamHocId}
                                        onChange={setSelectedNamHocId}
                                        placeholder="Tất cả năm học"
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                        loading={isLoading && !namHocList.length}
                                        className="custom-select"
                                    >
                                        {namHocList.map(nh => (
                                            <Select.Option key={nh.id} value={nh.id.toString()}>
                                                <div className="flex items-center justify-between">
                                                    <span>{nh.ten_nam_hoc}</span>
                                                    {nh.la_nam_hien_hanh && (
                                                        <Tag color="green" size="small">Hiện tại</Tag>
                                                    )}
                                                </div>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            
                            {/* Bộ lọc bộ môn chỉ hiển thị cho Trưởng Khoa */}
                            {managerProfile && !managerProfile.bo_mon_id && boMonTrongKhoaList.length > 0 && (
                                 <Col xs={24} sm={12} md={6}>
                                    <Form.Item label={
                                        <span className="flex items-center space-x-2 font-medium text-gray-700">
                                            <TeamOutlined className="text-green-500" />
                                            <span>Bộ môn</span>
                                        </span>
                                    } style={{marginBottom: 0}}>
                                        <Select
                                            value={selectedBoMonId}
                                            onChange={setSelectedBoMonId}
                                            placeholder="Tất cả bộ môn"
                                            style={{ width: '100%' }}
                                            size="large"
                                            allowClear
                                            className="custom-select"
                                        >
                                            {boMonTrongKhoaList.map(bm => (
                                                <Select.Option key={bm.id} value={bm.id.toString()}>
                                                    {bm.ten_bo_mon}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            )}
                            
                            <Col xs={24} sm={12} md={managerProfile && !managerProfile.bo_mon_id ? 6 : 8}>
                                <Form.Item label={
                                    <span className="flex items-center space-x-2 font-medium text-gray-700">
                                        <ClockCircleOutlined className="text-orange-500" />
                                        <span>Trạng thái</span>
                                    </span>
                                } style={{marginBottom: 0}}>
                                    <Select
                                        value={filterTrangThai}
                                        onChange={setFilterTrangThai}
                                        placeholder="Tất cả trạng thái"
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                        className="custom-select"
                                    >
                                         <Select.Option value="">
                                            <span className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                <span>Tất cả</span>
                                            </span>
                                        </Select.Option>
                                        <Select.Option value="0">
                                            <span className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                                <span>Nháp</span>
                                            </span>
                                        </Select.Option>
                                        <Select.Option value="1">
                                            <span className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                <span>Chờ duyệt BM</span>
                                            </span>
                                        </Select.Option>
                                        <Select.Option value="3">
                                            <span className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span>Đã duyệt BM</span>
                                            </span>
                                        </Select.Option>
                                        <Select.Option value="4">
                                            <span className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                <span>BM Trả lại</span>
                                            </span>
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            
                            <Col xs={24} sm={12} md={managerProfile && !managerProfile.bo_mon_id ? 6 : 8}>
                                 <Form.Item label={
                                    <span className="flex items-center space-x-2 font-medium text-gray-700">
                                        <SearchOutlined className="text-purple-500" />
                                        <span>Tìm kiếm</span>
                                    </span>
                                } style={{marginBottom: 0}}>
                                    <Input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Tên hoặc Mã GV..."
                                        size="large"
                                        prefix={<SearchOutlined className="text-gray-400" />}
                                        allowClear
                                        className="custom-input"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                     
                     <Divider className="border-gray-200/60" />
                     
                     {/* Enhanced Action Section */}
                     <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <CheckOutlined className="text-white text-sm" />
                                </div>
                                <Title level={4} className="mb-0 text-gray-800">
                                    Thao tác hàng loạt
                                </Title>
                            </div>
                            <Text type="secondary" className="text-sm">
                                Đã chọn {selectedKeKhaiIds.length} mục
                            </Text>
                        </div>

                        <Space className="flex-wrap" size="middle">
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={handleBulkApprove}
                                disabled={selectedKeKhaiIds.filter(id => {
                                    const item = keKhaiListData.data.find(k => k.id === id);
                                    return item && item.trang_thai_phe_duyet === 1;
                                }).length === 0 || isLoading}
                                size="large"
                                className="bg-gradient-to-r from-green-500 to-emerald-600 border-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                style={{ borderRadius: '12px' }}
                            >
                                <span className="font-medium">
                                    Duyệt mục đã chọn ({selectedKeKhaiIds.filter(id => {
                                        const item = keKhaiListData.data.find(k => k.id === id);
                                        return item && item.trang_thai_phe_duyet === 1;
                                    }).length})
                                </span>
                            </Button>
                            
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                onClick={handleShowBulkRejectModal}
                                 disabled={selectedKeKhaiIds.filter(id => {
                                    const item = keKhaiListData.data.find(k => k.id === id);
                                    return item && item.trang_thai_phe_duyet === 1;
                                }).length === 0 || isLoading}
                                size="large"
                                className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                style={{ borderRadius: '12px' }}
                            >
                                <span className="font-medium">
                                    Từ chối mục đã chọn ({selectedKeKhaiIds.filter(id => {
                                        const item = keKhaiListData.data.find(k => k.id === id);
                                        return item && item.trang_thai_phe_duyet === 1;
                                    }).length})
                                </span>
                            </Button>
                            
                            <Button 
                                icon={<MailOutlined />} 
                                onClick={() => setIsNotificationModalVisible(true)} 
                                size="large"
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                style={{ borderRadius: '12px' }}
                            >
                                <span className="font-medium">Gửi thông báo</span>
                            </Button>
                        </Space>
                    </div>

                    {/* Enhanced Table */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
                        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200/60">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                                        <FileTextOutlined className="text-gray-600 text-sm" />
                                    </div>
                                    <Title level={4} className="mb-0 text-gray-800">
                                        Danh sách Kê khai ({keKhaiListData.total} mục)
                                    </Title>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span>Hiển thị {keKhaiListData.from || 0} - {keKhaiListData.to || 0}</span>
                                </div>
                            </div>
                        </div>
                        
                        <Table
                            columns={columns}
                            dataSource={keKhaiListData.data}
                            rowKey="id"
                            loading={isLoading}
                            pagination={false}
                            bordered={false}
                            scroll={{ x: 1500, y: 600 }}
                            rowSelection={{
                                selectedRowKeys: selectedKeKhaiIds,
                                onChange: (selectedRowKeys) => setSelectedKeKhaiIds(selectedRowKeys),
                                getCheckboxProps: (record) => ({
                                    disabled: record.trang_thai_phe_duyet !== 1,
                                }),
                            }}
                            className="elegant-table"
                            size="middle"
                            showHeader={true}
                        />
                        
                        {keKhaiListData.total > keKhaiListData.per_page && (
                            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200/60">
                                <Pagination
                                    current={keKhaiListData.current_page}
                                    pageSize={keKhaiListData.per_page}
                                    total={keKhaiListData.total}
                                    onChange={onTableChange}
                                    showSizeChanger={false}
                                    showQuickJumper
                                    showTotal={(total, range) => (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                            <Text type="secondary" className="text-sm font-medium">
                                                Hiển thị {range[0]}-{range[1]} của {total} kê khai
                                            </Text>
                                        </div>
                                    )}
                                    className="refined-pagination"
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Enhanced Modal */}
                <Modal
                    title={
                        <div className="text-center pb-4 border-b border-gray-100">
                            <div className="flex items-center justify-center space-x-4 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <FileTextOutlined className="text-white text-lg" />
                                </div>
                                <Title level={3} style={{ margin: 0 }} className="text-gray-800">
                                    Chi tiết Kê khai & Báo cáo
                                </Title>
                            </div>
                            <Text type="secondary" className="text-base">
                                Xem xét chi tiết trước khi phê duyệt
                            </Text>
                        </div>
                    }
                    open={isDetailModalVisible}
                    onCancel={() => setIsDetailModalVisible(false)}
                    width="95%"
                    style={{ top: 20, maxWidth: '1600px' }}
                    footer={[
                        <Button 
                            key="close" 
                            onClick={() => setIsDetailModalVisible(false)} 
                            size="large"
                            className="px-8 shadow-md hover:shadow-lg transition-all duration-300"
                            style={{ borderRadius: '10px' }}
                        >
                            Đóng
                        </Button>
                    ]}
                    destroyOnClose
                    className="detail-modal-enhanced"
                >
                    {currentDetailKeKhai ? 
                        <BaoCaoKeKhaiPreviewManager 
                            keKhaiData={currentDetailKeKhai} 
                            onApprove={handleModalApprove}
                            onReject={handleModalReject}
                            isLoading={isLoading}
                        /> : 
                        <div className="flex justify-center items-center h-96">
                            <div className="text-center space-y-4">
                                <Spin size="large" />
                                <Text className="text-lg text-gray-600">Đang tải chi tiết kê khai...</Text>
                            </div>
                        </div>
                    }
                </Modal>

                {/* Existing modals for reject and bulk operations */}
                <Modal
                    title={
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <CloseOutlined className="text-red-500" />
                            </div>
                            <div>
                                <Title level={4} className="mb-0 text-gray-800">Lý do từ chối kê khai</Title>
                                <Text type="secondary" className="text-sm">Vui lòng nhập lý do cụ thể</Text>
                            </div>
                        </div>
                    }
                    open={isRejectModalVisible}
                    onOk={handleConfirmReject}
                    onCancel={() => { setIsRejectModalVisible(false); setRejectReason(""); setRejectingKeKhaiId(null);}}
                    okText="Xác nhận Từ chối"
                    cancelText="Hủy"
                    confirmLoading={isLoading}
                    className="custom-modal"
                >
                    <Form layout="vertical" className="mt-4">
                        <Form.Item label="Nhập lý do từ chối:" required>
                            <TextArea 
                                rows={4} 
                                value={rejectReason} 
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Nhập lý do cụ thể tại sao từ chối kê khai này..."
                                className="custom-textarea"
                            />
                        </Form.Item>
                    </Form>
                </Modal>
                
                <Modal
                    title={
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <CloseOutlined className="text-red-500" />
                            </div>
                            <div>
                                <Title level={4} className="mb-0 text-gray-800">Lý do từ chối hàng loạt</Title>
                                <Text type="secondary" className="text-sm">Áp dụng cho tất cả mục đã chọn</Text>
                            </div>
                        </div>
                    }
                    open={isBulkRejectModalVisible}
                    onOk={handleConfirmBulkReject}
                    onCancel={() => { setIsBulkRejectModalVisible(false); setBulkRejectReason("");}}
                    okText="Xác nhận Từ chối hàng loạt"
                    cancelText="Hủy"
                    confirmLoading={isLoading}
                    className="custom-modal"
                >
                     <Form layout="vertical" className="mt-4">
                        <Form.Item label="Nhập lý do từ chối cho các mục đã chọn:" required>
                            <TextArea 
                                rows={4} 
                                value={bulkRejectReason} 
                                onChange={(e) => setBulkRejectReason(e.target.value)}
                                placeholder="Nhập lý do chung cho việc từ chối các kê khai đã chọn..."
                                className="custom-textarea"
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Send Notification Modal */}
                <SendNotificationModal 
                    open={isNotificationModalVisible} 
                    onConfirm={handleSendNotification} 
                    onCancel={() => setIsNotificationModalVisible(false)} 
                    namHocList={namHocList}
                    isLoading={isLoading}
                />

                {/* Enhanced Custom Styles */}
                <style>{`
                    /* Enhanced Modal Styling */
                    .detail-modal-enhanced .ant-modal-content {
                        border-radius: 24px !important;
                        overflow: hidden !important;
                        box-shadow: 0 32px 64px rgba(0, 0, 0, 0.12) !important;
                        backdrop-filter: blur(16px) !important;
                        background: rgba(255, 255, 255, 0.95) !important;
                    }
                    
                    .detail-modal-enhanced .ant-modal-header {
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%) !important;
                        border: none !important;
                        padding: 32px 32px 0 32px !important;
                    }
                    
                    .detail-modal-enhanced .ant-modal-body {
                        padding: 0 !important;
                        max-height: calc(90vh - 140px) !important;
                        overflow-y: auto !important;
                    }
                    
                    .detail-modal-enhanced .ant-modal-footer {
                        border: none !important;
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%) !important;
                        padding: 20px 32px 32px 32px !important;
                    }

                    /* Custom Modal Styling */
                    .custom-modal .ant-modal-content {
                        border-radius: 20px !important;
                        overflow: hidden !important;
                        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15) !important;
                    }
                    
                    .custom-modal .ant-modal-header {
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                        border: none !important;
                        padding: 24px !important;
                    }
                    
                    .custom-modal .ant-modal-body {
                        padding: 24px !important;
                    }

                    /* Elegant Table Styling */
                    .elegant-table {
                        background: transparent !important;
                    }
                    
                    .elegant-table .ant-table-container {
                        background: transparent !important;
                    }
                    
                    .elegant-table .ant-table-content {
                        background: transparent !important;
                    }

                    .elegant-table .ant-table-thead > tr > th {
                        background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
                        border: none !important;
                        border-bottom: 1px solid #e2e8f0 !important;
                        font-weight: 600 !important;
                        font-size: 13px !important;
                        color: #374151 !important;
                        padding: 16px 12px !important;
                        position: relative !important;
                        white-space: nowrap !important;
                    }

                    .elegant-table .ant-table-thead > tr > th::before {
                        content: '';
                        position: absolute;
                        bottom: -1px;
                        left: 0;
                        width: 100%;
                        height: 1px;
                        background: linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%);
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    }

                    .elegant-table .ant-table-thead > tr > th:hover::before {
                        opacity: 1;
                    }
                    
                    .elegant-table .ant-table-tbody > tr > td {
                        border: none !important;
                        border-bottom: 1px solid #f1f5f9 !important;
                        padding: 8px 12px !important;
                        font-size: 13px !important;
                        background: transparent !important;
                        transition: all 0.2s ease !important;
                        vertical-align: middle !important;
                    }

                    .elegant-table .ant-table-tbody > tr {
                        transition: all 0.2s ease !important;
                    }
                    
                    .elegant-table .ant-table-tbody > tr:hover > td {
                        background: #f8fafc !important;
                        border-bottom-color: #e2e8f0 !important;
                    }

                    .elegant-table .ant-table-tbody > tr:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
                    }

                    .elegant-table .ant-table-tbody > tr:last-child > td {
                        border-bottom: none !important;
                    }

                    /* Fixed column styling */
                    .elegant-table .ant-table-cell-fix-left,
                    .elegant-table .ant-table-cell-fix-right {
                        background: rgba(255, 255, 255, 0.98) !important;
                        backdrop-filter: blur(8px) !important;
                        box-shadow: 2px 0 4px rgba(0, 0, 0, 0.02) !important;
                    }

                    .elegant-table .ant-table-tbody > tr:hover .ant-table-cell-fix-left,
                    .elegant-table .ant-table-tbody > tr:hover .ant-table-cell-fix-right {
                        background: rgba(248, 250, 252, 0.98) !important;
                        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04) !important;
                    }

                    /* Row selection styling */
                    .elegant-table .ant-table-tbody > tr.ant-table-row-selected > td {
                        background: rgba(59, 130, 246, 0.04) !important;
                        border-bottom-color: rgba(59, 130, 246, 0.1) !important;
                    }

                    .elegant-table .ant-table-tbody > tr.ant-table-row-selected {
                        box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1) !important;
                    }

                    .elegant-table .ant-table-tbody > tr.ant-table-row-selected:hover > td {
                        background: rgba(59, 130, 246, 0.06) !important;
                    }

                    /* Loading state */
                    .elegant-table .ant-spin-container {
                        background: transparent !important;
                    }

                    .elegant-table .ant-table-placeholder {
                        background: #ffffff !important;
                        border-radius: 8px !important;
                        margin: 16px !important;
                        border: 1px solid #f1f5f9 !important;
                    }

                    /* Refined Pagination */
                    .refined-pagination {
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        flex-wrap: wrap !important;
                        gap: 16px !important;
                    }

                    .refined-pagination .ant-pagination-item {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        transition: all 0.2s ease !important;
                        font-weight: 500 !important;
                        background: #ffffff !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important;
                    }

                    .refined-pagination .ant-pagination-item:hover {
                        border-color: #3b82f6 !important;
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15) !important;
                        background: #f8fafc !important;
                    }

                    .refined-pagination .ant-pagination-item-active {
                        background: #3b82f6 !important;
                        border-color: #3b82f6 !important;
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25) !important;
                    }

                    .refined-pagination .ant-pagination-item-active a {
                        color: white !important;
                        font-weight: 600 !important;
                    }

                    .refined-pagination .ant-pagination-prev,
                    .refined-pagination .ant-pagination-next,
                    .refined-pagination .ant-pagination-jump-prev,
                    .refined-pagination .ant-pagination-jump-next {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                        transition: all 0.2s ease !important;
                        background: #ffffff !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important;
                    }

                    .refined-pagination .ant-pagination-prev:hover,
                    .refined-pagination .ant-pagination-next:hover {
                        border-color: #6366f1 !important;
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 8px rgba(99, 102, 241, 0.15) !important;
                        background: #f8fafc !important;
                    }

                    /* Enhanced Form Controls - keeping existing refined styling */
                    .custom-select .ant-select-selector,
                    .custom-input {
                        border-radius: 12px !important;
                        border: 2px solid #e2e8f0 !important;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
                        transition: all 0.3s ease !important;
                    }

                    .custom-select .ant-select-selector:hover,
                    .custom-input:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
                        transform: translateY(-1px) !important;
                    }

                    .custom-select.ant-select-focused .ant-select-selector,
                    .custom-input:focus {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
                        transform: translateY(-2px) !important;
                    }

                    .custom-textarea {
                        border-radius: 12px !important;
                        border: 2px solid #e2e8f0 !important;
                        transition: all 0.3s ease !important;
                    }

                    .custom-textarea:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1) !important;
                    }

                    .custom-textarea:focus {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
                    }

                    /* Responsive table adjustments */
                    @media (max-width: 768px) {
                        .elegant-table .ant-table-tbody > tr > td {
                            padding: 6px 8px !important;
                            font-size: 12px !important;
                        }

                        .elegant-table .ant-table-thead > tr > th {
                            padding: 12px 8px !important;
                            font-size: 12px !important;
                        }

                        .refined-pagination {
                            justify-content: center !important;
                            gap: 8px !important;
                        }
                    }

                    /* Subtle animations */
                    @keyframes subtleSlideIn {
                        from {
                            opacity: 0;
                            transform: translateY(8px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes gentleFadeIn {
                        from {
                            opacity: 0;
                            transform: scale(0.98);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    .elegant-table .ant-table-tbody > tr {
                        animation: subtleSlideIn 0.3s ease-out !important;
                    }

                    .detail-modal-enhanced .ant-modal-content {
                        animation: gentleFadeIn 0.3s ease-out !important;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default DuyetKeKhai;