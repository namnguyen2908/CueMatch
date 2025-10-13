import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { toast } from 'react-toastify';
import billiardsClubApi from '../../api/billiardsClubApi';
import { FaSave } from 'react-icons/fa';
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

    return (
        <div className="flex h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <main className="flex flex-col flex-1 overflow-auto transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? '16rem' : '4rem' }}>
                {loading ? (
                    <div className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-300 rounded w-1/3 dark:bg-gray-700"></div>
                            <div className="h-64 bg-gray-300 rounded dark:bg-gray-700"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                {[...Array(6)].map((_, idx) => (
                                    <div key={idx} className="h-12 bg-gray-300 rounded dark:bg-gray-700"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                        <h1 className="text-4xl font-extrabold text-center text-indigo-600 dark:text-indigo-400 mb-10 tracking-wide">
                            Thông tin Quán Bi-a
                        </h1>

                        {formData.CoverImage && (
                            <div className="w-full h-72 rounded-lg overflow-hidden shadow-xl mb-10">
                                <img
                                    src={formData.CoverImage}
                                    alt="Ảnh bìa quán"
                                    className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdate();
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {[
                                { label: 'Tên quán', name: 'Name' },
                                { label: 'Số điện thoại', name: 'Phone' },
                                { label: 'Địa chỉ', name: 'Address' },
                                { label: 'Ảnh bìa (URL)', name: 'CoverImage' },
                                { label: 'Giờ mở cửa', name: 'OpenTime', type: 'time' },
                                { label: 'Giờ đóng cửa', name: 'CloseTime', type: 'time' },
                            ].map(({ label, name, type = 'text' }) => (
                                <div key={name} className="flex flex-col">
                                    <label
                                        htmlFor={name}
                                        className="mb-2 font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        {label}
                                    </label>
                                    <input
                                        id={name}
                                        type={type}
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
                                        placeholder={`Nhập ${label.toLowerCase()}`}
                                    />
                                </div>
                            ))}

                            <div className="md:col-span-2 flex flex-col">
                                <label
                                    htmlFor="Description"
                                    className="mb-2 font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Mô tả
                                </label>
                                <textarea
                                    id="Description"
                                    name="Description"
                                    rows={5}
                                    value={formData.Description}
                                    onChange={handleChange}
                                    placeholder="Nhập mô tả quán bi-a"
                                    className="resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-center">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-400 focus:outline-none text-white font-bold py-3 px-10 rounded-xl shadow-lg transition ${saving ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {saving ? (
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
                                    ) : (
                                        <FaSave size={18} />
                                    )}
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </main>
        </div>
    );
};

export default ClubProfile;