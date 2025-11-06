import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { toast } from 'react-toastify';
import billiardsClubApi from '../../api/billiardsClubApi';
import { FaSave, FaStore, FaPhone, FaMapMarkerAlt, FaImage, FaClock, FaAlignLeft } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const ClubProfile = () => {
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const dataUser = useUser();
    console.log(dataUser);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const [formData, setFormData] = useState({
        Name: '',
        Address: '',
        Phone: '',
        Description: '',
        CoverImage: '',
        OpenTime: '',
        CloseTime: '',
    });

    const fetchClub = async () => {
        try {
            const response = await billiardsClubApi.getMyClubs();
            if (response.length > 0) {
                const clubData = response[0];
                setClub(clubData);
                setFormData({
                    Name: clubData.Name || '',
                    Address: clubData.Address || '',
                    Phone: clubData.Phone || '',
                    Description: clubData.Description || '',
                    CoverImage: clubData.CoverImage || '',
                    OpenTime: clubData.OpenTime || '',
                    CloseTime: clubData.CloseTime || '',
                });
            } else {
                toast.warning('Bạn chưa tạo quán nào');
            }
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin quán:', error);
            toast.error('Không thể lấy thông tin quán');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClub();
    }, []);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleUpdate = async () => {
        if (!club?._id) return;

        setSaving(true);
        try {
            await billiardsClubApi.updateClub(club._id, formData);
            toast.success('Cập nhật thông tin quán thành công');
        } catch (error) {
            console.error('❌ Lỗi cập nhật:', error);
            toast.error('Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    const InputField = ({ icon: Icon, label, name, type = 'text', placeholder }) => (
        <div className="group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                </div>
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
            </div>
        </div>
    );

    return (
        <div className="flex h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
            <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <main className="flex flex-col flex-1 overflow-auto transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? '16rem' : '4rem' }}>
                <div className="max-w-6xl mx-auto w-full p-6 lg:p-8">
                    {loading ? (
                        <div className="space-y-6">
                            <div className="animate-pulse">
                                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg w-64 mb-8"></div>
                                <div className="h-80 bg-gray-300 dark:bg-gray-700 rounded-2xl mb-8"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[...Array(6)].map((_, idx) => (
                                        <div key={idx} className="h-20 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {formData.CoverImage && (
                                <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-2xl mb-8 group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                                    <img
                                        src={formData.CoverImage}
                                        alt="Ảnh bìa quán"
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute bottom-6 left-6 z-20">
                                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ảnh bìa quán</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <FaStore size={24} />
                                        Chi tiết thông tin
                                    </h2>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <InputField
                                            icon={FaStore}
                                            label="Tên quán"
                                            name="Name"
                                            placeholder="Nhập tên quán bi-a"
                                        />
                                        <InputField
                                            icon={FaPhone}
                                            label="Số điện thoại"
                                            name="Phone"
                                            placeholder="Nhập số điện thoại"
                                        />
                                        <InputField
                                            icon={FaMapMarkerAlt}
                                            label="Địa chỉ"
                                            name="Address"
                                            placeholder="Nhập địa chỉ quán"
                                        />
                                        <InputField
                                            icon={FaImage}
                                            label="Ảnh bìa (URL)"
                                            name="CoverImage"
                                            placeholder="Nhập URL ảnh bìa"
                                        />
                                        <InputField
                                            icon={FaClock}
                                            label="Giờ mở cửa"
                                            name="OpenTime"
                                            type="time"
                                        />
                                        <InputField
                                            icon={FaClock}
                                            label="Giờ đóng cửa"
                                            name="CloseTime"
                                            type="time"
                                        />
                                    </div>

                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Mô tả
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-4 left-4 pointer-events-none">
                                                <FaAlignLeft className="text-gray-400" size={18} />
                                            </div>
                                            <textarea
                                                id="Description"
                                                name="Description"
                                                rows={6}
                                                value={formData.Description}
                                                onChange={handleChange}
                                                placeholder="Nhập mô tả chi tiết về quán bi-a của bạn..."
                                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={handleUpdate}
                                            disabled={saving}
                                            className={`relative inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
                                                saving ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {saving ? (
                                                <>
                                                    <svg
                                                        className="animate-spin h-5 w-5 text-white"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                            fill="none"
                                                        />
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8v8z"
                                                        />
                                                    </svg>
                                                    <span>Đang lưu...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave size={18} />
                                                    <span>Lưu thay đổi</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ClubProfile;