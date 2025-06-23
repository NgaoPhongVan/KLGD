import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Card,
    Button,
    Select,
    Typography,
    Space,
    Divider,
    Form,
    message,
    Spin,
    Tabs,
    Alert,
    Row,
    Col,
    Tag,
    Statistic,
    Progress,
    Modal,
    Table,
    Timeline,
    Tooltip,
    Radio,
    DatePicker,
    Switch,
    Badge,
    List,
    Empty,
    InputNumber
} from 'antd';
import {
    SaveOutlined,
    CalendarOutlined,
    BookOutlined,
    SolutionOutlined,
    UserSwitchOutlined,
    AuditOutlined,
    CarryOutOutlined,
    BuildOutlined,
    ExperimentOutlined,
    TeamOutlined,
    CalculatorOutlined,
    EyeOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    BarChartOutlined,
    PieChartOutlined,
    LineChartOutlined,
    TrophyOutlined,
    RiseOutlined,
    FallOutlined,
    DashboardOutlined,
    SwapOutlined,
    HistoryOutlined,
    AimOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

// Import các component form con (sử dụng lại từ KeKhaiGiangDayForm)
import FormGdLop from './KekhaiForms/FormGdLop';
import FormHdDatnDaihoc from './KekhaiForms/FormHdDatnDaihoc';
import FormHdLvThacsi from './KekhaiForms/FormHdLvThacsi';
import FormHdLaTiensi from './KekhaiForms/FormHdLaTiensi';
import FormDgHpTnDaihoc from './KekhaiForms/FormDgHpTnDaihoc';
import FormDgLvThacsi from './KekhaiForms/FormDgLvThacsi';
import FormDgLaTiensi from './KekhaiForms/FormDgLaTiensi';
import FormKhaoThi from './KekhaiForms/FormKhaoThi';
import FormXdCtdtVaKhacGd from './KekhaiForms/FormXdCtdtVaKhacGd';
import FormNckh from './KekhaiForms/FormNckh';
import FormCongTacKhac from './KekhaiForms/FormCongTacKhac';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Component Simple Chart thay thế cho @ant-design/plots
const SimpleChart = ({ type, data, title, height = 300 }) => {
    const renderPieChart = () => {
        if (!data || data.length === 0) {
            return <Empty description="Không có dữ liệu để hiển thị" />;
        }
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">Biểu đồ tròn sẽ được hiển thị tại đây</Text>
                </div>
            </div>
        );
    };

    const renderBarChart = () => {
        if (!data || data.length === 0) {
            return <Empty description="Không có dữ liệu để hiển thị" />;
        }
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={5}>{title}</Title>
                    <Text type="secondary">Biểu đồ cột sẽ được hiển thị tại đây</Text>
                </div>
            </div>
        );
    };

    const renderRadarChart = () => {
        if (!data || data.length === 0) {
            return <Empty description="Không có dữ liệu để hiển thị" />;
        }
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Title level={5}>{title}</Title>
                    <Text type="secondary">Biểu đồ radar sẽ được hiển thị tại đây</Text>
                </div>
            </div>
        );
    };

    switch (type) {
        case 'pie':
            return renderPieChart();
        case 'bar':
            return renderBarChart();
        case 'radar':
            return renderRadarChart();
        default:
            return <Empty description="Loại biểu đồ không được hỗ trợ" />;
    }
};

