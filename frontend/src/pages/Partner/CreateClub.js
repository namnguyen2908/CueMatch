import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import billiardsClubApi from '../../api/billiardsClubApi';
import { toast } from 'react-toastify';

const CreateClub = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    Name: '',
    Address: '',
    Phone: '',
    Description: '',
    CoverImage: '',
    OpenTime: '09:00',
    CloseTime: '23:00'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await billiardsClubApi.createClub(form);
      toast.success('Tạo quán thành công!');
      navigate('/club-dashboard'); // hoặc trang danh sách quán của tôi
    } catch (err) {
      console.error('❌ Error creating club:', err);
      toast.error('Lỗi khi tạo quán. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 dark:from-gray-900 dark:to-gray-950 flex justify-center items-center p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-xl w-full">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">Tạo Quán Bi-a</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Tên quán *</label>
            <input
              type="text"
              name="Name"
              value={form.Name}
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Địa chỉ *</label>
            <input
              type="text"
              name="Address"
              value={form.Address}
              onChange={handleChange}
              required
              className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Số điện thoại</label>
            <input
              type="text"
              name="Phone"
              value={form.Phone}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Mô tả</label>
            <textarea
              name="Description"
              rows="3"
              value={form.Description}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Ảnh bìa (URL)</label>
            <input
              type="text"
              name="CoverImage"
              value={form.CoverImage}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Giờ mở cửa</label>
              <input
                type="time"
                name="OpenTime"
                value={form.OpenTime}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Giờ đóng cửa</label>
              <input
                type="time"
                name="CloseTime"
                value={form.CloseTime}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Tạo Quán'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClub;