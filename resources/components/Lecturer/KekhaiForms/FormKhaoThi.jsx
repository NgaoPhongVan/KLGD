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
    Col
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CarryOutOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

function FormKhaoThi({
    type, // 'khaothi_dh_trongbm', 'khaothi_dh_ngoaibm', 'khaothi_ths', 'khaothi_ts'
    dataSource,
    setDataSource
}) {
    const [form] = Form.useForm();
    const [editingItem, setEditingItem] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const getTitleAndTrinhDo = () => {
        let title = "Hoạt động Khảo thí";
        let trinhDoDisplay = "";
        let phamViDisplay = "";

        if (type.includes('_dh_')) trinhDoDisplay = "Đại học";
        else if (type.includes('_ths')) trinhDoDisplay = "Thạc sĩ";
        else if (type.includes('_ts')) trinhDoDisplay = "Tiến sĩ";

        if (type.includes('_trongbm')) phamViDisplay = " (Trong Bộ môn)";
        else if (type.includes('_ngoaibm')) phamViDisplay = " (Ngoài Bộ môn)";

        title = `Khảo thí ${trinhDoDisplay}${phamViDisplay}`;
        return { title, trinhDoDisplay };
    };

    const { title: componentTitle, trinhDoDisplay } = getTitleAndTrinhDo();


    const handleAddItem = () => {
        setEditingItem(null);
        form.resetFields();
        if (type === 'khaothi_dh_trongbm') form.setFieldsValue({ pham_vi_display: 'Trong BM' });
        else if (type === 'khaothi_dh_ngoaibm') form.setFieldsValue({ pham_vi_display: 'Ngoài BM' });

        setIsModalVisible(true);
    };

    const handleEditItem = (record, index) => {
        setEditingItem({ index, record });
        let phamViValue;
        if (type === 'khaothi_dh_trongbm') phamViValue = 'Trong BM';
        else if (type === 'khaothi_dh_ngoaibm') phamViValue = 'Ngoài BM';

        form.setFieldsValue({
            hang_muc: record.hang_muc,
            so_ca_bai_mon: record.so_ca_bai_mon,
            dinh_muc_gv_nhap: record.dinh_muc_gv_nhap,
            ghi_chu: record.ghi_chu,
            pham_vi_display: phamViValue,
        });
        setIsModalVisible(true);
    };

    const handleDeleteItem = (indexToDelete) => {
        setDataSource(prevData => prevData.filter((_, index) => index !== indexToDelete));
        message.success(`Đã xóa mục khảo thí.`);
    };

    const calculateSoTietQD = (so_ca_bai_mon, dinh_muc_gv_nhap) => {
        const sl = parseFloat(so_ca_bai_mon || 0);
        const dm = parseFloat(dinh_muc_gv_nhap || 0);
        return (sl * dm).toFixed(2);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const so_tiet_qd = calculateSoTietQD(values.so_ca_bai_mon, values.dinh_muc_gv_nhap);

            const newItem = {
                id_temp: editingItem?.record.id_temp || Date.now() + Math.random(),
                id_database: editingItem?.record.id_database || null,
                ...values,
                so_tiet_qd: so_tiet_qd,
            };
            delete newItem.pham_vi_display;


            let newData = [...dataSource];
            if (editingItem !== null && editingItem.index !== undefined) {
                newData[editingItem.index] = newItem;
                message.success("Cập nhật thông tin khảo thí thành công.");
            } else {
                newData.push(newItem);
                message.success("Thêm mục khảo thí vào kê khai thành công.");
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
            title: 'Hạng mục Khảo thí',
            dataIndex: 'hang_muc',
            key: 'hang_muc',
            ellipsis: true,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>
        },
        {
            title: 'Số Ca/Bài/Môn',
            dataIndex: 'so_ca_bai_mon',
            key: 'so_ca_bai_mon',
            width: 140,
            align: 'center',
            render: (text) => parseFloat(text || 0).toFixed(1)
        },
        {
            title: 'Định mức (GV nhập)',
            dataIndex: 'dinh_muc_gv_nhap',
            key: 'dinh_muc_gv_nhap',
            width: 150,
            align: 'center',
            render: (text) => `${parseFloat(text || 0).toFixed(2)} giờ/đv`
        },
        {
            title: 'Số Tiết QĐ',
            dataIndex: 'so_tiet_qd',
            key: 'so_tiet_qd',
            width: 120,
            align: 'center',
            render: (text) => <Text strong style={{ color: '#fa8c16' }}>{parseFloat(text || 0).toFixed(2)}</Text>
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
            <Typography.Title level={5} style={{ marginBottom: 16, color: '#fa8c16' }}>
                <CarryOutOutlined style={{ marginRight: 8 }} />
                {componentTitle}
            </Typography.Title>
            <Button
                type="dashed"
                onClick={handleAddItem}
                icon={<PlusOutlined />}
                style={{ marginBottom: 16, borderColor: '#fa8c16', color: '#fa8c16' }}
            >
                Thêm Hoạt động Khảo thí
            </Button>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id_temp"
                pagination={false}
                bordered
                size="middle"
                locale={{ emptyText: `Chưa có kê khai khảo thí cho ${trinhDoDisplay.toLowerCase()}.` }}
                summary={pageData => {
                    let totalGioQuyDoi = 0;
                    pageData.forEach(({ so_tiet_qd }) => {
                        totalGioQuyDoi += parseFloat(so_tiet_qd || 0);
                    });
                    return (
                        dataSource && dataSource.length > 0 && (
                            <Table.Summary.Row style={{ background: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={4} align="right">
                                    <Text strong>Tổng giờ Khảo thí ({trinhDoDisplay}):</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                    <Text strong style={{ color: '#fa8c16' }}>{totalGioQuyDoi.toFixed(2)}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} colSpan={2}/>
                            </Table.Summary.Row>
                        )
                    );
                }}
            />

            <Modal
                title={editingItem ? `Chỉnh sửa ${componentTitle}` : `Thêm ${componentTitle}`}
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
                        name="hang_muc"
                        label="Hạng mục Khảo thí (GV tự nhập)"
                        rules={[{ required: true, message: 'Vui lòng nhập hạng mục khảo thí!' }]}
                    >
                        <Input placeholder="Ví dụ: Coi thi cuối kỳ, Chấm bài tự luận KTLT..." />
                    </Form.Item>

                    {/* Trường Phạm vi chỉ hiển thị cho Đại học */}
                    {(type === 'khaothi_dh_trongbm' || type === 'khaothi_dh_ngoaibm') && (
                         <Form.Item
                            name="pham_vi_display" // Chỉ để hiển thị, không lưu trực tiếp
                            label="Phạm vi thực hiện"
                        >
                            <Input readOnly className="ant-input-readonly-custom" />
                        </Form.Item>
                    )}


                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="so_ca_bai_mon"
                                label="Số Ca thi/Bài thi/Môn thi"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }, { type: 'number', min: 0, message: 'Số lượng không hợp lệ'}]}
                            >
                                <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Nhập số lượng" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dinh_muc_gv_nhap"
                                label="Định mức Giờ/Đơn vị (GV tự nhập)"
                                rules={[{ required: true, message: 'Vui lòng nhập định mức!' }, { type: 'number', min: 0, message: 'Định mức không hợp lệ'}]}
                            >
                                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Ví dụ: 2.5 (giờ/ca)" />
                            </Form.Item>
                        </Col>
                    </Row>

                     <Form.Item
                        label="Số tiết Quy đổi (tự động tính)"
                    >
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.so_ca_bai_mon !== currentValues.so_ca_bai_mon || prevValues.dinh_muc_gv_nhap !== currentValues.dinh_muc_gv_nhap
                            }
                        >
                            {({ getFieldValue }) => (
                                <Input
                                    readOnly
                                    value={calculateSoTietQD(getFieldValue('so_ca_bai_mon'), getFieldValue('dinh_muc_gv_nhap'))}
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
                </Form>
            </Modal>
        </div>
    );
}

export default FormKhaoThi;