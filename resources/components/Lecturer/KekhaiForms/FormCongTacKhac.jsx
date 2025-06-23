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
    Select // Thêm Select
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select; // Thêm Option

function FormCongTacKhac({
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
            ten_cong_tac: record.ten_cong_tac,
            ket_qua_dat_duoc: record.ket_qua_dat_duoc, // Đổi tên từ ket_qua_quy_doi
            loai_gio_quy_doi: record.loai_gio_quy_doi,
            so_gio_quy_doi_gv_nhap: record.so_gio_quy_doi_gv_nhap, // Đổi tên từ tong_gio_congtac_gv_nhap
            ghi_chu: record.ghi_chu,
        });
        setIsModalVisible(true);
    };

    const handleDeleteItem = (indexToDelete) => {
        setDataSource(prevData => prevData.filter((_, index) => index !== indexToDelete));
        message.success(`Đã xóa mục công tác khác.`);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            const newItem = {
                id_temp: editingItem?.record.id_temp || Date.now() + Math.random(),
                id_database: editingItem?.record.id_database || null,
                ...values,
                // Đảm bảo các trường có tên đúng với $fillable của model
                // ten_cong_tac, ket_qua_dat_duoc, loai_gio_quy_doi, so_gio_quy_doi_gv_nhap, ghi_chu
            };

            let newData = [...dataSource];
            if (editingItem !== null && editingItem.index !== undefined) {
                newData[editingItem.index] = newItem;
                message.success("Cập nhật thông tin công tác khác thành công.");
            } else {
                newData.push(newItem);
                message.success("Thêm mục công tác khác vào kê khai thành công.");
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
            title: 'Tên Công tác',
            dataIndex: 'ten_cong_tac',
            key: 'ten_cong_tac',
            ellipsis: true,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>
        },
        {
            title: 'Kết quả đạt được/Mô tả', // Đổi tên cột
            dataIndex: 'ket_qua_dat_duoc',    // Đổi dataIndex
            key: 'ket_qua_dat_duoc',
            ellipsis: true,
            width: 250,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>
        },
        {
            title: 'Loại giờ QĐ',
            dataIndex: 'loai_gio_quy_doi',
            key: 'loai_gio_quy_doi',
            width: 120,
            align: 'center',
            render: (text) => {
                if (text === 'GD') return <Tag color="blue">Giờ Giảng dạy</Tag>;
                if (text === 'KHCN') return <Tag color="purple">Giờ KHCN</Tag>;
                return <Tag>Chưa rõ</Tag>;
            }
        },
        {
            title: 'Số Giờ QĐ (GV nhập)', // Đổi tên cột
            dataIndex: 'so_gio_quy_doi_gv_nhap', // Đổi dataIndex
            key: 'so_gio_quy_doi_gv_nhap',
            width: 160,
            align: 'center',
            render: (text) => <Text strong style={{ color: '#eb2f96' }}>{parseFloat(text || 0).toFixed(2)}</Text>
        },
        { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', ellipsis: true, render: (text) => <Tooltip title={text}>{text || '💭 ——'}</Tooltip> },
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
            <Typography.Title level={5} style={{ marginBottom: 16, color: '#eb2f96' }}>
                <TeamOutlined style={{ marginRight: 8 }} />
                Kê khai Công tác khác (GVCN, Olympic, HD SV NCKH ngoài định mức,...)
            </Typography.Title>
            <Button
                type="dashed"
                onClick={handleAddItem}
                icon={<PlusOutlined />}
                style={{ marginBottom: 16, borderColor: '#eb2f96', color: '#eb2f96' }}
            >
                Thêm Công tác khác
            </Button>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id_temp"
                pagination={false}
                bordered
                size="middle"
                locale={{ emptyText: 'Chưa có công tác khác nào được kê khai.' }}
                summary={pageData => {
                    let totalGioGd = 0;
                    let totalGioKhcn = 0;
                    pageData.forEach(item => {
                        if (item.loai_gio_quy_doi === 'GD') {
                            totalGioGd += parseFloat(item.so_gio_quy_doi_gv_nhap || 0);
                        } else if (item.loai_gio_quy_doi === 'KHCN') {
                            totalGioKhcn += parseFloat(item.so_gio_quy_doi_gv_nhap || 0);
                        }
                    });
                    return (
                        dataSource && dataSource.length > 0 && (
                            <>
                                <Table.Summary.Row style={{ background: '#fafafa' }}>
                                    <Table.Summary.Cell index={0} colSpan={3} align="right"><Text strong>Tổng giờ Công tác khác (quy ra GD):</Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="center" colSpan={2}>
                                        <Text strong style={{ color: '#eb2f96' }}>{totalGioGd.toFixed(2)}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} colSpan={3}/>
                                </Table.Summary.Row>
                                <Table.Summary.Row style={{ background: '#f9f0ff' }}>
                                    <Table.Summary.Cell index={0} colSpan={3} align="right"><Text strong>Tổng giờ Công tác khác (quy ra KHCN):</Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="center" colSpan={2}>
                                        <Text strong style={{ color: '#eb2f96' }}>{totalGioKhcn.toFixed(2)}</Text>
                                    </Table.Summary.Cell>
                                     <Table.Summary.Cell index={2} colSpan={3}/>
                                </Table.Summary.Row>
                            </>
                        )
                    );
                }}
            />

            <Modal
                title={editingItem ? `Chỉnh sửa Công tác khác` : `Thêm Công tác khác`}
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
                        name="ten_cong_tac"
                        label="Tên Công tác (GV tự nhập)"
                        rules={[{ required: true, message: 'Vui lòng nhập tên công tác!' }]}
                    >
                        <TextArea rows={3} placeholder="Mô tả chi tiết công tác (VD: Chủ nhiệm lớp 63CNTT1, Bồi dưỡng đội tuyển Olympic...)" />
                    </Form.Item>

                    <Form.Item
                        name="ket_qua_dat_duoc" // Đổi tên
                        label="Kết quả đạt được/Mô tả quy đổi (GV tự nhập nếu có)"
                    >
                        <Input placeholder="Ví dụ: Hoàn thành tốt, Lớp đạt danh hiệu Lớp tiên tiến..." />
                    </Form.Item>

                    <Form.Item
                        name="loai_gio_quy_doi"
                        label="Quy đổi ra loại giờ"
                        rules={[{ required: true, message: 'Vui lòng chọn loại giờ quy đổi!' }]}
                    >
                        <Select placeholder="Chọn loại giờ được quy đổi ra">
                            <Option value="GD">Giờ Giảng dạy (GD)</Option>
                            <Option value="KHCN">Giờ Nghiên cứu Khoa học (KHCN)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="so_gio_quy_doi_gv_nhap" // Đổi tên
                        label="Số Giờ Quy đổi cho Công tác này (GV tự nhập)"
                        rules={[{ required: true, message: 'Vui lòng nhập số giờ quy đổi!' }, { type: 'number', min: 0, message: 'Giờ quy đổi không hợp lệ' }]}
                    >
                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Nhập tổng số giờ đã quy đổi theo quy định" />
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

export default FormCongTacKhac;