// Component thống kê tổng quan nâng cao sử dụng dữ liệu từ API
const ThongKeTongQuanNangCao = ({ apiStatisticsData, namHocSelected }) => {
    if (!apiStatisticsData) {
        return (
            <Card className="stat-overview-empty">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có dữ liệu thống kê"
                    imageStyle={{ height: 60 }}
                >
                    <Text type="secondary">Chưa có dữ liệu thống kê cho năm học này</Text>
                </Empty>
            </Card>
        );
    }

    const currentYearData = namHocSelected 
        ? apiStatisticsData.statistics_by_year?.find(item => item.nam_hoc_id === parseInt(namHocSelected.id))
        : null;

    if (!currentYearData) {
        return (
            <Card className="stat-overview-empty">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không tìm thấy dữ liệu cho năm học này"
                    imageStyle={{ height: 60 }}
                >
                    <Text type="secondary">Vui lòng chọn năm học khác hoặc thực hiện kê khai</Text>
                </Empty>
            </Card>
        );
    }

    const {
        tong_gio_thuc_hien,
        phan_bo_gio,
        dinh_muc_gd,
        dinh_muc_khcn,
        ty_le_hoanthanh_gd,
        ty_le_hoanthanh_khcn,
        thua_thieu_gd,
        hoan_thanh_khcn_so_voi_dm
    } = currentYearData;

    // Tính tỷ lệ hoàn thành chung
    const tongDinhMuc = dinh_muc_gd + dinh_muc_khcn;
    const tyLeChung = tongDinhMuc > 0 ? (tong_gio_thuc_hien / tongDinhMuc * 100) : 0;

    // Tính tổng giờ GD và KHCN từ phân bố
    const tongGioGD = (phan_bo_gio.giang_day_lop_danhgia_khacgd || 0) + 
                     (phan_bo_gio.huong_dan || 0) + 
                     (phan_bo_gio.coi_cham_thi_dh || 0) + 
                     (phan_bo_gio.cong_tac_khac_gd || 0);
    const tongGioKHCN = phan_bo_gio.khcn || 0;

    return (
        <div className="space-y-6">
            {/* Tổng quan chính */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card-enhanced">
                        <Statistic
                            title="Tỷ lệ hoàn thành chung"
                            value={tyLeChung}
                            precision={1}
                            suffix="%"
                            prefix={<DashboardOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ 
                                color: tyLeChung >= 100 ? '#52c41a' : tyLeChung >= 80 ? '#faad14' : '#ff4d4f',
                                fontSize: '28px',
                                fontWeight: 'bold'
                            }}
                        />
                        <Progress 
                            percent={Math.min(tyLeChung, 200)} 
                            strokeColor={tyLeChung >= 100 ? '#52c41a' : tyLeChung >= 80 ? '#faad14' : '#ff4d4f'}
                            trailColor="#f0f0f0"
                            style={{ marginTop: 12 }}
                            strokeWidth={8}
                        />
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card-enhanced">
                        <Statistic
                            title="Giờ Giảng dạy"
                            value={tongGioGD}
                            precision={1}
                            suffix="giờ"
                            prefix={<BookOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: ty_le_hoanthanh_gd >= 100 ? '#52c41a' : '#faad14' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">Định mức: {dinh_muc_gd} giờ</Text>
                            <br />
                            <Tag color={thua_thieu_gd >= 0 ? 'success' : 'warning'}>
                                {thua_thieu_gd >= 0 ? '+' : ''}{thua_thieu_gd.toFixed(1)} giờ
                            </Tag>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card-enhanced">
                        <Statistic
                            title="Giờ NCKH"
                            value={tongGioKHCN}
                            precision={1}
                            suffix="giờ"
                            prefix={<ExperimentOutlined style={{ color: '#722ed1' }} />}
                            valueStyle={{ color: ty_le_hoanthanh_khcn >= 100 ? '#52c41a' : '#faad14' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">Định mức: {dinh_muc_khcn} giờ</Text>
                            <br />
                            <Tag color={hoan_thanh_khcn_so_voi_dm >= 0 ? 'success' : 'warning'}>
                                {hoan_thanh_khcn_so_voi_dm >= 0 ? '+' : ''}{hoan_thanh_khcn_so_voi_dm.toFixed(1)} giờ
                            </Tag>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card-enhanced">
                        <Statistic
                            title="Tổng cộng"
                            value={tong_gio_thuc_hien}
                            precision={1}
                            suffix="giờ"
                            prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
                            valueStyle={{ color: '#fa8c16', fontSize: '24px' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">Năm học: {currentYearData.nam_hoc || 'N/A'}</Text>
                            <br />
                            <Tag color={currentYearData.trang_thai_phe_duyet ? 'success' : 'processing'}>
                                {currentYearData.trang_thai_phe_duyet ? 'Đã phê duyệt' : 'Chưa phê duyệt'}
                            </Tag>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Phân tích chi tiết */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Phân tích cơ cấu Giảng dạy" className="analysis-card">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span>Giảng dạy lớp & Đánh giá:</span>
                                <div className="flex items-center space-x-2">
                                    <Text strong>{(phan_bo_gio.giang_day_lop_danhgia_khacgd || 0).toFixed(1)} giờ</Text>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ width: `${tongGioGD > 0 ? ((phan_bo_gio.giang_day_lop_danhgia_khacgd || 0) / tongGioGD) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Hướng dẫn:</span>
                                <div className="flex items-center space-x-2">
                                    <Text strong>{(phan_bo_gio.huong_dan || 0).toFixed(1)} giờ</Text>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-600 h-2 rounded-full" 
                                            style={{ width: `${tongGioGD > 0 ? ((phan_bo_gio.huong_dan || 0) / tongGioGD) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Coi/Chấm thi:</span>
                                <div className="flex items-center space-x-2">
                                    <Text strong>{(phan_bo_gio.coi_cham_thi_dh || 0).toFixed(1)} giờ</Text>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-purple-600 h-2 rounded-full" 
                                            style={{ width: `${tongGioGD > 0 ? ((phan_bo_gio.coi_cham_thi_dh || 0) / tongGioGD) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Công tác khác (GD):</span>
                                <div className="flex items-center space-x-2">
                                    <Text strong>{(phan_bo_gio.cong_tac_khac_gd || 0).toFixed(1)} giờ</Text>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-orange-600 h-2 rounded-full" 
                                            style={{ width: `${tongGioGD > 0 ? ((phan_bo_gio.cong_tac_khac_gd || 0) / tongGioGD) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} md={12}>
                    <Card title="Thống kê định mức" className="analysis-card">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span>Tỷ lệ hoàn thành GD:</span>
                                <div className="flex items-center space-x-2">
                                    <Text strong>{ty_le_hoanthanh_gd.toFixed(1)}%</Text>
                                    <Tag color={ty_le_hoanthanh_gd >= 100 ? 'success' : 'warning'}>
                                        {ty_le_hoanthanh_gd >= 100 ? 'Đạt' : 'Chưa đạt'}
                                    </Tag>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Tỷ lệ hoàn thành KHCN:</span>
                                <div className="flex items-center space-x-2">
                                    <Text strong>{ty_le_hoanthanh_khcn.toFixed(1)}%</Text>
                                    <Tag color={ty_le_hoanthanh_khcn >= 100 ? 'success' : 'warning'}>
                                        {ty_le_hoanthanh_khcn >= 100 ? 'Đạt' : 'Chưa đạt'}
                                    </Tag>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>NCKH:</span>
                                <div className="flex items-center space-x-2">
                                    <Text strong>{tongGioKHCN.toFixed(1)} giờ</Text>
                                    <Tag color="purple">{tongGioKHCN > 0 ? '100%' : '0%'}</Tag>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Trạng thái:</span>
                                <div className="flex items-center space-x-2">
                                    <Tag color={currentYearData.trang_thai_phe_duyet ? 'success' : 'processing'} size="large">
                                        {currentYearData.trang_thai_phe_duyet ? 'Đã phê duyệt' : 'Chưa phê duyệt'}
                                    </Tag>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// Component so sánh dữ liệu thực vs mô phỏng
const SoSanhThucVsMoPhong = ({ apiStatisticsData, simulationResults, namHocSelected }) => {
    if (!apiStatisticsData || !simulationResults || !namHocSelected) {
        return (
            <Empty 
                description="Cần có cả dữ liệu thực và dữ liệu mô phỏng để so sánh"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    const realData = apiStatisticsData.statistics_by_year?.find(
        item => item.nam_hoc_id === parseInt(namHocSelected.id)
    );

    if (!realData) {
        return (
            <Empty 
                description="Không tìm thấy dữ liệu thực cho năm học này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    // Dữ liệu thực
    const realGD = (realData.phan_bo_gio.giang_day_lop_danhgia_khacgd || 0) + 
                   (realData.phan_bo_gio.huong_dan || 0) + 
                   (realData.phan_bo_gio.coi_cham_thi_dh || 0) + 
                   (realData.phan_bo_gio.cong_tac_khac_gd || 0);
    const realKHCN = realData.phan_bo_gio.khcn || 0;
    const realTotal = realData.tong_gio_thuc_hien;

    // Dữ liệu mô phỏng
    const simGD = simulationResults.tongKet.tongGioGd;
    const simKHCN = simulationResults.tongKet.tongGioKhcn;
    const simTotal = simulationResults.tongKet.tongCong;

    const comparisonData = [
        {
            category: 'Giờ Giảng dạy',
            real: realGD,
            simulation: simGD,
            difference: simGD - realGD,
            target: realData.dinh_muc_gd
        },
        {
            category: 'Giờ NCKH',
            real: realKHCN,
            simulation: simKHCN,
            difference: simKHCN - realKHCN,
            target: realData.dinh_muc_khcn
        },
        {
            category: 'Tổng cộng',
            real: realTotal,
            simulation: simTotal,
            difference: simTotal - realTotal,
            target: realData.dinh_muc_gd + realData.dinh_muc_khcn
        }
    ];

    // Component Biểu đồ So sánh Cột
    const ComparisonBarChart = ({ data, title }) => {
        const canvasRef = useRef(null);
        
        useEffect(() => {
            if (!canvasRef.current || !data.length) return;
            
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const padding = 60;
            const chartWidth = canvas.width - 2 * padding;
            const chartHeight = canvas.height - 2 * padding;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const maxValue = Math.max(...data.map(d => Math.max(d.real, d.simulation, d.target)));
            const barGroupWidth = chartWidth / data.length;
            const barWidth = barGroupWidth / 4; // 3 bars per group + spacing
            
            // Draw background grid
            ctx.strokeStyle = '#f0f0f0';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight * i) / 5;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(padding + chartWidth, y);
                ctx.stroke();
            }
            
            // Draw bars
            data.forEach((item, index) => {
                const x = padding + index * barGroupWidth + barGroupWidth * 0.1;
                
                // Thực tế (màu xanh dương)
                const realHeight = (item.real / maxValue) * chartHeight;
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(x, padding + chartHeight - realHeight, barWidth, realHeight);
                
                // Kế hoạch mô phỏng (màu xanh lá)
                const simHeight = (item.simulation / maxValue) * chartHeight;
                ctx.fillStyle = '#10b981';
                ctx.fillRect(x + barWidth, padding + chartHeight - simHeight, barWidth, simHeight);
                
                // Định mức (màu cam)
                const targetHeight = (item.target / maxValue) * chartHeight;
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(x + barWidth * 2, padding + chartHeight - targetHeight, barWidth, targetHeight);
                
                // Nhãn danh mục
                ctx.fillStyle = '#374151';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                const labelX = x + barWidth * 1.5;
                ctx.fillText(item.category.replace('Giờ ', ''), labelX, canvas.height - 15);
                
                // Giá trị trên đầu cột
                ctx.font = '10px Arial';
                ctx.fillStyle = '#6b7280';
                
                // Giá trị thực tế
                if (realHeight > 20) {
                    ctx.fillText(item.real.toFixed(0), x + barWidth/2, padding + chartHeight - realHeight - 5);
                }
                
                // Giá trị mô phỏng
                if (simHeight > 20) {
                    ctx.fillText(item.simulation.toFixed(0), x + barWidth * 1.5, padding + chartHeight - simHeight - 5);
                }
                
                // Giá trị định mức
                if (targetHeight > 20) {
                    ctx.fillText(item.target.toFixed(0), x + barWidth * 2.5, padding + chartHeight - targetHeight - 5);
                }
            });
            
            // Draw Y-axis labels
            ctx.fillStyle = '#6b7280';
            ctx.font = '11px Arial';
            ctx.textAlign = 'right';
            for (let i = 0; i <= 5; i++) {
                const value = (maxValue * (5 - i)) / 5;
                const y = padding + (chartHeight * i) / 5;
                ctx.fillText(value.toFixed(0), padding - 10, y + 4);
            }
            
            // Draw title
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(title, canvas.width / 2, 25);
            
        }, [data, title]);
        
        return (
            <div style={{ textAlign: 'center' }}>
                <canvas ref={canvasRef} width={600} height={400} style={{ maxWidth: '100%' }} />
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 16, height: 16, backgroundColor: '#3b82f6' }}></div>
                        <Text style={{ fontSize: '12px' }}>Thực tế đã kê khai</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 16, height: 16, backgroundColor: '#10b981' }}></div>
                        <Text style={{ fontSize: '12px' }}>Kế hoạch mô phỏng</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 16, height: 16, backgroundColor: '#f59e0b' }}></div>
                        <Text style={{ fontSize: '12px' }}>Định mức</Text>
                    </div>
                </div>
            </div>
        );
    };

    // Component Biểu đồ Xu hướng
    const TrendLineChart = ({ data, title }) => {
        const canvasRef = useRef(null);
        
        useEffect(() => {
            if (!canvasRef.current || !data.length) return;
            
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const padding = 60;
            const chartWidth = canvas.width - 2 * padding;
            const chartHeight = canvas.height - 2 * padding;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const maxValue = Math.max(...data.map(d => Math.max(d.real, d.simulation, d.target)));
            const minValue = Math.min(...data.map(d => Math.min(d.real, d.simulation, d.target)));
            const valueRange = maxValue - minValue;
            
            // Draw background grid
            ctx.strokeStyle = '#f0f0f0';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight * i) / 5;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(padding + chartWidth, y);
                ctx.stroke();
                
                // Vertical grid lines
                const x = padding + (chartWidth * i) / 5;
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, padding + chartHeight);
                ctx.stroke();
            }
            
            // Helper function to get Y coordinate
            const getY = (value) => {
                return padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
            };
            
            // Helper function to get X coordinate
            const getX = (index) => {
                return padding + (index / (data.length - 1)) * chartWidth;
            };
            
            // Draw trend lines
            const drawLine = (values, color, lineWidth = 3, isDashed = false) => {
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                
                if (isDashed) {
                    ctx.setLineDash([8, 4]);
                } else {
                    ctx.setLineDash([]);
                }
                
                ctx.beginPath();
                values.forEach((value, index) => {
                    const x = getX(index);
                    const y = getY(value);
                    
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
                ctx.setLineDash([]);
            };
            
            // Draw data points
            const drawPoints = (values, color, radius = 5) => {
                ctx.fillStyle = color;
                values.forEach((value, index) => {
                    const x = getX(index);
                    const y = getY(value);
                    
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Add white border
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                });
            };
            
            // Prepare data arrays
            const realValues = data.map(d => d.real);
            const simValues = data.map(d => d.simulation);
            const targetValues = data.map(d => d.target);
            
            // Draw lines
            drawLine(realValues, '#3b82f6', 3);
            drawLine(simValues, '#10b981', 3);
            drawLine(targetValues, '#f59e0b', 2, true);
            
            // Draw points
            drawPoints(realValues, '#3b82f6');
            drawPoints(simValues, '#10b981');
            drawPoints(targetValues, '#f59e0b', 4);
            
            // Draw labels
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            data.forEach((item, index) => {
                const x = getX(index);
                ctx.fillText(item.category.replace('Giờ ', ''), x, canvas.height - 15);
            });
            
            // Draw Y-axis labels
            ctx.textAlign = 'right';
            ctx.font = '11px Arial';
            ctx.fillStyle = '#6b7280';
            for (let i = 0; i <= 5; i++) {
                const value = minValue + (valueRange * (5 - i)) / 5;
                const y = padding + (chartHeight * i) / 5;
                ctx.fillText(value.toFixed(0), padding - 10, y + 4);
            }
            
            // Draw title
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(title, canvas.width / 2, 25);
            
            // Draw trend analysis
            const totalRealChange = realValues[realValues.length - 1] - realValues[0];
            const totalSimChange = simValues[simValues.length - 1] - simValues[0];
            
            // Add trend indicators
            ctx.fillStyle = totalRealChange >= 0 ? '#10b981' : '#ef4444';
            ctx.font = '11px Arial';
            ctx.textAlign = 'left';
            const trendText = `Xu hướng thực tế: ${totalRealChange >= 0 ? '↗' : '↘'} ${Math.abs(totalRealChange).toFixed(1)}`;
            ctx.fillText(trendText, padding, canvas.height - 35);
            
            ctx.fillStyle = totalSimChange >= 0 ? '#10b981' : '#ef4444';
            const planTrendText = `Xu hướng kế hoạch: ${totalSimChange >= 0 ? '↗' : '↘'} ${Math.abs(totalSimChange).toFixed(1)}`;
            ctx.fillText(planTrendText, padding, canvas.height - 50);
            
        }, [data, title]);
        
        return (
            <div style={{ textAlign: 'center' }}>
                <canvas ref={canvasRef} width={600} height={400} style={{ maxWidth: '100%' }} />
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 16, height: 16, backgroundColor: '#3b82f6' }}></div>
                        <Text style={{ fontSize: '12px' }}>Đường xu hướng thực tế</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 16, height: 16, backgroundColor: '#10b981' }}></div>
                        <Text style={{ fontSize: '12px' }}>Đường xu hướng kế hoạch</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 16, height: 2, backgroundColor: '#f59e0b', borderRadius: '1px', border: '1px dashed #f59e0b' }}></div>
                        <Text style={{ fontSize: '12px' }}>Mức định mức</Text>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Alert
                message="So sánh Dữ liệu Thực tế vs Kế hoạch Mô phỏng"
                description="Bảng dưới đây cho phép bạn so sánh giữa dữ liệu đã kê khai thực tế với kế hoạch mô phỏng bạn vừa tạo"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Row gutter={[16, 16]}>
                {comparisonData.map((item, index) => (
                    <Col xs={24} md={8} key={index}>
                        <Card className="comparison-card">
                            <Title level={5} style={{ textAlign: 'center', marginBottom: 16 }}>
                                {item.category}
                            </Title>
                            
                            <div className="space-y-4">
                                {/* Dữ liệu thực */}
                                <div className="flex justify-between items-center">
                                    <Text>Thực tế đã kê khai:</Text>
                                    <Text strong style={{ color: '#1890ff' }}>
                                        {item.real.toFixed(1)} giờ
                                    </Text>
                                </div>

                                {/* Dữ liệu mô phỏng */}
                                <div className="flex justify-between items-center">
                                    <Text>Kế hoạch mô phỏng:</Text>
                                    <Text strong style={{ color: '#52c41a' }}>
                                        {item.simulation.toFixed(1)} giờ
                                    </Text>
                                </div>

                                {/* Định mức */}
                                <div className="flex justify-between items-center">
                                    <Text>Định mức:</Text>
                                    <Text strong style={{ color: '#722ed1' }}>
                                        {item.target.toFixed(1)} giờ
                                    </Text>
                                </div>

                                <Divider style={{ margin: '12px 0' }} />

                                {/* Chênh lệch */}
                                <div className="flex justify-between items-center">
                                    <Text>Chênh lệch (KH - TT):</Text>
                                    <Text 
                                        strong 
                                        style={{ 
                                            color: item.difference >= 0 ? '#52c41a' : '#ff4d4f',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {item.difference >= 0 ? '+' : ''}{item.difference.toFixed(1)} giờ
                                    </Text>
                                </div>

                                {/* Progress so sánh */}
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        Tỷ lệ kế hoạch/thực tế: {item.real > 0 ? ((item.simulation / item.real) * 100).toFixed(1) : 0}%
                                    </Text>
                                    <Progress 
                                        percent={item.real > 0 ? Math.min((item.simulation / item.real) * 100, 200) : 0}
                                        strokeColor={item.difference >= 0 ? '#52c41a' : '#ff4d4f'}
                                        size="small"
                                        style={{ marginTop: 4 }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Biểu đồ so sánh */}
            <Card title="Biểu đồ So sánh Chi tiết">
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <ComparisonBarChart 
                            data={comparisonData} 
                            title="Biểu đồ So sánh Thực tế vs Kế hoạch"
                        />
                    </Col>
                    <Col xs={24} lg={12}>
                        <TrendLineChart 
                            data={comparisonData} 
                            title="Phân tích Xu hướng"
                        />
                    </Col>
                </Row>
            </Card>

            {/* Phân tích tổng quan */}
            <Card title="Phân tích Tổng quan">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <div className="space-y-3">
                            <Title level={5}>Đánh giá hiệu suất</Title>
                            <div className="space-y-2">
                                {comparisonData.map((item, index) => {
                                    const efficiency = item.real > 0 ? (item.simulation / item.real) * 100 : 0;
                                    const status = efficiency >= 100 ? 'success' : efficiency >= 80 ? 'warning' : 'error';
                                    const statusText = efficiency >= 100 ? 'Vượt mục tiêu' : efficiency >= 80 ? 'Gần đạt' : 'Cần cải thiện';
                                    
                                    return (
                                        <div key={index} className="flex justify-between items-center">
                                            <Text>{item.category}:</Text>
                                            <div className="flex items-center space-x-2">
                                                <Text strong>{efficiency.toFixed(1)}%</Text>
                                                <Tag color={status}>{statusText}</Tag>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="space-y-3">
                            <Title level={5}>Tổng kết so sánh</Title>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Text>Tổng giờ thực tế:</Text>
                                    <Text strong style={{ color: '#1890ff' }}>
                                        {comparisonData.reduce((sum, item) => sum + item.real, 0).toFixed(1)} giờ
                                    </Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Tổng giờ kế hoạch:</Text>
                                    <Text strong style={{ color: '#52c41a' }}>
                                        {comparisonData.reduce((sum, item) => sum + item.simulation, 0).toFixed(1)} giờ
                                    </Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Tổng định mức:</Text>
                                    <Text strong style={{ color: '#722ed1' }}>
                                        {comparisonData.reduce((sum, item) => sum + item.target, 0).toFixed(1)} giờ
                                    </Text>
                                </div>
                                <Divider style={{ margin: '8px 0' }} />
                                <div className="flex justify-between">
                                    <Text strong>Chênh lệch tổng:</Text>
                                    <Text strong style={{ 
                                        color: comparisonData.reduce((sum, item) => sum + item.difference, 0) >= 0 ? '#52c41a' : '#ff4d4f',
                                        fontSize: '16px'
                                    }}>
                                        {(comparisonData.reduce((sum, item) => sum + item.difference, 0) >= 0 ? '+' : '')}
                                        {comparisonData.reduce((sum, item) => sum + item.difference, 0).toFixed(1)} giờ
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

// Component biểu đồ phân tích nâng cao sử dụng dữ liệu API
const BieuDoPhantichNangCao = ({ apiStatisticsData, namHocSelected }) => {
    if (!apiStatisticsData || !namHocSelected) {
        return (
            <Empty 
                description="Chưa có dữ liệu để hiển thị biểu đồ"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    const currentYearData = apiStatisticsData.statistics_by_year?.find(
        item => item.nam_hoc_id === parseInt(namHocSelected.id)
    );

    if (!currentYearData) {
        return (
            <Empty 
                description="Không tìm thấy dữ liệu cho năm học này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    const { phan_bo_gio } = currentYearData;

    // Dữ liệu cho biểu đồ tròn - Phân bố giờ
    const pieDataGD = [
        { type: 'Giảng dạy & Đánh giá', value: phan_bo_gio.giang_day_lop_danhgia_khacgd || 0, color: '#1890ff' },
        { type: 'Hướng dẫn', value: phan_bo_gio.huong_dan || 0, color: '#52c41a' },
        { type: 'Coi/Chấm thi', value: phan_bo_gio.coi_cham_thi_dh || 0, color: '#faad14' },
        { type: 'NCKH', value: phan_bo_gio.khcn || 0, color: '#722ed1' },
        { type: 'Công tác khác (GD)', value: phan_bo_gio.cong_tac_khac_gd || 0, color: '#fa8c16' }
    ].filter(item => item.value > 0);

    // Dữ liệu cho biểu đồ radar - So sánh với định mức
    const tongGioGD = (phan_bo_gio.giang_day_lop_danhgia_khacgd || 0) + 
                     (phan_bo_gio.huong_dan || 0) + 
                     (phan_bo_gio.coi_cham_thi_dh || 0) + 
                     (phan_bo_gio.cong_tac_khac_gd || 0);
    const tongGioKHCN = phan_bo_gio.khcn || 0;

    const radarData = [
        { item: 'Giảng dạy', thucHien: tongGioGD, dinhMuc: currentYearData.dinh_muc_gd },
        { item: 'NCKH', thucHien: tongGioKHCN, dinhMuc: currentYearData.dinh_muc_khcn },
        { item: 'Hướng dẫn', thucHien: phan_bo_gio.huong_dan || 0, dinhMuc: 100 },
        { item: 'Coi/Chấm thi', thucHien: phan_bo_gio.coi_cham_thi_dh || 0, dinhMuc: 50 }
    ];

    // Dữ liệu cho biểu đồ cột - So sánh theo thời gian
    const comparisonData = apiStatisticsData.statistics_by_year.map(yearData => ({
        nam_hoc: yearData.nam_hoc,
        giangday: (yearData.phan_bo_gio.giang_day_lop_danhgia_khacgd || 0) + 
                  (yearData.phan_bo_gio.huong_dan || 0) + 
                  (yearData.phan_bo_gio.coi_cham_thi_dh || 0) + 
                  (yearData.phan_bo_gio.cong_tac_khac_gd || 0),
        nckh: yearData.phan_bo_gio.khcn || 0,
        dinhmuc_gd: yearData.dinh_muc_gd,
        dinhmuc_khcn: yearData.dinh_muc_khcn,
        tong_thuc_hien: yearData.tong_gio_thuc_hien
    }));

    // Component Pie Chart với Canvas
    const PieChart = ({ data, title }) => {
        const canvasRef = useRef(null);
        
        useEffect(() => {
            if (!canvasRef.current || !data.length) return;
            
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 40;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const total = data.reduce((sum, item) => sum + item.value, 0);
            let currentAngle = -Math.PI / 2;
            
            // Draw pie slices
            data.forEach((item, index) => {
                const sliceAngle = (item.value / total) * 2 * Math.PI;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = item.color;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw labels
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius + 25);
                const labelY = centerY + Math.sin(labelAngle) * (radius + 25);
                
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                const percentage = ((item.value / total) * 100).toFixed(1);
                ctx.fillText(`${percentage}%`, labelX, labelY);
                
                currentAngle += sliceAngle;
            });
        }, [data]);
        
        return (
            <div style={{ textAlign: 'center' }}>
                <Title level={5} style={{ marginBottom: 16 }}>{title}</Title>
                <canvas ref={canvasRef} width={400} height={300} style={{ maxWidth: '100%' }} />
                <div style={{ marginTop: 16 }}>
                    {data.map((item, index) => (
                        <div key={index} style={{ display: 'inline-block', margin: '4px 12px' }}>
                            <span style={{ 
                                display: 'inline-block', 
                                width: 12, 
                                height: 12, 
                                backgroundColor: item.color, 
                                marginRight: 8 
                            }}></span>
                            <Text style={{ fontSize: '12px' }}>{item.type}: {item.value.toFixed(1)} giờ</Text>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Component Bar Chart với Canvas
    const BarChart = ({ data, title }) => {
        const canvasRef = useRef(null);
        
        useEffect(() => {
            if (!canvasRef.current || !data.length) return;
            
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const padding = 60;
            const chartWidth = canvas.width - 2 * padding;
            const chartHeight = canvas.height - 2 * padding;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const maxValue = Math.max(...data.map(d => Math.max(d.giangday, d.nckh, d.dinhmuc_gd, d.dinhmuc_khcn)));
            const barWidth = chartWidth / (data.length * 4 + (data.length - 1));
            
            // Draw bars
            data.forEach((item, index) => {
                const x = padding + index * (barWidth * 4 + barWidth);
                
                // Giảng dạy thực hiện
                const gdHeight = (item.giangday / maxValue) * chartHeight;
                ctx.fillStyle = '#1890ff';
                ctx.fillRect(x, padding + chartHeight - gdHeight, barWidth, gdHeight);
                
                // NCKH thực hiện
                const nckhHeight = (item.nckh / maxValue) * chartHeight;
                ctx.fillStyle = '#722ed1';
                ctx.fillRect(x + barWidth, padding + chartHeight - nckhHeight, barWidth, nckhHeight);
                
                // Định mức GD
                const dmGdHeight = (item.dinhmuc_gd / maxValue) * chartHeight;
                ctx.fillStyle = '#52c41a';
                ctx.fillRect(x + barWidth * 2, padding + chartHeight - dmGdHeight, barWidth, dmGdHeight);
                
                // Định mức KHCN
                const dmKhcnHeight = (item.dinhmuc_khcn / maxValue) * chartHeight;
                ctx.fillStyle = '#faad14';
                ctx.fillRect(x + barWidth * 3, padding + chartHeight - dmKhcnHeight, barWidth, dmKhcnHeight);
                
                // Labels
                ctx.fillStyle = '#333';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(item.nam_hoc, x + barWidth * 2, canvas.height - 10);
            });
            
            // Draw axes
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, padding);
            ctx.lineTo(padding, padding + chartHeight);
            ctx.lineTo(padding + chartWidth, padding + chartHeight);
            ctx.stroke();
            
        }, [data]);
        
        return (
            <div style={{ textAlign: 'center' }}>
                <Title level={5} style={{ marginBottom: 16 }}>{title}</Title>
                <canvas ref={canvasRef} width={600} height={300} style={{ maxWidth: '100%' }} />
                <div style={{ marginTop: 16 }}>
                    <span style={{ display: 'inline-block', margin: '4px 12px' }}>
                        <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#1890ff', marginRight: 8 }}></span>
                        <Text style={{ fontSize: '12px' }}>GD Thực hiện</Text>
                    </span>
                    <span style={{ display: 'inline-block', margin: '4px 12px' }}>
                        <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#722ed1', marginRight: 8 }}></span>
                        <Text style={{ fontSize: '12px' }}>NCKH Thực hiện</Text>
                    </span>
                    <span style={{ display: 'inline-block', margin: '4px 12px' }}>
                        <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#52c41a', marginRight: 8 }}></span>
                        <Text style={{ fontSize: '12px' }}>Định mức GD</Text>
                    </span>
                    <span style={{ display: 'inline-block', margin: '4px 12px' }}>
                        <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#faad14', marginRight: 8 }}></span>
                        <Text style={{ fontSize: '12px' }}>Định mức KHCN</Text>
                    </span>
                </div>
            </div>
        );
    };

    // Component Radar Chart với Canvas
    const RadarChart = ({ data, title }) => {
        const canvasRef = useRef(null);
        
        useEffect(() => {
            if (!canvasRef.current || !data.length) return;
            
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 60;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const angleStep = (2 * Math.PI) / data.length;
            const maxValue = Math.max(...data.map(d => Math.max(d.thucHien, d.dinhMuc)));
            
            // Draw grid circles
            for (let i = 1; i <= 5; i++) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
                ctx.strokeStyle = '#e8e8e8';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Draw axes
            data.forEach((item, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = '#e8e8e8';
                ctx.stroke();
                
                // Labels
                const labelX = centerX + Math.cos(angle) * (radius + 30);
                const labelY = centerY + Math.sin(angle) * (radius + 30);
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(item.item, labelX, labelY);
            });
            
            // Draw data polygons
            // Thực hiện
            ctx.beginPath();
            data.forEach((item, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const distance = (item.thucHien / maxValue) * radius;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fillStyle = 'rgba(24, 144, 255, 0.3)';
            ctx.fill();
            ctx.strokeStyle = '#1890ff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Định mức
            ctx.beginPath();
            data.forEach((item, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const distance = (item.dinhMuc / maxValue) * radius;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fillStyle = 'rgba(82, 196, 26, 0.3)';
            ctx.fill();
            ctx.strokeStyle = '#52c41a';
            ctx.lineWidth = 2;
            ctx.stroke();
            
        }, [data]);
        
        return (
            <div style={{ textAlign: 'center' }}>
                <Title level={5} style={{ marginBottom: 16 }}>{title}</Title>
                <canvas ref={canvasRef} width={400} height={300} style={{ maxWidth: '100%' }} />
                <div style={{ marginTop: 16 }}>
                    <span style={{ display: 'inline-block', margin: '4px 12px' }}>
                        <div style={{ 
                            width: 16, 
                            height: 3, 
                            backgroundColor: '#1890ff',
                            borderRadius: '2px',
                            display: 'inline-block',
                            marginRight: 8 
                        }}></div>
                        <Text style={{ fontSize: '12px' }}>Thực hiện</Text>
                    </span>
                    <span style={{ display: 'inline-block', margin: '4px 12px' }}>
                        <div style={{ 
                            width: 16, 
                            height: 3, 
                            backgroundColor: '#52c41a',
                            borderRadius: '2px',
                            display: 'inline-block',
                            marginRight: 8 
                        }}></div>
                        <Text style={{ fontSize: '12px' }}>Định mức</Text>
                    </span>
                </div>
            </div>
        );
    };

    return (
        <Tabs defaultActiveKey="pie" className="chart-tabs-enhanced">
            <TabPane tab={<span><PieChartOutlined />Phân bố công việc</span>} key="pie">
                <PieChart 
                    data={pieDataGD} 
                    title="Phân bố giờ làm việc theo loại hoạt động"
                />
            </TabPane>
            <TabPane tab={<span><BarChartOutlined />So sánh định mức</span>} key="radar">
                <RadarChart 
                    data={radarData} 
                    title="So sánh thực hiện với định mức"
                />
            </TabPane>
            <TabPane tab={<span><BarChartOutlined />So sánh theo năm</span>} key="column">
                <BarChart 
                    data={comparisonData} 
                    title="So sánh khối lượng công việc theo năm học"
                />
            </TabPane>
        </Tabs>
    );
};

// Component thiết lập mục tiêu
const ThietLapMucTieu = ({ currentUserProfile, namHocSelected, onTargetsChange }) => {
    const [targets, setTargets] = useState({
        gd: 300,
        khcn: 300,
        hd: 100,
        dg: 60,
        kt: 40,
        xd: 30,
        ct: 50
    });

    useEffect(() => {
        // Load targets from localStorage
        if (namHocSelected) {
            const savedTargets = localStorage.getItem(`targets_${namHocSelected.id}`);
            if (savedTargets) {
                try {
                    const parsed = JSON.parse(savedTargets);
                    setTargets(parsed);
                } catch (error) {
                    console.error('Error parsing saved targets:', error);
                }
            }
        }
    }, [namHocSelected]);

    const handleTargetChange = (key, value) => {
        const newTargets = { ...targets, [key]: value };
        setTargets(newTargets);
        
        // Save to localStorage
        if (namHocSelected) {
            localStorage.setItem(`targets_${namHocSelected.id}`, JSON.stringify(newTargets));
        }
        
        // Notify parent component
        if (onTargetsChange) {
            onTargetsChange(newTargets);
        }
    };

    const targetConfigs = [
        { key: 'gd', label: 'Giờ Giảng dạy', color: '#1890ff', icon: <BookOutlined />, unit: 'giờ' },
        { key: 'khcn', label: 'Giờ NCKH', color: '#722ed1', icon: <ExperimentOutlined />, unit: 'giờ' },
        { key: 'hd', label: 'Hướng dẫn', color: '#52c41a', icon: <UserSwitchOutlined />, unit: 'giờ' },
        { key: 'dg', label: 'Đánh giá', color: '#faad14', icon: <AuditOutlined />, unit: 'giờ' },
        { key: 'kt', label: 'Khảo thí', color: '#fa8c16', icon: <CarryOutOutlined />, unit: 'giờ' },
        { key: 'xd', label: 'XD CTĐT', color: '#389e0d', icon: <BuildOutlined />, unit: 'giờ' },
        { key: 'ct', label: 'Công tác khác', color: '#eb2f96', icon: <TeamOutlined />, unit: 'giờ' }
    ];

    return (
        <div className="space-y-6">
            <Alert
                message="Thiết lập Mục tiêu Cá nhân"
                description="Đặt mục tiêu cho từng loại hoạt động để theo dõi tiến độ và lập kế hoạch công việc hiệu quả"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Row gutter={[16, 16]}>
                {targetConfigs.map((config) => (
                    <Col xs={12} sm={8} lg={6} key={config.key}>
                        <Card className="target-card" hoverable>
                            <div className="text-center space-y-3">
                                <div 
                                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                                >
                                    {config.icon}
                                </div>
                                
                                <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                                    {config.label}
                                </Title>
                                
                                <InputNumber
                                    value={targets[config.key]}
                                    onChange={(value) => handleTargetChange(config.key, value || 0)}
                                    min={0}
                                    max={1000}
                                    step={10}
                                    size="large"
                                    style={{ width: '100%' }}
                                    formatter={value => `${value} ${config.unit}`}
                                    parser={value => value.replace(/[^\d]/g, '')}
                                />
                                
                                <Progress
                                    percent={Math.min((targets[config.key] / 500) * 100, 100)}
                                    strokeColor={config.color}
                                    size="small"
                                    showInfo={false}
                                />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card title="Tổng quan Mục tiêu" className="mt-6">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Statistic
                            title="Tổng mục tiêu Giảng dạy"
                            value={targets.gd + targets.hd + targets.dg + targets.kt + targets.xd + targets.ct}
                            suffix="giờ"
                            prefix={<DashboardOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Statistic
                            title="Tổng mục tiêu NCKH"
                            value={targets.khcn}
                            suffix="giờ"
                            prefix={<ExperimentOutlined style={{ color: '#722ed1' }} />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Col>
                </Row>
            </Card>

            <style>{`
                .target-card .ant-card-body {
                    padding: 16px !important;
                }
                
                .target-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
                
                .space-y-3 > * + * {
                    margin-top: 12px !important;
                }
                
                .space-y-6 > * + * {
                    margin-top: 24px !important;
                }
            `}</style>
        </div>
    );
};

// Component so sánh với mục tiêu sử dụng dữ liệu API
const SoSanhMucTieu = ({ apiStatisticsData, namHocSelected }) => {
    if (!apiStatisticsData || !namHocSelected) {
        return (
            <Empty 
                description="Chưa có dữ liệu để so sánh mục tiêu"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    const currentYearData = apiStatisticsData.statistics_by_year?.find(
        item => item.nam_hoc_id === parseInt(namHocSelected.id)
    );

    if (!currentYearData) {
        return (
            <Empty 
                description="Không tìm thấy dữ liệu cho năm học này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    const { phan_bo_gio, dinh_muc_gd, dinh_muc_khcn, ty_le_hoanthanh_gd, ty_le_hoanthanh_khcn } = currentYearData;

    const tongGioGD = (phan_bo_gio.giang_day_lop_danhgia_khacgd || 0) + 
                     (phan_bo_gio.huong_dan || 0) + 
                     (phan_bo_gio.coi_cham_thi_dh || 0) + 
                     (phan_bo_gio.cong_tac_khac_gd || 0);
    const tongGioKHCN = phan_bo_gio.khcn || 0;

    const achievements = [
        {
            key: 'gd',
            title: 'Giảng dạy',
            value: tongGioGD,
            target: dinh_muc_gd,
            percentage: ty_le_hoanthanh_gd,
            icon: <BookOutlined />,
            color: '#1890ff'
        },
        {
            key: 'khcn',
            title: 'NCKH',
            value: tongGioKHCN,
            target: dinh_muc_khcn,
            percentage: ty_le_hoanthanh_khcn,
            icon: <ExperimentOutlined />,
            color: '#722ed1'
        },
        {
            key: 'hd',
            title: 'Hướng dẫn',
            value: phan_bo_gio.huong_dan || 0,
            target: 80,
            percentage: 0,
            icon: <UserSwitchOutlined />,
            color: '#52c41a'
        },
        {
            key: 'thi',
            title: 'Coi/Chấm thi',
            value: phan_bo_gio.coi_cham_thi_dh || 0,
            target: 40,
            percentage: 0,
            icon: <CarryOutOutlined />,
            color: '#faad14'
        }
    ];

    // Tính phần trăm cho hướng dẫn và thi
    achievements[2].percentage = achievements[2].target > 0 ? (achievements[2].value / achievements[2].target * 100) : 0;
    achievements[3].percentage = achievements[3].target > 0 ? (achievements[3].value / achievements[3].target * 100) : 0;

    return (
        <div className="space-y-6">
            <Alert
                message="So sánh với Mục tiêu"
                description="Phân tích mức độ hoàn thành các mục tiêu công việc theo từng lĩnh vực"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Row gutter={[16, 16]}>
                {achievements.map((item) => (
                    <Col xs={12} md={6} key={item.key}>
                        <Card className="target-comparison-card" hoverable>
                            <div className="text-center space-y-4">
                                <div 
                                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                                >
                                    {item.icon}
                                </div>
                                
                                <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                                    {item.title}
                                </Title>
                                
                                <div className="space-y-2">
                                    <Progress
                                        type="circle"
                                        percent={Math.min(item.percentage, 200)}
                                        size={80}
                                        strokeColor={{
                                            '0%': item.color,
                                            '100%': item.percentage >= 100 ? '#52c41a' : item.color,
                                        }}
                                        format={() => `${item.percentage.toFixed(0)}%`}
                                    />
                                    
                                    <div className="space-y-1">
                                        <Text strong style={{ color: item.color, display: 'block' }}>
                                            {item.value.toFixed(1)}/{item.target} giờ
                                        </Text>
                                        
                                        <div className="space-y-1">
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                Chênh lệch: {item.value >= item.target ? '+' : ''}{(item.value - item.target).toFixed(1)} giờ
                                            </div>
                                            
                                            <Tag 
                                                color={item.percentage >= 100 ? 'success' : item.percentage >= 80 ? 'warning' : 'error'}
                                                size="small"
                                            >
                                                {item.percentage >= 100 ? 'Đạt mục tiêu' : 
                                                 item.percentage >= 80 ? 'Gần đạt' : 'Chưa đạt'}
                                            </Tag>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Tổng kết và đánh giá */}
            <Card title="Tổng kết Mục tiêu" className="summary-card">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <div className="space-y-4">
                            <Title level={5}>Đánh giá tổng quan</Title>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Text>Tổng giờ GD:</Text>
                                    <Text strong>{tongGioGD.toFixed(1)} giờ</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Định mức GD:</Text>
                                    <Text>{dinh_muc_gd} giờ</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Tỷ lệ GD:</Text>
                                    <Text strong style={{ color: ty_le_hoanthanh_gd >= 100 ? '#52c41a' : '#faad14' }}>
                                        {ty_le_hoanthanh_gd.toFixed(1)}%
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={12}>
                        <div className="space-y-4">
                            <Title level={5}>Mục tiêu NCKH</Title>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Text>Tổng giờ NCKH:</Text>
                                    <Text strong>{tongGioKHCN.toFixed(1)} giờ</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Định mức NCKH:</Text>
                                    <Text>{dinh_muc_khcn} giờ</Text>
                                </div>
                                <div className="flex justify-between">
                                    <Text>Tỷ lệ NCKH:</Text>
                                    <Text strong style={{ color: ty_le_hoanthanh_khcn >= 100 ? '#52c41a' : '#faad14' }}>
                                        {ty_le_hoanthanh_khcn.toFixed(1)}%
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Divider />
                
                <div className="text-center">
                    <div className="space-y-2">
                        <Title level={5}>Tổng điểm đánh giá</Title>
                        <div className="flex justify-center space-x-8">
                            <div className="text-center">
                                <div className="text-2xl font-bold" style={{ 
                                    color: achievements.filter(a => a.percentage >= 100).length >= 3 ? '#52c41a' : 
                                           achievements.filter(a => a.percentage >= 80).length >= 2 ? '#faad14' : '#ff4d4f' 
                                }}>
                                    {achievements.filter(a => a.percentage >= 100).length}/4
                                </div>
                                <Text type="secondary">Mục tiêu đạt</Text>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold" style={{ color: '#1890ff' }}>
                                    {(achievements.reduce((sum, a) => sum + a.percentage, 0) / achievements.length).toFixed(0)}%
                                </div>
                                <Text type="secondary">Tỷ lệ trung bình</Text>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <style>{`
                .target-comparison-card {
                    transition: all 0.3s ease;
                    border-radius: 12px;
                    border: 1px solid #f0f0f0;
                }
                .target-comparison-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }
                .summary-card {
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .space-y-1 > * + * {
                    margin-top: 4px !important;
                }
                .space-y-2 > * + * {
                    margin-top: 8px !important;
                }
                .space-y-4 > * + * {
                    margin-top: 16px !important;
                }
                .space-y-6 > * + * {
                    margin-top: 24px !important;
                }
                .flex {
                    display: flex;
                }
                .justify-between {
                    justify-content: space-between;
                }
                .justify-center {
                    justify-content: center;
                }
                .text-center {
                    text-align: center;
                }
                .space-x-8 > * + * {
                    margin-left: 32px !important;
                }
            `}</style>
        </div>
    );
};

// Component lịch sử mô phỏng
const LichSuMoPhong = ({ selectedNamHocId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedNamHocId) {
            loadHistory();
        }
    }, [selectedNamHocId]);

    const loadHistory = () => {
        setLoading(true);
        try {
            const historyKey = `simulation_history_${selectedNamHocId}`;
            const savedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
            setHistory(savedHistory);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        Modal.confirm({
            title: 'Xác nhận xóa lịch sử',
            content: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử mô phỏng?',
            okText: 'Có, xóa',
            cancelText: 'Hủy',
            onOk: () => {
                const historyKey = `simulation_history_${selectedNamHocId}`;
                localStorage.removeItem(historyKey);
                setHistory([]);
                message.success('Đã xóa lịch sử mô phỏng');
            },
        });
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 200,
            render: (timestamp) => moment(timestamp).format('HH:mm DD/MM/YYYY')
        },
        {
            title: 'Tổng giờ GD',
            dataIndex: ['results', 'tongKet', 'tongGioGd'],
            key: 'tongGioGd',
            width: 120,
            align: 'center',
            render: (value) => <Text strong style={{ color: '#1890ff' }}>{parseFloat(value || 0).toFixed(1)}</Text>
        },
        {
            title: 'Tổng giờ KHCN',
            dataIndex: ['results', 'tongKet', 'tongGioKhcn'],
            key: 'tongGioKhcn',
            width: 120,
            align: 'center',
            render: (value) => <Text strong style={{ color: '#722ed1' }}>{parseFloat(value || 0).toFixed(1)}</Text>
        },
        {
            title: 'Tổng cộng',
            dataIndex: ['results', 'tongKet', 'tongCong'],
            key: 'tongCong',
            width: 120,
            align: 'center',
            render: (value) => <Text strong style={{ color: '#fa8c16' }}>{parseFloat(value || 0).toFixed(1)}</Text>
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            ellipsis: true,
            render: (text) => <Text type="secondary">{text}</Text>
        }
    ];

    if (!selectedNamHocId) {
        return (
            <Empty 
                description="Vui lòng chọn năm học để xem lịch sử mô phỏng"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Title level={4}>Lịch sử Mô phỏng</Title>
                {history.length > 0 && (
                    <Button danger onClick={clearHistory}>
                        Xóa lịch sử
                    </Button>
                )}
            </div>

            <Table
                columns={columns}
                dataSource={history}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                size="small"
                locale={{ 
                    emptyText: 'Chưa có lịch sử mô phỏng nào cho năm học này' 
                }}
            />
        </div>
    );
};

// Main component với các cải tiến
function KeHoachGiangDay() {
    const [form] = Form.useForm();
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [error, setError] = useState(null);

    const [namHocList, setNamHocList] = useState([]);
    const [selectedNamHocId, setSelectedNamHocId] = useState(null);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showCalculationModal, setShowCalculationModal] = useState(false);
    
    // Thay thế calculationResults bằng apiStatisticsData
    const [apiStatisticsData, setApiStatisticsData] = useState(null);
    
    // New states for enhanced features
    const [activeAnalysisTab, setActiveAnalysisTab] = useState('overview');
    const [autoSave, setAutoSave] = useState(true);
    const [lastSaved, setLastSaved] = useState(null);

    // Add missing userTargets state
    const [userTargets, setUserTargets] = useState(null);

    // Thêm state cho mô phỏng
    const [simulationResults, setSimulationResults] = useState(null);

    // State cho từng bảng kê khai chi tiết mô phỏng
    const [simGdLopDhTrongBmList, setSimGdLopDhTrongBmList] = useState([]);
    const [simGdLopDhNgoaiBmList, setSimGdLopDhNgoaiBmList] = useState([]);
    const [simGdLopDhNgoaiCsList, setSimGdLopDhNgoaiCsList] = useState([]);
    const [simGdLopThsList, setSimGdLopThsList] = useState([]);
    const [simGdLopTsList, setSimGdLopTsList] = useState([]);

    const [simHdDatnDhList, setSimHdDatnDhList] = useState([]);
    const [simHdLvThsList, setSimHdLvThsList] = useState([]);
    const [simHdLaTsList, setSimHdLaTsList] = useState([]);

    const [simDgHpTnDhList, setSimDgHpTnDhList] = useState([]);
    const [simDgLvThacsiList, setSimDgLvThacsiList] = useState([]);
    const [simDgLaTsDotList, setSimDgLaTsDotList] = useState([]);

    const [simKhaoThiDhTrongBmList, setSimKhaoThiDhTrongBmList] = useState([]);
    const [simKhaoThiDhNgoaiBmList, setSimKhaoThiDhNgoaiBmList] = useState([]);
    const [simKhaoThiThsList, setSimKhaoThiThsList] = useState([]);
    const [simKhaoThiTsList, setSimKhaoThiTsList] = useState([]);

    const [simXdCtdtVaKhacGdList, setSimXdCtdtVaKhacGdList] = useState([]);
    const [simNckhList, setSimNckhList] = useState([]);
    const [simCongTacKhacList, setSimCongTacKhacList] = useState([]);

    const [dmHeSoChung, setDmHeSoChung] = useState([]);

    // Load user targets from localStorage when selectedNamHocId changes
    useEffect(() => {
        if (selectedNamHocId) {
            const savedTargets = localStorage.getItem(`targets_${selectedNamHocId}`);
            if (savedTargets) {
                try {
                    const parsedTargets = JSON.parse(savedTargets);
                    setUserTargets(parsedTargets);
                } catch (error) {
                    console.error('Error parsing saved targets:', error);
                    // Set default targets if parsing fails
                    setUserTargets({
                        gd: 300,
                        khcn: 300,
                        hd: 100,
                        dg: 60,
                        kt: 40,
                        xd: 30,
                        ct: 50
                    });
                }
            } else {
                // Set default targets if no saved targets
                setUserTargets({
                    gd: 300,
                    khcn: 300,
                    hd: 100,
                    dg: 60,
                    kt: 40,
                    xd: 30,
                    ct: 50
                });
            }
        }
    }, [selectedNamHocId]);

    // Define loadStatisticsFromAPI first before using it
    const loadStatisticsFromAPI = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/lecturer/statistics/overview", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApiStatisticsData(response.data);
            return response.data;
        } catch (error) {
            console.error("Error loading statistics:", error);
            message.error("Không thể tải dữ liệu thống kê từ hệ thống");
            return null;
        }
    }, []);

    const resetAllSimulationLists = () => {
        setSimGdLopDhTrongBmList([]);
        setSimGdLopDhNgoaiBmList([]);
        setSimGdLopDhNgoaiCsList([]);
        setSimGdLopThsList([]);
        setSimGdLopTsList([]);
        setSimHdDatnDhList([]);
        setSimHdLvThsList([]);
        setSimHdLaTsList([]);
        setSimDgHpTnDhList([]);
        setSimDgLvThacsiList([]);
        setSimDgLaTsDotList([]);
        setSimKhaoThiDhTrongBmList([]);
        setSimKhaoThiDhNgoaiBmList([]);
        setSimKhaoThiThsList([]);
        setSimKhaoThiTsList([]);
        setSimXdCtdtVaKhacGdList([]);
        setSimNckhList([]);
        setSimCongTacKhacList([]);
    };

    // Save simulation data to localStorage
    const saveSimulationDataToStorage = useCallback(() => {
        if (!selectedNamHocId) return;
        
        try {
            const dataToSave = {
                simGdLopDhTrongBmList,
                simGdLopDhNgoaiBmList,
                simGdLopDhNgoaiCsList,
                simGdLopThsList,
                simGdLopTsList,
                simHdDatnDhList,
                simHdLvThsList,
                simHdLaTsList,
                simDgHpTnDhList,
                setSimDgHpTnDhList,
                simDgLvThacsiList,
                setSimDgLvThacsiList,
                simDgLaTsDotList,
                setSimDgLaTsDotList,
                simKhaoThiDhTrongBmList,
                setSimKhaoThiDhTrongBmList,
                simKhaoThiDhNgoaiBmList,
                setSimKhaoThiDhNgoaiBmList,
                simKhaoThiThsList,
                setSimKhaoThiThsList,
                simKhaoThiTsList,
                setSimKhaoThiTsList,
                simXdCtdtVaKhacGdList,
                setSimXdCtdtVaKhacGdList,
                simNckhList,
                setSimNckhList,
                simCongTacKhacList,
                setSimCongTacKhacList,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem(`simulation_data_${selectedNamHocId}`, JSON.stringify(dataToSave));
            setLastSaved(new Date());
        } catch (error) {
            console.error('Error saving simulation data:', error);
        }
    }, [
        selectedNamHocId, simGdLopDhTrongBmList, simGdLopDhNgoaiBmList, simGdLopDhNgoaiCsList,
        simGdLopThsList, simGdLopTsList, simHdDatnDhList, simHdLvThsList, simHdLaTsList,
        simDgHpTnDhList, simDgLvThacsiList, simDgLaTsDotList, simKhaoThiDhTrongBmList,
        simKhaoThiDhNgoaiBmList, simKhaoThiThsList, simKhaoThiTsList,
        simXdCtdtVaKhacGdList, simNckhList, simCongTacKhacList
    ]);

    // Load simulation data from localStorage
    const loadSimulationDataFromStorage = useCallback(() => {
        if (!selectedNamHocId) return;
        
        try {
            const savedData = localStorage.getItem(`simulation_data_${selectedNamHocId}`);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                setSimGdLopDhTrongBmList(parsedData.simGdLopDhTrongBmList || []);
                setSimGdLopDhNgoaiBmList(parsedData.simGdLopDhNgoaiBmList || []);
                setSimGdLopDhNgoaiCsList(parsedData.simGdLopDhNgoaiCsList || []);
                setSimGdLopThsList(parsedData.simGdLopThsList || []);
                setSimGdLopTsList(parsedData.simGdLopTsList || []);
                
                setSimHdDatnDhList(parsedData.simHdDatnDhList || []);
                setSimHdLvThsList(parsedData.simHdLvThsList || []);
                setSimHdLaTsList(parsedData.simHdLaTsList || []);
                
                setSimDgHpTnDhList(parsedData.simDgHpTnDhList || []);
                setSimDgLvThacsiList(parsedData.simDgLvThacsiList || []);
                setSimDgLaTsDotList(parsedData.simDgLaTsDotList || []);
                
                setSimKhaoThiDhTrongBmList(parsedData.simKhaoThiDhTrongBmList || []);
                setSimKhaoThiDhNgoaiBmList(parsedData.simKhaoThiDhNgoaiBmList || []);
                setSimKhaoThiThsList(parsedData.simKhaoThiThsList || []);
                setSimKhaoThiTsList(parsedData.simKhaoThiTsList || []);
                
                setSimXdCtdtVaKhacGdList(parsedData.simXdCtdtVaKhacGdList || []);
                setSimNckhList(parsedData.simNckhList || []);
                setSimCongTacKhacList(parsedData.simCongTacKhacList || []);
            }
        } catch (error) {
            console.error('Error loading simulation data:', error);
        }
    }, [selectedNamHocId]);

    // Auto-save simulation data when data changes
    useEffect(() => {
        if (autoSave && selectedNamHocId) {
            saveSimulationDataToStorage();
        }
    }, [selectedNamHocId, saveSimulationDataToStorage, autoSave]);

    // Load simulation data when selectedNamHocId changes
    useEffect(() => {
        if (selectedNamHocId && !isLoadingInitial) {
            loadSimulationDataFromStorage();
        } else if (!selectedNamHocId) {
            resetAllSimulationLists();
        }
    }, [selectedNamHocId, loadSimulationDataFromStorage, isLoadingInitial]);

    // Calculate simulation results
    const calculateSimulationResults = useCallback(() => {
        const giangDay = {
            dhTrongBm: simGdLopDhTrongBmList.reduce((sum, item) => sum + parseFloat(item.so_tiet_qd || 0), 0),
            dhNgoaiBm: simGdLopDhNgoaiBmList.reduce((sum, item) => sum + parseFloat(item.so_tiet_qd || 0), 0),
            dhNgoaiCs: simGdLopDhNgoaiCsList.reduce((sum, item) => sum + parseFloat(item.so_tiet_qd || 0), 0),
            ths: simGdLopThsList.reduce((sum, item) => sum + parseFloat(item.so_tiet_qd || 0), 0),
            ts: simGdLopTsList.reduce((sum, item) => sum + parseFloat(item.so_tiet_qd || 0), 0),
        };
        giangDay.tong = Object.values(giangDay).reduce((sum, val) => sum + val, 0);

        const huongDan = {
            datn: simHdDatnDhList.reduce((sum, item) => sum + parseFloat(item.tong_gio_quydoi_gv_nhap || 0), 0),
            lvThs: simHdLvThsList.reduce((sum, item) => sum + parseFloat(item.tong_gio_quydoi_gv_nhap || 0), 0),
            laTs: simHdLaTsList.reduce((sum, item) => sum + parseFloat(item.tong_gio_quydoi_gv_nhap || 0), 0),
        };
        huongDan.tong = Object.values(huongDan).reduce((sum, val) => sum + val, 0);

        const danhGia = {
            hpTn: simDgHpTnDhList.reduce((sum, item) => sum + parseFloat(item.tong_gio_quydoi_gv_nhap || 0), 0),
            lvThs: simDgLvThacsiList.reduce((sum, item) => sum + parseFloat(item.tong_gio_quydoi_gv_nhap || 0), 0),
            laTs: simDgLaTsDotList.reduce((sum, item) => sum + parseFloat(item.tong_gio_quydoi_cho_dot || 0), 0),
        };
        danhGia.tong = Object.values(danhGia).reduce((sum, val) => sum + val, 0);

        const khaoThi = {
            dhTrongBm: simKhaoThiDhTrongBmList.reduce((sum, item) => sum + parseFloat(item.so_tiet_qd || 0), 0),
            dhNgoaiBm: simKhaoThiDhNgoaiBmList.reduce((sum, item) => sum + parseFloat(item.so_tiet_qd || 0), 0),
            ths: simKhaoThiThsList.reduce((sum, item) => sum + parseFloat(item.so_tiet_qd || 0), 0),
            ts: simKhaoThiTsList.reduce((sum, item) => sum + parseFloat(item.so_tiet_qd || 0), 0),
        };
        khaoThi.tong = Object.values(khaoThi).reduce((sum, val) => sum + val, 0);

        const xdCtdt = simXdCtdtVaKhacGdList.reduce((sum, item) => sum + parseFloat(item.tong_gio_quydoi_gv_nhap || 0), 0);
        const nckh = simNckhList.reduce((sum, item) => sum + parseFloat(item.tong_gio_nckh_gv_nhap || 0), 0);
        
        const congTacKhac = {
            gd: simCongTacKhacList
                .filter(item => item.loai_gio_quy_doi === 'GD')
                .reduce((sum, item) => sum + parseFloat(item.so_gio_quy_doi_gv_nhap || 0), 0),
            khcn: simCongTacKhacList
                .filter(item => item.loai_gio_quy_doi === 'KHCN')
                .reduce((sum, item) => sum + parseFloat(item.so_gio_quy_doi_gv_nhap || 0), 0),
        };
        congTacKhac.tong = congTacKhac.gd + congTacKhac.khcn;

        // Tính tổng kết
        const dinhmucGd = userTargets?.gd || 300;
        const dinhmucKhcn = userTargets?.khcn || 300;
        
        const tongGioGd = giangDay.tong + huongDan.tong + danhGia.tong + khaoThi.tong + xdCtdt + congTacKhac.gd;
        const tongGioKhcn = nckh + congTacKhac.khcn;
        const tongCong = tongGioGd + tongGioKhcn;

        const tongKet = {
            tongGioGd,
            tongGioKhcn,
            tongCong,
            dinhmucGd,
            dinhmucKhcn,
            chenh_lech_gd: tongGioGd - dinhmucGd,
            chenh_lech_khcn: tongGioKhcn - dinhmucKhcn,
        };

        return {
            giangDay,
            huongDan,
            danhGia,
            khaoThi,
            xdCtdt,
            nckh,
            congTacKhac,
            tongKet
        };
    }, [
        simGdLopDhTrongBmList, simGdLopDhNgoaiBmList, simGdLopDhNgoaiCsList, simGdLopThsList, simGdLopTsList,
        simHdDatnDhList, simHdLvThsList, simHdLaTsList, simDgHpTnDhList, simDgLvThacsiList, simDgLaTsDotList,
        simKhaoThiDhTrongBmList, simKhaoThiDhNgoaiBmList, simKhaoThiThsList, simKhaoThiTsList,
        simXdCtdtVaKhacGdList, simNckhList, simCongTacKhacList, userTargets
    ]);

    // Update simulation results when data changes
    useEffect(() => {
        const results = calculateSimulationResults();
        setSimulationResults(results);
    }, [calculateSimulationResults]);

    // Modified calculateWorkload to use API data instead
    const calculateWorkload = async () => {
        setIsCalculating(true);
        
        // Simulate loading time
        setTimeout(async () => {
            const statisticsData = await loadStatisticsFromAPI();
            if (statisticsData) {
                setShowCalculationModal(true);
                // Auto save to history if enabled
                if (autoSave) {
                    saveToHistory(statisticsData);
                }
            }
            setIsCalculating(false);
        }, 1500);
    };

    const saveToHistory = (statisticsData) => {
        if (!selectedNamHocId || !statisticsData) return;
        
        const historyKey = `simulation_history_${selectedNamHocId}`;
        const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        const currentYearData = statisticsData.statistics_by_year?.find(
            item => item.nam_hoc_id === parseInt(selectedNamHocId)
        );

        if (!currentYearData) return;
        
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            results: {
                tongKet: {
                    tongGioGd: (currentYearData.phan_bo_gio.giang_day_lop_danhgia_khacgd || 0) + 
                              (currentYearData.phan_bo_gio.huong_dan || 0) + 
                              (currentYearData.phan_bo_gio.coi_cham_thi_dh || 0) + 
                              (currentYearData.phan_bo_gio.cong_tac_khac_gd || 0),
                    tongGioKhcn: currentYearData.phan_bo_gio.khcn || 0,
                    tongCong: currentYearData.tong_gio_thuc_hien
                }
            },
            note: `Dữ liệu từ API ${moment().format('HH:mm DD/MM')}`
        };
        
        const updatedHistory = [newEntry, ...existingHistory.slice(0, 19)]; // Keep 20 entries
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
        setLastSaved(new Date());
    };

    const handleResetSimulation = () => {
        Modal.confirm({
            title: 'Xác nhận reset mô phỏng',
            content: 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu mô phỏng hiện tại?',
            okText: 'Có, reset',
            cancelText: 'Hủy',
            onOk: () => {
                resetAllSimulationLists();
                setApiStatisticsData(null);
                if (selectedNamHocId) {
                    localStorage.removeItem(`simulation_data_${selectedNamHocId}`);
                }
                message.success('Đã reset toàn bộ dữ liệu mô phỏng');
            },
        });
    };

    // Auto-save simulation data when data changes
    useEffect(() => {
        if (autoSave && selectedNamHocId) {
            saveSimulationDataToStorage();
        }
    }, [selectedNamHocId, saveSimulationDataToStorage, autoSave]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingInitial(true);
            try {
                const token = localStorage.getItem("token");
                
                const profileRes = await axios.get("/api/lecturer/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentUserProfile(profileRes.data);

                const namHocRes = await axios.get("/api/lecturer/nam-hoc", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const nhs = namHocRes.data || [];
                setNamHocList(nhs);
                
                const currentActiveNamHoc = nhs.find(nh => nh.la_nam_hien_hanh === 1);
                if (currentActiveNamHoc) {
                    setSelectedNamHocId(currentActiveNamHoc.id.toString());
                }

                // Load statistics data
                await loadStatisticsFromAPI();

                setError(null);
            } catch (error) {
                message.error("Không thể tải dữ liệu ban đầu.");
                setError("Lỗi tải dữ liệu ban đầu.");
            } finally {
                setIsLoadingInitial(false);
            }
        };
        fetchInitialData();
    }, [loadStatisticsFromAPI]);

    // Load simulation data when selectedNamHocId changes
    useEffect(() => {
        if (selectedNamHocId && !isLoadingInitial) {
            loadSimulationDataFromStorage();
        } else if (!selectedNamHocId) {
            resetAllSimulationLists();
        }
    }, [selectedNamHocId, loadSimulationDataFromStorage, isLoadingInitial]);

    const renderEnhancedCalculationModal = () => (
        <Modal
            title={
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <DashboardOutlined className="text-white text-lg" />
                    </div>
                    <span className="text-xl font-bold">Kết quả phân tích từ dữ liệu hệ thống</span>
                </div>
            }
            open={showCalculationModal}
            onCancel={() => setShowCalculationModal(false)}
            footer={[
                <Button key="close" onClick={() => setShowCalculationModal(false)}>
                    Đóng
                </Button>,
                <Button key="refresh" type="primary" onClick={loadStatisticsFromAPI} icon={<ReloadOutlined />}>
                    Tải lại dữ liệu
                </Button>
            ]}
            width={1200}
            className="enhanced-calculation-modal"
        >
            {apiStatisticsData && (
                <Tabs activeKey={activeAnalysisTab} onChange={setActiveAnalysisTab} className="analysis-tabs">
                    <TabPane tab={<span><DashboardOutlined />Tổng quan</span>} key="overview">
                        <ThongKeTongQuanNangCao 
                            apiStatisticsData={apiStatisticsData}
                            namHocSelected={namHocList.find(nh => nh.id.toString() === selectedNamHocId)}
                        />
                    </TabPane>
                    
                    <TabPane tab={<span><BarChartOutlined />Biểu đồ</span>} key="charts">
                        <BieuDoPhantichNangCao 
                            apiStatisticsData={apiStatisticsData}
                            namHocSelected={namHocList.find(nh => nh.id.toString() === selectedNamHocId)}
                        />
                    </TabPane>
                    
                    <TabPane tab={<span><AimOutlined />Mục tiêu</span>} key="targets">
                        <SoSanhMucTieu 
                            apiStatisticsData={apiStatisticsData}
                            namHocSelected={namHocList.find(nh => nh.id.toString() === selectedNamHocId)}
                        />
                    </TabPane>
                </Tabs>
            )}
        </Modal>
    );

    if (isLoadingInitial) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
                <Card className="text-center p-8">
                    <Spin size="large" />
                    <Title level={4} style={{ margin: 0, marginTop: 16 }}>Đang tải dữ liệu...</Title>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/40 relative">
            {/* Enhanced background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-8 space-y-6">
                {/* Enhanced Header */}
                <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                    <div className="bg-gradient-to-r from-slate-50 via-purple-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center">
                                    <CalculatorOutlined className="text-2xl text-white" />
                                </div>
                                <div>
                                    <Title level={2} style={{ margin: 0 }} className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                                        Kế hoạch Giảng dạy (Mô phỏng)
                                    </Title>
                                    <Text type="secondary">
                                        Mô phỏng và phân tích khối lượng công việc theo kế hoạch
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Controls */}
                    <Row gutter={16} align="bottom" style={{ marginBottom: 24 }}>
                        <Col xs={24} md={8}>
                            <Form.Item label={<Text strong>Chọn Năm học</Text>} style={{ marginBottom: 0 }}>
                                <Select
                                    value={selectedNamHocId}
                                    onChange={setSelectedNamHocId}
                                    placeholder="Chọn năm học để mô phỏng"
                                    style={{ width: '100%' }}
                                    size="large"
                                >
                                    {namHocList.map(nh => (
                                        <Option key={nh.id} value={nh.id.toString()}>
                                            {nh.ten_nam_hoc}
                                            {nh.la_nam_hien_hanh && <Tag color="green" style={{ marginLeft: 5 }}>Hiện hành</Tag>}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={10}>
                            <Space>
                                <Button
                                    type="primary"
                                    onClick={calculateWorkload}
                                    disabled={!selectedNamHocId}
                                    loading={isCalculating}
                                    size="large"
                                    icon={<CalculatorOutlined />}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
                                >
                                    Xem dữ liệu thống kê
                                </Button>
                                <Button
                                    onClick={loadStatisticsFromAPI}
                                    size="large"
                                    icon={<ReloadOutlined />}
                                    disabled={!selectedNamHocId}
                                >
                                    Tải lại từ API
                                </Button>
                            </Space>
                        </Col>
                        <Col xs={24} md={6}>
                            <div className="flex items-center justify-end space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Text type="secondary">Nguồn:</Text>
                                    <Tag color="blue">API Statistics</Tag>
                                </div>
                                {lastSaved && (
                                    <Tooltip title={`Lần cuối: ${moment(lastSaved).format('HH:mm DD/MM')}`}>
                                        <Badge dot status="success">
                                            <HistoryOutlined />
                                        </Badge>
                                    </Tooltip>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Enhanced Results Display using API data */}
                {apiStatisticsData && selectedNamHocId && (
                    <Card className="bg-white/95 backdrop-blur-lg shadow-lg" style={{ borderRadius: '12px' }}>
                        <ThongKeTongQuanNangCao 
                            apiStatisticsData={apiStatisticsData}
                            namHocSelected={namHocList.find(nh => nh.id.toString() === selectedNamHocId)}
                        />
                    </Card>
                )}

                {/* Enhanced Main Content Tabs with Forms */}
                {selectedNamHocId && (
                    <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                        <Tabs defaultActiveKey="analysis" className="enhanced-main-tabs">
                            <TabPane tab={<span><BarChartOutlined />Phân tích dữ liệu</span>} key="analysis">
                                <BieuDoPhantichNangCao 
                                    apiStatisticsData={apiStatisticsData}
                                    namHocSelected={namHocList.find(nh => nh.id.toString() === selectedNamHocId)}
                                />
                            </TabPane>
                            
                            <TabPane tab={<span><AimOutlined />Thiết lập mục tiêu</span>} key="targets">
                                <ThietLapMucTieu 
                                    currentUserProfile={currentUserProfile}
                                    namHocSelected={namHocList.find(nh => nh.id.toString() === selectedNamHocId)}
                                    onTargetsChange={setUserTargets}
                                />
                            </TabPane>

                            <TabPane tab={<span><CalculatorOutlined />Kê khai mô phỏng</span>} key="simulation">
                                <Form layout="vertical" className="enhanced-form">
                                    <Alert
                                        message="Mô phỏng Kế hoạch Công việc"
                                        description="Tạo kế hoạch mô phỏng để dự đoán khối lượng công việc cho năm học. Dữ liệu này sẽ được so sánh với dữ liệu thực tế."
                                        type="info"
                                        showIcon
                                        style={{ marginBottom: 24 }}
                                    />

                                    <Tabs defaultActiveKey="sim_giangday" type="card">
                                        <TabPane tab={<span><BookOutlined />Giảng dạy</span>} key="sim_giangday">
                                            <Tabs defaultActiveKey="sim_gd_dh" type="line" size="small">
                                                <TabPane tab="Đại học - Trong BM" key="sim_gd_dh_trongbm">
                                                    <FormGdLop 
                                                        type="gd_lop_dh_trongbm" 
                                                        dataSource={simGdLopDhTrongBmList} 
                                                        setDataSource={setSimGdLopDhTrongBmList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="Đại học - Ngoài BM" key="sim_gd_dh_ngoaibm">
                                                    <FormGdLop 
                                                        type="gd_lop_dh_ngoaibm" 
                                                        dataSource={simGdLopDhNgoaiBmList} 
                                                        setDataSource={setSimGdLopDhNgoaiBmList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="Đại học - Ngoài CS" key="sim_gd_dh_ngoaics">
                                                    <FormGdLop 
                                                        type="gd_lop_dh_ngoaics" 
                                                        dataSource={simGdLopDhNgoaiCsList} 
                                                        setDataSource={setSimGdLopDhNgoaiCsList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="Thạc sĩ" key="sim_gd_ths">
                                                    <FormGdLop 
                                                        type="gd_lop_ths" 
                                                        dataSource={simGdLopThsList} 
                                                        setDataSource={setSimGdLopThsList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="Tiến sĩ" key="sim_gd_ts">
                                                    <FormGdLop 
                                                        type="gd_lop_ts" 
                                                        dataSource={simGdLopTsList} 
                                                        setDataSource={setSimGdLopTsList} 
                                                    />
                                                </TabPane>
                                            </Tabs>
                                        </TabPane>
                                        
                                        <TabPane tab={<span><UserSwitchOutlined />Hướng dẫn</span>} key="sim_huongdan">
                                            <Tabs defaultActiveKey="sim_hd_datn" type="line" size="small">
                                                <TabPane tab="ĐATN/KLTN ĐH" key="sim_hd_datn">
                                                    <FormHdDatnDaihoc 
                                                        dataSource={simHdDatnDhList} 
                                                        setDataSource={setSimHdDatnDhList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="Luận văn ThS" key="sim_hd_lv_ths">
                                                    <FormHdLvThacsi 
                                                        dataSource={simHdLvThsList} 
                                                        setDataSource={setSimHdLvThsList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="Luận án TS" key="sim_hd_la_ts">
                                                    <FormHdLaTiensi 
                                                        dataSource={simHdLaTsList} 
                                                        setDataSource={setSimHdLaTsList} 
                                                    />
                                                </TabPane>
                                            </Tabs>
                                        </TabPane>
                                        
                                        <TabPane tab={<span><AuditOutlined />Đánh giá</span>} key="sim_danhgia">
                                            <Tabs defaultActiveKey="sim_dg_hp_tn" type="line" size="small">
                                                <TabPane tab="HP TN ĐH" key="sim_dg_hp_tn">
                                                    <FormDgHpTnDaihoc 
                                                        dataSource={simDgHpTnDhList} 
                                                        setDataSource={setSimDgHpTnDhList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="LV ThS" key="sim_dg_lv_ths">
                                                    <FormDgLvThacsi 
                                                        dataSource={simDgLvThacsiList} 
                                                        setDataSource={setSimDgLvThacsiList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="LA TS" key="sim_dg_la_ts">
                                                    <FormDgLaTiensi 
                                                        dataSource={simDgLaTsDotList} 
                                                        setDataSource={setSimDgLaTsDotList} 
                                                    />
                                                </TabPane>
                                            </Tabs>
                                        </TabPane>
                                        
                                        <TabPane tab={<span><CarryOutOutlined />Khảo thí</span>} key="sim_khaothi">
                                            <Tabs defaultActiveKey="sim_kt_dh_trongbm" type="line" size="small">
                                                <TabPane tab="ĐH - Trong BM" key="sim_kt_dh_trongbm">
                                                    <FormKhaoThi 
                                                        type="khaothi_dh_trongbm" 
                                                        dataSource={simKhaoThiDhTrongBmList} 
                                                        setDataSource={setSimKhaoThiDhTrongBmList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="ĐH - Ngoài BM" key="sim_kt_dh_ngoaibm">
                                                    <FormKhaoThi 
                                                        type="khaothi_dh_ngoaibm" 
                                                        dataSource={simKhaoThiDhNgoaiBmList} 
                                                        setDataSource={setSimKhaoThiDhNgoaiBmList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="ThS" key="sim_kt_ths">
                                                    <FormKhaoThi 
                                                        type="khaothi_ths" 
                                                        dataSource={simKhaoThiThsList} 
                                                        setDataSource={setSimKhaoThiThsList} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="TS" key="sim_kt_ts">
                                                    <FormKhaoThi 
                                                        type="khaothi_ts" 
                                                        dataSource={simKhaoThiTsList} 
                                                        setDataSource={setSimKhaoThiTsList} 
                                                    />
                                                </TabPane>
                                            </Tabs>
                                        </TabPane>
                                        
                                        <TabPane tab={<span><BuildOutlined />XD CTĐT & HĐ khác</span>} key="sim_xdctdt">
                                            <FormXdCtdtVaKhacGd 
                                                dataSource={simXdCtdtVaKhacGdList} 
                                                setDataSource={setSimXdCtdtVaKhacGdList} 
                                            />
                                        </TabPane>
                                        
                                        <TabPane tab={<span><ExperimentOutlined />NCKH</span>} key="sim_nckh">
                                            <FormNckh 
                                                dataSource={simNckhList} 
                                                setDataSource={setSimNckhList} 
                                            />
                                        </TabPane>
                                        
                                        <TabPane tab={<span><TeamOutlined />Công tác khác</span>} key="sim_congtackhac">
                                            <FormCongTacKhac 
                                                dataSource={simCongTacKhacList} 
                                                setDataSource={setSimCongTacKhacList} 
                                            />
                                        </TabPane>
                                    </Tabs>

                                    {/* Hiển thị kết quả mô phỏng */}
                                    {simulationResults && (
                                        <Card title="Kết quả Mô phỏng" style={{ marginTop: 24 }}>
                                            <Row gutter={[16, 16]}>
                                                <Col xs={24} sm={8}>
                                                    <Statistic
                                                        title="Tổng giờ GD (Mô phỏng)"
                                                        value={simulationResults.tongKet.tongGioGd}
                                                        precision={1}
                                                        suffix="giờ"
                                                        valueStyle={{ color: '#1890ff' }}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={8}>
                                                    <Statistic
                                                        title="Tổng giờ KHCN (Mô phỏng)"
                                                        value={simulationResults.tongKet.tongGioKhcn}
                                                        precision={1}
                                                        suffix="giờ"
                                                        valueStyle={{ color: '#722ed1' }}
                                                    />
                                                </Col>
                                                <Col xs={24} sm={8}>
                                                    <Statistic
                                                        title="Tổng cộng (Mô phỏng)"
                                                        value={simulationResults.tongKet.tongCong}
                                                        precision={1}
                                                        suffix="giờ"
                                                        valueStyle={{ color: '#fa8c16' }}
                                                    />
                                                </Col>
                                            </Row>
                                        </Card>
                                    )}
                                </Form>
                            </TabPane>

                            <TabPane tab={<span><SwapOutlined />So sánh TT vs KH</span>} key="comparison">
                                <SoSanhThucVsMoPhong 
                                    apiStatisticsData={apiStatisticsData}
                                    simulationResults={simulationResults}
                                    namHocSelected={namHocList.find(nh => nh.id.toString() === selectedNamHocId)}
                                />
                            </TabPane>
                            
                            <TabPane tab={<span><HistoryOutlined />Lịch sử</span>} key="history">
                                <LichSuMoPhong selectedNamHocId={selectedNamHocId} />
                            </TabPane>
                        </Tabs>
                    </Card>
                )}

                {/* Enhanced Modal */}
                {renderEnhancedCalculationModal()}

                {/* Enhanced Custom Styles */}
                <style>{`
                    /* ...existing styles... */
                    
                    .comparison-card .ant-card-body {
                        padding: 20px !important;
                    }
                    
                    .target-card .ant-card-body {
                        padding: 16px !important;
                    }
                    
                    .target-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    }
                `}</style>
            </div>
        </div>
    );
}

export default KeHoachGiangDay;