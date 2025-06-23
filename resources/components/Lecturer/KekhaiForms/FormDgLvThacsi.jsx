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

function FormDgLvThacsi({
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
            hoi_dong_dot_hk: record.hoi_dong_dot_hk,
            sl_duyet_de_cuong: record.sl_duyet_de_cuong,
            sl_gop_y_lv: record.sl_gop_y_lv,
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
        message.success(`Đã xóa mục đánh giá Luận văn Thạc sĩ.`);
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
                message.success("Cập nhật thông tin đánh giá LV ThS thành công.");
            } else {
                newData.push(newItem);
                message.success("Thêm mục đánh giá LV ThS vào kê khai thành công.");
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
            title: 'Hội đồng/Đợt/HK (Chấm LV ThS)',
            dataIndex: 'hoi_dong_dot_hk',
            key: 'hoi_dong_dot_hk',
            ellipsis: true,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>
        },
        { title: 'SL Duyệt ĐC', dataIndex: 'sl_duyet_de_cuong', key: 'sl_duyet_de_cuong', width: 100, align: 'center', render: (text) => text || 0 },
        { title: 'SL Góp ý LV', dataIndex: 'sl_gop_y_lv', key: 'sl_gop_y_lv', width: 100, align: 'center', render: (text) => text || 0 },
        { title: 'SL PB1 (LV)', dataIndex: 'sl_pb1', key: 'sl_pb1', width: 90, align: 'center', render: (text) => text || 0 },
        { title: 'SL PB2 (LV)', dataIndex: 'sl_pb2', key: 'sl_pb2', width: 90, align: 'center', render: (text) => text || 0 },
        { title: 'SL CT (HĐ)', dataIndex: 'sl_ct', key: 'sl_ct', width: 80, align: 'center', render: (text) => text || 0 },
        { title: 'SL UV (HĐ)', dataIndex: 'sl_uv', key: 'sl_uv', width: 80, align: 'center', render: (text) => text || 0 },
        { title: 'SL UV-TK (HĐ)', dataIndex: 'sl_uv_tk', key: 'sl_uv_tk', width: 100, align: 'center', render: (text) => text || 0 },
        {
            title: 'Tổng Giờ QĐ (GV nhập)',
            dataIndex: 'tong_gio_quydoi_gv_nhap',
            key: 'tong_gio_quydoi_gv_nhap',
            width: 160,
            align: 'center',
            render: (text) => <Text strong style={{ color: '#d4380d' }}>{parseFloat(text || 0).toFixed(2)}</Text>
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
            <Typography.Title level={5} style={{ marginBottom: 16, color: '#d4380d' }}>
                <AuditOutlined style={{ marginRight: 8 }} />
                Chấm Luận văn Thạc sĩ & Tham gia Hội đồng
            </Typography.Title>
            <Button
                type="dashed"
                onClick={handleAddItem}
                icon={<PlusOutlined />}
                style={{ marginBottom: 16, borderColor: '#d4380d', color: '#d4380d' }}
            >
                Thêm Đợt Chấm/Hội đồng LV ThS
            </Button>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id_temp"
                pagination={false}
                bordered
                size="middle"
                locale={{ emptyText: 'Chưa có kê khai chấm Luận văn Thạc sĩ.' }}
                summary={pageData => {
                    let totalGioQuyDoi = 0;
                    pageData.forEach(({ tong_gio_quydoi_gv_nhap }) => {
                        totalGioQuyDoi += parseFloat(tong_gio_quydoi_gv_nhap || 0);
                    });
                    return (
                        dataSource && dataSource.length > 0 && (
                            <Table.Summary.Row style={{ background: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={9} align="right"> {/* Adjusted colSpan */}
                                    <Text strong>Tổng giờ Chấm LV ThS:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                    <Text strong style={{ color: '#d4380d' }}>{totalGioQuyDoi.toFixed(2)}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} colSpan={1}/>
                            </Table.Summary.Row>
                        )
                    );
                }}
            />

            <Modal
                title={editingItem ? `Chỉnh sửa Chấm LV ThS` : `Thêm Đợt Chấm/Hội đồng LV ThS`}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText={editingItem ? "Cập nhật" : "Thêm"}
                cancelText="Hủy"
                width={900} // Tăng chiều rộng modal
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="hoi_dong_dot_hk"
                        label="Tên Hội đồng/Đợt/Học kỳ"
                        rules={[{ required: true, message: 'Vui lòng nhập thông tin Hội đồng/Đợt/HK!' }]}
                    >
                        <Input placeholder="Ví dụ: Hội đồng LV Khoa Kinh tế - Đợt 1 HK1 2024-2025" />
                    </Form.Item>

                    <Divider orientation="left">Số lượng theo Vai trò/Nhiệm vụ</Divider>
                    <Row gutter={16}>
                        <Col xs={12} sm={8} md={6}>
                            <Form.Item name="sl_duyet_de_cuong" label="SL Duyệt Đề cương" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL ĐC" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={8} md={6}>
                            <Form.Item name="sl_gop_y_lv" label="SL Góp ý LV" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL LV" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={8} md={6}>
                            <Form.Item name="sl_pb1" label="SL Phản biện 1 (LV)" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL LV" />
                            </Form.Item>
                        </Col>
                         <Col xs={12} sm={8} md={6}>
                            <Form.Item name="sl_pb2" label="SL Phản biện 2 (LV)" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL LV" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={8} md={6}>
                            <Form.Item name="sl_ct" label="SL Chủ tịch HĐ (LV)" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL Buổi/HĐ" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={8} md={6}>
                            <Form.Item name="sl_uv" label="SL Ủy viên HĐ (LV)" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL Buổi/HĐ" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={8} md={6}>
                            <Form.Item name="sl_uv_tk" label="SL UV Thư ký HĐ (LV)" initialValue={0} rules={[{ type: 'number', min: 0 }]}>
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL Buổi/HĐ" />
                            </Form.Item>
                        </Col>
                    </Row>
                     <Text type="secondary" style={{display: 'block', marginBottom: '15px', fontSize: '12px'}}>
                        Nhập số lượng Luận văn hoặc số Buổi/Hội đồng tùy theo đơn vị tính của từng vai trò (theo quy định của Trường).
                    </Text>

                    <Form.Item
                        name="tong_gio_quydoi_gv_nhap"
                        label="Tổng Giờ Quy đổi cho Đợt này (GV tự nhập)"
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

export default FormDgLvThacsi;