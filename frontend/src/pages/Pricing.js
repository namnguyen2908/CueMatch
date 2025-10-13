import React, { useEffect, useState } from 'react';
import { Check, ArrowRight, Zap } from 'lucide-react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import subscriptionPlanApi from '../api/subscriptionPlanApi';
import paymentApi from '../api/paymentApi';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState('user');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await subscriptionPlanApi.getPlanByType(planType);
        setPlans(res);
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [planType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <Header />
      <Sidebar />

      <main className="ml-60 pt-[7rem] px-6 pb-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto text-center mb-16 relative">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-300/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-amber-300/20 rounded-full filter blur-3xl animate-pulse delay-1000" />

          <div className="relative z-10">

            <h3 className="text-4xl md:text-4xl font-black mb-6 leading-tight">
              <span className="text-gray-900 dark:text-white">Choose the </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-300">
                Perfect Plan
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">for Your Journey</span>
            </h3>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              Unlock premium features and elevate your experience with our flexible subscription options
            </p>

            {/* Plan Type Toggle */}
            <div className="inline-flex items-center gap-3 p-2 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-orange-200/50 dark:border-orange-700/50 shadow-2xl">
              <button
                onClick={() => setPlanType('user')}
                className={`relative flex items-center gap-3 px-8 py-4 text-base font-bold rounded-xl transition-all duration-300
                  ${planType === 'user'
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-lg scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700/50'}`}
              >
                <span className="relative">Player Plans</span>
              </button>
              <button
                onClick={() => setPlanType('partner')}
                className={`relative flex items-center gap-3 px-8 py-4 text-base font-bold rounded-xl transition-all duration-300
                  ${planType === 'partner'
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-lg scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700/50'}`}
              >
                <span className="relative">Venue Plans</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Section */}
        <div className="max-w-7xl mx-auto relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-orange-200 dark:border-orange-800 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold mt-6">Loading amazing plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan._id}
                  plan={{
                    id: plan._id,
                    title: plan.Name,
                    description: plan.Description,
                    price: plan.Price,
                    duration: plan.Duration,
                    features: plan.Features,
                  }}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const PlanCard = ({ plan, index }) => {
  const isFree = plan.price === 0;
  const navigate = useNavigate();

  const handleBuyPlan = () => {
    if (isFree) {
      // Ở đây bạn có thể xử lý logic chọn gói miễn phí nếu có
      alert(`Bạn đã chọn gói miễn phí: ${plan.title}`);
      return;
    }

    // 👉 Chuyển hướng sang trang thanh toán
    navigate(`/payment/${plan.id}`);
  };
  return (
    <div
      className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl transition-all duration-500 border-2 border-gray-200 dark:border-gray-700 shadow-lg group hover:scale-105 hover:shadow-2xl flex flex-col overflow-hidden"
      style={{ animation: `slideUp 0.6s ease-out ${index * 150}ms both` }}
    >
      <div className="p-8 flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
            {plan.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 min-h-[40px]">
            {plan.description}
          </p>
        </div>

        {/* Price */}
        <div className="mb-8">
          {isFree ? (
            <div>
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Free
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Forever free plan
              </p>
            </div>
          ) : (
            <div>
              <span className="text-5xl font-black text-gray-900 dark:text-white">
                {plan.price.toLocaleString()}₫
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                for {plan.duration} days access
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex-grow mb-8">
          <ul className="space-y-4">
            {plan.features.slice(0, 5).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 group/item">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                    {feature.Description || feature.Key}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {feature.MonthlyLimit === null ? 'Unlimited' : `${feature.MonthlyLimit} / month`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <div>
          <button
            onClick={handleBuyPlan}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white font-bold text-sm hover:shadow-xl transition-all duration-300 disabled:opacity-60"
          >
            {isFree ? 'Choose Plan' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;