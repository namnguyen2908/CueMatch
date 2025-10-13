import React, { useState, useEffect } from 'react';
import { X, Package, Tag, DollarSign, Calendar, Star } from 'lucide-react';

// Danh sách feature cố định
const availableFeatures = ['Matching', 'Send Email', 'Club'];

const SubscriptionPlanModal = ({ isOpen, onClose, onSubmit, initialData = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    Name: '',
    Type: 'user',
    Price: '',
    Duration: 30,
    Features: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        Name: initialData.Name || '',
        Type: initialData.Type || 'user',
        Price: initialData.Price || '',
        Duration: initialData.Duration || 30,
        Features: initialData.Features || [],
      });
    } else {
      setFormData({
        Name: '',
        Type: 'user',
        Price: '',
        Duration: 30,
        Features: [],
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Check if a feature is selected
  const isFeatureSelected = (key) => {
    return formData.Features.some((f) => f.Key === key);
  };

  // Get feature object by key
  const getFeature = (key) => {
    return formData.Features.find((f) => f.Key === key);
  };

  // Handle checkbox toggle
  const toggleFeature = (key) => {
    if (isFeatureSelected(key)) {
      const newFeatures = formData.Features.filter((f) => f.Key !== key);
      setFormData((prev) => ({ ...prev, Features: newFeatures }));
    } else {
      setFormData((prev) => ({
        ...prev,
        Features: [
          ...prev.Features,
          {
            Key: key,
            Description: '',
            MonthlyLimit: formData.Type === 'user' ? null : undefined,
          },
        ],
      }));
    }
  };

  // Cập nhật mô tả feature
  const updateFeatureDescription = (key, desc) => {
    const updated = formData.Features.map((f) =>
      f.Key === key ? { ...f, Description: desc } : f
    );
    setFormData((prev) => ({ ...prev, Features: updated }));
  };

  // Cập nhật giới hạn sử dụng (chỉ áp dụng cho user)
  const updateFeatureLimit = (key, value) => {
    const updated = formData.Features.map((f) =>
      f.Key === key ? { ...f, MonthlyLimit: value === '' ? null : Number(value) } : f
    );
    setFormData((prev) => ({ ...prev, Features: updated }));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedFeatures = formData.Features.map((f) => ({
      Key: f.Key,
      Description: f.Description || '',
      MonthlyLimit: formData.Type === 'user'
        ? (f.MonthlyLimit === null || f.MonthlyLimit === undefined ? null : Number(f.MonthlyLimit))
        : null

    }));

    const payload = {
      ...formData,
      Price: Number(formData.Price),
      Duration: Number(formData.Duration),
      Features: cleanedFeatures,
    };

    onSubmit(payload);
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'create' ? 'Create New Subscription Plan' : 'Edit Subscription Plan'}
              </h2>
              <p className="text-blue-100 text-sm">
                {mode === 'create' ? 'Add a new subscription plan to the system' : 'Update subscription plan information'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">

          {/* Plan Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Package size={16} className="text-blue-600" />
              Plan Name
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              required
              placeholder="Enter subscription plan name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Type & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Tag size={16} className="text-blue-600" />
                Plan Type
              </label>
              <select
                name="Type"
                value={formData.Type}
                onChange={(e) => {
                  const newType = e.target.value;
                  // Reset all MonthlyLimit to null when changing type
                  const newFeatures = formData.Features.map((f) => ({
                    Key: f.Key,
                    MonthlyLimit: null,
                  }));
                  setFormData((prev) => ({
                    ...prev,
                    Type: newType,
                    Features: newFeatures,
                  }));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="user">User</option>
                <option value="partner">Partner</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DollarSign size={16} className="text-blue-600" />
                Price (VND)
              </label>
              <input
                type="number"
                name="Price"
                value={formData.Price}
                onChange={(e) => setFormData({ ...formData, Price: e.target.value })}
                min={0}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar size={16} className="text-blue-600" />
              Duration (days)
            </label>
            <input
              type="number"
              name="Duration"
              value={formData.Duration}
              onChange={(e) => setFormData({ ...formData, Duration: e.target.value })}
              min={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Star size={16} className="text-blue-600" />
              Features
            </label>

            {availableFeatures.map((featureKey) => {
              const selected = isFeatureSelected(featureKey);
              const feature = getFeature(featureKey) || {};

              return (
                <div key={featureKey} className="flex flex-col gap-1 border border-gray-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleFeature(featureKey)}
                      className="accent-blue-600"
                    />
                    <span className="text-gray-800 font-medium">{featureKey}</span>
                  </div>

                  {selected && (
                    <div className="mt-2 space-y-2">
                      {/* Description (Always shown) */}
                      <input
                        type="text"
                        placeholder="Feature Description..."
                        value={feature?.Description || ''}
                        onChange={(e) => updateFeatureDescription(featureKey, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />

                      {/* MonthlyLimit (Only for user) */}
                      {formData.Type === 'user' && (
                        <input
                          type="number"
                          placeholder="Monthly Limit (leave blank for unlimited)"
                          value={feature?.MonthlyLimit === null || feature?.MonthlyLimit === undefined ? '' : feature.MonthlyLimit}
                          min={0}
                          onChange={(e) => updateFeatureLimit(featureKey, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>


          {/* Action */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition"
            >
              {mode === 'create' ? 'Create Plan' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionPlanModal;