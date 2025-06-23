import React, { useState } from 'react';
import {
    Button,
    Form,
    Input,
    InputNumber,
    Table,
    Space,
    Tooltip,
    Popconfirm,
    Typography,
    Tag,
    Modal,
    message,
    Select,
    Row,
    Col,
    Upload,
    Alert,
    Divider
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SolutionOutlined, UploadOutlined, FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

function FormGdLop({
    type,
    dataSource,
    setDataSource,
    formatDisplayValue,
    EmptyValueDisplay,
    renderTableCell,
    renderNotes,
    renderFileAttachment
}) {
    const [form] = Form.useForm();
    const [editingItem, setEditingItem] = useState(null); // { index: number, record: object }
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [csvPreview, setCsvPreview] = useState([]);
    const [isProcessingCSV, setIsProcessingCSV] = useState(false);

    const getTitle = () => {
        switch (type) {
            case 'gd_lop_dh_trongbm': return "Giảng dạy Lớp ĐH (Trong Bộ môn)";
            case 'gd_lop_dh_ngoaibm': return "Giảng dạy Lớp ĐH (Ngoài Bộ môn)";
            case 'gd_lop_dh_ngoaics': return "Giảng dạy Lớp ĐH (Ngoài Cơ sở chính)";
            case 'gd_lop_ths': return "Giảng dạy Lớp Thạc sĩ";
            case 'gd_lop_ts': return "Giảng dạy Lớp Tiến sĩ";
            default: return "Giảng dạy Lớp học phần";
        }
    };

    const handleAddItem = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditItem = (record, index) => {
        setEditingItem({ index, record });
        form.setFieldsValue({
            ten_lop_hoc_phan: record.ten_lop_hoc_phan,
            hoc_ky_dien_ra: record.hoc_ky_dien_ra,
            si_so: record.si_so,
            ky_nang: record.ky_nang,
            don_vi_tinh: record.don_vi_tinh || 'Tiết', // Mặc định là Tiết
            kl_ke_hoach: record.kl_ke_hoach,
            he_so_qd: record.he_so_qd,
            ghi_chu: record.ghi_chu,
            ...(type === 'gd_lop_dh_ngoaibm' && { ten_bo_mon_day_ho: record.ten_bo_mon_day_ho }),
            ...(type === 'gd_lop_dh_ngoaics' && { ten_co_so_day: record.ten_co_so_day }),
        });
        setIsModalVisible(true);
    };

    const handleDeleteItem = (indexToDelete) => {
        setDataSource(prevData => prevData.filter((_, index) => index !== indexToDelete));
        message.success(`Đã xóa mục giảng dạy lớp.`);
    };

    const calculateSoTietQD = (kl_ke_hoach, he_so_qd) => {
        const kl = parseFloat(kl_ke_hoach || 0);
        const hs = parseFloat(he_so_qd || 0);
        return (kl * hs).toFixed(2);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const so_tiet_qd = calculateSoTietQD(values.kl_ke_hoach, values.he_so_qd);

            const newItem = {
                id_temp: editingItem?.record.id_temp || Date.now() + Math.random(),
                id_database: editingItem?.record.id_database || null, // Giữ id_database nếu là sửa
                ...values, // Bao gồm tất cả các trường từ form
                so_tiet_qd: so_tiet_qd,
                // Không cần minh chứng theo yêu cầu mới
            };

            let newData = [...dataSource];
            if (editingItem !== null && editingItem.index !== undefined) {
                newData[editingItem.index] = newItem;
                message.success("Cập nhật thông tin giảng dạy lớp thành công.");
            } else {
                newData.push(newItem);
                message.success("Thêm mục giảng dạy lớp vào kê khai thành công.");
            }
            setDataSource(newData);
            setIsModalVisible(false);
            form.resetFields();
            setEditingItem(null);
        } catch (errorInfo) {
            console.log('Validate Failed:', errorInfo);
            message.error("Vui lòng kiểm tra lại thông tin đã nhập.");
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingItem(null);
    };

    const parseCSVContent = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length >= headers.length && values[2] && values[2].trim()) { // Có Lớp học phần
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header.trim()] = values[index] ? values[index].trim() : '';
                });
                // Chỉ thêm những dòng có thông tin lớp học phần
                if (rowData['Lớp học phần'] && rowData['Lớp học phần'] !== '') {
                    data.push(rowData);
                }
            }
        }
        return data;
    };

    const handleCSVUpload = (file) => {
        setIsProcessingCSV(true);
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const parsedData = parseCSVContent(csvText);
                
                if (parsedData.length === 0) {
                    message.error('Không tìm thấy dữ liệu hợp lệ trong file CSV!');
                    setIsProcessingCSV(false);
                    return;
                }                // Chuyển đổi dữ liệu CSV sang format của form
                const convertedData = parsedData.map((row, index) => ({
                    id_temp: `csv_${Date.now()}_${index}`,
                    ten_lop_hoc_phan: row['Lớp học phần'] || '',
                    si_so: parseInt(row['Số SV DK']) || 0,
                    ky_nang: row['Kiểu học'] || '',
                    // Các trường còn lại để trống, giảng viên sẽ tự điền
                    hoc_ky_dien_ra: '',
                    don_vi_tinh: 'Tiết',
                    kl_ke_hoach: 0,
                    he_so_qd: 0, // Thay đổi từ 1.0 thành 0 để buộc nhập thủ công
                    so_tiet_qd: 0,
                    ghi_chu: `Nhập từ CSV - ${row['Mã môn học'] || ''}`
                }));

                setCsvPreview(convertedData);
                setIsImportModalVisible(true);
                message.success(`Đã phân tích ${convertedData.length} lớp học phần từ file CSV.`);
            } catch (error) {
                console.error('Lỗi xử lý file CSV:', error);
                message.error('Có lỗi khi xử lý file CSV. Vui lòng kiểm tra định dạng file!');
            } finally {
                setIsProcessingCSV(false);
            }
        };

        reader.onerror = () => {
            message.error('Có lỗi khi đọc file!');
            setIsProcessingCSV(false);
        };

        reader.readAsText(file, 'utf-8');
        return false; // Ngăn upload tự động
    };

    const handleImportCSVData = () => {
        if (csvPreview.length === 0) {
            message.warning('Không có dữ liệu để nhập!');
            return;
        }

        // Thêm dữ liệu CSV vào dataSource hiện tại
        const newData = [...dataSource, ...csvPreview];
        setDataSource(newData);
        
        message.success(`Đã nhập thành công ${csvPreview.length} lớp học phần từ CSV. Vui lòng kiểm tra và bổ sung thông tin còn thiếu.`);
        
        // Reset và đóng modal
        setCsvPreview([]);
        setIsImportModalVisible(false);
    };

    const handleCancelImport = () => {
        setCsvPreview([]);
        setIsImportModalVisible(false);
    };

    // Function to check if a row has missing required information
    const isRowIncomplete = (record) => {
        const requiredFields = ['hoc_ky_dien_ra', 'kl_ke_hoach', 'he_so_qd'];
        const missingFields = requiredFields.filter(field => !record[field] || record[field] === 0 || record[field] === '');
        return missingFields.length > 0;
    };

    // Function to get missing field names for tooltip
    const getMissingFields = (record) => {
        const fieldLabels = {
            'hoc_ky_dien_ra': 'Học kỳ',
            'kl_ke_hoach': 'KLKH',
            'he_so_qd': 'Hệ số QĐ'
        };
        const requiredFields = ['hoc_ky_dien_ra', 'kl_ke_hoach', 'he_so_qd'];
        const missingFields = requiredFields.filter(field => !record[field] || record[field] === 0 || record[field] === '');
        return missingFields.map(field => fieldLabels[field]).join(', ');
    };

    const columns = [
        { title: 'STT', key: 'stt', width: 50, align: 'center', render: (_, __, index) => index + 1 },
        { 
            title: 'Tên Lớp học phần', 
            dataIndex: 'ten_lop_hoc_phan', 
            key: 'ten_lop_hoc_phan', 
            ellipsis: true, 
            render: (text, record) => {
                const incomplete = isRowIncomplete(record);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tooltip title={text}>
                            <span>{text}</span>
                        </Tooltip>
                        {incomplete && (
                            <Tooltip title={`Thiếu thông tin: ${getMissingFields(record)}`}>
                                <Tag color="orange" size="small" style={{ fontSize: '10px', margin: 0 }}>
                                    Chưa đủ
                                </Tag>
                            </Tooltip>
                        )}
                    </div>
                );
            }
        },        ...(type === 'gd_lop_dh_ngoaibm' ? [{
            title: 'BM Dạy hộ', 
            dataIndex: 'ten_bo_mon_day_ho', 
            key: 'ten_bo_mon_day_ho', 
            width: 150, 
            ellipsis: true,
            render: (text) => renderTableCell(text, 'text')
        }] : []),
        ...(type === 'gd_lop_dh_ngoaics' ? [{
            title: 'Cơ sở dạy', 
            dataIndex: 'ten_co_so_day', 
            key: 'ten_co_so_day', 
            width: 150, 
            ellipsis: true,
            render: (text) => renderTableCell(text, 'text')
        }] : []),        { 
            title: 'Học kỳ', 
            dataIndex: 'hoc_ky_dien_ra', 
            key: 'hoc_ky_dien_ra', 
            width: 100, 
            align: 'center',
            render: (text, record) => {
                const isEmpty = !text || text === '';
                if (isEmpty) {
                    return (
                        <span style={{ 
                            color: '#ff4d4f',
                            fontStyle: 'italic'
                        }}>
                            Chưa nhập
                        </span>
                    );
                }
                return renderTableCell(text, 'text');
            }
        },
        { 
            title: 'Sĩ số', 
            dataIndex: 'si_so', 
            key: 'si_so', 
            width: 80, 
            align: 'center',
            render: (text) => renderTableCell(text, 'number')
        },
        { 
            title: 'Kỹ năng', 
            dataIndex: 'ky_nang', 
            key: 'ky_nang', 
            width: 100, 
            align: 'center',
            render: (text) => renderTableCell(text, 'text')
        },
        { 
            title: 'KLKH', 
            dataIndex: 'kl_ke_hoach', 
            key: 'kl_ke_hoach', 
            width: 80, 
            align: 'center', 
            render: (text, record) => {
                const isEmpty = !text || text === 0;
                return (
                    <span style={{ 
                        color: isEmpty ? '#ff4d4f' : 'inherit',
                        fontStyle: isEmpty ? 'italic' : 'normal'
                    }}>
                        {isEmpty ? 'Chưa nhập' : parseFloat(text || 0).toFixed(1)}
                    </span>
                );
            }
        },
        { 
            title: 'HSQĐ', 
            dataIndex: 'he_so_qd', 
            key: 'he_so_qd', 
            width: 80, 
            align: 'center', 
            render: (text, record) => {
                const isEmpty = !text || text === 0;
                return (
                    <span style={{ 
                        color: isEmpty ? '#ff4d4f' : 'inherit',
                        fontStyle: isEmpty ? 'italic' : 'normal'
                    }}>
                        {isEmpty ? 'Chưa nhập' : parseFloat(text || 0).toFixed(2)}
                    </span>
                );
            }
        },        {
            title: 'Tiết QĐ', dataIndex: 'so_tiet_qd', key: 'so_tiet_qd', width: 100, align: 'center',
            render: (text) => <Text strong style={{ color: '#1890ff' }}>{parseFloat(text || 0).toFixed(2)}</Text>
        },
        { 
            title: 'Ghi chú', 
            dataIndex: 'ghi_chu', 
            key: 'ghi_chu', 
            ellipsis: true, 
            render: (text) => (
                <Tooltip title={text || 'Chưa có ghi chú'}>
                    {renderNotes(text)}
                </Tooltip>
            )
        },
        {
            title: 'Thao tác', key: 'action', width: 100, align: 'center',
            render: (_, record, index) => (
                <Space size="small">
                    <Tooltip title="Sửa"><Button icon={<EditOutlined />} type="text" style={{ color: 'blue' }} onClick={() => handleEditItem(record, index)} size="small" /></Tooltip>
                    <Popconfirm title="Xóa mục này?" onConfirm={() => handleDeleteItem(index)} okText="Xóa" cancelText="Hủy">
                        <Tooltip title="Xóa"><Button icon={<DeleteOutlined />} type="text" danger size="small" /></Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];    const csvPreviewColumns = [
        { title: 'STT', key: 'stt', width: 50, align: 'center', render: (_, __, index) => index + 1 },
        { 
            title: 'Tên Lớp học phần', 
            dataIndex: 'ten_lop_hoc_phan', 
            key: 'ten_lop_hoc_phan', 
            ellipsis: true,
            render: (text) => renderTableCell(text, 'text')
        },
        { 
            title: 'Sĩ số', 
            dataIndex: 'si_so', 
            key: 'si_so', 
            width: 80, 
            align: 'center',
            render: (text) => renderTableCell(text, 'number')
        },
        { 
            title: 'Kỹ năng', 
            dataIndex: 'ky_nang', 
            key: 'ky_nang', 
            width: 100, 
            align: 'center',
            render: (text) => renderTableCell(text, 'text')
        },
        { 
            title: 'Ghi chú', 
            dataIndex: 'ghi_chu', 
            key: 'ghi_chu', 
            ellipsis: true,
            render: (text) => renderNotes(text)
        },
    ];

    // Function to generate and download CSV template
    const downloadCSVTemplate = () => {
        const csvHeaders = [
            'STT',
            'Mã môn học',
            'Lớp học phần',
            'Số TC',
            'Số SV DK',
            'Số SV ĐK',
            'Kiểu học',
            'Giảng viên phụ trách',
            '',
            '',
            ''
        ];

        const sampleData = [
            ['1', 'CSE281', 'Cấu trúc dữ liệu và giải thuật (64CNTT1)', '3', '45', '0', 'LT', 'Nguyễn Văn A', '', '', ''],
            ['2', 'CSE489', 'Mạng máy tính (64CNTT2)', '3', '50', '0', 'TH', 'Trần Thị B', '', '', ''],
            ['3', 'CSE101', 'Nhập môn lập trình (64HTTT1)', '4', '60', '0', 'BT', 'Lê Văn C', '', '', '']
        ];

        // Create CSV content
        const csvContent = [
            csvHeaders.join(','),
            ...sampleData.map(row => row.join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Mau_CSV_${getTitle().replace(/\s+/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success('Đã tải xuống file CSV mẫu!');
    };

    return (        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            {/* Add custom CSS styles */}
            <style jsx>{`
                .incomplete-row {
                    background-color: #fff7e6 !important;
                    border-left: 4px solid #faad14 !important;
                }
                .incomplete-row:hover {
                    background-color: #fff1b8 !important;
                }
                .ant-table-tbody > tr.incomplete-row > td {
                    background-color: #fff7e6 !important;
                }
                .ant-table-tbody > tr.incomplete-row:hover > td {
                    background-color: #fff1b8 !important;
                }
                
                /* Enhanced empty value styling for FormGdLop */
                .ant-table-tbody .empty-value-elegant {
                    background: linear-gradient(45deg, rgba(148, 163, 184, 0.08), rgba(203, 213, 225, 0.04));
                    padding: 1px 6px;
                    border-radius: 4px;
                    border: 1px dashed rgba(148, 163, 184, 0.2);
                    display: inline-block;
                    min-width: 28px;
                    text-align: center;
                    transition: all 0.2s ease;
                    font-size: 0.85em;
                }
                
                .ant-table-tbody .empty-value-elegant:hover {
                    background: linear-gradient(45deg, rgba(148, 163, 184, 0.12), rgba(203, 213, 225, 0.06));
                    border-color: rgba(148, 163, 184, 0.3);
                    transform: translateY(-1px);
                }
                
                /* Special styling for notes column */
                .ant-table-tbody td:last-child .empty-value-elegant {
                    font-size: 0.8em;
                    opacity: 0.8;
                }
            `}</style>

            <Typography.Title level={5} style={{ marginBottom: 16, color: '#003a8c' }}>
                <SolutionOutlined style={{ marginRight: 8 }} />
                {getTitle()}
            </Typography.Title>
            
            <Space style={{ marginBottom: 16 }}>
                <Button
                    type="dashed"
                    onClick={handleAddItem}
                    icon={<PlusOutlined />}
                    style={{ borderColor: '#1890ff', color: '#1890ff' }}
                >
                    Thêm Lớp
                </Button>
                
                <Upload
                    accept=".csv"
                    showUploadList={false}
                    beforeUpload={handleCSVUpload}
                    loading={isProcessingCSV}
                >
                    <Button 
                        icon={<FileExcelOutlined />}
                        loading={isProcessingCSV}
                        style={{ borderColor: '#52c41a', color: '#52c41a' }}
                    >
                        Nhập từ CSV
                    </Button>
                </Upload>

                <Button
                    icon={<DownloadOutlined />}
                    onClick={downloadCSVTemplate}
                    style={{ borderColor: '#722ed1', color: '#722ed1' }}
                    title="Tải xuống file CSV mẫu để làm theo"
                >
                    Tải CSV mẫu
                </Button>
            </Space>

            {/* Add instruction alert */}
            <Alert
                message="Hướng dẫn nhập CSV"
                description={
                    <div>
                        <strong>Cách sử dụng:</strong>
                        <br />1. Nhấn "Tải CSV mẫu" để tải file mẫu về máy
                        <br />2. Mở file bằng Excel hoặc ứng dụng bảng tính, chỉnh sửa dữ liệu theo lớp học phần của bạn
                        <br />3. Lưu file dạng CSV (UTF-8) và nhấn "Nhập từ CSV" để tải lên
                        <br /><strong>Lưu ý:</strong> Chỉ cần điền đúng cột "Lớp học phần", "Số SV DK", "Kiểu học". Các thông tin khác sẽ được bổ sung sau.
                    </div>
                }
                type="info"
                showIcon
                closable
                style={{ marginBottom: 16 }}
            />

            {/* Show warning if there are incomplete rows */}
            {dataSource.some(record => isRowIncomplete(record)) && (
                <Alert
                    message="Cảnh báo: Có dữ liệu chưa đầy đủ"
                    description={
                        <div>
                            Có {dataSource.filter(record => isRowIncomplete(record)).length} lớp học phần chưa đủ thông tin bắt buộc (Học kỳ, KLKH, Hệ số QĐ). 
                            <br />Các hàng này được đánh dấu màu vàng. Vui lòng bổ sung thông tin trước khi lưu.
                        </div>
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id_temp"
                pagination={false}
                bordered
                size="middle"
                locale={{ emptyText: `Chưa có kê khai ${getTitle().toLowerCase()}.` }}
                rowClassName={(record) => isRowIncomplete(record) ? 'incomplete-row' : ''}
                summary={pageData => {
                    let totalSoTietQD = 0;
                    pageData.forEach(({ so_tiet_qd }) => {
                        totalSoTietQD += parseFloat(so_tiet_qd || 0);
                    });
                    return (
                        dataSource && dataSource.length > 0 && (
                            <Table.Summary.Row style={{ background: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={columns.findIndex(col => col.key === 'so_tiet_qd')} align="right">
                                    <Text strong>Tổng số tiết quy đổi:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                    <Text strong style={{ color: '#1890ff' }}>{totalSoTietQD.toFixed(2)}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} colSpan={columns.length - columns.findIndex(col => col.key === 'so_tiet_qd') -1 } />
                            </Table.Summary.Row>
                        )
                    );
                }}
            />

            {/* Modal xem trước dữ liệu CSV */}
            <Modal
                title="Xem trước dữ liệu từ CSV"
                open={isImportModalVisible}
                onOk={handleImportCSVData}
                onCancel={handleCancelImport}
                okText="Nhập dữ liệu"
                cancelText="Hủy"
                width={1000}
                okButtonProps={{ 
                    type: 'primary',
                    icon: <UploadOutlined />,
                    disabled: csvPreview.length === 0
                }}
            >
                <Alert
                    message="Lưu ý"
                    description={
                        <div>
                            Dữ liệu từ CSV chỉ chứa thông tin cơ bản (Tên lớp, Sĩ số, Kỹ năng). 
                            <br />Bạn cần bổ sung các thông tin còn thiếu như Học kỳ, KLKH, Hệ số QĐ sau khi nhập.
                            <br /><strong>Mẹo:</strong> Có thể tải file CSV mẫu bằng nút "Tải CSV mẫu" để xem định dạng chuẩn.
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                
                <Text strong>Dữ liệu sẽ được nhập ({csvPreview.length} lớp):</Text>
                <Table
                    columns={csvPreviewColumns}
                    dataSource={csvPreview}
                    rowKey="id_temp"
                    pagination={{ pageSize: 10 }}
                    size="small"
                    style={{ marginTop: 8 }}
                    scroll={{ y: 400 }}
                />
            </Modal>

            <Modal
                title={editingItem ? `Chỉnh sửa ${getTitle()}` : `Thêm ${getTitle()}`}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={editingItem ? "Cập nhật" : "Thêm"}
                cancelText="Hủy"
                width={800}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="ten_lop_hoc_phan"
                        label="Tên Lớp học phần (bao gồm mã lớp)"
                        rules={[{ required: true, message: 'Vui lòng nhập tên lớp học phần!' }]}
                    >
                        <Input placeholder="Ví dụ: Cấu trúc dữ liệu và giải thuật-1-23 (CSE281_001)" />
                    </Form.Item>

                    {type === 'gd_lop_dh_ngoaibm' && (
                        <Form.Item
                            name="ten_bo_mon_day_ho"
                            label="Tên Bộ môn dạy hộ (nếu có)"
                        >
                            <Input placeholder="Nhập tên bộ môn bạn dạy hộ" />
                        </Form.Item>
                    )}
                    {type === 'gd_lop_dh_ngoaics' && (
                        <Form.Item
                            name="ten_co_so_day"
                            label="Tên Cơ sở dạy (nếu không phải cơ sở chính)"
                        >
                            <Input placeholder="Ví dụ: Phân hiệu XYZ" />
                        </Form.Item>
                    )}

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="hoc_ky_dien_ra"
                                label="Học kỳ diễn ra"
                                rules={[{ required: true, message: 'Vui lòng nhập học kỳ!' }]}
                            >
                                <Input placeholder="Ví dụ: 1, 2, Hè, Phụ" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="si_so"
                                label="Sĩ số"
                                rules={[{ type: 'number', min: 0, message: 'Sĩ số không hợp lệ' }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập sĩ số lớp" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ky_nang"
                                label="Kỹ năng"
                                rules={[{ required: true, message: 'Vui lòng nhập kỹ năng!' }]}
                            >
                                <Select placeholder="Chọn kỹ năng (LT, TH,...)">
                                    <Option value="LT">LT - Lý thuyết</Option>
                                    <Option value="TH">TH - Thực hành</Option>
                                    <Option value="BT">BT - Bài tập</Option>
                                    <Option value="DA">DA - Đồ án môn học</Option>
                                    <Option value="TTTN">TTTN - Thực tập tốt nghiệp</Option>
                                    <Option value="Khác">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                         <Col span={12}>
                            <Form.Item
                                name="don_vi_tinh"
                                label="Đơn vị tính KLKH"
                                initialValue="Tiết"
                                rules={[{ required: true, message: 'Vui lòng nhập đơn vị tính!' }]}
                            >
                                <Input placeholder="Mặc định: Tiết" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="kl_ke_hoach"
                                label="Khối lượng Kế hoạch (GV tự nhập)"
                                rules={[{ required: true, message: 'Vui lòng nhập KLKH!' }, { type: 'number', min: 0, message: 'KLKH không hợp lệ' }]}
                            >
                                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Số tiết/giờ theo kế hoạch" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="he_so_qd"
                                label="Hệ số Quy đổi (GV tự nhập)"
                                rules={[{ required: true, message: 'Vui lòng nhập Hệ số QĐ!' }, { type: 'number', min: 0, message: 'Hệ số không hợp lệ' }]}
                            >
                                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Ví dụ: 1.0, 1.2" />
                            </Form.Item>
                        </Col>
                    </Row>
                     <Form.Item
                        label="Số tiết Quy đổi (tự động tính)"
                    >
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.kl_ke_hoach !== currentValues.kl_ke_hoach || prevValues.he_so_qd !== currentValues.he_so_qd
                            }
                        >
                            {({ getFieldValue }) => (
                                <Input
                                    readOnly
                                    value={calculateSoTietQD(getFieldValue('kl_ke_hoach'), getFieldValue('he_so_qd'))}
                                    className="ant-input-readonly-custom"
                                />
                            )}
                        </Form.Item>
                    </Form.Item>
                    <Form.Item
                        name="ghi_chu"
                        label="Ghi chú"
                    >
                        <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
                    </Form.Item>
                    {/* Không còn upload minh chứng ở đây theo yêu cầu mới */}
                </Form>
            </Modal>
        </div>
    );
}

export default FormGdLop;