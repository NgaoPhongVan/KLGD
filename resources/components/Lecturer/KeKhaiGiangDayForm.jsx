import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Card,
    Button,
    Select,
    Typography,
    Space,
    Divider,
    Form,
    message,
    Spin,
    Tabs,
    Alert,
    Row,
    Col,
    Tag,
} from "antd";
import {
    SaveOutlined,
    CalendarOutlined,
    BookOutlined,
    SolutionOutlined, // Giảng dạy lớp
    UserSwitchOutlined, // Hướng dẫn
    AuditOutlined, // Đánh giá/Hội đồng
    CarryOutOutlined, // Khảo thí
    BuildOutlined, // XDCTĐT & Hoạt động GD khác
    ExperimentOutlined, // NCKH
    TeamOutlined, // Công tác khác (GVCN, Olympic...)
    StopOutlined,
} from "@ant-design/icons";

// Import các component form con chuyên biệt
import FormGdLop from "./KekhaiForms/FormGdLop";
import FormHdDatnDaihoc from "./KekhaiForms/FormHdDatnDaihoc";
import FormHdLvThacsi from "./KekhaiForms/FormHdLvThacsi";
import FormHdLaTiensi from "./KekhaiForms/FormHdLaTiensi";
import FormDgHpTnDaihoc from "./KekhaiForms/FormDgHpTnDaihoc";
import FormDgLvThacsi from "./KekhaiForms/FormDgLvThacsi";
import FormDgLaTiensi from "./KekhaiForms/FormDgLaTiensi";
import FormKhaoThi from "./KekhaiForms/FormKhaoThi";
import FormXdCtdtVaKhacGd from "./KekhaiForms/FormXdCtdtVaKhacGd";
import FormNckh from "./KekhaiForms/FormNckh";
import FormCongTacKhac from "./KekhaiForms/FormCongTacKhac";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

