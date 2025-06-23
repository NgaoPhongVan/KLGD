import React, { useState } from 'react';
import {
    Button,
    Form,
    Input,
    InputNumber,
    Upload,
    Table,
    Space,
    Tooltip,
    Popconfirm,
    Typography,
    Tag,
    Modal,
    message
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined, ExperimentOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

function FormNckh({
    dataSource,
    setDataSource,
    keKhaiTongHopId // Cần ID này để có thể liên kết minh chứng nếu lưu ngay
}) {
    const [form] = Form.useForm();
    const [editingItem, setEditingItem] = useState(null); // { index: number, record: object }
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentMinhChung, setCurrentMinhChung] = useState(null); // { name: string, path?: string }

    const handleAddItem = () => {
        setEditingItem(null);
        setCurrentMinhChung(null);
        setSelectedFile(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditItem = (record, index) => {
        setEditingItem({ index, record });
        setCurrentMinhChung(record.minh_chung_existing ? { name: record.minh_chung_existing, path: record.minh_chung_existing_path } : null);
        setSelectedFile(null); // Reset file mới chọn khi mở modal sửa
        form.setFieldsValue({
            ten_hoat_dong_san_pham: record.ten_hoat_dong_san_pham,
            ket_qua_dat_duoc_quy_doi: record.ket_qua_dat_duoc_quy_doi,
            tong_gio_nckh_gv_nhap: record.tong_gio_nckh_gv_nhap,
            ghi_chu: record.ghi_chu,
        });
        setIsModalVisible(true);
    };

    const handleDeleteItem = (indexToDelete) => {
        setDataSource(prevData => prevData.filter((_, index) => index !== indexToDelete));
        message.success(`Đã xóa mục NCKH.`);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            const newItem = {
                id_temp: editingItem?.record.id_temp || Date.now() + Math.random(),
                id_database: editingItem?.record.id_database || null,
                ...values,
                minh_chung_file: selectedFile, // File object để gửi lên server
                minh_chung_existing: selectedFile ? selectedFile.name : editingItem?.record.minh_chung_existing,
                minh_chung_existing_path: editingItem?.record.minh_chung_existing_path,
            };

            let newData = [...dataSource];
            if (editingItem !== null && editingItem.index !== undefined) {
                newData[editingItem.index] = newItem;
                message.success("Cập nhật thông tin NCKH thành công.");
            } else {
                newData.push(newItem);
                message.success("Thêm mục NCKH vào kê khai thành công.");
            }
            setDataSource(newData);
            setIsModalVisible(false);
            form.resetFields();
            setEditingItem(null);
            setSelectedFile(null);
            setCurrentMinhChung(null);
        } catch (errorInfo) {
            console.log('Validate Failed:', errorInfo);
            message.error("Vui lòng kiểm tra lại thông tin đã nhập.");
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingItem(null);
        setSelectedFile(null);
        setCurrentMinhChung(null);
    };

    const uploadProps = {
        onRemove: () => {
            setSelectedFile(null);
            // Nếu đang sửa, và người dùng xóa file VỪA CHỌN (selectedFile),
            // thì hiển thị lại file cũ (nếu có)
            if (editingItem && editingItem.record.minh_chung_existing) {
                setCurrentMinhChung({ name: editingItem.record.minh_chung_existing, path: editingItem.record.minh_chung_existing_path });
            } else if (editingItem) {
                setCurrentMinhChung(null); // Không có file cũ
            }
        },
        beforeUpload: file => {
            const isLt2M = file.size / 1024 / 1024 < 2; // Ví dụ giới hạn 2MB
            if (!isLt2M) {
                message.error('File minh chứng phải nhỏ hơn 2MB!');
                return Upload.LIST_IGNORE; // Ngăn chặn việc thêm file vào danh sách nếu quá lớn
            }
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            if (!allowedTypes.includes(file.type)) {
                message.error('Chỉ cho phép tải lên file PDF, Word, Excel hoặc Ảnh (JPG, PNG)!');
                return Upload.LIST_IGNORE;
            }
            setSelectedFile(file); // Lưu file đã chọn vào state
            setCurrentMinhChung({ name: file.name }); // Hiển thị tên file mới đã chọn
            return false; // Luôn trả về false để ngăn chặn việc tự động upload của Ant Design
        },
        fileList: selectedFile ? [selectedFile] : [], // Hiển thị file đang được chọn (nếu có)
        maxCount: 1,
    };


    const columns = [
        { title: 'STT', key: 'stt', width: 50, align: 'center', render: (_, __, index) => index + 1 },
        {
            title: 'Tên Hoạt động/Sản phẩm NCKH',
            dataIndex: 'ten_hoat_dong_san_pham',
            key: 'ten_hoat_dong_san_pham',
            ellipsis: true,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>
        },
        {
            title: 'Kết quả đạt được/Quy đổi',
            dataIndex: 'ket_qua_dat_duoc_quy_doi',
            key: 'ket_qua_dat_duoc_quy_doi',
            ellipsis: true,
            width: 250,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>
        },
        {
            title: 'Tổng Giờ NCKH (GV nhập)',
            dataIndex: 'tong_gio_nckh_gv_nhap',
            key: 'tong_gio_nckh_gv_nhap',
            width: 180,
            align: 'center',
            render: (text) => <Text strong style={{ color: '#13c2c2' }}>{parseFloat(text || 0).toFixed(2)}</Text>
        },
        {
            title: 'Minh chứng',
            key: 'minh_chung',
            width: 180,
            align: 'center',
            render: (_, record) => {
                const fileName = record.minh_chung_file?.name || record.minh_chung_existing;
                if (fileName) {
                    return (
                        <Tooltip title={fileName}>
                            <Tag color="cyan" icon={<UploadOutlined />}>
                                {fileName.length > 20 ? `${fileName.substring(0,17)}...` : fileName}
                            </Tag>
                        </Tooltip>
                    );
                }
                return <Tag color="red">Bắt buộc</Tag>;
            }
        },
        { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', ellipsis: true, render: (text) => <Tooltip title={text}>{text || 'N/A'}</Tooltip> },
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
    ];

    return (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            <Typography.Title level={5} style={{ marginBottom: 16, color: '#13c2c2' }}>
                <ExperimentOutlined style={{ marginRight: 8 }} />
                Kê khai Nghiên cứu Khoa học (NCKH)
            </Typography.Title>
            <Button
                type="dashed"
                onClick={handleAddItem}
                icon={<PlusOutlined />}
                style={{ marginBottom: 16, borderColor: '#13c2c2', color: '#13c2c2' }}
            >
                Thêm Hoạt động/Sản phẩm NCKH
            </Button>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id_temp"
                pagination={false}
                bordered
                size="middle"
                locale={{ emptyText: 'Chưa có hoạt động NCKH nào được kê khai.' }}
                summary={pageData => {
                    let totalGioQuyDoi = 0;
                    pageData.forEach(({ tong_gio_nckh_gv_nhap }) => {
                        totalGioQuyDoi += parseFloat(tong_gio_nckh_gv_nhap || 0);
                    });
                    return (
                        dataSource && dataSource.length > 0 && (
                            <Table.Summary.Row style={{ background: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={3} align="right">
                                    <Text strong>Tổng giờ NCKH:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                    <Text strong style={{ color: '#13c2c2' }}>{totalGioQuyDoi.toFixed(2)}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} colSpan={3}/>
                            </Table.Summary.Row>
                        )
                    );
                }}
            />

            <Modal
                title={editingItem ? `Chỉnh sửa Kê khai NCKH` : `Thêm Kê khai NCKH`}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={editingItem ? "Cập nhật" : "Thêm"}
                cancelText="Hủy"
                width={700}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="ten_hoat_dong_san_pham"
                        label="Tên Hoạt động/Sản phẩm NCKH (GV tự nhập)"
                        rules={[{ required: true, message: 'Vui lòng nhập tên hoạt động/sản phẩm!' }]}
                    >
                        <TextArea rows={3} placeholder="Mô tả chi tiết bài báo, đề tài, dự án, công bố, sở hữu trí tuệ, sách, các hoạt động học thuật khác..." />
                    </Form.Item>

                    <Form.Item
                        name="ket_qua_dat_duoc_quy_doi"
                        label="Kết quả đạt được/Quy đổi (GV tự nhập)"
                    >
                        <Input placeholder="Ví dụ: Bài báo ISI Q1, Đề tài cấp Bộ nghiệm thu Xuất sắc, Sách chuyên khảo..." />
                    </Form.Item>

                    <Form.Item
                        name="tong_gio_nckh_gv_nhap"
                        label="Tổng Giờ NCKH Quy đổi cho Hoạt động/Sản phẩm này (GV tự nhập)"
                        rules={[{ required: true, message: 'Vui lòng nhập tổng giờ NCKH!' }, { type: 'number', min: 0, message: 'Giờ NCKH không hợp lệ' }]}
                    >
                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Nhập tổng số giờ NCKH đã quy đổi theo quy định" />
                    </Form.Item>

                    <Form.Item
                        name="ghi_chu"
                        label="Ghi chú"
                    >
                        <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
                    </Form.Item>
                    <Form.Item
                        label="Minh chứng (Bắt buộc)"
                        // Nếu không có file nào được chọn và cũng không có file cũ -> lỗi
                        // validateStatus={!selectedFile && !(editingItem && editingItem.record.minh_chung_existing) ? 'error' : ''}
                        // help={!selectedFile && !(editingItem && editingItem.record.minh_chung_existing) ? 'Vui lòng tải lên file minh chứng!' : ''}
                        rules={[{
                            validator: async (_, value) => {
                                if (!selectedFile && !(editingItem && editingItem.record.minh_chung_existing)) {
                                    return Promise.reject(new Error('Vui lòng tải lên file minh chứng!'));
                                }
                                return Promise.resolve();
                            }
                        }]}
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Chọn File Minh chứng</Button>
                        </Upload>
                        {currentMinhChung && !selectedFile && editingItem && editingItem.record.minh_chung_existing && (
                             <div style={{ marginTop: 8 }}>
                                <Text type="secondary">File hiện tại: </Text>
                                <Tag
                                    closable
                                    onClose={(e) => {
                                        e.preventDefault(); // Ngăn modal đóng nếu đang trong form
                                        setCurrentMinhChung(null);
                                        // Quan trọng: Đánh dấu file cũ đã bị xóa để backend xử lý (nếu cần)
                                        // Hoặc logic ở handleModalOk sẽ không gửi thông tin file cũ nếu currentMinhChung là null
                                        if (editingItem && editingItem.record) {
                                            const updatedRecord = { ...editingItem.record, minh_chung_existing: null, minh_chung_existing_path: null };
                                            setEditingItem({ ...editingItem, record: updatedRecord });
                                        }
                                    }}
                                >
                                    {currentMinhChung.name}
                                </Tag>
                            </div>
                        )}
                         {selectedFile && ( // Hiển thị tên file mới được chọn
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary">File mới chọn: </Text>
                                <Tag>{selectedFile.name}</Tag>
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default FormNckh;