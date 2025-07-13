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
    Tabs,
    Alert,
    Row,
    Col,
    Tag,
    Statistic,
    Progress,
    DatePicker,
    Empty
} from 'antd';
import {
    SaveOutlined,
    BookOutlined,
    UserSwitchOutlined,
    AuditOutlined,
    CarryOutOutlined,
    BuildOutlined,
    ExperimentOutlined,
    TeamOutlined,
    CalculatorOutlined,
    ReloadOutlined,
    BarChartOutlined,
    PieChartOutlined,
    SwapOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Title as ChartTitle,
    Legend,
    RadialLinearScale,
    Filler
} from "chart.js";

ChartJS.register(
    CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, 
    ChartTitle, Legend, RadialLinearScale, Filler
);

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
                                        {comparisonData.reduce((sum, item) => sum + item.real, 0).toFixed(1) - comparisonData[2]?.real} giờ
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
                                        {comparisonData.reduce((sum, item) => sum + item.difference, 0).toFixed(1) - comparisonData[2]?.difference} giờ
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

    const pieDatas = {
        labels: pieDataGD.map(item => item.type),
        datasets: [
            {
                data: pieDataGD.map(item => item.value),
                backgroundColor: pieDataGD.map(item => item.color),
                borderColor: '#fff',
                borderWidth: 2
            }
        ]
    };

    const pieOptions = {
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
            callbacks: {
                label: (ctx) => {
                const value = ctx.parsed;
                return `${ctx.label}: ${value.toFixed(1)} giờ`;
                }
            }
            }
        }
    };

    const labels = comparisonData.map(item => item.nam_hoc);

    const colors = {
        giangday: '#1890ff',
        nckh: '#722ed1',
        dinhmuc_gd: '#52c41a',
        dinhmuc_khcn: '#faad14',
    };

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Giảng dạy thực hiện',
                data: comparisonData.map(item => item.giangday ?? 0),
                backgroundColor: colors.giangday
            },
            {
                label: 'Định mức GD',
                data: comparisonData.map(item => item.dinhmuc_gd ?? 0),
                backgroundColor: colors.dinhmuc_gd
            },
            {
                label: 'NCKH thực hiện',
                data: comparisonData.map(item => item.nckh ?? 0),
                backgroundColor: colors.nckh
            },
            {
                label: 'Định mức KHCN', 
                data: comparisonData.map(item => item.dinhmuc_khcn ?? 0),
                backgroundColor: colors.dinhmuc_khcn
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} giờ`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Số giờ' }
            }
        }
    };

    return (
        <Tabs defaultActiveKey="pie" className="chart-tabs-enhanced">
            <TabPane tab={<span><PieChartOutlined />Phân bố công việc</span>} key="pie">
                <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
                    <Pie data={pieDatas} options={pieOptions} />
                </div>
            </TabPane>
            <TabPane tab={<span><BarChartOutlined />So sánh theo năm</span>} key="column">
                <div style={{ textAlign: 'center', padding: '12px' }}>
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </TabPane>
        </Tabs>
    );
};

function KeHoachGiangDay() {
    const [form] = Form.useForm();
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [error, setError] = useState(null);

    const [namHocList, setNamHocList] = useState([]);
    const [selectedNamHocId, setSelectedNamHocId] = useState(null);
    
    const [apiStatisticsData, setApiStatisticsData] = useState(null);
    
    const [userTargets, setUserTargets] = useState(null);

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

    const loadStatisticsFromAPI = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/lecturer/statistics/overview", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApiStatisticsData(response.data);
            return response.data;
        } catch (error) {
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

    const renderTableCell = (value, record, dataIndex) => {
        if (value === null || value === undefined || value === "") {
            return <EmptyValueDisplay />;
        }
        if (typeof value === "number") {
            return (
                <span className="font-medium">{value.toLocaleString()}</span>
            );
        }
        return value;
    };

    const renderNotes = (notes) => {
        if (!notes || notes.trim() === "") {
            return <EmptyValueDisplay />;
        }
        return (
            <div className="max-w-xs">
                <Text
                    className="text-sm text-gray-600"
                    ellipsis={{ tooltip: notes }}
                >
                    {notes}
                </Text>
            </div>
        );
    };

    const formatDisplayValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return <EmptyValueDisplay />;
        }
        if (typeof value === "number") {
            return value.toLocaleString();
        }
        return value;
    };

    const EmptyValueDisplay = () => (
        <span className="empty-value-elegant text-gray-400 italic">--</span>
    );

    const saveSimulationDataToStorage = () => {
        if (!selectedNamHocId) {
            message.warning('Vui lòng chọn năm học trước');
            return;
        }
        
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
                simDgLvThacsiList,
                simDgLaTsDotList,
                simKhaoThiDhTrongBmList,
                simKhaoThiDhNgoaiBmList,
                simKhaoThiThsList,
                simKhaoThiTsList,
                simXdCtdtVaKhacGdList,
                simNckhList,
                simCongTacKhacList,
                lastSaved: new Date().toISOString()
            };
            
            localStorage.setItem(`simulation_data_${selectedNamHocId}`, JSON.stringify(dataToSave));
            message.success('Đã lưu dữ liệu mô phỏng thành công');
        } catch (error) {
            console.error('Lỗi lưu mô phỏng', error);
            message.error('Không thể lưu dữ liệu mô phỏng');
        }
    };

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
            console.error('Loi load du lieu mo phong', error);
        }
    }, [selectedNamHocId]);

    useEffect(() => {
        if (selectedNamHocId && !isLoadingInitial) {
            loadSimulationDataFromStorage();
        } else if (!selectedNamHocId) {
            resetAllSimulationLists();
        }
    }, [selectedNamHocId, loadSimulationDataFromStorage, isLoadingInitial]);

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

    useEffect(() => {
        const results = calculateSimulationResults();
        setSimulationResults(results);
    }, [calculateSimulationResults]);

    const handleResetSimulation = () => {
        resetAllSimulationLists();
        if (selectedNamHocId) {
            localStorage.removeItem(`simulation_data_${selectedNamHocId}`);
        }
        message.success('Đã xóa toàn bộ dữ liệu mô phỏng');
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoadingInitial(true);
            try {
                const token = localStorage.getItem("token");

                const namHocRes = await axios.get("/api/lecturer/nam-hoc", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const nhs = namHocRes.data || [];
                setNamHocList(nhs);
                
                const currentActiveNamHoc = nhs.find(nh => nh.la_nam_hien_hanh === 1);
                if (currentActiveNamHoc) {
                    setSelectedNamHocId(currentActiveNamHoc.id.toString());
                }

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

    if (isLoadingInitial) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden flex items-center justify-center">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 text-center space-y-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CalculatorOutlined className="text-4xl text-white" />
                        </div>
                        
                        <div className="absolute -top-2 -right-8 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-ping"></div>
                        <div className="absolute -bottom-2 -left-8 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse delay-300"></div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 bg-clip-text text-transparent">
                            Đang tải kế hoạch giảng dạy
                        </h2>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Vui lòng chờ trong giây lát, chúng tôi đang chuẩn bị dữ liệu mô phỏng cho bạn...
                        </p>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                        <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce delay-300"></div>
                    </div>

                    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 rounded-full animate-pulse"></div>
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
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                        <CalculatorOutlined className="text-2xl text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-md"></div>
                                </div>
                                <div className="space-y-2">
                                    <Title level={2} style={{ margin: 0 }} className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                                        Kế hoạch Giảng dạy (Mô phỏng)
                                    </Title>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                        <Text type="secondary">
                                            Mô phỏng và phân tích khối lượng công việc theo kế hoạch
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Row gutter={16} align="bottom">
                        <Col xs={24} sm={12} md={8}>
                            <Text strong>Chọn Năm học để mô phỏng:</Text>
                            <Select
                                value={selectedNamHocId}
                                onChange={setSelectedNamHocId}
                                placeholder="Chọn năm học để mô phỏng"
                                style={{ width: '100%', marginTop: 8 }}
                                size="large"
                                className="custom-select"
                            >
                                {namHocList.map(nh => (
                                    <Option key={nh.id} value={nh.id.toString()}>
                                        {nh.ten_nam_hoc}
                                        {nh.la_nam_hien_hanh && <Tag color="green" style={{ marginLeft: 5 }}>Hiện hành</Tag>}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Button
                                onClick={loadStatisticsFromAPI}
                                size="large"
                                icon={<ReloadOutlined />}
                                disabled={!selectedNamHocId}
                                style={{ marginTop: 8 }}
                                className="custom-button"
                            >
                                Tải lại dữ liệu thống kê
                            </Button>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Space style={{ marginTop: 8 }}>
                                <Button
                                    onClick={saveSimulationDataToStorage}
                                    size="large"
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    disabled={!selectedNamHocId}
                                    className="custom-button"
                                >
                                    Lưu dữ liệu mô phỏng
                                </Button>
                                <Button
                                    onClick={handleResetSimulation}
                                    size="large"
                                    danger
                                    icon={<DeleteOutlined />}
                                    disabled={!selectedNamHocId}
                                    className="custom-button"
                                >
                                    Xóa dữ liệu
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {selectedNamHocId && (
                    <Card className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl" style={{ borderRadius: '16px' }}>
                        <Tabs defaultActiveKey="analysis" className="enhanced-main-tabs">
                            <TabPane tab={<span><BarChartOutlined style={{ marginRight: 3 }} />Phân tích dữ liệu</span>} key="analysis">
                                <BieuDoPhantichNangCao 
                                    apiStatisticsData={apiStatisticsData}
                                    namHocSelected={namHocList.find(nh => nh.id.toString() === selectedNamHocId)}
                                />
                            </TabPane>

                            <TabPane tab={<span><CalculatorOutlined  style={{ marginRight: 3 }} />Kê khai mô phỏng</span>} key="simulation">
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
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                    />
                                                </TabPane>
                                                <TabPane tab="Đại học - Ngoài BM" key="sim_gd_dh_ngoaibm">
                                                    <FormGdLop 
                                                        type="gd_lop_dh_ngoaibm" 
                                                        dataSource={simGdLopDhNgoaiBmList} 
                                                        setDataSource={setSimGdLopDhNgoaiBmList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                    />
                                                </TabPane>
                                                <TabPane tab="Đại học - Ngoài CS" key="sim_gd_dh_ngoaics">
                                                    <FormGdLop 
                                                        type="gd_lop_dh_ngoaics" 
                                                        dataSource={simGdLopDhNgoaiCsList} 
                                                        setDataSource={setSimGdLopDhNgoaiCsList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                    />
                                                </TabPane>
                                                <TabPane tab="Thạc sĩ" key="sim_gd_ths">
                                                    <FormGdLop 
                                                        type="gd_lop_ths" 
                                                        dataSource={simGdLopThsList} 
                                                        setDataSource={setSimGdLopThsList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="Tiến sĩ" key="sim_gd_ts">
                                                    <FormGdLop 
                                                        type="gd_lop_ts" 
                                                        dataSource={simGdLopTsList} 
                                                        setDataSource={setSimGdLopTsList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
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
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                    />
                                                </TabPane>
                                                <TabPane tab="Luận văn ThS" key="sim_hd_lv_ths">
                                                    <FormHdLvThacsi 
                                                        dataSource={simHdLvThsList} 
                                                        setDataSource={setSimHdLvThsList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                    />
                                                </TabPane>
                                                <TabPane tab="Luận án TS" key="sim_hd_la_ts">
                                                    <FormHdLaTiensi 
                                                        dataSource={simHdLaTsList} 
                                                        setDataSource={setSimHdLaTsList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
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
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes} 
                                                    />
                                                </TabPane>
                                                <TabPane tab="LV ThS" key="sim_dg_lv_ths">
                                                    <FormDgLvThacsi 
                                                        dataSource={simDgLvThacsiList} 
                                                        setDataSource={setSimDgLvThacsiList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                    />
                                                </TabPane>
                                                <TabPane tab="LA TS" key="sim_dg_la_ts">
                                                    <FormDgLaTiensi 
                                                        dataSource={simDgLaTsDotList} 
                                                        setDataSource={setSimDgLaTsDotList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
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
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                    />
                                                </TabPane>
                                                <TabPane tab="ĐH - Ngoài BM" key="sim_kt_dh_ngoaibm">
                                                    <FormKhaoThi 
                                                        type="khaothi_dh_ngoaibm" 
                                                        dataSource={simKhaoThiDhNgoaiBmList} 
                                                        setDataSource={setSimKhaoThiDhNgoaiBmList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                    />
                                                </TabPane>
                                                <TabPane tab="ThS" key="sim_kt_ths">
                                                    <FormKhaoThi 
                                                        type="khaothi_ths" 
                                                        dataSource={simKhaoThiThsList} 
                                                        setDataSource={setSimKhaoThiThsList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                    />
                                                </TabPane>
                                                <TabPane tab="TS" key="sim_kt_ts">
                                                    <FormKhaoThi 
                                                        type="khaothi_ts" 
                                                        dataSource={simKhaoThiTsList} 
                                                        setDataSource={setSimKhaoThiTsList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                    />
                                                </TabPane>
                                            </Tabs>
                                        </TabPane>
                                        
                                        <TabPane tab={<span><BuildOutlined />XD CTĐT & HĐ khác</span>} key="sim_xdctdt">
                                            <FormXdCtdtVaKhacGd 
                                                dataSource={simXdCtdtVaKhacGdList} 
                                                setDataSource={setSimXdCtdtVaKhacGdList}
                                                formatDisplayValue={ formatDisplayValue }
                                                EmptyValueDisplay={ EmptyValueDisplay }
                                                renderTableCell={renderTableCell}
                                                renderNotes={renderNotes}
                                            />
                                        </TabPane>
                                        
                                        <TabPane tab={<span><ExperimentOutlined />NCKH</span>} key="sim_nckh">
                                            <FormNckh 
                                                dataSource={simNckhList} 
                                                setDataSource={setSimNckhList}
                                                formatDisplayValue={ formatDisplayValue }
                                                EmptyValueDisplay={ EmptyValueDisplay }
                                                renderTableCell={renderTableCell}
                                                renderNotes={renderNotes}
                                            />
                                        </TabPane>
                                        
                                        <TabPane tab={<span><TeamOutlined />Công tác khác</span>} key="sim_congtackhac">
                                            <FormCongTacKhac 
                                                dataSource={simCongTacKhacList} 
                                                setDataSource={setSimCongTacKhacList}
                                                formatDisplayValue={ formatDisplayValue }
                                                EmptyValueDisplay={ EmptyValueDisplay }
                                                renderTableCell={renderTableCell}
                                                renderNotes={renderNotes}
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

                            <TabPane tab={<span> <SwapOutlined style={{ marginRight: 3 }} />So sánh TT vs KH </span> } key="comparison">
                                <SoSanhThucVsMoPhong 
                                    apiStatisticsData={apiStatisticsData}
                                    simulationResults={simulationResults}
                                    namHocSelected={namHocList.find(nh => nh.id.toString() === selectedNamHocId)}
                                />
                            </TabPane>
                        </Tabs>
                    </Card>
                )}
                <style>{`
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
                        background: linear-gradient(135deg, #8b5cf6, #6366f1) !important;
                        border: none !important;
                    }

                    .custom-button.ant-btn-primary:hover {
                        background: linear-gradient(135deg, #7c3aed, #4f46e5) !important;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default KeHoachGiangDay;