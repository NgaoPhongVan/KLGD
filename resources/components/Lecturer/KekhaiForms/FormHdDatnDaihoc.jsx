import React, { useState } from "react";
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
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

function FormHdDatnDaihoc({ dataSource, setDataSource }) {
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
            quyet_dinh_dot_hk: record.quyet_dinh_dot_hk,
            so_luong_sv_cttt: record.so_luong_sv_cttt,
            so_luong_sv_dai_tra: record.so_luong_sv_dai_tra,
            tong_sv_quy_doi: record.tong_sv_quy_doi,
            tong_gio_quydoi_gv_nhap: record.tong_gio_quydoi_gv_nhap,
            ghi_chu: record.ghi_chu,
        });
        setIsModalVisible(true);
    };

    const handleDeleteItem = (indexToDelete) => {
        setDataSource((prevData) =>
            prevData.filter((_, index) => index !== indexToDelete)
        );
        message.success(`Đã xóa mục hướng dẫn ĐATN/KLTN.`);
    };

    const calculateTongSvQuyDoi = (slCTTT, slDaiTra) => {
        return parseInt(slCTTT || 0) + parseInt(slDaiTra || 0);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            const tong_sv_quy_doi_calculated = calculateTongSvQuyDoi(
                values.so_luong_sv_cttt,
                values.so_luong_sv_dai_tra
            );

            const newItem = {
                id_temp:
                    editingItem?.record.id_temp || Date.now() + Math.random(),
                id_database: editingItem?.record.id_database || null,
                ...values,
                tong_sv_quy_doi:
                    values.tong_sv_quy_doi !== undefined
                        ? values.tong_sv_quy_doi
                        : tong_sv_quy_doi_calculated,
            };

            let newData = [...dataSource];
            if (editingItem !== null && editingItem.index !== undefined) {
                newData[editingItem.index] = newItem;
                message.success(
                    "Cập nhật thông tin hướng dẫn ĐATN/KLTN thành công."
                );
            } else {
                newData.push(newItem);
                message.success(
                    "Thêm mục hướng dẫn ĐATN/KLTN vào kê khai thành công."
                );
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
        {
            title: "STT",
            key: "stt",
            width: 50,
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Quyết định/Đợt/HK",
            dataIndex: "quyet_dinh_dot_hk",
            key: "quyet_dinh_dot_hk",
            ellipsis: true,
            render: (text) => <Tooltip title={text}>{text}</Tooltip>,
        },
        {
            title: "SL SV CTTT",
            dataIndex: "so_luong_sv_cttt",
            key: "so_luong_sv_cttt",
            width: 120,
            align: "center",
            render: (text) => text || 0,
        },
        {
            title: "SL SV Đại trà",
            dataIndex: "so_luong_sv_dai_tra",
            key: "so_luong_sv_dai_tra",
            width: 120,
            align: "center",
            render: (text) => text || 0,
        },
        {
            title: "Tổng SV QĐ",
            dataIndex: "tong_sv_quy_doi",
            key: "tong_sv_quy_doi",
            width: 120,
            align: "center",
            render: (text) => parseFloat(text || 0).toFixed(1),
        },
        {
            title: "Tổng Giờ QĐ (GV nhập)",
            dataIndex: "tong_gio_quydoi_gv_nhap",
            key: "tong_gio_quydoi_gv_nhap",
            width: 150,
            align: "center",
            render: (text) => (
                <Text strong style={{ color: "#52c41a" }}>
                    {parseFloat(text || 0).toFixed(2)}
                </Text>
            ),
        },
        {
            title: "Ghi chú",
            dataIndex: "ghi_chu",
            key: "ghi_chu",
            ellipsis: true,
            render: (text) => <Tooltip title={text}>{text || "N/A"}</Tooltip>,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 100,
            align: "center",
            render: (_, record, index) => (
                <Space size="small">
                    <Tooltip title="Sửa">
                        <Button
                            icon={<EditOutlined />}
                            type="text"
                            style={{ color: "blue" }}
                            onClick={() => handleEditItem(record, index)}
                            size="small"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa mục này?"
                        onConfirm={() => handleDeleteItem(index)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                icon={<DeleteOutlined />}
                                type="text"
                                danger
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div
            style={{
                marginBottom: "20px",
                padding: "10px",
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
            }}
        >
            <Typography.Title
                level={5}
                style={{ marginBottom: 16, color: "#52c41a" }}
            >
                <UserSwitchOutlined style={{ marginRight: 8 }} />
                Hướng dẫn Đồ án/Khóa luận Tốt nghiệp (Đại học)
            </Typography.Title>
            <Button
                type="dashed"
                onClick={handleAddItem}
                icon={<PlusOutlined />}
                style={{
                    marginBottom: 16,
                    borderColor: "#52c41a",
                    color: "#52c41a",
                }}
            >
                Thêm Đợt Hướng dẫn ĐATN/KLTN
            </Button>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id_temp"
                pagination={false}
                bordered
                size="middle"
                locale={{
                    emptyText: "Chưa có kê khai hướng dẫn ĐATN/KLTN Đại học.",
                }}
                summary={(pageData) => {
                    let totalGioQuyDoi = 0;
                    pageData.forEach(({ tong_gio_quydoi_gv_nhap }) => {
                        totalGioQuyDoi += parseFloat(
                            tong_gio_quydoi_gv_nhap || 0
                        );
                    });
                    return (
                        dataSource &&
                        dataSource.length > 0 && (
                            <Table.Summary.Row
                                style={{ background: "#fafafa" }}
                            >
                                <Table.Summary.Cell
                                    index={0}
                                    colSpan={5}
                                    align="right"
                                >
                                    <Text strong>
                                        Tổng giờ Hướng dẫn ĐATN/KLTN:
                                    </Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                    <Text strong style={{ color: "#52c41a" }}>
                                        {totalGioQuyDoi.toFixed(2)}
                                    </Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} colSpan={1} />
                            </Table.Summary.Row>
                        )
                    );
                }}
            />

            <Modal
                title={
                    editingItem ? `Chỉnh sửa Hướng dẫn ĐATN/KLTN` : `Thêm Hướng dẫn ĐATN/KLTN`
                }
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
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập thông tin QĐ/Đợt/HK!",
                            },
                        ]}
                    >
                        <Input placeholder="Ví dụ: QĐ 123, Đợt 1 - HK1 2023-2024" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="so_luong_sv_cttt"
                                label="Số lượng SV Chương trình Tiên tiến"
                                initialValue={0}
                                rules={[
                                    {
                                        type: "number",
                                        min: 0,
                                        message: "Số lượng không hợp lệ",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    placeholder="Nhập SL SV CTTT"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="so_luong_sv_dai_tra"
                                label="Số lượng SV Chương trình Đại trà"
                                initialValue={0}
                                rules={[
                                    {
                                        type: "number",
                                        min: 0,
                                        message: "Số lượng không hợp lệ",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    placeholder="Nhập SL SV Đại trà"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="tong_sv_quy_doi"
                        label="Tổng số SV Quy đổi (Nếu GV tự nhập, nếu không sẽ tự tính tổng CTTT+Đại trà)"
                        rules={[
                            {
                                type: "number",
                                min: 0,
                                message: "Tổng SV QĐ không hợp lệ",
                            },
                        ]}
                    >
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.so_luong_sv_cttt !==
                                    currentValues.so_luong_sv_cttt ||
                                prevValues.so_luong_sv_dai_tra !==
                                    currentValues.so_luong_sv_dai_tra
                            }
                        >
                            {({ getFieldValue, setFieldsValue }) => {
                                const slCTTT =
                                    getFieldValue("so_luong_sv_cttt") || 0;
                                const slDaiTra =
                                    getFieldValue("so_luong_sv_dai_tra") || 0;
                                const currentTongSVQD_Form =
                                    getFieldValue("tong_sv_quy_doi");
                                const calculatedTongSVQD =
                                    calculateTongSvQuyDoi(slCTTT, slDaiTra);

                                // Chỉ tự động cập nhật nếu người dùng chưa nhập hoặc giá trị tính toán khác
                                if (
                                    currentTongSVQD_Form === undefined || currentTongSVQD_Form === "" || parseFloat(currentTongSVQD_Form) !== calculatedTongSVQD
                                ) {
                                    // Để tránh vòng lặp vô hạn, chỉ set nếu giá trị khác
                                    if (
                                        form.getFieldValue(
                                            "tong_sv_quy_doi"
                                        ) !== calculatedTongSVQD
                                    ) {
                                        // setTimeout(() => form.setFieldsValue({ tong_sv_quy_doi: calculatedTongSVQD }), 0);
                                    }
                                }
                                return (
                                    <InputNumber
                                        min={0}
                                        step={0.1}
                                        style={{ width: "100%" }}
                                        placeholder={`Gợi ý: ${calculatedTongSVQD} (Tổng CTTT và Đại trà)`}
                                    />
                                );
                            }}
                        </Form.Item>
                    </Form.Item>

                    <Form.Item
                        name="tong_gio_quydoi_gv_nhap"
                        label="Tổng Giờ Quy đổi cho Đợt này (GV tự nhập)"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tổng giờ quy đổi!",
                            },
                            {
                                type: "number",
                                min: 0,
                                message: "Giờ QĐ không hợp lệ",
                            },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            step={0.01}
                            style={{ width: "100%" }}
                            placeholder="Nhập tổng số giờ đã quy đổi"
                        />
                    </Form.Item>

                    <Form.Item name="ghi_chu" label="Ghi chú">
                        <Input.TextArea
                            rows={2}
                            placeholder="Nhập ghi chú (nếu có)"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default FormHdDatnDaihoc;