function KeKhaiGiangDayForm() {
    const [form] = Form.useForm();
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmittingOfficial, setIsSubmittingOfficial] = useState(false);
    const [error, setError] = useState(null);

    const [namHocList, setNamHocList] = useState([]);
    const [selectedNamHocId, setSelectedNamHocId] = useState(null);
    const [currentKeKhaiTongHop, setCurrentKeKhaiTongHop] = useState(null);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [keKhaiThoiGian, setKeKhaiThoiGian] = useState(null);

    // State cho từng bảng kê khai chi tiết (mỗi mảng lưu các item của bảng đó)
    const [gdLopDhTrongBmList, setGdLopDhTrongBmList] = useState([]);
    const [gdLopDhNgoaiBmList, setGdLopDhNgoaiBmList] = useState([]);
    const [gdLopDhNgoaiCsList, setGdLopDhNgoaiCsList] = useState([]);
    const [gdLopThsList, setGdLopThsList] = useState([]);
    const [gdLopTsList, setGdLopTsList] = useState([]);

    const [hdDatnDhList, setHdDatnDhList] = useState([]);
    const [hdLvThsList, setHdLvThsList] = useState([]);
    const [hdLaTsList, setHdLaTsList] = useState([]);

    const [dgHpTnDhList, setDgHpTnDhList] = useState([]);
    const [dgLvThsList, setDgLvThsList] = useState([]);
    const [dgLaTsDotList, setDgLaTsDotList] = useState([]);

    const [khaoThiDhTrongBmList, setKhaoThiDhTrongBmList] = useState([]);
    const [khaoThiDhNgoaiBmList, setKhaoThiDhNgoaiBmList] = useState([]);
    const [khaoThiThsList, setKhaoThiThsList] = useState([]);
    const [khaoThiTsList, setKhaoThiTsList] = useState([]);

    const [xdCtdtVaKhacGdList, setXdCtdtVaKhacGdList] = useState([]);
    const [nckhList, setNckhList] = useState([]);
    const [congTacKhacList, setCongTacKhacList] = useState([]);

    const [dmHeSoChung, setDmHeSoChung] = useState([]);

    const formatDisplayValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return <EmptyValueDisplay />;
        }
        if (typeof value === "number") {
            return value.toLocaleString();
        }
        return value;
    };

    const EmptyValueDisplay = () => (
        <span className="empty-value-elegant text-gray-400 italic">--</span>
    );

    const renderTableCell = (value, record, dataIndex) => {
        if (value === null || value === undefined || value === "") {
            return <EmptyValueDisplay />;
        }
        if (typeof value === "number") {
            return (
                <span className="font-medium">{value.toLocaleString()}</span>
            );
        }
        return value;
    };

    const renderNotes = (notes) => {
        if (!notes || notes.trim() === "") {
            return <EmptyValueDisplay />;
        }
        return (
            <div className="max-w-xs">
                <Text
                    className="text-sm text-gray-600"
                    ellipsis={{ tooltip: notes }}
                >
                    {notes}
                </Text>
            </div>
        );
    };

    const renderFileAttachment = (record) => {
        const hasExistingFile = record.minh_chung_existing;
        const hasNewFile = record.minh_chung_file instanceof File;

        if (!hasExistingFile && !hasNewFile) {
            return <EmptyValueDisplay />;
        }

        return (
            <div className="flex flex-col space-y-1">
                {hasExistingFile && (
                    <a
                        href={record.minh_chung_existing_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                        📎 File hiện tại
                    </a>
                )}
                {hasNewFile && (
                    <span className="text-green-600 text-xs">
                        📄 {record.minh_chung_file.name}
                    </span>
                )}
            </div>
        );
    };

    const resetAllDetailLists = () => {
        setGdLopDhTrongBmList([]);
        setGdLopDhNgoaiBmList([]);
        setGdLopDhNgoaiCsList([]);
        setGdLopThsList([]);
        setGdLopTsList([]);
        setHdDatnDhList([]);
        setHdLvThsList([]);
        setHdLaTsList([]);
        setDgHpTnDhList([]);
        setDgLvThsList([]);
        setDgLaTsDotList([]);
        setKhaoThiDhTrongBmList([]);
        setKhaoThiDhNgoaiBmList([]);
        setKhaoThiThsList([]);
        setKhaoThiTsList([]);
        setXdCtdtVaKhacGdList([]);
        setNckhList([]);
        setCongTacKhacList([]);
    };

    const fetchKeKhaiThoiGian = useCallback(async (namHocIdForFetch) => {
        if (!namHocIdForFetch) {
            setKeKhaiThoiGian(null);
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(
                `/api/lecturer/ke-khai-thoi-gian?nam_hoc_id=${namHocIdForFetch}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data) {
                if (
                    response.data.data &&
                    Array.isArray(response.data.data) &&
                    response.data.data.length > 0
                ) {
                    setKeKhaiThoiGian(response.data.data[0]);
                } else if (
                    response.data.thoi_gian_bat_dau &&
                    response.data.thoi_gian_ket_thuc
                ) {
                    setKeKhaiThoiGian(response.data);
                } else if (
                    Array.isArray(response.data) &&
                    response.data.length > 0
                ) {
                    setKeKhaiThoiGian(response.data[0]);
                } else {
                    setKeKhaiThoiGian(null);
                }
            } else {
                setKeKhaiThoiGian(null);
            }
        } catch (err) {
            console.error("Lỗi tải thời gian kê khai:", err);
            setKeKhaiThoiGian(null);
        }
    }, []);

    const fetchDataForSelectedNamHoc = useCallback(
        async (namHocIdForFetch) => {
            if (!namHocIdForFetch) {
                setCurrentKeKhaiTongHop(null);
                resetAllDetailLists();
                setKeKhaiThoiGian(null);
                return;
            }
            setIsLoadingData(true);
            setError(null);
            const token = localStorage.getItem("token");
            try {
                await fetchKeKhaiThoiGian(namHocIdForFetch);

                const keKhaiTongHopRes = await axios.post(
                    "/api/lecturer/ke-khai-tong-hop-nam-hoc/start",
                    { nam_hoc_id: namHocIdForFetch },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const newKeKhaiTongHop =
                    keKhaiTongHopRes.data.ke_khai_tong_hop_nam_hoc;
                setCurrentKeKhaiTongHop(newKeKhaiTongHop);

                if (newKeKhaiTongHop && newKeKhaiTongHop.id) {
                    const chiTietRes = await axios.get(
                        `/api/lecturer/kekhai-chi-tiet?ke_khai_tong_hop_nam_hoc_id=${newKeKhaiTongHop.id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    const { all_kekhai_details } = chiTietRes.data;
                    resetAllDetailLists();
                    if (
                        all_kekhai_details &&
                        Array.isArray(all_kekhai_details)
                    ) {
                        const typeToListSetterMap = {
                            gd_lop_dh_trongbm: setGdLopDhTrongBmList,
                            gd_lop_dh_ngoaibm: setGdLopDhNgoaiBmList,
                            gd_lop_dh_ngoaics: setGdLopDhNgoaiCsList,
                            gd_lop_ths: setGdLopThsList,
                            gd_lop_ts: setGdLopTsList,
                            hd_datn_daihoc: setHdDatnDhList,
                            hd_lv_thacsi: setHdLvThsList,
                            hd_la_tiensi: setHdLaTsList,
                            dg_hp_tn_daihoc: setDgHpTnDhList,
                            dg_lv_thacsi: setDgLvThsList,
                            dg_la_tiensi: setDgLaTsDotList,
                            khaothi_dh_trongbm: setKhaoThiDhTrongBmList,
                            khaothi_dh_ngoaibm: setKhaoThiDhNgoaiBmList,
                            khaothi_ths: setKhaoThiThsList,
                            khaothi_ts: setKhaoThiTsList,
                            xd_ctdt_va_khac_gd: setXdCtdtVaKhacGdList,
                            nckh: setNckhList,
                            congtac_khac: setCongTacKhacList,
                        };

                        // Phân loại dữ liệu từ API vào các state list tương ứng
                        const groupedDetails = {};
                        all_kekhai_details.forEach((item) => {
                            if (!groupedDetails[item.type]) {
                                groupedDetails[item.type] = [];
                            }
                            // Chuyển data từ item.data vào cấp ngoài cùng cho dễ dùng ở form con
                            groupedDetails[item.type].push({
                                ...item.data, // Lấy các trường từ data
                                id_temp: item.id_database || Date.now() + Math.random(),
                                id_database: item.id_database,
                                minh_chung_existing: item.minh_chung_existing,
                                minh_chung_existing_path: item.minh_chung_existing_path,
                                ...(item.type === "dg_la_tiensi" && {
                                    nhiem_vu_ts_arr: item.nhiem_vu_ts_arr || [],
                                }),
                            });
                        });

                        for (const type in typeToListSetterMap) {
                            if (groupedDetails[type]) {
                                typeToListSetterMap[type](groupedDetails[type]);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu chi tiết:", err);
                message.error(
                    err.response?.data?.message || "Lỗi tải dữ liệu chi tiết."
                );
                setError(
                    err.response?.data?.message || "Lỗi tải dữ liệu chi tiết."
                );
                setCurrentKeKhaiTongHop(null);
                setKeKhaiThoiGian(null);
            } finally {
                setIsLoadingData(false);
            }
        },
        [fetchKeKhaiThoiGian]
    );

    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchInitialData = async () => {
            setIsLoadingInitial(true);
            try {
                const profileRes = await axios.get("/api/lecturer/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCurrentUserProfile(profileRes.data);

                const namHocRes = await axios.get("/api/lecturer/nam-hoc", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const nhs = namHocRes.data || [];
                setNamHocList(nhs);
                const currentActiveNamHoc = nhs.find(
                    (nh) => nh.la_nam_hien_hanh === 1
                );
                if (currentActiveNamHoc) {
                    setSelectedNamHocId(currentActiveNamHoc.id.toString());
                    await fetchDataForSelectedNamHoc(
                        currentActiveNamHoc.id.toString()
                    );
                }

                const dmHSCRes = await axios.get(
                    "/api/lecturer/dm-he-so-chung",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setDmHeSoChung(dmHSCRes.data.data || []);

                setError(null);
            } catch (error) {
                message.error("Không thể tải dữ liệu ban đầu.");
                setError("Lỗi tải dữ liệu ban đầu.");
            } finally {
                setIsLoadingInitial(false);
            }
        };
        fetchInitialData();
    }, [fetchDataForSelectedNamHoc]);

    useEffect(() => {
        if (selectedNamHocId && !isLoadingInitial) {
            fetchDataForSelectedNamHoc(selectedNamHocId);
        } else if (!selectedNamHocId) {
            setCurrentKeKhaiTongHop(null);
            resetAllDetailLists();
            setKeKhaiThoiGian(null);
        }
    }, [selectedNamHocId, fetchDataForSelectedNamHoc, isLoadingInitial]);

    const handleSelectNamHocAndFetch = () => {
        if (selectedNamHocId) {
            fetchDataForSelectedNamHoc(selectedNamHocId);
        } else {
            message.info("Vui lòng chọn một năm học.");
        }
    };

    const handleSaveAll = async () => {
        if (!currentKeKhaiTongHop || !currentKeKhaiTongHop.id) {
            message.error(
                "Vui lòng chọn năm học và bắt đầu kê khai trước khi lưu."
            );
            return;
        }
        setIsSubmitting(true);
        setError(null);
        const currentToken = localStorage.getItem("token");
        try {
            const payloads = [];
            const keKhaiTongHopIdToSave = currentKeKhaiTongHop.id;

            const prepareItemData = (item, type) => {
                const {
                    id_temp,
                    id_database,
                    minh_chung_file,
                    minh_chung_existing,
                    minh_chung_existing_path,
                    // Các trường chỉ dùng ở frontend mà không có trong model DB
                    ten_hoat_dong,
                    don_vi_tinh,
                    dinh_muc_gio_tren_don_vi,
                    ...dataToSubmit // Dữ liệu của model
                } = item;

                return {
                    type: type,
                    data: dataToSubmit,
                    minh_chung_file:
                        minh_chung_file instanceof File
                            ? minh_chung_file
                            : null,
                    id_database: id_database,
                };
            };

            // Thu thập dữ liệu từ tất cả các state list
            gdLopDhTrongBmList.forEach((item) =>
                payloads.push(prepareItemData(item, "gd_lop_dh_trongbm"))
            );
            gdLopDhNgoaiBmList.forEach((item) =>
                payloads.push(prepareItemData(item, "gd_lop_dh_ngoaibm"))
            );
            gdLopDhNgoaiCsList.forEach((item) =>
                payloads.push(prepareItemData(item, "gd_lop_dh_ngoaics"))
            );
            gdLopThsList.forEach((item) =>
                payloads.push(prepareItemData(item, "gd_lop_ths"))
            );
            gdLopTsList.forEach((item) =>
                payloads.push(prepareItemData(item, "gd_lop_ts"))
            );

            hdDatnDhList.forEach((item) =>
                payloads.push(prepareItemData(item, "hd_datn_daihoc"))
            );
            hdLvThsList.forEach((item) =>
                payloads.push(prepareItemData(item, "hd_lv_thacsi"))
            );
            hdLaTsList.forEach((item) =>
                payloads.push(prepareItemData(item, "hd_la_tiensi"))
            );

            dgHpTnDhList.forEach((item) =>
                payloads.push(prepareItemData(item, "dg_hp_tn_daihoc"))
            );
            dgLvThsList.forEach((item) =>
                payloads.push(prepareItemData(item, "dg_lv_thacsi"))
            );
            dgLaTsDotList.forEach((item) =>
                payloads.push(prepareItemData(item, "dg_la_tiensi"))
            );

            khaoThiDhTrongBmList.forEach((item) =>
                payloads.push(prepareItemData(item, "khaothi_dh_trongbm"))
            );
            khaoThiDhNgoaiBmList.forEach((item) =>
                payloads.push(prepareItemData(item, "khaothi_dh_ngoaibm"))
            );
            khaoThiThsList.forEach((item) =>
                payloads.push(prepareItemData(item, "khaothi_ths"))
            );
            khaoThiTsList.forEach((item) =>
                payloads.push(prepareItemData(item, "khaothi_ts"))
            );

            xdCtdtVaKhacGdList.forEach((item) =>
                payloads.push(prepareItemData(item, "xd_ctdt_va_khac_gd"))
            );
            nckhList.forEach((item) =>
                payloads.push(prepareItemData(item, "nckh"))
            );
            congTacKhacList.forEach((item) =>
                payloads.push(prepareItemData(item, "congtac_khac"))
            );

            const formData = new FormData();
            formData.append(
                "ke_khai_tong_hop_nam_hoc_id",
                keKhaiTongHopIdToSave
            );
            const itemsForJson = payloads.map((p) => ({
                type: p.type,
                data: p.data,
                id_database: p.id_database,
            }));
            formData.append("ke_khai_items_json", JSON.stringify(itemsForJson));

            payloads.forEach((payload, index) => {
                if (payload.minh_chung_file) {
                    // Chỉ gửi file mới
                    formData.append(
                        `ke_khai_items_files[${index}]`,
                        payload.minh_chung_file,
                        payload.minh_chung_file.name
                    );
                }
            });

            const response = await axios.post(
                "/api/lecturer/kekhai-chi-tiet/batch-save",
                formData,
                {
                    headers: { Authorization: `Bearer ${currentToken}` },
                }
            );
            message.success(
                response.data.message || "Lưu toàn bộ kê khai thành công!"
            );
            if (response.data.ke_khai_tong_hop_nam_hoc) {
                setCurrentKeKhaiTongHop(response.data.ke_khai_tong_hop_nam_hoc);
                fetchDataForSelectedNamHoc(selectedNamHocId);
            }
        } catch (err) {
            showNotification(
                "error",
                err.response?.data?.message || "Có lỗi xảy ra khi lưu kê khai",
                "Lỗi lưu dữ liệu"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitOfficial = async () => {
        if (!currentKeKhaiTongHop || !currentKeKhaiTongHop.id) {
            message.error(
                "Vui lòng chọn năm học và bắt đầu kê khai trước khi nộp."
            );
            return;
        }

        // Kiểm tra xem có dữ liệu nào không
        const hasAnyData =
            [
                ...gdLopDhTrongBmList,
                ...gdLopDhNgoaiBmList,
                ...gdLopDhNgoaiCsList,
                ...gdLopThsList,
                ...gdLopTsList,
                ...hdDatnDhList,
                ...hdLvThsList,
                ...hdLaTsList,
                ...dgHpTnDhList,
                ...dgLvThsList,
                ...dgLaTsDotList,
                ...khaoThiDhTrongBmList,
                ...khaoThiDhNgoaiBmList,
                ...khaoThiThsList,
                ...khaoThiTsList,
                ...xdCtdtVaKhacGdList,
                ...nckhList,
                ...congTacKhacList,
            ].length > 0;

        if (!hasAnyData) {
            message.warning(
                "Vui lòng thêm ít nhất một mục kê khai trước khi nộp chính thức."
            );
            return;
        }

        setIsSubmittingOfficial(true);
        setError(null);
        const currentToken = localStorage.getItem("token");

        try {
            const response = await axios.post(
                `/api/lecturer/ke-khai-tong-hop-nam-hoc/${currentKeKhaiTongHop.id}/submit`,
                {},
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );

            showNotification(
                "success",
                response.data.message || "Nộp kê khai thành công!",
                "Nộp kê khai thành công"
            );

            if (response.data.data) {
                setCurrentKeKhaiTongHop(response.data.data);
            }
            fetchDataForSelectedNamHoc(selectedNamHocId);
        } catch (err) {
            showNotification(
                "error",
                err.response?.data?.message || "Có lỗi xảy ra khi nộp kê khai",
                "Lỗi nộp kê khai"
            );
        } finally {
            setIsSubmittingOfficial(false);
        }
    };

    const handleCancelCurrentDeclare = () => {
        setSelectedNamHocId(null);
        setCurrentKeKhaiTongHop(null);
        resetAllDetailLists();
        message.info("Đã hủy kê khai cho năm học hiện tại và reset form.");
    };

    const [notification, setNotification] = useState({
        show: false,
        type: "",
        message: "",
        title: "",
    });

    const showNotification = (type, message, title = "") => {
        const notificationConfig = {
            success: {
                title: title || "Thành công!",
                bgGradient: "from-emerald-500 via-green-500 to-teal-500",
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600",
                icon: "M5 13l4 4L19 7",
            },
            error: {
                title: title || "Có lỗi xảy ra!",
                bgGradient: "from-red-500 via-rose-500 to-pink-500",
                iconBg: "bg-red-100",
                iconColor: "text-red-600",
                icon: "M6 18L18 6M6 6l12 12",
            },
            warning: {
                title: title || "Cảnh báo!",
                bgGradient: "from-amber-500 via-yellow-500 to-orange-500",
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
                icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z",
            },
            info: {
                title: title || "Thông tin",
                bgGradient: "from-blue-500 via-indigo-500 to-purple-500",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
                icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            },
        };

        setNotification({
            show: true,
            type,
            message,
            title,
            config: notificationConfig[type] || notificationConfig.info,
        });

        setTimeout(() => {
            setNotification((prev) => ({ ...prev, show: false }));
        }, 4000);
    };

    const dismissNotification = () => {
        setNotification((prev) => ({ ...prev, show: false }));
    };

    const renderNotification = () => {
        if (!notification.show) return null;

        return (
            <div className="fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out">
                <div
                    className={`
                    bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 backdrop-blur-xl
                    transform transition-all duration-500 ease-out
                    ${notification.show
                            ? "translate-x-0 opacity-100 scale-100"
                            : "translate-x-full opacity-0 scale-95"
                        }
                    hover:scale-105 hover:shadow-3xl
                    max-w-md w-full mx-4 rounded-2xl
                `}
                >
                    <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${notification.config?.bgGradient} opacity-5 animate-pulse`}
                    ></div>

                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200/20 rounded-t-2xl overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${notification.config?.bgGradient} animate-progress-bar`}
                        ></div>
                    </div>

                    <div className="relative p-6">
                        <div className="flex items-start space-x-4">
                            <div
                                className={`
                                flex-shrink-0 w-12 h-12 ${notification.config?.iconBg} rounded-xl 
                                flex items-center justify-center transform transition-all duration-300
                                hover:scale-110 hover:rotate-6
                                shadow-lg border border-white/30
                            `}
                            >
                                <div
                                    className={`w-6 h-6 ${notification.config?.iconColor} animate-bounce-gentle`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-full h-full"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d={notification.config?.icon}
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h4
                                        className={`
                                        text-lg font-bold bg-gradient-to-r ${notification.config?.bgGradient} 
                                        bg-clip-text text-transparent animate-text-shine
                                    `}
                                    >
                                        {notification.config?.title}
                                    </h4>

                                    <button
                                        onClick={dismissNotification}
                                        className="flex-shrink-0 w-8 h-8 bg-gray-100/80 hover:bg-gray-200/80 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110 ml-2"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <p className="text-gray-700 text-sm leading-relaxed">
                                    {notification.message}
                                </p>

                                <div className="flex items-center mt-3 space-x-1">
                                    <div
                                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${notification.config?.bgGradient} animate-pulse-delay-0`}
                                    ></div>
                                    <div
                                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${notification.config?.bgGradient} animate-pulse-delay-1`}
                                    ></div>
                                    <div
                                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${notification.config?.bgGradient} animate-pulse-delay-2`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-100 animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg animate-bounce"></div>
                </div>
            </div>
        );
    };

    if (isLoadingInitial) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden flex items-center justify-center">
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 text-center space-y-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <BookOutlined className="text-4xl text-white" />
                        </div>

                        <div className="absolute -top-2 -right-8 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-ping"></div>
                        <div className="absolute -bottom-2 -left-8 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse delay-300"></div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-slate-700 to-gray-800 bg-clip-text text-transparent">
                            Đang khởi tạo hệ thống
                        </h2>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Vui lòng chờ trong giây lát, chúng tôi đang tải dữ
                            liệu cho bạn...
                        </p>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-300"></div>
                    </div>

                    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    const renderKeKhaiTimeInfo = () => {
        if (!keKhaiThoiGian) {
            return (
                <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">⏰</span>
                            <Text strong className="text-sm text-gray-600">
                                Thời gian Kê khai
                            </Text>
                        </div>
                        <Tag color="default" className="border-0 font-medium">
                            Chưa thiết lập
                        </Tag>
                    </div>

                    <div className="text-center py-4">
                        <Text type="secondary" className="text-sm">
                            Chưa có thông tin thời gian kê khai cho năm học này
                        </Text>
                    </div>
                </div>
            );
        }

        const formatDateTime = (dateTimeString) => {
            if (!dateTimeString) return "Chưa xác định";
            try {
                return new Date(dateTimeString).toLocaleString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } catch (error) {
                return dateTimeString;
            }
        };

        const isActive = () => {
            if (
                !keKhaiThoiGian.thoi_gian_bat_dau ||
                !keKhaiThoiGian.thoi_gian_ket_thuc
            )
                return null;

            const now = new Date();
            const startTime = new Date(keKhaiThoiGian.thoi_gian_bat_dau);
            const endTime = new Date(keKhaiThoiGian.thoi_gian_ket_thuc);

            if (now < startTime) return "upcoming";
            if (now > endTime) return "expired";
            return "active";
        };

        const status = isActive();
        const getStatusConfig = () => {
            switch (status) {
                case "active":
                    return {
                        color: "green",
                        bgColor: "bg-green-50",
                        textColor: "text-green-700",
                        borderColor: "border-green-200",
                        icon: "🟢",
                        text: "Đang mở",
                    };
                case "upcoming":
                    return {
                        color: "blue",
                        bgColor: "bg-blue-50",
                        textColor: "text-blue-700",
                        borderColor: "border-blue-200",
                        icon: "🔵",
                        text: "Sắp mở",
                    };
                case "expired":
                    return {
                        color: "red",
                        bgColor: "bg-red-50",
                        textColor: "text-red-700",
                        borderColor: "border-red-200",
                        icon: "🔴",
                        text: "Đã đóng",
                    };
                default:
                    return {
                        color: "gray",
                        bgColor: "bg-gray-50",
                        textColor: "text-gray-700",
                        borderColor: "border-gray-200",
                        icon: "⚪",
                        text: "Chưa xác định",
                    };
            }
        };

        const statusConfig = getStatusConfig();

        return (
            <div
                className={`rounded-xl border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} p-4 shadow-sm mt-4`}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{statusConfig.icon}</span>
                        <Text
                            strong
                            className={`text-sm ${statusConfig.textColor}`}
                        >
                            Thời gian Kê khai
                        </Text>
                    </div>
                    <Tag
                        color={statusConfig.color}
                        className="border-0 font-medium"
                    >
                        {statusConfig.text}
                    </Tag>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                        <Text type="secondary" className="text-xs font-medium">
                            Bắt đầu:
                        </Text>
                        <div
                            className={`font-medium ${statusConfig.textColor}`}
                        >
                            {formatDateTime(keKhaiThoiGian.thoi_gian_bat_dau)}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Text type="secondary" className="text-xs font-medium">
                            Kết thúc:
                        </Text>
                        <div
                            className={`font-medium ${statusConfig.textColor}`}
                        >
                            {formatDateTime(keKhaiThoiGian.thoi_gian_ket_thuc)}
                        </div>
                    </div>
                </div>

                {keKhaiThoiGian.ghi_chu && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <Text type="secondary" className="text-xs font-medium">
                            Ghi chú:
                        </Text>
                        <div
                            className={`text-sm ${statusConfig.textColor} mt-1`}
                        >
                            {keKhaiThoiGian.ghi_chu}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-8 space-y-6">
                <Card
                    className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                    style={{ borderRadius: "16px" }}
                >
                    <div className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 px-6 py-4 border-b border-gray-200/50 -mx-6 -mt-6 mb-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                        <BookOutlined className="text-2xl text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-md"></div>
                                </div>
                                <div className="space-y-2">
                                    <Title
                                        level={2}
                                        style={{ margin: 0 }}
                                        className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent"
                                    >
                                        Kê khai khối lượng công việc
                                    </Title>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                        <Text type="secondary">
                                            Hệ thống kê khai tổng hợp khối lượng
                                            công việc theo năm học
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Row
                        gutter={16}
                        align="bottom"
                        style={{ marginBottom: 24 }}
                    >
                        <Col xs={24} md={10}>
                            <Form.Item
                                label={
                                    <Text strong>Chọn Năm học để Kê khai</Text>
                                }
                                style={{ marginBottom: 0 }}
                            >
                                <Select
                                    value={selectedNamHocId}
                                    onChange={(value) =>
                                        setSelectedNamHocId(value)
                                    }
                                    placeholder="Vui lòng chọn năm học"
                                    style={{ width: "100%" }}
                                    size="large"
                                    loading={isLoadingInitial || isLoadingData}
                                    className="custom-select"
                                >
                                    {namHocList.map((nh) => (
                                        <Option
                                            key={nh.id}
                                            value={nh.id.toString()}
                                        >
                                            {nh.ten_nam_hoc}
                                            {nh.la_nam_hien_hanh ? (
                                                <Tag
                                                    color="green"
                                                    style={{ marginLeft: 5 }}
                                                >
                                                    Hiện hành
                                                </Tag>
                                            ) : null}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={14}>
                            <Space>
                                <Button
                                    type="default"
                                    onClick={handleSelectNamHocAndFetch}
                                    disabled={
                                        !selectedNamHocId ||
                                        isLoadingData ||
                                        isLoadingInitial
                                    }
                                    loading={isLoadingData}
                                    size="large"
                                    icon={<CalendarOutlined />}
                                    className="custom-button"
                                >
                                    Làm mới dữ liệu
                                </Button>
                                {currentKeKhaiTongHop && (
                                    <Button
                                        onClick={handleCancelCurrentDeclare}
                                        size="large"
                                        danger
                                        icon={<StopOutlined />}
                                        disabled={isSubmitting}
                                        className="custom-button"
                                    >
                                        Hủy/Reset Kê khai Năm học này
                                    </Button>
                                )}
                            </Space>
                        </Col>
                    </Row>

                    {selectedNamHocId && (
                        <div style={{ marginTop: "16px" }}>
                            {renderKeKhaiTimeInfo()}
                        </div>
                    )}
                </Card>

                {error && !isLoadingData && (
                    <Alert
                        message="Thông báo lỗi"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: 16 }}
                        className="custom-alert"
                    />
                )}

                {isLoadingData && (
                    <Card
                        className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                        style={{ borderRadius: "16px" }}
                    >
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 relative flex justify-center items-center mx-auto">
                                        <div className="absolute w-full h-full border-4 border-indigo-200/30 rounded-full animate-spin"></div>
                                        <div className="absolute w-16 h-16 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-full flex items-center justify-center">
                                            <BookOutlined className="text-white animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                                <Text className="text-lg font-medium text-gray-700">
                                    Đang tải dữ liệu kê khai...
                                </Text>
                                <div className="flex items-center justify-center space-x-1 mt-3">
                                    <div
                                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                                        style={{ animationDelay: "0s" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.1s" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.3s" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {currentKeKhaiTongHop && !isLoadingData && !error && (
                    <Card
                        className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                        style={{ borderRadius: "16px" }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSaveAll}
                            className="enhanced-form"
                        >
                            <Tabs
                                defaultActiveKey="tab_giang_day_dai_hoc"
                                type="line"
                                size="large"
                                className="custom-tabs"
                            >
                                <TabPane
                                    tab={
                                        <span className="tab-label">
                                            <BookOutlined />
                                            Giảng dạy Đại học
                                        </span>
                                    }
                                    key="tab_giang_day_dai_hoc"
                                >
                                    <div className="p-6">
                                        <Tabs
                                            defaultActiveKey="gd_dh_trongbm"
                                            type="card"
                                            size="small"
                                            className="custom-tabs-inner"
                                        >
                                            <TabPane
                                                tab="Trong Bộ môn"
                                                key="gd_dh_trongbm"
                                            >
                                                <div className="p-4">
                                                    <FormGdLop
                                                        type="gd_lop_dh_trongbm"
                                                        dataSource={gdLopDhTrongBmList}
                                                        setDataSource={setGdLopDhTrongBmList}
                                                        formatDisplayValue={formatDisplayValue}
                                                        EmptyValueDisplay={EmptyValueDisplay}
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                        renderFileAttachment={renderFileAttachment}
                                                    />
                                                </div>
                                            </TabPane>
                                            <TabPane
                                                tab="Ngoài Bộ môn"
                                                key="gd_dh_ngoaibm"
                                            >
                                                <div className="p-4">
                                                    <FormGdLop
                                                        type="gd_lop_dh_ngoaibm"
                                                        dataSource={gdLopDhNgoaiBmList}
                                                        setDataSource={setGdLopDhNgoaiBmList}
                                                        formatDisplayValue={formatDisplayValue}
                                                        EmptyValueDisplay={EmptyValueDisplay}
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                        renderFileAttachment={renderFileAttachment}
                                                    />
                                                </div>
                                            </TabPane>
                                            <TabPane
                                                tab="Ngoài Cơ sở chính"
                                                key="gd_dh_ngoàics"
                                            >
                                                <div className="p-4">
                                                    <FormGdLop
                                                        type="gd_lop_dh_ngoaics"
                                                        dataSource={gdLopDhNgoaiCsList}
                                                        setDataSource={setGdLopDhNgoaiCsList}
                                                        formatDisplayValue={formatDisplayValue}
                                                        EmptyValueDisplay={EmptyValueDisplay}
                                                        renderTableCell={renderTableCell}
                                                        renderNotes={renderNotes}
                                                        renderFileAttachment={renderFileAttachment}
                                                    />
                                                </div>
                                            </TabPane>
                                        </Tabs>
                                    </div>
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span className="tab-label">
                                            <BookOutlined />
                                            Giảng dạy Thạc sĩ
                                        </span>
                                    }
                                    key="tab_giang_day_ths"
                                >
                                    <div className="p-6">
                                        <FormGdLop
                                            type="gd_lop_ths"
                                            dataSource={gdLopThsList}
                                            setDataSource={setGdLopThsList}
                                            formatDisplayValue={ formatDisplayValue }
                                            EmptyValueDisplay={ EmptyValueDisplay }
                                            renderTableCell={renderTableCell}
                                            renderNotes={renderNotes}
                                            renderFileAttachment={ renderFileAttachment }
                                        />
                                    </div>
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span className="tab-label">
                                            <BookOutlined />
                                            Giảng dạy Tiến sĩ
                                        </span>
                                    }
                                    key="tab_giang_day_ts"
                                >
                                    <div className="p-6">
                                        <FormGdLop
                                            type="gd_lop_ts"
                                            dataSource={gdLopTsList}
                                            setDataSource={setGdLopTsList}
                                            formatDisplayValue={ formatDisplayValue }
                                            EmptyValueDisplay={ EmptyValueDisplay }
                                            renderTableCell={renderTableCell}
                                            renderNotes={renderNotes}
                                            renderFileAttachment={ renderFileAttachment }
                                        />
                                    </div>
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span className="tab-label">
                                            <UserSwitchOutlined />
                                            Hướng dẫn
                                        </span>
                                    }
                                    key="tab_huong_dan"
                                >
                                    <div className="p-6">
                                        <Tabs
                                            defaultActiveKey="hd_dh"
                                            type="card"
                                            size="small"
                                            className="custom-tabs-inner"
                                        >
                                            {" "}
                                            <TabPane tab="Đại học" key="hd_dh">
                                                <div className="p-4">
                                                    <FormHdDatnDaihoc
                                                        dataSource={ hdDatnDhList }
                                                        setDataSource={ setHdDatnDhList }
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={ renderTableCell }
                                                        renderNotes={  renderNotes }
                                                        renderFileAttachment={ renderFileAttachment }
                                                    />
                                                </div>
                                            </TabPane>
                                            <TabPane tab="Thạc sĩ" key="hd_ths">
                                                <div className="p-4">
                                                    <FormHdLvThacsi
                                                        dataSource={hdLvThsList}
                                                        setDataSource={setHdLvThsList}
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={ renderTableCell }
                                                        renderNotes={ renderNotes }
                                                        renderFileAttachment={ renderFileAttachment }
                                                    />
                                                </div>
                                            </TabPane>
                                            <TabPane tab="Tiến sĩ" key="hd_ts">
                                                <div className="p-4">
                                                    <FormHdLaTiensi
                                                        dataSource={hdLaTsList}
                                                        setDataSource={ setHdLaTsList }
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={ renderTableCell }
                                                        renderNotes={ renderNotes }
                                                        renderFileAttachment={ renderFileAttachment }
                                                    />
                                                </div>
                                            </TabPane>
                                        </Tabs>
                                    </div>
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span className="tab-label">
                                            <AuditOutlined /> Đánh giá & Hội đồng
                                        </span>
                                    }
                                    key="tab_danh_gia"
                                >
                                    <div className="p-6">
                                        <Tabs
                                            defaultActiveKey="dg_dh"
                                            type="card"
                                            size="small"
                                            className="custom-tabs-inner"
                                        >
                                            {" "}
                                            <TabPane tab="Đại học" key="dg_dh">
                                                <div className="p-4">
                                                    <FormDgHpTnDaihoc
                                                        dataSource={ dgHpTnDhList }
                                                        setDataSource={ setDgHpTnDhList }
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={ renderTableCell }
                                                        renderNotes={ renderNotes }
                                                        renderFileAttachment={ renderFileAttachment }
                                                    />
                                                </div>
                                            </TabPane>
                                            <TabPane tab="Thạc sĩ" key="dg_ths">
                                                <div className="p-4">
                                                    <FormDgLvThacsi
                                                        dataSource={dgLvThsList}
                                                        setDataSource={ setDgLvThsList }
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={ renderTableCell }
                                                        renderNotes={ renderNotes }
                                                        renderFileAttachment={ renderFileAttachment }
                                                    />
                                                </div>
                                            </TabPane>
                                            <TabPane tab="Tiến sĩ" key="dg_ts">
                                                <div className="p-4">
                                                    <FormDgLaTiensi
                                                        dataSource={ dgLaTsDotList }
                                                        setDataSource={ setDgLaTsDotList }
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={ renderTableCell }
                                                        renderNotes={ renderNotes }
                                                        renderFileAttachment={ renderFileAttachment }
                                                    />
                                                </div>
                                            </TabPane>
                                        </Tabs>
                                    </div>
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span className="tab-label">
                                            <CarryOutOutlined /> Coi thi, Chấm thi
                                        </span>
                                    }
                                    key="tab_khao_thi"
                                >
                                    <div className="p-6">
                                        <Tabs
                                            defaultActiveKey="kt_dh_trongbm"
                                            type="card"
                                            size="small"
                                            className="custom-tabs-inner"
                                        >
                                            {" "}
                                            <TabPane
                                                tab="ĐH - Trong BM"
                                                key="kt_dh_trongbm"
                                            >
                                                <div className="p-4">
                                                    <FormKhaoThi
                                                        type="khaothi_dh_trongbm"
                                                        dataSource={ khaoThiDhTrongBmList }
                                                        setDataSource={ setKhaoThiDhTrongBmList }
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={ renderTableCell }
                                                        renderNotes={ renderNotes }
                                                        renderFileAttachment={ renderFileAttachment }
                                                    />
                                                </div>
                                            </TabPane>
                                            <TabPane
                                                tab="ĐH - Ngoài BM"
                                                key="kt_dh_ngoaibm"
                                            >
                                                <div className="p-4">
                                                    <FormKhaoThi
                                                        type="khaothi_dh_ngoaibm"
                                                        dataSource={ khaoThiDhNgoaiBmList }
                                                        setDataSource={ setKhaoThiDhNgoaiBmList }
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={ renderTableCell }
                                                        renderNotes={ renderNotes }
                                                        renderFileAttachment={ renderFileAttachment }
                                                    />
                                                </div>
                                            </TabPane>
                                            <TabPane tab="Thạc sĩ" key="kt_ths">
                                                <div className="p-4">
                                                    <FormKhaoThi type="khaothi_ths" dataSource={ khaoThiThsList }
                                                        setDataSource={ setKhaoThiThsList }
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={ renderTableCell }
                                                        renderNotes={ renderNotes }
                                                        renderFileAttachment={ renderFileAttachment }
                                                    />
                                                </div>
                                            </TabPane>
                                            <TabPane tab="Tiến sĩ" key="kt_ts">
                                                <div className="p-4">
                                                    <FormKhaoThi
                                                        type="khaothi_ts"
                                                        dataSource={  khaoThiTsList }
                                                        setDataSource={ setKhaoThiTsList }
                                                        formatDisplayValue={ formatDisplayValue }
                                                        EmptyValueDisplay={ EmptyValueDisplay }
                                                        renderTableCell={ renderTableCell }
                                                        renderNotes={ renderNotes }
                                                        renderFileAttachment={ renderFileAttachment }
                                                    />
                                                </div>
                                            </TabPane>
                                        </Tabs>
                                    </div>
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span className="tab-label">
                                            <BuildOutlined /> XD CTĐT & HĐ GD khác
                                        </span>
                                    }
                                    key="tab_xd_ctdt_khac"
                                >
                                    <div className="p-6">
                                        <FormXdCtdtVaKhacGd
                                            dataSource={xdCtdtVaKhacGdList}
                                            setDataSource={ setXdCtdtVaKhacGdList }
                                            formatDisplayValue={ EmptyValueDisplay }
                                            renderTableCell={renderTableCell}
                                            renderNotes={renderNotes}
                                            renderFileAttachment={ renderFileAttachment }
                                        />
                                    </div>
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span className="tab-label">
                                            <ExperimentOutlined /> Nghiên cứu Khoa học
                                        </span>
                                    }
                                    key="tab_nckh"
                                >
                                    <div className="p-6">
                                        <FormNckh
                                            dataSource={nckhList}
                                            setDataSource={setNckhList}
                                            keKhaiTongHopId={ currentKeKhaiTongHop?.id }
                                            formatDisplayValue={ formatDisplayValue }
                                            EmptyValueDisplay={ EmptyValueDisplay }
                                            renderTableCell={renderTableCell}
                                            renderNotes={renderNotes}
                                            renderFileAttachment={ renderFileAttachment }
                                        />
                                    </div>
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span className="tab-label">
                                            <TeamOutlined /> Công tác khác
                                        </span>
                                    }
                                    key="tab_cong_tac_khac"
                                >
                                    <div className="p-6">
                                        <FormCongTacKhac
                                            dataSource={congTacKhacList}
                                            setDataSource={setCongTacKhacList}
                                            formatDisplayValue={ formatDisplayValue }
                                            EmptyValueDisplay={ EmptyValueDisplay }
                                            renderTableCell={renderTableCell}
                                            renderNotes={renderNotes}
                                            renderFileAttachment={ renderFileAttachment }
                                        />
                                    </div>
                                </TabPane>
                            </Tabs>
                            <Divider />
                            <Form.Item
                                style={{
                                    marginTop: "20px",
                                    textAlign: "right",
                                }}
                            >
                                <Space>
                                    <Button
                                        type="default"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        loading={isSubmitting}
                                        size="large"
                                        disabled={
                                            isSubmittingOfficial || !currentKeKhaiTongHop || currentKeKhaiTongHop.trang_thai_phe_duyet === 1 || currentKeKhaiTongHop.trang_thai_phe_duyet === 3
                                        }
                                        className="text-white px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 rounded-xl shadow-lg hover:shadow-xl"
                                    >
                                        Lưu Bản Nháp
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={handleSubmitOfficial}
                                        icon={<SolutionOutlined />}
                                        loading={isSubmittingOfficial}
                                        size="large"
                                        disabled={
                                            isSubmitting ||
                                            !currentKeKhaiTongHop ||
                                            currentKeKhaiTongHop.trang_thai_phe_duyet ===
                                            1 ||
                                            currentKeKhaiTongHop.trang_thai_phe_duyet ===
                                            3
                                        }
                                        className="px-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0 rounded-xl shadow-lg hover:shadow-xl"
                                    >
                                        Nộp Kê Khai Chính Thức
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                )}

                {!currentKeKhaiTongHop &&
                    !isLoadingData &&
                    !error &&
                    selectedNamHocId && (
                        <Card
                            className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                            style={{ borderRadius: "16px" }}
                        >
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CalendarOutlined className="text-3xl text-gray-400" />
                                </div>
                                <Title level={4} className="text-gray-600 mb-4">
                                    Chưa có dữ liệu kê khai
                                </Title>
                                <Text
                                    type="secondary"
                                    className="text-base mb-6 block"
                                >
                                    Vui lòng nhấn "Làm mới dữ liệu" để bắt đầu
                                    kê khai cho năm học đã chọn
                                </Text>
                            </div>
                        </Card>
                    )}

                {!selectedNamHocId && !isLoadingInitial && (
                    <Card
                        className="bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                        style={{ borderRadius: "16px" }}
                    >
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOutlined className="text-3xl text-blue-500" />
                            </div>
                            <Title level={4} className="text-gray-600 mb-4">
                                Chào mừng đến với hệ thống kê khai
                            </Title>
                            <Text
                                type="secondary"
                                className="text-base mb-6 block"
                            >
                                Vui lòng chọn năm học để bắt đầu kê khai khối
                                lượng công việc của bạn
                            </Text>
                        </div>
                    </Card>
                )}

                {renderNotification()}

                <style>{`
                    .enhanced-form .ant-form-item-label > label {
                        font-weight: 600 !important;
                        color: #374151 !important;
                    }

                    .custom-select .ant-select-selector {
                        border-radius: 12px !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.2s ease !important;
                        background: rgba(255, 255, 255, 0.8) !important;
                        backdrop-filter: blur(8px) !important;
                    }
                    
                    .custom-select .ant-select-selector:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
                    }

                    .custom-select .ant-select-focused .ant-select-selector {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                    }

                    .custom-button.ant-btn {
                        border-radius: 12px !important;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        backdrop-filter: blur(8px) !important;
                    }
                    
                    .custom-button.ant-btn:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
                    }

                    .custom-button.ant-btn-primary {
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
                        border: none !important;
                    }

                    .custom-button.ant-btn-primary:hover {
                        background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
                    }

                    .custom-alert.ant-alert {
                        border-radius: 12px !important;
                        border: none !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                        backdrop-filter: blur(8px) !important;
                    }

                    .custom-tabs .ant-tabs-nav {
                        margin-bottom: 24px !important;
                    }

                    .custom-tabs .ant-tabs-tab {
                        border-radius: 8px 8px 0 0 !important;
                        transition: all 0.2s ease !important;
                        font-weight: 500 !important;
                        padding: 12px 20px !important;
                        min-width: 180px !important;
                        margin-right: 8px !important;
                    }

                    .custom-tabs .ant-tabs-tab:hover {
                        background: rgba(59, 130, 246, 0.05) !important;
                    }

                    .custom-tabs .ant-tabs-tab-active {
                        background: rgba(59, 130, 246, 0.1) !important;
                        border-color: #3b82f6 !important;
                    }

                    .custom-tabs-inner .ant-tabs-tab {
                        border-radius: 6px !important;
                        margin-right: 4px !important;
                        font-size: 13px !important;
                        padding: 8px 16px !important;
                        min-width: 120px !important;
                    }

                    .tab-label {
                        display: inline-flex !important;
                        align-items: center !important;
                        gap: 10px !important;
                        font-size: 14px !important;
                        font-weight: 500 !important;
                        white-space: nowrap !important;
                    }

                    .tab-label .anticon {
                        font-size: 16px !important;
                        margin-right: 0 !important;
                    }

                    /* Responsive */
                    @media (max-width: 1200px) {
                        .custom-tabs .ant-tabs-tab {
                            min-width: 150px !important;
                            padding: 10px 16px !important;
                        }
                        
                        .tab-label {
                            font-size: 13px !important;
                            gap: 8px !important;
                        }
                        
                        .tab-label .anticon {
                            font-size: 15px !important;
                        }
                    }

                    @media (max-width: 768px) {
                        .custom-tabs .ant-tabs-tab {
                            min-width: 120px !important;
                            padding: 8px 12px !important;
                        }
                        
                        .tab-label {
                            font-size: 12px !important;
                            gap: 6px !important;
                        }
                        
                        .tab-label .anticon {
                            font-size: 14px !important;
                        }
                    }

                    @media (max-width: 480px) {
                        .custom-tabs .ant-tabs-tab {
                            min-width: 100px !important;
                            padding: 6px 8px !important;
                        }
                        
                        .tab-label {
                            font-size: 11px !important;
                            gap: 4px !important;
                        }
                        
                        .tab-label .anticon {
                            font-size: 13px !important;
                        }
                    }

                    .ant-card {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }

                    .ant-card:hover {
                        transform: translateY(-2px) !important;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
                    }                   
                    .ant-divider {
                        border-color: rgba(59, 130, 246, 0.1) !important;
                        margin: 32px 0 !important;
                    }

                    .empty-value-elegant {
                        background: linear-gradient(45deg, rgba(148, 163, 184, 0.1), rgba(203, 213, 225, 0.05));
                        padding: 2px 8px;
                        border-radius: 6px;
                        border: 1px dashed rgba(148, 163, 184, 0.3);
                        display: inline-block;
                        min-width: 32px;
                        text-align: center;
                        transition: all 0.2s ease;
                    }

                    .empty-value-elegant:hover {
                        background: linear-gradient(45deg, rgba(148, 163, 184, 0.15), rgba(203, 213, 225, 0.08));
                        border-color: rgba(148, 163, 184, 0.4);
                        transform: translateY(-1px);
                    }

                    .ant-table-tbody > tr > td .empty-value-elegant {
                        margin: 0;
                        font-size: 0.85em;
                        opacity: 0.7;
                    }

                    .ant-form-item .empty-value-elegant {
                        font-size: 0.9em;
                        opacity: 0.6;
                    }

                    /* Notification Animations */
                    @keyframes progress-bar {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }

                    @keyframes bounce-gentle {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-4px); }
                    }

                    @keyframes text-shine {
                        0% { background-position: -200% center; }
                        100% { background-position: 200% center; }
                    }

                    @keyframes pulse-delay-0 {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(0.8); }
                    }

                    @keyframes pulse-delay-1 {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(0.8); }
                    }

                    @keyframes pulse-delay-2 {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(0.8); }
                    }

                    .animate-progress-bar {
                        animation: progress-bar 4s linear forwards;
                    }

                    .animate-bounce-gentle {
                        animation: bounce-gentle 2s ease-in-out infinite;
                    }

                    .animate-text-shine {
                        background-size: 200% auto;
                        animation: text-shine 2s linear infinite;
                    }

                    .animate-pulse-delay-0 {
                        animation: pulse-delay-0 1.5s ease-in-out infinite;
                    }

                    .animate-pulse-delay-1 {
                        animation: pulse-delay-1 1.5s ease-in-out infinite 0.2s;
                    }

                    .animate-pulse-delay-2 {
                        animation: pulse-delay-2 1.5s ease-in-out infinite 0.4s;
                    }

                    .shadow-3xl {
                        box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
                    }
                `}</style>
            </div>
        </div>
    );
}

export default KeKhaiGiangDayForm;
