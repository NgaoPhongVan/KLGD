import React, { useState, useEffect } from 'react';
import { 
    Modal, Form, Input, Select, Radio, Card, Space, Typography, Alert, 
    Divider, Button, Tag, List, Avatar, Tooltip, Row, Col 
} from 'antd';
import { 
    BellOutlined, UserOutlined, TeamOutlined, ClockCircleOutlined, 
    MessageOutlined, SendOutlined, ExclamationCircleOutlined,
    CheckCircleOutlined, WarningOutlined, InfoCircleOutlined, CalendarOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

const SendNotificationModal = ({ 
    open, 
    onConfirm, 
    onCancel, 
    namHocList = [], 
    isLoading = false 
}) => {
    const [form] = Form.useForm();
    const [selectedSendTo, setSelectedSendTo] = useState('all');
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        if (open) {
            form.resetFields();
            setSelectedSendTo('all');
            setPreviewMode(false);
        }
    }, [open, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onConfirm(values);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handlePreview = () => {
        form.validateFields().then(() => {
            setPreviewMode(true);
        }).catch(() => {
            setPreviewMode(false);
        });
    };

    const getRecipientInfo = (sendTo) => {
        const infoMap = {
            'all': {
                icon: <TeamOutlined className="text-blue-500" />,
                title: 'Tất cả giảng viên',
                description: 'Gửi thông báo tới tất cả giảng viên trong bộ môn',
                color: 'blue',
                count: 'Tất cả'
            },
            'pending': {
                icon: <ClockCircleOutlined className="text-orange-500" />,
                title: 'Giảng viên có kê khai chờ duyệt',
                description: 'Chỉ gửi tới những giảng viên đã nộp kê khai và đang chờ phê duyệt',
                color: 'orange',
                count: 'Chờ duyệt'
            },
            'not_submitted': {
                icon: <WarningOutlined className="text-red-500" />,
                title: 'Giảng viên chưa nộp kê khai',
                description: 'Chỉ gửi tới những giảng viên chưa nộp hoặc còn ở trạng thái nháp',
                color: 'red',
                count: 'Chưa nộp'
            }
        };
        return infoMap[sendTo] || infoMap['all'];
    };

    const predefinedMessages = [
        {
            title: 'Nhắc nhở nộp kê khai',
            message: 'Kính gửi Thầy/Cô,\n\nHệ thống nhắc nhở Thầy/Cô hoàn thành kê khai khối lượng giảng dạy cho năm học hiện tại. Vui lòng đăng nhập hệ thống và hoàn thành kê khai trong thời gian quy định.\n\nTrân trọng!'
        },
        {
            title: 'Thông báo hạn chót kê khai',
            message: 'Kính gửi Thầy/Cô,\n\nHạn chót nộp kê khai khối lượng giảng dạy sắp đến. Để đảm bảo quyền lợi và tránh ảnh hưởng đến công tác thanh toán, vui lòng hoàn thành kê khai sớm nhất có thể.\n\nTrân trọng!'
        },
        {
            title: 'Yêu cầu bổ sung thông tin',
            message: 'Kính gửi Thầy/Cô,\n\nSau khi xem xét kê khai của Thầy/Cô, chúng tôi cần bổ sung một số thông tin để hoàn thiện hồ sơ. Vui lòng đăng nhập hệ thống và cập nhật thông tin theo yêu cầu.\n\nTrân trọng!'
        }
    ];

    const currentFormValues = form.getFieldsValue();
    const recipientInfo = getRecipientInfo(selectedSendTo);

    return (
        <Modal
            title={
                <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BellOutlined className="text-white text-lg" />
                    </div>
                    <div>
                        <Title level={4} className="mb-0 text-gray-800">
                            Gửi thông báo tới giảng viên
                        </Title>
                        <Text type="secondary" className="text-sm">
                            Gửi thông báo nhắc nhở hoặc hướng dẫn tới giảng viên
                        </Text>
                    </div>
                </div>
            }
            open={open}
            onCancel={onCancel}
            width={800}
            footer={
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <Button onClick={onCancel} size="large" className="px-6">
                        Hủy bỏ
                    </Button>
                    <Space size="middle">
                        <Button 
                            onClick={handlePreview} 
                            size="large" 
                            className="px-6"
                            icon={<InfoCircleOutlined />}
                        >
                            Xem trước
                        </Button>
                        <Button 
                            type="primary" 
                            onClick={handleSubmit} 
                            loading={isLoading}
                            size="large"
                            className="px-8 bg-gradient-to-r from-blue-500 to-indigo-600 border-none shadow-lg"
                            icon={<SendOutlined />}
                        >
                            Gửi thông báo
                        </Button>
                    </Space>
                </div>
            }
            className="notification-modal"
            destroyOnClose
        >
            <div className="space-y-6">
                <Form form={form} layout="vertical" size="large">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item
                                name="nam_hoc_id"
                                label={
                                    <span className="flex items-center space-x-2">
                                        <CalendarOutlined className="text-blue-500" />
                                        <span>Năm học</span>
                                    </span>
                                }
                                rules={[{ required: true, message: 'Vui lòng chọn năm học!' }]}
                            >
                                <Select 
                                    placeholder="Chọn năm học"
                                    className="rounded-lg"
                                    size="large"
                                >
                                    {namHocList.map(nh => (
                                        <Option key={nh.id} value={nh.id}>
                                            <div className="flex items-center justify-between">
                                                <span>{nh.ten_nam_hoc}</span>
                                                {nh.la_nam_hien_hanh && (
                                                    <Tag color="green" size="small">Hiện tại</Tag>
                                                )}
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="send_to"
                                label={
                                    <span className="flex items-center space-x-2">
                                        <UserOutlined className="text-blue-500" />
                                        <span>Đối tượng nhận</span>
                                    </span>
                                }
                                rules={[{ required: true, message: 'Vui lòng chọn đối tượng nhận!' }]}
                                initialValue="all"
                            >
                                <Select 
                                    placeholder="Chọn đối tượng nhận"
                                    className="rounded-lg"
                                    onChange={setSelectedSendTo}
                                    size="large"
                                >
                                    <Option value="all">
                                        <div className="flex items-center space-x-2">
                                            <TeamOutlined className="text-blue-500" />
                                            <span>Tất cả giảng viên</span>
                                        </div>
                                    </Option>
                                    <Option value="pending">
                                        <div className="flex items-center space-x-2">
                                            <ClockCircleOutlined className="text-orange-500" />
                                            <span>Chờ phê duyệt</span>
                                        </div>
                                    </Option>
                                    <Option value="not_submitted">
                                        <div className="flex items-center space-x-2">
                                            <WarningOutlined className="text-red-500" />
                                            <span>Chưa nộp kê khai</span>
                                        </div>
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Recipient Info Card */}
                    <Card 
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-xl"
                        size="small"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                {recipientInfo.icon}
                            </div>
                            <div className="flex-1">
                                <Title level={5} className="mb-1 text-gray-800">
                                    {recipientInfo.title}
                                </Title>
                                <Text type="secondary" className="text-sm">
                                    {recipientInfo.description}
                                </Text>
                            </div>
                            <Tag color={recipientInfo.color} className="text-sm px-3 py-1">
                                {recipientInfo.count}
                            </Tag>
                        </div>
                    </Card>

                    <Form.Item
                        name="title"
                        label={
                            <span className="flex items-center space-x-2">
                                <MessageOutlined className="text-blue-500" />
                                <span>Tiêu đề thông báo</span>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề!' },
                            { max: 255, message: 'Tiêu đề không được quá 255 ký tự!' }
                        ]}
                    >
                        <Input 
                            placeholder="Nhập tiêu đề thông báo..."
                            className="rounded-lg"
                            size="large"
                        />
                    </Form.Item>

                    {/* Quick Message Templates */}
                    <div className="space-y-3">
                        <Text strong className="text-gray-700">
                            Mẫu tin nhắn nhanh:
                        </Text>
                        <div className="grid grid-cols-1 gap-2">
                            {predefinedMessages.map((template, index) => (
                                <Card 
                                    key={index}
                                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200 hover:border-blue-300"
                                    size="small"
                                    onClick={() => {
                                        form.setFieldsValue({
                                            title: template.title,
                                            message: template.message
                                        });
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <Text strong className="text-gray-700">{template.title}</Text>
                                        <Button 
                                            type="link" 
                                            size="small"
                                            className="text-blue-500 hover:text-blue-600"
                                        >
                                            Sử dụng
                                        </Button>
                                    </div>
                                    <Text type="secondary" className="text-sm line-clamp-2">
                                        {template.message.substring(0, 100)}...
                                    </Text>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <Form.Item
                        name="message"
                        label={
                            <span className="flex items-center space-x-2">
                                <MessageOutlined className="text-blue-500" />
                                <span>Nội dung thông báo</span>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Vui lòng nhập nội dung!' },
                            { max: 1000, message: 'Nội dung không được quá 1000 ký tự!' }
                        ]}
                    >
                        <TextArea 
                            rows={6}
                            placeholder="Nhập nội dung thông báo..."
                            className="rounded-lg"
                            size="large"
                            showCount
                            maxLength={1000}
                        />
                    </Form.Item>
                </Form>

                {/* Preview Mode */}
                {previewMode && currentFormValues.title && currentFormValues.message && (
                    <Card 
                        title={
                            <div className="flex items-center space-x-2">
                                <InfoCircleOutlined className="text-blue-500" />
                                <span>Xem trước thông báo</span>
                            </div>
                        }
                        className="bg-gray-50 border-gray-200 rounded-xl"
                    >
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                                        <BellOutlined className="text-white text-sm" />
                                    </div>
                                    <div>
                                        <Text strong className="text-lg text-gray-800">
                                            {currentFormValues.title}
                                        </Text>
                                        <div className="text-xs text-gray-500">
                                            Hệ thống Quản lý Khối lượng Giảng dạy
                                        </div>
                                    </div>
                                </div>
                                <div className="prose prose-sm max-w-none">
                                    <Text className="text-gray-700 whitespace-pre-wrap">
                                        {currentFormValues.message}
                                    </Text>
                                </div>
                                <Divider className="my-4" />
                                <div className="text-center text-sm text-gray-500">
                                    Trân trọng,<br />
                                    <Text strong>Đại học Thủy Lợi</Text><br />
                                    <Text type="secondary">Hệ thống Quản lý Khối lượng Giảng dạy</Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Warning Alert */}
                <Alert
                    message="Lưu ý quan trọng"
                    description="Thông báo sẽ được gửi qua email tới tất cả giảng viên thuộc đối tượng đã chọn. Vui lòng kiểm tra kỹ nội dung trước khi gửi."
                    type="info"
                    showIcon
                    className="rounded-lg"
                    icon={<ExclamationCircleOutlined />}
                />
            </div>

            <style>{`
                .notification-modal .ant-modal-content {
                    border-radius: 20px !important;
                    overflow: hidden !important;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15) !important;
                }

                .notification-modal .ant-modal-header {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                    border: none !important;
                    padding: 24px 24px 0 24px !important;
                }

                .notification-modal .ant-modal-body {
                    padding: 24px !important;
                    max-height: 70vh !important;
                    overflow-y: auto !important;
                }

                .notification-modal .ant-modal-footer {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
                    border: none !important;
                    padding: 0 24px 24px 24px !important;
                }

                .line-clamp-2 {
                    display: -webkit-box !important;
                    -webkit-line-clamp: 2 !important;
                    -webkit-box-orient: vertical !important;
                    overflow: hidden !important;
                }

                .notification-modal .ant-form-item-label > label {
                    font-weight: 600 !important;
                    font-size: 14px !important;
                }

                .notification-modal .ant-select-selector,
                .notification-modal .ant-input,
                .notification-modal .ant-input-affix-wrapper {
                    border-radius: 8px !important;
                    border-color: #e2e8f0 !important;
                }

                .notification-modal .ant-select-selector:hover,
                .notification-modal .ant-input:hover,
                .notification-modal .ant-input-affix-wrapper:hover {
                    border-color: #3b82f6 !important;
                }

                .notification-modal .ant-select-focused .ant-select-selector,
                .notification-modal .ant-input:focus,
                .notification-modal .ant-input-affix-wrapper:focus {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
                }
            `}</style>
        </Modal>
    );
};

export default SendNotificationModal;
