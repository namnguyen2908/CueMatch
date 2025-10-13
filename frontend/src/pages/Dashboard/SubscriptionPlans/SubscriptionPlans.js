import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Power, PowerOff, AlertCircle, Loader2 } from 'lucide-react';
import subscriptionPlanApi from '../../../api/subscriptionPlanApi';
import Layout from '../Layout';
import SubscriptionPlanModal from './SubscriptionPlanModal';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await subscriptionPlanApi.getAllPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setSelectedPlan(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalMode === 'create') {
        await subscriptionPlanApi.createPlan(formData);
      } else if (modalMode === 'edit' && selectedPlan) {
        await subscriptionPlanApi.updatePlan(selectedPlan._id, formData);
      }
      closeModal();
      fetchPlans();
    } catch (err) {
      alert('An error occurred while saving data');
    }
  };

  const handleDisable = async (plan) => {
    const action = plan.IsActive ? 'disable' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} the "${plan.Name}" plan?`)) return;

    try {
      await subscriptionPlanApi.disablePlan(plan._id);
      fetchPlans();
    } catch (err) {
      alert(`An error occurred while trying to ${action} the plan`);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Basic': 'bg-blue-100 text-blue-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Pro': 'bg-green-100 text-green-800',
      'Enterprise': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Subscription Plans List
              </h1>
              <p className="text-gray-600 text-lg">
                Manage and monitor all subscription plans in the system
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              Create New Plan
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <span className="text-xl font-medium text-gray-700">Loading data...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                <div className="col-span-3">Plan Name</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-1">Duration</div>
                <div className="col-span-4">Features</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {plans.map((plan, index) => (
                <div
                  key={plan._id}
                  className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                >
                  {/* Name */}
                  <div className="col-span-3">
                    <div className="font-semibold text-gray-900 text-lg">
                      {plan.Name}
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${plan.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {plan.IsActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  {/* Type */}
                  <div className="col-span-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(plan.Type)}`}>
                      {plan.Type}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="col-span-2">
                    <div className="text-lg font-bold text-green-600">
                      {plan.Price.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">VND</div>
                  </div>

                  {/* Duration */}
                  <div className="col-span-1">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {plan.Duration}
                      </div>
                      <div className="text-xs text-gray-500">days</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="col-span-4">
                    <div className="flex flex-col gap-1 max-h-32 overflow-auto">
                      {plan.Features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          title={feature.Description || ''}
                        >
                          <span className="font-semibold mr-1">{feature.Key}</span>
                          <span>
                            {feature.MonthlyLimit === null || feature.MonthlyLimit === undefined
                              ? ': Unlimited'
                              : `: ${feature.MonthlyLimit}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150 hover:shadow-md"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDisable(plan)}
                      className={`p-2 rounded-lg transition-colors duration-150 hover:shadow-md ${plan.IsActive
                        ? 'text-red-600 hover:bg-red-100'
                        : 'text-green-600 hover:bg-green-100'
                        }`}
                      title={plan.IsActive ? 'Disable' : 'Activate'}
                    >
                      {plan.IsActive ? <PowerOff size={16} /> : <Power size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {plans.length === 0 && !loading && (
                <div className="py-16 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No subscription plans yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start by creating your first subscription plan
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-150"
                  >
                    Create New Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <SubscriptionPlanModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialData={selectedPlan}
          mode={modalMode}
        />
      </div>
    </Layout>
  );
};

export default SubscriptionPlans;