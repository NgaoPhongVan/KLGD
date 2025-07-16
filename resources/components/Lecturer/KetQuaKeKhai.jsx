import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Select,
    Button,
    Typography,
    Space,
    Tag,
    Modal,
    Table,
    Row,
    Col,
    Tooltip,
    Empty,
    Alert,
    message,
} from 'antd';
import {
    FolderOpenOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    EyeOutlined,
    PrinterOutlined,
    DownloadOutlined,
    SyncOutlined,
    CalendarOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    BookOutlined 
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const BaoCaoKeKhaiPreview = ({ keKhaiData }) => {
    if (!keKhaiData) return <Empty description="Không có dữ liệu để hiển thị báo cáo." />;

    const getValue = (value, defaultValue = 0, toFixed = 2) => {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue.toFixed(toFixed) : num.toFixed(toFixed);
    };

    const gioKHCNQD = keKhaiData.kekhai_congtac_khac_nam_hocs
    .filter(item => item.loai_gio_quy_doi === 'KHCN')
    .map(item => parseFloat(item.so_gio_quy_doi_gv_nhap ?? 0));

    const gioGKQD = keKhaiData.kekhai_congtac_khac_nam_hocs
    .filter(item => item.loai_gio_quy_doi === 'GD')
    .map(item => parseFloat(item.so_gio_quy_doi_gv_nhap ?? 0));

    // Dữ liệu cho bảng "BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ"
    const vuotGioData = {
        hd_la_sl_quy_doi: getValue(keKhaiData.tong_gio_butru_la_duyet ?? keKhaiData.tong_gio_butru_la_tam_tinh, 0, 2), // Giờ đã dùng bù từ LA
        hd_dakl_sl_quy_doi: getValue(keKhaiData.tong_gio_butru_dakl_duyet ?? keKhaiData.tong_gio_butru_dakl_tam_tinh, 0, 2), // Giờ đã dùng bù từ ĐA/KL
        hd_lv_sl_quy_doi: getValue(keKhaiData.tong_gio_butru_lv_duyet ?? keKhaiData.tong_gio_butru_lv_tam_tinh, 0, 2), // Giờ đã dùng bù từ LV
        khcn_hoan_thanh: getValue(keKhaiData.gio_khcn_hoanthanh_sau_butru_duyet ?? keKhaiData.gio_khcn_hoanthanh_sau_butru_tam_tinh, 0, 2), // KHCN còn lại sau bù
        gd_hoan_thanh: getValue(keKhaiData.gio_gd_hoanthanh_sau_butru_duyet ?? keKhaiData.gio_gd_hoanthanh_sau_butru_tam_tinh, 0, 2), // GD đã hoàn thành sau bù
        
        // Số lượng còn lại (để hiển thị)
        hd_la_sl_con_lai: getValue(keKhaiData.sl_huongdan_la_conlai_duyet ?? keKhaiData.sl_huongdan_la_conlai_tam_tinh, 0, 0),
        hd_dakl_sl_con_lai: getValue(keKhaiData.sl_huongdan_dakl_conlai_duyet ?? keKhaiData.sl_huongdan_dakl_conlai_tam_tinh, 0, 0),
        hd_lv_sl_con_lai: getValue(keKhaiData.sl_huongdan_lv_conlai_duyet ?? keKhaiData.sl_huongdan_lv_conlai_tam_tinh, 0, 0),

        so_tiet_vuot_khong_hd: getValue(keKhaiData.gio_vuot_gd_khong_hd_duyet ?? keKhaiData.gio_vuot_gd_khong_hd_tam_tinh, 0, 2),
        thua_thieu_cuoi_cung: getValue(keKhaiData.ket_qua_thua_thieu_gio_gd_duyet ?? keKhaiData.ket_qua_thua_thieu_gio_gd_tam_tinh, 0, 2)
    };


    return (
        <div className="print-preview-content p-4 bg-white rounded-lg shadow">
            <style>
                {`
                    .print-table-kq { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
                    .print-table-kq th, .print-table-kq td { border: 1px solid #ccc; padding: 5px; text-align: center; vertical-align: middle; }
                    .print-table-kq th { background-color: #f2f2f2; font-weight: bold; }
                    .print-table-kq .header-row-1 th { height: 30px; }
                    .print-table-kq .header-row-2 th { height: 50px; word-wrap: break-word; white-space: normal; }
                    .print-table-kq .header-row-3 th { height: 20px; font-style: italic; }
                    .print-table-kq .data-row td { height: 25px; }
                    .print-table-kq .text-left { text-align: left; }
                    .print-table-kq .font-bold { font-weight: bold; }
                    @media print { }
                `}
            </style>

            <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>
                BÁO CÁO KẾT QUẢ KÊ KHAI GIỜ CHUẨN NĂM HỌC {keKhaiData.nam_hoc?.ten_nam_hoc || 'N/A'}
            </Title>
            <Paragraph style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '5px' }}>
                (Dành cho giảng viên: {keKhaiData.nguoi_dung?.ho_ten || 'N/A'} - Mã GV: {keKhaiData.nguoi_dung?.ma_gv || 'N/A'})
            </Paragraph>
            <Paragraph style={{ textAlign: 'center', marginBottom: '20px' }}>
                Học hàm: {keKhaiData.nguoi_dung?.hoc_ham || 'N/A'} - Học vị: {keKhaiData.nguoi_dung?.hoc_vi || 'N/A'}
            </Paragraph>


            {/* Bảng 1 (cũ): Khối lượng vượt giờ */}
            <Title level={4} style={{ marginTop: '30px' }}>1. Khối lượng vượt giờ</Title>
            <table className="print-table-kq">
                <thead>
                    <tr className="header-row-1">
                        <th colSpan="2">Định mức</th>
                        <th colSpan="2">Số tiết GD thực hiện</th>
                        <th rowSpan="2">Số tiết GD xa trường</th>
                        <th colSpan="4">Khối lượng vượt giờ</th>
                    </tr>
                    <tr className="header-row-2">
                        <th>GD</th>
                        <th>KHCN</th>
                        <th>KHCN</th>
                        <th>GD+Đgiá</th>
                        <th>Số tiết GD đã HT (Sau bù trừ)</th>
                        <th>LA còn lại</th>
                        <th>LV còn lại</th>
                        <th>ĐA/KL còn lại</th>
                    </tr>
                     <tr className="header-row-3">
                        <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="data-row">
                        <td>{getValue(keKhaiData.dinhmuc_gd_apdung)}</td>
                        <td>{getValue(keKhaiData.dinhmuc_khcn_apdung)}</td>
                        <td>{getValue(keKhaiData.gio_khcn_thuchien_xet_dinhmuc_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.gio_gd_danhgia_xet_dinhmuc_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.gio_gdxatruong_xet_dinhmuc_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.ket_qua_thua_thieu_gio_gd_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.sl_huongdan_la_conlai_tam_tinh, 0, 0)}</td>
                        <td>{getValue(keKhaiData.sl_huongdan_lv_conlai_tam_tinh, 0, 0)}</td>
                        <td>{getValue(keKhaiData.sl_huongdan_dakl_conlai_tam_tinh, 0, 0)}</td>
                    </tr>
                </tbody>
            </table>
             <div style={{fontSize: '10px', fontStyle: 'italic', marginBottom: '5px'}}>
                Số giờ GD vượt (chỉ tính GD+ĐG, không tính HD): {getValue(keKhaiData.gio_vuot_gd_khong_hd_tam_tinh)}
            </div>
            <div style={{fontSize: '10px', fontStyle: 'italic', marginBottom: '5px'}}>
                Ghi chú bù trừ: {keKhaiData.ghi_chu_butru_tam_tinh || "Không có"}
            </div>
             <div style={{fontSize: '10px', fontWeight: 'bold', marginBottom: '15px'}}>
                Kết quả thừa/thiếu giờ GD cuối cùng (sau khi tính cả HD còn lại): {getValue(keKhaiData.ket_qua_thua_thieu_gio_gd_tam_tinh)}
            </div>

            {/* Bảng MỚI: BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ (từ file Bangthem.csv) */}
            <Title level={4} style={{ marginTop: '30px' }}>* BẢNG TỔNG HỢP KHỐI LƯỢNG TÍNH VƯỢT GIỜ (Bảng bổ sung)</Title>
            <table className="print-table-kq">
                <thead>
                    <tr>
                        <th colSpan="3">SL Hướng dẫn quy đổi (giờ)</th>
                        <th colSpan="2">Hoàn thành</th>
                        <th rowSpan="2">Số tiết GD vượt (không tính HD)</th>
                        <th colSpan="2">Luận án TS</th>
                        <th colSpan="2">Đồ án/KL</th>
                        <th colSpan="2">Luận văn CH</th>
                        <th rowSpan="2">Thừa/thiếu giờ GD cuối cùng</th>
                    </tr>
                    <tr>
                        <th>LA</th>
                        <th>ĐA/KL</th>
                        <th>LV</th>
                        <th>KHCN</th>
                        <th>GD</th>
                        <th>Số tiết bù</th>
                        <th>SL còn lại</th>
                        <th>Số tiết bù</th>
                        <th>SL còn lại</th>
                        <th>Số tiết bù</th>
                        <th>SL còn lại</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{getValue(keKhaiData.tong_sl_huongdan_la_duyet)}</td> {/* Giờ LA đã dùng để bù */}
                        <td>{getValue(keKhaiData.tong_sl_huongdan_dakl_duyet)}</td> {/* Giờ ĐA/KL đã dùng để bù */}
                        <td>{getValue(keKhaiData.tong_sl_huongdan_lv_duyet)}</td> {/* Giờ LV đã dùng để bù */}
                        <td>{getValue(keKhaiData.gio_khcn_hoanthanh_so_voi_dinhmuc_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.gio_vuot_gd_khong_hd_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.ket_qua_thua_thieu_gio_gd_tam_tinh)}</td>  {/*gio_vuot_gd_khong_hd_tam_tinh*/}
                        <td>{getValue(keKhaiData.tong_gio_butru_la_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.sl_huongdan_la_conlai_tam_tinh,0,0)}</td>
                        <td>{getValue(keKhaiData.tong_gio_butru_dakl_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.sl_huongdan_dakl_conlai_tam_tinh,0,0)}</td>
                        <td>{getValue(keKhaiData.tong_gio_butru_lv_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.sl_huongdan_lv_conlai_tam_tinh,0,0)}</td>
                        <td>{getValue(keKhaiData.ket_qua_thua_thieu_gio_gd_tam_tinh)}</td>
                    </tr>
                </tbody>
            </table>


            {/* Bảng 2 (cũ): Tổng hợp khối lượng */}
            <Title level={4} style={{ marginTop: '30px' }}>2. Tổng hợp khối lượng</Title>
            <table className="print-table-kq">
                <thead>
                    <tr className="header-row-1">
                        <th rowSpan="2">KHCN (P9)</th>
                        <th colSpan="2">Công tác khác (P7)</th>
                        <th rowSpan="2">Coi chấm thi (CT đại học) - P6</th>
                        <th colSpan="5">Công tác giảng dạy</th>
                        <th rowSpan="2">Tổng số giờ KHCN</th>
                        <th rowSpan="2">Tổng số giờ giảng dạy</th>
                        <th rowSpan="2">Số tiết GD xa trường</th>
                    </tr>  
                    <tr className="header-row-2">
                        <th>QĐ giờ KHCN</th>
                        <th>Quy đổi tiết</th>
                        <th>Giảng dạy, đánh giá</th>
                        <th>LA</th>
                        <th>LV</th>
                        <th>ĐA/KL</th>
                        <th>Số tiết</th>
                    </tr>
                     <tr className="header-row-3">
                        <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="data-row">
                        <td>{getValue(keKhaiData.tong_gio_khcn_kekhai_tam_tinh) - gioKHCNQD}</td>
                        <td>{getValue(gioKHCNQD)}</td>
                        <td>{getValue(gioGKQD)}</td>
                        <td>{getValue(keKhaiData.tong_gio_coithi_chamthi_dh_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.tong_gio_gd_danhgia_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.tong_sl_huongdan_la_tam_tinh, 0, 0)}</td>
                        <td>{getValue(keKhaiData.tong_sl_huongdan_lv_tam_tinh, 0, 0)}</td>
                        <td>{getValue(keKhaiData.tong_sl_huongdan_dakl_tam_tinh, 0, 0)}</td>
                        <td>{getValue(keKhaiData.tong_gio_huongdan_quydoi_tam_tinh)}</td>
                        <td>{getValue(keKhaiData.tong_gio_khcn_kekhai_tam_tinh)}</td> {/* Cột 10 = Cột 1 */}
                        <td>{getValue(keKhaiData.tong_gio_giangday_final_tam_tinh)}</td> {/* Cột 11 = (C4) + (C9) */}
                        <td>{getValue(keKhaiData.tong_gio_gdxatruong_tam_tinh)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Phần ký tên */}
            <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                <div>
                    <Text strong>NGƯỜI KÊ KHAI</Text><br />
                    <Text style={{ fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</Text><br /><br /><br /><br />
                    <Text strong>{keKhaiData.nguoi_dung?.ho_ten || 'N/A'}</Text>
                </div>
                <div>
                    <Text strong>TRƯỞNG BỘ MÔN</Text><br />
                    <Text style={{ fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</Text><br /><br /><br /><br />
                    <Text strong>{keKhaiData.ten_nguoi_duyet_bm || (keKhaiData.trang_thai_phe_duyet === 1 || keKhaiData.trang_thai_phe_duyet === 0 || keKhaiData.trang_thai_phe_duyet === 4 ? "Chưa duyệt" : "N/A")}</Text>
                </div>
            </div>
        </div>
    );
};

function KetQuaKeKhai() {
    const [declarations, setDeclarations] = useState([]);
    const [namHocList, setNamHocList] = useState([]);
    const [selectedNamHocId, setSelectedNamHocId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPrintPreviewModal, setShowPrintPreviewModal] = useState(false);
    const [itemToPrint, setItemToPrint] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNamHocList();
    }, []);

    useEffect(() => {
        if (selectedNamHocId) {
            fetchKeKhaiByNamHoc(selectedNamHocId);
        } else {
            setDeclarations([]);
        }
    }, [selectedNamHocId]);

    const fetchNamHocList = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("/api/lecturer/nam-hoc", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const namHocs = response.data || [];
            setNamHocList(namHocs);
            const currentNamHoc = namHocs.find(nh => nh.la_nam_hien_hanh === 1);
            if (currentNamHoc) {
                setSelectedNamHocId(currentNamHoc.id.toString());
            } else if (namHocs.length > 0) { }
        } catch (error) {
            message.error("Không thể tải danh sách năm học.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchKeKhaiByNamHoc = async (namHocId) => {
        if (!namHocId) {
            setDeclarations([]);
            return;
        }
        const token = localStorage.getItem("token");
        setIsLoading(true);
        try {
            const response = await axios.get("/api/lecturer/ke-khai-nam-hoc", {
                headers: { Authorization: `Bearer ${token}` },
                params: { nam_hoc_id: namHocId },
            });
            setDeclarations(response.data || []);
        } catch (error) {
            message.error("Không thể tải danh sách kê khai cho năm học đã chọn.");
            setDeclarations([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNamHocChange = (value) => {
        setSelectedNamHocId(value || ""); 
    };

    const getTrangThaiTag = (trangThai) => {
        switch (trangThai) {
            case 3: return <Tag color="success" icon={<CheckCircleOutlined />}>Đã phê duyệt</Tag>;
            case 1: return <Tag color="processing" icon={<ClockCircleOutlined />}>Chờ phê duyệt</Tag>;
            case 0: return <Tag color="default" icon={<ExclamationCircleOutlined />}>Nháp</Tag>;
            case 4: return <Tag color="warning" icon={<ExclamationCircleOutlined />}>BM Trả lại</Tag>;
            default: return <Tag color="default">Không xác định</Tag>;
        }
    };

    const handleViewAndPrint = async (id) => {
        const token = localStorage.getItem("token");
        message.loading({ content: 'Đang tải dữ liệu báo cáo...', key: 'loadingReport', duration: 0 });
        try {
            const response = await axios.get(`/api/lecturer/ke-khai-nam-hoc/${id}`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            setItemToPrint(response.data.ke_khai_tong_hop_nam_hoc);
            setShowPrintPreviewModal(true);
            message.success({ content: 'Tải dữ liệu báo cáo thành công!', key: 'loadingReport', duration: 2 });
        } catch (error) {
            message.error({ content: 'Không thể tải chi tiết kê khai để in.', key: 'loadingReport', duration: 3 });
            console.error("Lỗi tải chi tiết kê khai:", error.response?.data || error.message);
        }
    };

    const columns = [
        { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
        {
            title: 'Năm học', dataIndex: ['namHoc', 'ten_nam_hoc'], key: 'namHoc',
            render: (text, record) => record.nam_hoc?.ten_nam_hoc || 'N/A'
        },
        {
            title: 'Tổng giờ thực hiện (Đã duyệt/Tạm tính)',
            key: 'tong_gio_final',
            align: 'center',
            render: (_, record) => {
                const gio = record.trang_thai_phe_duyet === 3 ? record.tong_gio_thuc_hien_final_duyet : record.tong_gio_thuc_hien_final_tam_tinh;
                return <Text strong>{parseFloat(gio || 0).toFixed(2)}</Text>;
            }
        },
        {
            title: 'Định mức GD áp dụng', dataIndex: 'dinhmuc_gd_apdung', key: 'dinhmuc_gd_apdung', align: 'center',
            render: (text, record) => parseFloat(record.trang_thai_phe_duyet === 3 ? record.dinhmuc_gd_apdung : record.dinhmuc_gd_apdung || 0).toFixed(2)
        },
        {
            title: 'Ngày gửi', dataIndex: 'thoi_gian_gui', key: 'thoi_gian_gui', align: 'center',
            render: (text) => text ? moment(text).format('DD/MM/YYYY HH:mm') : 'Chưa gửi'
        },
        {
            title: 'Trạng thái', dataIndex: 'trang_thai_phe_duyet', key: 'trang_thai_phe_duyet', align: 'center',
            render: (trangThai) => getTrangThaiTag(trangThai)
        },
        {
            title: 'Thao tác', key: 'action', align: 'center', width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem và In Báo cáo">
                        <Button icon={<EyeOutlined />} onClick={() => handleViewAndPrint(record.id)} size="small" />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleActualPrint = () => {
        const printContent = document.querySelector('.print-preview-content');
        if (!printContent) {
            message.error("Không tìm thấy nội dung để in."); return;
        }
        const printWindow = window.open('', '_blank', 'height=800,width=1000');
        if (!printWindow) {
            message.error("Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép popup."); return;
        }
        
        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('');
                } catch (e) { return ''; }
            })
            .join('\n');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>Báo cáo Kê khai</title><style>${styles}</style></head>
            <body>${printContent.innerHTML}</body>
            </html>
        `);

        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    };

    const handleDownloadPDF = async () => {
        if (!itemToPrint) {
            message.error("Không có dữ liệu để tạo PDF."); return;
        }
        setIsGeneratingPDF(true);
        try {
            const printContent = document.querySelector('.print-preview-content');
            if (!printContent) throw new Error("Không tìm thấy nội dung.");

            if (window.html2pdf) {
                const opt = {
                    margin:       [0.5, 0.3, 0.5, 0.3],
                    filename:     `KeKhai_${itemToPrint.nam_hoc?.ten_nam_hoc}_${itemToPrint.nguoi_dung?.ma_gv}.pdf`,
                    image:        { type: 'jpeg', quality: 0.95 },
                    html2canvas:  { scale: 2, useCORS: true, logging: false, removeContainer: true, scrollY: -window.scrollY },
                    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait', compress: true },
                    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
                };
                await window.html2pdf().set(opt).from(printContent.cloneNode(true)).save();
                message.success("Đã tải xuống PDF.");
            } else {
                message.warning("Chức năng xuất PDF trực tiếp chưa sẵn sàng. Vui lòng sử dụng chức năng In và chọn 'Lưu thành PDF'.");
                handleActualPrint();
            }
        } catch (error) {
            console.error("Lỗi xuất PDF:", error);
            message.error("Lỗi khi tạo file PDF.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (isLoading && declarations.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden flex items-center justify-center">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 text-center space-y-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <BookOutlined className="text-4xl text-white" />
                        </div>
                        
                        <div className="absolute -top-2 -right-8 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-ping"></div>
                        <div className="absolute -bottom-2 -left-8 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse delay-300"></div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 bg-clip-text text-transparent">
                            Đang tải dữ liệu kê khai
                        </h2>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Vui lòng chờ trong giây lát, chúng tôi đang tải dữ liệu cho bạn...
                        </p>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-300"></div>
                    </div>

                    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-8 space-y-6">
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                        <FileTextOutlined className="text-2xl text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-md"></div>
                                </div>
                                <div className="space-y-2">
                                    <Title level={2} style={{ margin: 0 }} className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                                        Kết quả Kê khai Giờ chuẩn
                                    </Title>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                        <Text type="secondary">
                                            Xem báo cáo và kết quả phê duyệt kê khai theo từng năm học
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Row gutter={16} align="bottom" style={{ marginBottom: 24 }}>
                        <Col xs={24} md={8}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text strong>Chọn Năm học:</Text>
                                <Select
                                    value={selectedNamHocId}
                                    onChange={handleNamHocChange}
                                    placeholder="-- Chọn năm học --"
                                    style={{ width: '100%' }}
                                    size="large"
                                    loading={isLoading}
                                    allowClear
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    className="custom-select"
                                >
                                    {namHocList.map(nh => (
                                        <Option key={nh.id} value={nh.id.toString()} label={String(nh.ten_nam_hoc)}>
                                            {nh.ten_nam_hoc}
                                            {nh.la_nam_hien_hanh ? 
                                                <Tag color="green" style={{ marginLeft: 8 }}>Hiện hành</Tag> 
                                                : null
                                            }
                                        </Option>
                                    ))}
                                </Select>
                            </Space>
                        </Col>
                        <Col xs={24} md={8}>
                            <Button
                                type="primary"
                                icon={<SyncOutlined />}
                                onClick={() => selectedNamHocId && fetchKeKhaiByNamHoc(selectedNamHocId)}
                                disabled={!selectedNamHocId || isLoading}
                                loading={isLoading}
                                size="large"
                                className="custom-button"
                            >
                                Tải lại danh sách
                            </Button>
                        </Col>
                    </Row>

                    {selectedNamHocId && (
                        <Alert
                            message={`Đang xem kết quả kê khai cho năm học: ${namHocList.find(nh => nh.id.toString() === selectedNamHocId)?.ten_nam_hoc || 'N/A'}`}
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                            className="custom-alert"
                        />
                    )}
                </Card>

                {isLoading && declarations.length > 0 && (
                    <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 relative flex justify-center items-center mx-auto">
                                        <div className="absolute w-full h-full border-4 border-indigo-200/30 rounded-full animate-spin"></div>
                                        <div className="absolute w-16 h-16 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-full flex items-center justify-center">
                                            <FileTextOutlined className="text-white animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                                <Text className="text-lg font-medium text-gray-700">Đang tải dữ liệu kê khai...</Text>
                                <div className="flex items-center justify-center space-x-1 mt-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {!selectedNamHocId && !isLoading && (
                    <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileTextOutlined className="text-3xl text-blue-500" />
                            </div>
                            <Title level={4} className="text-gray-600 mb-4">Chào mừng đến với báo cáo kê khai</Title>
                            <Text type="secondary" className="text-base mb-6 block">
                                Vui lòng chọn năm học để xem kết quả kê khai giờ chuẩn của bạn
                            </Text>
                            <Button 
                                type="primary" 
                                icon={<CalendarOutlined />}
                                onClick={() => {
                                    const currentNamHoc = namHocList.find(nh => nh.la_nam_hien_hanh === 1);
                                    if (currentNamHoc) {
                                        setSelectedNamHocId(currentNamHoc.id.toString());
                                    }
                                }}
                                disabled={!namHocList.find(nh => nh.la_nam_hien_hanh === 1)}
                                size="large"
                                className="custom-button"
                            >
                                Chọn năm học hiện hành
                            </Button>
                        </div>
                    </Card>
                )}

                {selectedNamHocId && !isLoading && (
                    <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                        <div className="mb-4 flex justify-between items-center">
                            <Title level={4} className="mb-0">
                                <FolderOpenOutlined className="mr-2 text-blue-600" />
                                Danh sách Kê khai ({declarations.length} bản ghi)
                            </Title>
                            {declarations.length > 0 && (
                                <Space>
                                    <Text type="secondary">
                                        Cập nhật lần cuối: {moment().format('DD/MM/YYYY HH:mm')}
                                    </Text>
                                </Space>
                            )}
                        </div>

                        <Table
                            columns={columns}
                            dataSource={declarations}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} của ${total} bản ghi`,
                                pageSizeOptions: ['5', '10', '20', '50'],
                            }}
                            locale={{
                                emptyText: selectedNamHocId ? (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="Chưa có kê khai nào cho năm học này"
                                    >
                                        <Button 
                                            type="primary" 
                                            icon={<CalendarOutlined />}
                                            onClick={() => navigate(`/lecturer/ke-khai?nam_hoc_id=${selectedNamHocId}`)}
                                            className="custom-button"
                                        >
                                            Tạo kê khai mới
                                        </Button>
                                    </Empty>
                                ) : "Không có dữ liệu"
                            }}
                            scroll={{ x: 1200 }}
                            size="middle"
                            className="custom-table"
                            rowClassName={(record) => {
                                switch (record.trang_thai_phe_duyet) {
                                    case 3: return 'table-row-success';
                                    case 2: return 'table-row-error';
                                    case 1: return 'table-row-processing';
                                    case 4: return 'table-row-warning';
                                    default: return 'table-row-default';
                                }
                            }}
                        />
                    </Card>
                )}

                <Modal
                    title={<Title level={4} style={{textAlign: 'center'}}>Xem trước & In Báo cáo Kê khai</Title>}
                    open={showPrintPreviewModal}
                    onCancel={() => setShowPrintPreviewModal(false)}
                    width="90%"
                    style={{ top: 20, maxWidth: '850px' }}
                    footer={[
                        <Button key="back" onClick={() => setShowPrintPreviewModal(false)} size="large" className="custom-button">Đóng</Button>,
                        <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPDF} loading={isGeneratingPDF} size="large" className="custom-button bg-green-600 hover:bg-green-700 border-green-600">Tải PDF</Button>,
                        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handleActualPrint} size="large" className="custom-button">In ngay</Button>,
                    ]}
                    destroyOnClose
                    className="custom-modal"
                >
                    {itemToPrint && <BaoCaoKeKhaiPreview keKhaiData={itemToPrint} />}
                </Modal>

                <style>{`
                    .enhanced-form .ant-form-item-label > label {
                        font-weight: 600 !important;
                        color: #374151 !important;
                    }

                    .custom-select .ant-select-selector {
                        border-radius: 12px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                        background: rgba(255, 255, 255, 0.8) !important;
                        backdrop-filter: blur(8px) !important;
                    }
                    
                    .custom-select .ant-select-selector:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
                    }

                    .custom-select .ant-select-focused .ant-select-selector {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                    }

                    .custom-button.ant-btn {
                        border-radius: 12px !important;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        backdrop-filter: blur(8px) !important;
                    }
                    
                    .custom-button.ant-btn:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
                    }

                    .custom-button.ant-btn-primary {
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                        border: none !important;
                    }

                    .custom-button.ant-btn-primary:hover {
                        background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
                    }

                    .custom-alert.ant-alert {
                        border-radius: 12px !important;
                        border: none !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                        backdrop-filter: blur(8px) !important;
                    }

                    .custom-table .ant-table {
                        border-radius: 12px !important;
                        overflow: hidden !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
                    }

                    .custom-table .ant-table-thead > tr > th {
                        background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
                        border: none !important;
                        font-weight: 600 !important;
                        color: #374151 !important;
                        padding: 16px !important;
                    }

                    .custom-table .ant-table-tbody > tr > td {
                        border: none !important;
                        padding: 12px 16px !important;
                        transition: all 0.2s ease !important;
                    }

                    .table-row-success {
                        background: rgba(34, 197, 94, 0.05) !important;
                    }
                    .table-row-success:hover {
                        background: rgba(34, 197, 94, 0.1) !important;
                    }

                    .table-row-error {
                        background: rgba(239, 68, 68, 0.05) !important;
                    }
                    .table-row-error:hover {
                        background: rgba(239, 68, 68, 0.1) !important;
                    }

                    .table-row-processing {
                        background: rgba(59, 130, 246, 0.05) !important;
                    }
                    .table-row-processing:hover {
                        background: rgba(59, 130, 246, 0.1) !important;
                    }

                    .table-row-warning {
                        background: rgba(245, 158, 11, 0.05) !important;
                    }
                    .table-row-warning:hover {
                        background: rgba(245, 158, 11, 0.1) !important;
                    }

                    .table-row-default:hover {
                        background: rgba(156, 163, 175, 0.05) !important;
                    }

                    /* Custom Modal Styling */
                    .custom-modal .ant-modal-content {
                        border-radius: 16px !important;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
                        backdrop-filter: blur(8px) !important;
                    }

                    .custom-modal .ant-modal-header {
                        border-radius: 16px 16px 0 0 !important;
                        background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
                        border: none !important;
                        padding: 20px 24px !important;
                    }

                    .custom-modal .ant-modal-footer {
                        border: none !important;
                        padding: 16px 24px 24px !important;
                    }

                    .ant-tag {
                        border-radius: 6px !important;
                        font-weight: 500 !important;
                        padding: 2px 8px !important;
                        border: none !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                    }

                    .ant-card {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }

                    .ant-card:hover {
                        transform: translateY(-2px) !important;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
                    }

                    .ant-empty {
                        margin: 32px 0 !important;
                    }

                    .ant-empty-description {
                        color: #6b7280 !important;
                        font-size: 14px !important;
                    }

                    .ant-tooltip-inner {
                        border-radius: 8px !important;
                        backdrop-filter: blur(8px) !important;
                    }

                    .ant-pagination {
                        margin-top: 24px !important;
                    }

                    .ant-pagination-item {
                        border-radius: 8px !important;
                        border: 1px solid #e2e8f0 !important;
                    }

                    .ant-pagination-item-active {
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                        border-color: #3b82f6 !important;
                    }

                    .ant-pagination-item-active a {
                        color: white !important;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default KetQuaKeKhai;