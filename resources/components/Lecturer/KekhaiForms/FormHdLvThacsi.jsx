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
    Row, // Thêm Row
    Col  // Thêm Col
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UserSwitchOutlined } from '@ant-design/icons';

const { Text } = Typography;

function FormHdLvThacsi({
    dataSource,
    setDataSource
}) {
    const [form] = Form.useForm();
    const [editingItem, setEditingItem] = useState(null); // { index: number, record: object }
    const [isModalVisible, setIsModalVisible] = useState(false);
    // Không cần state cho selectedFile và currentMinhChung nữa

    const handleAddItem = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditItem = (record, index) => {
        setEditingItem({ index, record });
        form.setFieldsValue({
            quyet_dinh_dot_hk: record.quyet_dinh_dot_hk,
            so_luong_hd_doc_lap: record.so_luong_hd_doc_lap,
            so_luong_hd1: record.so_luong_hd1,
            so_luong_hd2: record.so_luong_hd2,
            tong_gio_quydoi_gv_nhap: record.tong_gio_quydoi_gv_nhap,
            ghi_chu: record.ghi_chu,
        });
        setIsModalVisible(true);
    };

    const handleDeleteItem = (indexToDelete) => {
        setDataSource(prevData => prevData.filter((_, index) => index !== indexToDelete));
        message.success(`Đã xóa mục hướng dẫn Luận văn Thạc sĩ.`);
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
                message.success("Cập nhật thông tin hướng dẫn LV ThS thành công.");
            } else {
                newData.push(newItem);
                message.success("Thêm mục hướng dẫn LV ThS vào kê khai thành công.");
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
            title: 'Quyết định/Đợt/HK',
            dataIndex: 'quyet_dinh_dot_hk',
            key: 'quyet_dinh_dot_hk',
            ellipsis: true,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>
        },
        {
            title: 'SL HĐ Độc lập',
            dataIndex: 'so_luong_hd_doc_lap',
            key: 'so_luong_hd_doc_lap',
            width: 130,
            align: 'center',
            render: (text) => text || 0
        },
        {
            title: 'SL HĐ1',
            dataIndex: 'so_luong_hd1',
            key: 'so_luong_hd1',
            width: 100,
            align: 'center',
            render: (text) => text || 0
        },
        {
            title: 'SL HĐ2',
            dataIndex: 'so_luong_hd2',
            key: 'so_luong_hd2',
            width: 100,
            align: 'center',
            render: (text) => text || 0
        },
        {
            title: 'Tổng Giờ QĐ (GV nhập)',
            dataIndex: 'tong_gio_quydoi_gv_nhap',
            key: 'tong_gio_quydoi_gv_nhap',
            width: 160,
            align: 'center',
            render: (text) => <Text strong style={{ color: '#08979c' }}>{parseFloat(text || 0).toFixed(2)}</Text>
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
            <Typography.Title level={5} style={{ marginBottom: 16, color: '#08979c' }}>
                <UserSwitchOutlined style={{ marginRight: 8 }} />
                Hướng dẫn Luận văn Thạc sĩ
            </Typography.Title>
            <Button
                type="dashed"
                onClick={handleAddItem}
                icon={<PlusOutlined />}
                style={{ marginBottom: 16, borderColor: '#08979c', color: '#08979c' }}
            >
                Thêm Đợt Hướng dẫn LV ThS
            </Button>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id_temp"
                pagination={false}
                bordered
                size="middle"
                locale={{ emptyText: 'Chưa có kê khai hướng dẫn Luận văn Thạc sĩ.' }}
                summary={pageData => {
                    let totalGioQuyDoi = 0;
                    pageData.forEach(({ tong_gio_quydoi_gv_nhap }) => {
                        totalGioQuyDoi += parseFloat(tong_gio_quydoi_gv_nhap || 0);
                    });
                    return (
                        dataSource && dataSource.length > 0 && (
                            <Table.Summary.Row style={{ background: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={5} align="right">
                                    <Text strong>Tổng giờ Hướng dẫn LV ThS:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                    <Text strong style={{ color: '#08979c' }}>{totalGioQuyDoi.toFixed(2)}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} colSpan={1}/>
                            </Table.Summary.Row>
                        )
                    );
                }}
            />

            <Modal
                title={editingItem ? `Chỉnh sửa Hướng dẫn LV ThS` : `Thêm Hướng dẫn LV ThS`}
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
                        name="quyet_dinh_dot_hk"
                        label="Quyết định/Đợt/Học kỳ"
                        rules={[{ required: true, message: 'Vui lòng nhập thông tin QĐ/Đợt/HK!' }]}
                    >
                        <Input placeholder="Ví dụ: QĐ 789, Đợt 2 - HK1 2024-2025" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="so_luong_hd_doc_lap"
                                label="SL HĐ Độc lập"
                                initialValue={0}
                                rules={[{ type: 'number', min: 0, message: 'Số lượng không hợp lệ' }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL Học viên" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="so_luong_hd1"
                                label="SL Hướng dẫn 1"
                                initialValue={0}
                                rules={[{ type: 'number', min: 0, message: 'Số lượng không hợp lệ' }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL Học viên" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="so_luong_hd2"
                                label="SL Hướng dẫn 2"
                                initialValue={0}
                                rules={[{ type: 'number', min: 0, message: 'Số lượng không hợp lệ' }]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="SL Học viên" />
                            </Form.Item>
                        </Col>
                    </Row>

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
                    {/* Không có Upload minh chứng theo yêu cầu mới */}
                </Form>
            </Modal>
        </div>
    );
}

export default FormHdLvThacsi;