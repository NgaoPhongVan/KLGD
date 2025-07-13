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
    Col,
    Divider
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, AuditOutlined } from '@ant-design/icons';

const { Text } = Typography;

function FormDgHpTnDaihoc({
    dataSource,
    setDataSource
}) {
    const [form] = Form.useForm();
    const [editingItem, setEditingItem] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleAddItem = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditItem = (record, index) => {
        setEditingItem({ index, record });
        form.setFieldsValue({
            hoi_dong_dot_hk: record.hoi_dong_dot_hk,
            sl_pb1: record.sl_pb1,
            sl_pb2: record.sl_pb2,
            sl_ct: record.sl_ct,
            sl_uv: record.sl_uv,
            sl_uv_tk: record.sl_uv_tk,
            tong_gio_quydoi_gv_nhap: record.tong_gio_quydoi_gv_nhap,
            ghi_chu: record.ghi_chu,
        });
        setIsModalVisible(true);
    };

    const handleDeleteItem = (indexToDelete) => {
        setDataSource(prevData => prevData.filter((_, index) => index !== indexToDelete));
        message.success(`Đã xóa mục đánh giá HP Tốt nghiệp ĐH.`);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            const newItem = {
                id_temp: editingItem?.record.id_temp || Date.now() + Math.random(),
                id_database: editingItem?.record.id_database || null,
                ...values,
            };

            let newData = [...dataSource];
            if (editingItem !== null && editingItem.index !== undefined) {
                newData[editingItem.index] = newItem;
                message.success("Cập nhật thông tin đánh giá HP Tốt nghiệp ĐH thành công.");
            } else {
                newData.push(newItem);
                message.success("Thêm mục đánh giá HP Tốt nghiệp ĐH vào kê khai thành công.");
            }
            setDataSource(newData);
            setIsModalVisible(false);
            form.resetFields();
            setEditingItem(null);
        } catch (errorInfo) {
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
            title: 'Hội đồng/Đợt/HK',
            dataIndex: 'hoi_dong_dot_hk',
            key: 'hoi_dong_dot_hk',
            ellipsis: true,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>
        },
        { title: 'SL PB1', dataIndex: 'sl_pb1', key: 'sl_pb1', width: 80, align: 'center', render: (text) => text || 0 },
        { title: 'SL PB2', dataIndex: 'sl_pb2', key: 'sl_pb2', width: 80, align: 'center', render: (text) => text || 0 },
        { title: 'SL CT', dataIndex: 'sl_ct', key: 'sl_ct', width: 70, align: 'center', render: (text) => text || 0 },
        { title: 'SL UV', dataIndex: 'sl_uv', key: 'sl_uv', width: 70, align: 'center', render: (text) => text || 0 },
        { title: 'SL UV-TK', dataIndex: 'sl_uv_tk', key: 'sl_uv_tk', width: 90, align: 'center', render: (text) => text || 0 },
        {
            title: 'Tổng Giờ QĐ (GV nhập)',
            dataIndex: 'tong_gio_quydoi_gv_nhap',
            key: 'tong_gio_quydoi_gv_nhap',
            width: 160,
            align: 'center',
            render: (text) => <Text strong style={{ color: '#faad14' }}>{parseFloat(text || 0).toFixed(2)}</Text>
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
            <Typography.Title level={5} style={{ marginBottom: 16, color: '#d46b08' }}>
                <AuditOutlined style={{ marginRight: 8 }} />
                Đánh giá Học phần Tốt nghiệp (Đồ án/Khóa luận Đại học)
            </Typography.Title>
            <Button
                type="dashed"
                onClick={handleAddItem}
                icon={<PlusOutlined />}
                style={{ marginBottom: 16, borderColor: '#d46b08', color: '#d46b08' }}
            >
                Thêm Đợt Đánh giá HP Tốt nghiệp ĐH
            </Button>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id_temp"
                pagination={false}
                bordered
                size="middle"
                locale={{ emptyText: 'Chưa có kê khai đánh giá Học phần Tốt nghiệp Đại học.' }}
                summary={pageData => {
                    let totalGioQuyDoi = 0;
                    pageData.forEach(({ tong_gio_quydoi_gv_nhap }) => {
                        totalGioQuyDoi += parseFloat(tong_gio_quydoi_gv_nhap || 0);
                    });
                    return (
                        dataSource && dataSource.length > 0 && (
                            <Table.Summary.Row style={{ background: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={7} align="right"> {/* Adjusted colSpan */}
                                    <Text strong>Tổng giờ Đánh giá HP TN ĐH:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                    <Text strong style={{ color: '#faad14' }}>{totalGioQuyDoi.toFixed(2)}</Text>
                                </Table.Summary.Cell>
                                 <Table.Summary.Cell index={2} colSpan={1}/>
                            </Table.Summary.Row>
                        )
                    );
                }}
            />

            <Modal
                title={editingItem ? `Chỉnh sửa Đánh giá HP TN ĐH` : `Thêm Đợt Đánh giá HP TN ĐH`}
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
                        name="hoi_dong_dot_hk"
                        label="Tên Hội đồng/Đợt/Học kỳ"
                        rules={[{ required: true, message: 'Vui lòng nhập thông tin Hội đồng/Đợt/HK!' }]}
                    >
                        <Input placeholder="Ví dụ: Hội đồng ĐATN Khoa CNTT - Đợt 1 HK2 2023-2024" />
                    </Form.Item>

                    <Divider orientation="left">Số lượng Sinh viên/Buổi theo Vai trò</Divider>
                    <Row gutter={16}>
                        <Col xs={12} sm={8} md={4}>
                            <Form.Item name="sl_pb1" label="SL PB1" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL SV" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                            <Form.Item name="sl_pb2" label="SL PB2" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL SV" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                            <Form.Item name="sl_ct" label="SL Chủ tịch HĐ" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL Buổi" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                            <Form.Item name="sl_uv" label="SL Ủy viên HĐ" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL Buổi" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={8} md={4}>
                            <Form.Item name="sl_uv_tk" label="SL UV Thư ký HĐ" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL Buổi" />
                            </Form.Item>
                        </Col>
                    </Row>
                     <Text type="secondary" style={{display: 'block', marginBottom: '15px', fontSize: '12px'}}>
                        Nhập số lượng sinh viên (cho vai trò Phản biện) hoặc số buổi/hội đồng (cho các vai trò trong Hội đồng).
                    </Text>

                    <Form.Item
                        name="tong_gio_quydoi_gv_nhap"
                        label="Tổng Giờ Quy đổi cho Đợt này (GV tự nhập)"
                        rules={[{ required: true, message: 'Vui lòng nhập tổng giờ quy đổi!' }, { type: 'number', min: 0, message: 'Giờ QĐ không hợp lệ' }]}
                    >
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Nhập tổng số giờ đã quy đổi" />
                    </Form.Item>

                    <Form.Item
                        name="ghi_chu"
                        label="Ghi chú"
                    >
                        <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default FormDgHpTnDaihoc;