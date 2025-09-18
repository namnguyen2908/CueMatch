import React, { useEffect, useState } from 'react';

const ranks = ['A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'G', 'H'];
const playTypes = ['Pool', 'Carom', 'Snooker'];
const availableTimes = ['Morning', 'Noon', 'Afternoon', 'Evening'];
const playGoals = ['Have fun!', 'Find a bet', 'Practice', 'Find friends'];

const BioModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    PlayTypes: [],
    Address: { Ward: '', District: '', City: '' },
    AvailableTimes: [],
    PlayGoals: [],
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

 useEffect(() => {
  if (initialData) {
    // Convert from old format if needed
    if (initialData.PlayTypes && initialData.Rank) {
      const converted = initialData.PlayTypes.map(type => ({
        PlayType: type,
        Rank: initialData.Rank,
      }));
      setFormData({
        PlayStyles: converted,
        Address: initialData.Address || { Ward: '', District: '', City: '' },
        AvailableTimes: initialData.AvailableTimes || [],
        PlayGoals: initialData.PlayGoals || [],
      });
    } else {
      setFormData(initialData);
    }
  } else {
    setFormData({
      PlayStyles: [],
      Address: { Ward: '', District: '', City: '' },
      AvailableTimes: [],
      PlayGoals: [],
    });
  }
}, [initialData]);


  const toggleCheckbox = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const selectRank = (rank) => {
    setFormData({ ...formData, Rank: rank });
    setIsDropdownOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/50 to-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      ></div>

      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-md max-w-4xl w-full mx-4 rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-300 ease-out">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100/80 hover:bg-red-100/80 flex items-center justify-center transition-all duration-200 hover:scale-110 group z-10"
        >
          <svg className="w-5 h-5 text-gray-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Form Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              {initialData ? 'Edit Profile' : 'Create Profile'}
            </h2>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Left Column */}
            <div className="space-y-6">
              {/* Skill Level - Custom Dropdown */}
              {/* Play Styles (PlayType + Rank) */}
              <div>
                <label className="block mb-3 font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  Game Types & Ranks
                </label>
                <div className="space-y-4">
                  {playTypes.map((type) => {
                    const existing = formData.PlayStyles.find(p => p.PlayType === type) || {};
                    return (
                      <div key={type} className="flex items-center gap-4">
                        {/* Toggle PlayType (on/off) */}
                        <label
                          className={`px-4 py-2 rounded-lg font-medium cursor-pointer border-2 transition-all ${existing.PlayType
                              ? 'bg-blue-100 text-blue-700 border-blue-500'
                              : 'bg-white text-gray-700 border-gray-200'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!existing.PlayType}
                            onChange={() => {
                              setFormData((prev) => {
                                const exists = prev.PlayStyles.find(p => p.PlayType === type);
                                if (exists) {
                                  return {
                                    ...prev,
                                    PlayStyles: prev.PlayStyles.filter(p => p.PlayType !== type)
                                  };
                                } else {
                                  return {
                                    ...prev,
                                    PlayStyles: [...prev.PlayStyles, { PlayType: type, Rank: 'C' }]
                                  };
                                }
                              });
                            }}
                            className="sr-only"
                          />
                          {type}
                        </label>

                        {/* Rank selector (only if selected) */}
                        {existing.PlayType && (
                          <select
                            value={existing.Rank}
                            onChange={(e) => {
                              const updatedRank = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                PlayStyles: prev.PlayStyles.map(p =>
                                  p.PlayType === type ? { ...p, Rank: updatedRank } : p
                                )
                              }));
                            }}
                            className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 transition"
                          >
                            {ranks.map((rank) => (
                              <option key={rank} value={rank}>
                                Level {rank}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* Available Times */}
              <div>
                <label className="block mb-3 font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  Available Times
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableTimes.map((time) => (
                    <label
                      key={time}
                      className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-sm font-medium hover:scale-105 ${formData.AvailableTimes.includes(time)
                          ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 text-green-700 shadow-md'
                          : 'border-gray-200 bg-white/50 hover:border-green-300 hover:bg-green-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.AvailableTimes.includes(time)}
                        onChange={() => toggleCheckbox('AvailableTimes', time)}
                        className="sr-only"
                      />
                      {time}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Play Goals */}
              <div>
                <label className="block mb-3 font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  Play Goals
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {playGoals.map((goal) => (
                    <label
                      key={goal}
                      className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-sm font-medium hover:scale-105 ${formData.PlayGoals.includes(goal)
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 shadow-md'
                          : 'border-gray-200 bg-white/50 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.PlayGoals.includes(goal)}
                        onChange={() => toggleCheckbox('PlayGoals', goal)}
                        className="sr-only"
                      />
                      {goal}
                    </label>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block mb-3 font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  Address
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.Address.Ward}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Address: { ...formData.Address, Ward: e.target.value },
                      })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-red-300"
                    placeholder="Ward"
                  />
                  <input
                    type="text"
                    value={formData.Address.District}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Address: { ...formData.Address, District: e.target.value },
                      })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-red-300"
                    placeholder="District"
                  />
                  <input
                    type="text"
                    value={formData.Address.City}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Address: { ...formData.Address, City: e.target.value },
                      })
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-red-300"
                    placeholder="City"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button - Full Width */}
            <div className="lg:col-span-2 flex justify-center pt-4">
              <button
                type="submit"
                className="px-12 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg focus:outline-none focus:ring-4 focus:ring-orange-200"
              >
                {initialData ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BioModal;