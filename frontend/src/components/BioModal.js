import React, { useEffect, useState } from 'react';

const ranks = ['A', 'B+', 'B', 'C'];
const playTypes = ['Pool', 'Carom', 'Snooker'];
const availableTimes = ['Chiều', 'Tối', 'Cuối tuần'];
const playGoals = ['Have fun!', 'Find a bet', 'Practice', 'Find friends'];

const BioModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    Rank: '',
    PlayTypes: [],
    Address: [],
    AvailableTimes: [],
    PlayGoals: [],
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({
      Rank: '',
      PlayTypes: [],
      Address: [],
      AvailableTimes: [],
      PlayGoals: [],
    });
  }, [initialData]);

  const toggleCheckbox = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const handleRankSelect = (rank) => {
    setFormData({ ...formData, Rank: rank });
    setDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-amber-800/20 to-orange-600/30 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] overflow-hidden border border-white/30">
        
        {/* Header */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-orange-50/50 via-white/60 to-orange-50/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {initialData ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ mới'}
              </h2>
              <p className="text-gray-600 mt-1 text-sm">Hoàn thiện thông tin để kết nối với các golfer khác</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center text-orange-600 hover:text-orange-700 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-orange-200/50"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid gap-8">
            {/* Custom Dropdown for Rank */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400"></div>
                Trình độ chơi
              </label>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-orange-200/60 focus:border-orange-400 bg-white/60 backdrop-blur-sm text-left font-medium transition-all duration-300 hover:border-orange-300 hover:bg-white/80 shadow-lg hover:shadow-xl flex items-center justify-between group"
                >
                  <span className={formData.Rank ? 'text-gray-800' : 'text-gray-500'}>
                    {formData.Rank || 'Chọn trình độ của bạn'}
                  </span>
                  <div className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-white/90 backdrop-blur-xl rounded-2xl border border-orange-200/60 shadow-2xl shadow-orange-500/20 overflow-hidden">
                    {ranks.map((rank, index) => (
                      <button
                        key={rank}
                        onClick={() => handleRankSelect(rank)}
                        className={`w-full px-6 py-4 text-left font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-amber-50/80 hover:text-orange-700 ${
                          index !== ranks.length - 1 ? 'border-b border-orange-100/50' : ''
                        } ${formData.Rank === rank ? 'bg-gradient-to-r from-orange-100/60 to-amber-100/60 text-orange-700' : 'text-gray-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400"></div>
                          {rank}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PlayTypes */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400"></div>
                Loại hình chơi yêu thích
              </label>
              <div className="grid grid-cols-3 gap-3">
                {playTypes.map(type => (
                  <label key={type} className="relative cursor-pointer group/item">
                    <input
                      type="checkbox"
                      checked={formData.PlayTypes.includes(type)}
                      onChange={() => toggleCheckbox('PlayTypes', type)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center font-medium backdrop-blur-sm
                      ${formData.PlayTypes.includes(type) 
                        ? 'border-orange-300 bg-gradient-to-br from-orange-50/70 to-amber-50/70 text-orange-700 shadow-lg shadow-orange-100/60' 
                        : 'border-gray-200/50 bg-white/50 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'
                      }`}>
                      <div className="text-2xl mb-1">🎱</div>
                      <div className="text-sm">{type}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* AvailableTimes */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400"></div>
                Thời gian có thể chơi
              </label>
              <div className="grid grid-cols-3 gap-3">
                {availableTimes.map(time => (
                  <label key={time} className="relative cursor-pointer group/item">
                    <input
                      type="checkbox"
                      checked={formData.AvailableTimes.includes(time)}
                      onChange={() => toggleCheckbox('AvailableTimes', time)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center font-medium backdrop-blur-sm
                      ${formData.AvailableTimes.includes(time) 
                        ? 'border-orange-300 bg-gradient-to-br from-orange-50/70 to-amber-50/70 text-orange-700 shadow-lg shadow-orange-100/60' 
                        : 'border-gray-200/50 bg-white/50 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'
                      }`}>
                      <div className="text-2xl mb-1">⏰</div>
                      <div className="text-sm">{time}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* PlayGoals */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400"></div>
                Mục đích chơi
              </label>
              <div className="grid grid-cols-2 gap-3">
                {playGoals.map(goal => (
                  <label key={goal} className="relative cursor-pointer group/item">
                    <input
                      type="checkbox"
                      checked={formData.PlayGoals.includes(goal)}
                      onChange={() => toggleCheckbox('PlayGoals', goal)}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center font-medium backdrop-blur-sm
                      ${formData.PlayGoals.includes(goal) 
                        ? 'border-orange-300 bg-gradient-to-br from-orange-50/70 to-amber-50/70 text-orange-700 shadow-lg shadow-orange-100/60' 
                        : 'border-gray-200/50 bg-white/50 text-gray-600 hover:border-orange-200 hover:bg-orange-50/50'
                      }`}>
                      <div className="text-sm">{goal}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400"></div>
                Địa chỉ club thường chơi
              </label>
              <div className="relative">
                <textarea
                  className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200/50 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 resize-none text-gray-800 font-medium transition-all duration-200 hover:border-orange-200 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg"
                  rows={4}
                  value={formData.Address.join('\n')}
                  onChange={(e) =>
                    setFormData({ ...formData, Address: e.target.value.split('\n').filter(Boolean) })
                  }
                  placeholder="Nhập địa chỉ các câu lạc bộ billiards mà bạn thường chơi&#10;Mỗi dòng một địa chỉ..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50/40 via-white/60 to-gray-50/40 backdrop-blur-sm border-t border-gray-100/50">
          <div className="flex justify-end gap-4">
            <button 
              onClick={handleSubmit} 
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl transition-all duration-200 font-semibold shadow-lg shadow-orange-200/60 hover:shadow-xl hover:shadow-orange-300/70 hover:scale-105 backdrop-blur-sm"
            >
              {initialData ? 'Cập nhật' : 'Tạo hồ sơ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioModal;