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
    Row,
    Col
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, BuildOutlined } from '@ant-design/icons';

const { Text } = Typography;

function FormXdCtdtVaKhacGd({
    dataSource,
    setDataSource
}) {
    const [form] = Form.useForm();
    const [editingItem, setEditingItem] = useState(null); // { index: number, record: object }
    const [isModalVisible, setIsModalVisible] = useState(false);
    // Không cần state cho selectedFile và currentMinhChung

    const handleAddItem = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditItem = (record, index) => {
        setEditingItem({ index, record });
        form.setFieldsValue({
            ten_hoat_dong: record.ten_hoat_dong,
            so_luong_don_vi: record.so_luong_don_vi,
            don_vi_tinh: record.don_vi_tinh,
            tong_gio_quydoi_gv_nhap: record.tong_gio_quydoi_gv_nhap,
            ghi_chu: record.ghi_chu,
        });
        setIsModalVisible(true);
    };

    const handleDeleteItem = (indexToDelete) => {
        setDataSource(prevData => prevData.filter((_, index) => index !== indexToDelete));
        message.success(`Đã xóa mục hoạt động khác (QĐ giờ GD).`);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            const newItem = {
                id_temp: editingItem?.record.id_temp || Date.now() + Math.random(),
                id_database: editingItem?.record.id_database || null,
                ...values,
                // tong_gio_quydoi_gv_nhap đã có trong values
            };

            let newData = [...dataSource];
            if (editingItem !== null && editingItem.index !== undefined) {
                newData[editingItem.index] = newItem;
                message.success("Cập nhật thông tin hoạt động khác (QĐ giờ GD) thành công.");
            } else {
                newData.push(newItem);
                message.success("Thêm mục hoạt động khác (QĐ giờ GD) vào kê khai thành công.");
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

    const columns = [
        { title: 'STT', key: 'stt', width: 50, align: 'center', render: (_, __, index) => index + 1 },
        {
            title: 'Tên Hoạt động',
            dataIndex: 'ten_hoat_dong',
            key: 'ten_hoat_dong',
            ellipsis: true,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>
        },
        {
            title: 'Số lượng',
            dataIndex: 'so_luong_don_vi',
            key: 'so_luong_don_vi',
            width: 120,
            align: 'center',
            render: (text) => parseFloat(text || 0).toFixed(1)
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'don_vi_tinh',
            key: 'don_vi_tinh',
            width: 130,
            align: 'center',
        },
        {
            title: 'Tổng Giờ QĐ (GV nhập)',
            dataIndex: 'tong_gio_quydoi_gv_nhap',
            key: 'tong_gio_quydoi_gv_nhap',
            width: 160,
            align: 'center',
            render: (text) => <Text strong style={{ color: '#389e0d' }}>{parseFloat(text || 0).toFixed(2)}</Text>
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
            <Typography.Title level={5} style={{ marginBottom: 16, color: '#389e0d' }}>
                <BuildOutlined style={{ marginRight: 8 }} />
                Các hoạt động khác quy đổi ra giờ giảng dạy (XD CTĐT,...)
            </Typography.Title>
            <Button
                type="dashed"
                onClick={handleAddItem}
                icon={<PlusOutlined />}
                style={{ marginBottom: 16, borderColor: '#389e0d', color: '#389e0d' }}
            >
                Thêm Hoạt động khác (QĐ giờ GD)
            </Button>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id_temp"
                pagination={false}
                bordered
                size="middle"
                locale={{ emptyText: 'Chưa có hoạt động khác (QĐ giờ GD) nào được kê khai.' }}
                summary={pageData => {
                    let totalGioQuyDoi = 0;
                    pageData.forEach(({ tong_gio_quydoi_gv_nhap }) => {
                        totalGioQuyDoi += parseFloat(tong_gio_quydoi_gv_nhap || 0);
                    });
                    return (
                        dataSource && dataSource.length > 0 && (
                            <Table.Summary.Row style={{ background: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={4} align="right">
                                    <Text strong>Tổng giờ Hoạt động khác (QĐ giờ GD):</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                    <Text strong style={{ color: '#389e0d' }}>{totalGioQuyDoi.toFixed(2)}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} colSpan={2}/>
                            </Table.Summary.Row>
                        )
                    );
                }}
            />

            <Modal
                title={editingItem ? `Chỉnh sửa Hoạt động khác (QĐ giờ GD)` : `Thêm Hoạt động khác (QĐ giờ GD)`}
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
                        name="ten_hoat_dong"
                        label="Tên Hoạt động (GV tự nhập)"
                        rules={[{ required: true, message: 'Vui lòng nhập tên hoạt động!' }]}
                    >
                        <Input placeholder="Ví dụ: Tham gia xây dựng chương trình đào tạo ngành XYZ, Biên soạn đề cương môn ABC..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="so_luong_don_vi"
                                label="Số lượng (nếu có)"
                                rules={[{ type: 'number', min: 0, message: 'Số lượng không hợp lệ'}]}
                            >
                                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Nhập số lượng" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item
                                name="don_vi_tinh"
                                label="Đơn vị tính (nếu có)"
                            >
                                <Input style={{ width: '100%' }} placeholder="Ví dụ: Chương trình, Đề cương, Buổi" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="tong_gio_quydoi_gv_nhap"
                        label="Tổng Giờ Quy đổi cho Hoạt động này (GV tự nhập)"
                        rules={[{ required: true, message: 'Vui lòng nhập tổng giờ quy đổi!' }, { type: 'number', min: 0, message: 'Giờ QĐ không hợp lệ' }]}
                    >
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Nhập tổng số giờ đã quy đổi theo quy định" />
                    </Form.Item>

                    <Form.Item
                        name="ghi_chu"
                        label="Ghi chú"
                    >
                        <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
                    </Form.Item>
                    {/* Không có Upload minh chứng */}
                </Form>
            </Modal>
        </div>
    );
}

export default FormXdCtdtVaKhacGd;