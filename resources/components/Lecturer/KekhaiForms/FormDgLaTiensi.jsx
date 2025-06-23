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
    Divider,
    List
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, AuditOutlined, SubnodeOutlined } from '@ant-design/icons';

const { Text, Title: AntTitle } = Typography;
const { Option } = Select;

function FormDgLaTiensi({
    dataSource, // Danh sách các đợt đánh giá LA TS đã kê khai
    setDataSource
}) {
    const [dotForm] = Form.useForm(); // Form cho thông tin chung của đợt đánh giá
    const [nhiemVuForm] = Form.useForm(); // Form riêng cho việc thêm/sửa nhiệm vụ
    
    const [editingDotDanhGia, setEditingDotDanhGia] = useState(null); // Đợt đánh giá đang được sửa/thêm { index: number, record: object }
    const [isDotModalVisible, setIsDotModalVisible] = useState(false);
    
    const [currentNhiemVuList, setCurrentNhiemVuList] = useState([]); // Nhiệm vụ của đợt đang sửa/thêm
    const [editingNhiemVu, setEditingNhiemVu] = useState(null); // Nhiệm vụ đang được sửa/thêm { index: number, record: object }
    const [isNhiemVuModalVisible, setIsNhiemVuModalVisible] = useState(false);
    // Không cần state cho selectedFile và currentMinhChung nữa

    // == XỬ LÝ CHO ĐỢT ĐÁNH GIÁ CHUNG ==
    const handleAddDotDanhGia = () => {
        setEditingDotDanhGia(null);
        setCurrentNhiemVuList([]);
        dotForm.resetFields();
        dotForm.setFieldsValue({loai_hoat_dong_ts: 'HĐ đánh giá LA'}); // Mặc định
        setIsDotModalVisible(true);
    };

    const handleEditDotDanhGia = (record, index) => {
        setEditingDotDanhGia({ index, record });
        setCurrentNhiemVuList(record.nhiem_vu_ts_arr || []);
        dotForm.setFieldsValue({
            loai_hoat_dong_ts: record.loai_hoat_dong_ts,
            hoi_dong_dot_hk: record.hoi_dong_dot_hk,
            ten_ncs_hoac_ten_cd: record.ten_ncs_hoac_ten_cd,
            ten_luan_an: record.ten_luan_an, // Nếu có trường này trong record.data
            ghi_chu: record.ghi_chu, // Ghi chú cho cả đợt
        });
        setIsDotModalVisible(true);
    };

    const handleDeleteDotDanhGia = (indexToDelete) => {
        setDataSource(prevData => prevData.filter((_, index) => index !== indexToDelete));
        message.success(`Đã xóa đợt đánh giá Luận án Tiến sĩ.`);
    };

    const calculateTongGioChoDot = (nhiemVuArray) => {
        return nhiemVuArray.reduce((sum, nv) => sum + parseFloat(nv.so_tiet_gv_nhap || 0), 0);
    };

    const handleDotModalOk = async () => {
        try {
            const values = await dotForm.validateFields();
            
            if (currentNhiemVuList.length === 0) {
                message.warn("Vui lòng thêm ít nhất một nhiệm vụ cho đợt đánh giá này.");
                return;
            }

            const tongGioQuyDoiDot = calculateTongGioChoDot(currentNhiemVuList);

            const newItem = {
                id_temp: editingDotDanhGia?.record.id_temp || Date.now() + Math.random(),
                id_database: editingDotDanhGia?.record.id_database || null,
                ...values, // Bao gồm loai_hoat_dong_ts, hoi_dong_dot_hk, ten_ncs_hoac_ten_cd, ten_luan_an, ghi_chu
                nhiem_vu_ts_arr: currentNhiemVuList.map(nv => ({ // Chỉ lưu các trường cần thiết của nhiệm vụ
                    ten_nhiem_vu: nv.ten_nhiem_vu,
                    so_tiet_gv_nhap: nv.so_tiet_gv_nhap,
                    ghi_chu_nhiem_vu: nv.ghi_chu_nhiem_vu, // Đổi tên để phân biệt với ghi chú của đợt
                    id_database_chi_tiet: nv.id_database_chi_tiet || null
                })),
                tong_gio_quydoi_cho_dot: tongGioQuyDoiDot.toFixed(2),
            };

            let newData = [...dataSource];
            if (editingDotDanhGia !== null && editingDotDanhGia.index !== undefined) {
                newData[editingDotDanhGia.index] = newItem;
                message.success("Cập nhật thông tin đợt đánh giá LA TS thành công.");
            } else {
                newData.push(newItem);
                message.success("Thêm đợt đánh giá LA TS vào kê khai thành công.");
            }
            setDataSource(newData);
            setIsDotModalVisible(false);
            dotForm.resetFields();
            setEditingDotDanhGia(null);
            setCurrentNhiemVuList([]);
        } catch (errorInfo) {
            console.log('Validate Failed:', errorInfo);
            message.error("Vui lòng kiểm tra lại thông tin chung của đợt đánh giá.");
        }
    };

    const handleDotModalCancel = () => {
        setIsDotModalVisible(false);
        dotForm.resetFields();
        setEditingDotDanhGia(null);
        setCurrentNhiemVuList([]);
    };

    // == XỬ LÝ CHO TỪNG NHIỆM VỤ TRONG ĐỢT ĐÁNH GIÁ ==
    const handleAddNhiemVu = () => {
        setEditingNhiemVu(null);
        nhiemVuForm.resetFields();
        setIsNhiemVuModalVisible(true);
    };

    const handleEditNhiemVu = (nhiemVuRecord, index) => {
        setEditingNhiemVu({ index, record: nhiemVuRecord });
        nhiemVuForm.setFieldsValue({
            ten_nhiem_vu: nhiemVuRecord.ten_nhiem_vu,
            so_tiet_gv_nhap: nhiemVuRecord.so_tiet_gv_nhap,
            ghi_chu_nhiem_vu: nhiemVuRecord.ghi_chu_nhiem_vu,
        });
        setIsNhiemVuModalVisible(true);
    };

    const handleDeleteNhiemVu = (indexToDelete) => {
        setCurrentNhiemVuList(prevList => prevList.filter((_, index) => index !== indexToDelete));
    };

    const handleNhiemVuModalOk = async () => {
        try {
            const values = await nhiemVuForm.validateFields();
            const newNhiemVu = {
                id_temp_nv: editingNhiemVu?.record.id_temp_nv || Date.now() + Math.random() + '_nv',
                id_database_chi_tiet: editingNhiemVu?.record.id_database_chi_tiet || null,
                ...values, // ten_nhiem_vu, so_tiet_gv_nhap, ghi_chu_nhiem_vu
            };

            let newNhiemVuList = [...currentNhiemVuList];
            if (editingNhiemVu !== null && editingNhiemVu.index !== undefined) {
                newNhiemVuList[editingNhiemVu.index] = newNhiemVu;
            } else {
                newNhiemVuList.push(newNhiemVu);
            }
            setCurrentNhiemVuList(newNhiemVuList);
            setIsNhiemVuModalVisible(false);
            nhiemVuForm.resetFields();
            setEditingNhiemVu(null);
        } catch (errorInfo) {
            console.log('Validate NhiemVu Failed:', errorInfo);
        }
    };


    const columns = [
        { title: 'STT', key: 'stt', width: 50, align: 'center', render: (_, __, index) => index + 1 },
        { title: 'Loại HĐ TS', dataIndex: 'loai_hoat_dong_ts', key: 'loai_hoat_dong_ts', width: 150, render: (text) => <Tag color="purple">{text}</Tag> },
        { title: 'Hội đồng/Đợt/HK', dataIndex: 'hoi_dong_dot_hk', key: 'hoi_dong_dot_hk', ellipsis: true, render: (text) => <Tooltip title={text}>{text}</Tooltip> },
        { title: 'Tên NCS/Chuyên đề', dataIndex: 'ten_ncs_hoac_ten_cd', key: 'ten_ncs_hoac_ten_cd', ellipsis: true },
        { title: 'Tên Luận án', dataIndex: 'ten_luan_an', key: 'ten_luan_an', ellipsis: true },
        {
            title: 'Số Nhiệm vụ', key: 'so_nhiem_vu', width: 120, align: 'center',
            render: (_, record) => record.nhiem_vu_ts_arr?.length || 0
        },
        {
            title: 'Tổng Giờ QĐ (GV nhập)', dataIndex: 'tong_gio_quydoi_cho_dot', key: 'tong_gio_quydoi_cho_dot', width: 160, align: 'center',
            render: (text) => <Text strong style={{ color: '#722ed1' }}>{parseFloat(text || 0).toFixed(2)}</Text>
        },
        { title: 'Ghi chú đợt', dataIndex: 'ghi_chu', key: 'ghi_chu', ellipsis: true, render: (text) => <Tooltip title={text}>{text || 'N/A'}</Tooltip> },
        {
            title: 'Thao tác', key: 'action', width: 100, align: 'center',
            render: (_, record, index) => (
                <Space size="small">
                    <Tooltip title="Sửa"><Button icon={<EditOutlined />} type="text" style={{ color: 'blue' }} onClick={() => handleEditDotDanhGia(record, index)} size="small" /></Tooltip>
                    <Popconfirm title="Xóa đợt đánh giá này?" onConfirm={() => handleDeleteDotDanhGia(index)} okText="Xóa" cancelText="Hủy">
                        <Tooltip title="Xóa"><Button icon={<DeleteOutlined />} type="text" danger size="small" /></Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            <Typography.Title level={5} style={{ marginBottom: 16, color: '#722ed1' }}>
                <AuditOutlined style={{ marginRight: 8 }} />
                Đánh giá Luận án Tiến sĩ & Hướng dẫn Chuyên đề
            </Typography.Title>
            <Button
                type="dashed"
                onClick={handleAddDotDanhGia}
                icon={<PlusOutlined />}
                style={{ marginBottom: 16, borderColor: '#722ed1', color: '#722ed1' }}
            >
                Thêm Đợt Đánh giá/HD CĐ TS
            </Button>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="id_temp"
                pagination={false}
                bordered
                size="middle"
                locale={{ emptyText: 'Chưa có kê khai đánh giá Luận án Tiến sĩ.' }}
                summary={pageData => {
                    let totalGioQuyDoi = 0;
                    pageData.forEach(({ tong_gio_quydoi_cho_dot }) => {
                        totalGioQuyDoi += parseFloat(tong_gio_quydoi_cho_dot || 0);
                    });
                    return (
                        dataSource && dataSource.length > 0 && (
                            <Table.Summary.Row style={{ background: '#fafafa' }}>
                                <Table.Summary.Cell index={0} colSpan={6} align="right">
                                    <Text strong>Tổng giờ Đánh giá LA TS & HD CĐ:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                    <Text strong style={{ color: '#722ed1' }}>{totalGioQuyDoi.toFixed(2)}</Text>
                                </Table.Summary.Cell>
                                 <Table.Summary.Cell index={2} colSpan={2}/>
                            </Table.Summary.Row>
                        )
                    );
                }}
            />

            {/* Modal cho thông tin chung của Đợt Đánh giá LA TS */}
            <Modal
                title={editingDotDanhGia ? `Chỉnh sửa Đợt Đánh giá/HD CĐ TS` : `Thêm Đợt Đánh giá/HD CĐ TS`}
                open={isDotModalVisible}
                onOk={handleDotModalOk}
                onCancel={handleDotModalCancel}
                okText={editingDotDanhGia ? "Cập nhật Đợt" : "Lưu Đợt"}
                cancelText="Hủy"
                width={900}
                destroyOnClose
            >
                <Form form={dotForm} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="loai_hoat_dong_ts"
                                label="Loại Hoạt động Tiến sĩ"
                                rules={[{ required: true, message: 'Vui lòng chọn loại hoạt động!' }]}
                                initialValue="HĐ đánh giá LA"
                            >
                                <Select placeholder="Chọn loại hoạt động">
                                    <Option value="Tiểu ban">Tham gia Tiểu ban</Option>
                                    <Option value="HĐ đánh giá LA">Tham gia Hội đồng đánh giá LA</Option>
                                    <Option value="Hướng dẫn CĐ">Hướng dẫn Chuyên đề TS</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="hoi_dong_dot_hk" label="Tên Hội đồng/Đợt/Học kỳ" rules={[{ required: true, message: 'Không được để trống!' }]}>
                                <Input placeholder="Ví dụ: Hội đồng NCS A, HK1 2024-2025" />
                            </Form.Item>
                        </Col>
                    </Row>
                     <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="ten_ncs_hoac_ten_cd" label="Tên Nghiên cứu sinh / Tên Chuyên đề" rules={[{ required: true, message: 'Không được để trống!' }]}>
                                <Input placeholder="Nhập tên NCS hoặc tên chuyên đề" />
                            </Form.Item>
                        </Col>
                         <Col span={12}>
                            <Form.Item name="ten_luan_an" label="Tên Luận án (nếu có)">
                                <Input placeholder="Nhập tên đầy đủ của luận án" />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Divider orientation="left"><SubnodeOutlined /> Các Nhiệm vụ Tham gia</Divider>
                    <Button type="dashed" onClick={handleAddNhiemVu} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                        Thêm Nhiệm vụ
                    </Button>
                    <List
                        bordered
                        dataSource={currentNhiemVuList}
                        locale={{ emptyText: 'Chưa có nhiệm vụ nào được thêm.'}}
                        renderItem={(item, index) => (
                            <List.Item
                                actions={[
                                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEditNhiemVu(item, index)} size="small">Sửa</Button>,
                                    <Popconfirm title="Xóa nhiệm vụ này?" onConfirm={() => handleDeleteNhiemVu(index)}>
                                        <Button type="link" danger icon={<DeleteOutlined />} size="small">Xóa</Button>
                                    </Popconfirm>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Tag color="purple">{index + 1}</Tag>}
                                    title={<Text strong>{item.ten_nhiem_vu || "N/A"}</Text>}
                                    description={
                                        <Space>
                                            <Text>SL: {item.so_luong_thuc_hien_ts_nv || 0}</Text>
                                            <Text>Giờ QĐ (GV nhập): {parseFloat(item.so_tiet_gv_nhap || 0).toFixed(2)}</Text>
                                        </Space>
                                    }
                                />
                                {item.ghi_chu_nhiem_vu && <Text type="secondary" style={{fontSize: '12px', display: 'block', marginTop: 4}}>Ghi chú NV: {item.ghi_chu_nhiem_vu}</Text>}
                            </List.Item>
                        )}
                    />
                     <div style={{textAlign: 'right', marginTop: '10px'}}>
                        <Text strong>Tổng giờ QĐ cho đợt này (từ các nhiệm vụ): {calculateTongGioChoDot(currentNhiemVuList).toFixed(2)}</Text>
                    </div>

                    <Form.Item name="ghi_chu" label="Ghi chú chung cho Đợt đánh giá này" style={{marginTop: '20px'}}>
                        <Input.TextArea rows={2} placeholder="Nhập ghi chú chung (nếu có)" />
                    </Form.Item>
                     {/* Không có Upload minh chứng */}
                </Form>
            </Modal>

            {/* Modal cho thêm/sửa Nhiệm vụ chi tiết */}
            <Modal
                title={editingNhiemVu ? `Chỉnh sửa Nhiệm vụ TS` : `Thêm Nhiệm vụ TS`}
                open={isNhiemVuModalVisible}
                onOk={handleNhiemVuModalOk}
                onCancel={() => { setIsNhiemVuModalVisible(false); nhiemVuForm.resetFields(); setEditingNhiemVu(null);}}
                okText={editingNhiemVu ? "Cập nhật Nhiệm vụ" : "Thêm Nhiệm vụ"}
                cancelText="Hủy"
                destroyOnClose
            >
                <Form form={nhiemVuForm} layout="vertical">
                    <Form.Item
                        name="ten_nhiem_vu"
                        label="Tên Nhiệm vụ/Vai trò (GV tự nhập)"
                        rules={[{ required: true, message: 'Vui lòng nhập tên nhiệm vụ!' }]}
                    >
                       <Input placeholder="Ví dụ: Phản biện 1 Tiểu ban, Chủ tịch Hội đồng..." />
                    </Form.Item>
                     <Form.Item
                        name="so_luong_thuc_hien_ts_nv" // Giảng viên tự nhập số lượng cho nhiệm vụ này (thường là 1)
                        label="Số lượng (thường là 1 cho mỗi nhiệm vụ cụ thể)"
                        initialValue={1}
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }, {type: 'number', min: 1}]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                     <Form.Item
                        name="so_tiet_gv_nhap" // Giảng viên tự nhập số tiết quy đổi cho nhiệm vụ này
                        label="Số tiết/giờ Quy đổi cho Nhiệm vụ này (GV tự nhập)"
                        rules={[{ required: true, message: 'Vui lòng nhập số tiết/giờ!' }, {type: 'number', min: 0}]}
                    >
                        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="Số giờ QĐ theo quy định" />
                    </Form.Item>
                    <Form.Item name="ghi_chu_nhiem_vu" label="Ghi chú cho Nhiệm vụ này">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default FormDgLaTiensi;