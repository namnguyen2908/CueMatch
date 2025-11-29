import React, { useEffect, useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  Zap, 
  Crown, 
  Users, 
  Building2, 
  Sparkles,
  Infinity,
  TrendingUp,
  Shield,
  Clock,
  Star,
  Info
} from 'lucide-react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import subscriptionPlanApi from '../api/subscriptionPlanApi';
import paymentApi from '../api/paymentApi';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState('user');
  const [currentSub, setCurrentSub] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const res = await paymentApi.getSubscriptionStatus();
        if (res.hasSubscription) {
          setCurrentSub(res);
        }
      } catch (err) {
        console.error("Failed to fetch subscription status", err);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await subscriptionPlanApi.getPlanByType(planType);
        // Sort plans: free first, then by price ascending
        const sortedPlans = res.sort((a, b) => {
          if (a.Price === 0) return -1;
          if (b.Price === 0) return 1;
          return a.Price - b.Price;
        });
        setPlans(sortedPlans);
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [planType]);

  // Determine popular plan (middle plan if 3 plans, or second plan)
  const getPopularPlanIndex = () => {
    if (plans.length === 3) return 1;
    if (plans.length >= 2) return 1;
    return -1;
  };

  const popularIndex = getPopularPlanIndex();

  return (
    <div className="relative min-h-screen overflow-hidden
      bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50
      dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-40"></div>
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar
        variant="overlay"
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="pt-24 md:pt-28 relative z-10 flex flex-col lg:flex-row min-h-screen">
        <div className="hidden lg:block w-[250px] flex-shrink-0">
          <Sidebar />
        </div>

        <div className="flex-1 px-4 sm:px-6 pb-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto text-center mb-12 relative">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-300/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-amber-300/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative z-10">

            {/* Plan Type Toggle */}
            <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-2 border-orange-200/50 dark:border-orange-700/50 shadow-xl mb-8 flex-wrap justify-center">
              <button
                onClick={() => setPlanType('user')}
                className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 ${
                  planType === 'user'
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-lg scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Player Plans</span>
              </button>
              <button
                onClick={() => setPlanType('partner')}
                className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 ${
                  planType === 'partner'
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white shadow-lg scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Venue Plans</span>
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
          ) : plans.length === 0 ? (
            <div className="text-center py-32">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-6">
                <Info className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Plans Available</h3>
              <p className="text-gray-600 dark:text-gray-400">Please check back later for available subscription plans.</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
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
                  currentSub={currentSub}
                  isPopular={index === popularIndex}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
};

const PlanCard = ({ plan, index, currentSub, isPopular }) => {
  const navigate = useNavigate();
  const isFree = plan.price === 0;
  const isCurrent =
    currentSub &&
    currentSub.hasSubscription &&
    currentSub.planName === plan.title &&
    currentSub.statusMessage?.includes('Active');

  const pricePerDay = isFree ? 0 : Math.round(plan.price / plan.duration);
  const pricePerMonth = isFree ? 0 : Math.round((plan.price / plan.duration) * 30);

  const handleBuyOrRenew = () => {
    if (isFree) {
      alert(`You have selected the free plan: ${plan.title}`);
      return;
    }

    if (isCurrent) {
      navigate(`/payment/${plan.id}?renew=true`);
    } else {
      navigate(`/payment/${plan.id}`);
    }
  };

  const getFeatureIcon = (featureKey) => {
    const key = featureKey?.toLowerCase() || '';
    if (key.includes('match')) return <Users className="w-4 h-4" />;
    if (key.includes('email')) return <Shield className="w-4 h-4" />;
    if (key.includes('club')) return <Building2 className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  return (
    <div
      className={`w-full max-w-sm relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl transition-all duration-500 border-2 flex flex-col overflow-hidden group ${
        isPopular
          ? 'border-orange-500 dark:border-orange-400 shadow-2xl scale-100 sm:scale-105 lg:scale-110 z-10'
          : 'border-gray-200 dark:border-gray-700 shadow-lg hover:scale-100 sm:hover:scale-105 hover:shadow-2xl hover:border-orange-300 dark:hover:border-orange-600'
      } ${isCurrent ? 'ring-4 ring-green-500/50 dark:ring-green-400/50' : ''}`}
      style={{ animation: `slideUp 0.6s ease-out ${index * 150}ms both` }}
    >

      {/* Current Plan Badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold shadow-md">
            <Check className="w-3.5 h-3.5" />
            <span>ACTIVE</span>
          </div>
        </div>
      )}

      {/* Gradient Background */}
      {isPopular && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-transparent dark:from-orange-900/20 dark:via-amber-900/10 pointer-events-none" />
      )}

      <div className="p-6 sm:p-8 flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            {isFree ? (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            ) : isPopular ? (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            )}
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {plan.title}
            </h3>
          </div>
          {plan.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {plan.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          {isFree ? (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  Free
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Forever free plan
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
                  {plan.price.toLocaleString()}₫
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{plan.duration} days</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="break-all">{pricePerDay.toLocaleString()}₫/day</span>
                {pricePerMonth > 0 && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="break-all">~{pricePerMonth.toLocaleString()}₫/month</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="flex-grow mb-8">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
            Features Included
          </h4>
          <ul className="space-y-3">
            {plan.features.length > 0 ? (
              plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 group/item">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0 ${
                    isPopular 
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    {getFeatureIcon(feature.Key)}
                    <span className="sr-only">Check</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {feature.Description || feature.Key}
                      </span>
                      {feature.MonthlyLimit === null && (
                        <Infinity className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {feature.MonthlyLimit === null 
                        ? 'Unlimited access' 
                        : `${feature.MonthlyLimit} times per month`}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500 dark:text-gray-400 italic">
                No features listed
              </li>
            )}
          </ul>
        </div>

        {/* CTA Button */}
        <div className="mt-auto">
          <button
            onClick={handleBuyOrRenew}
            disabled={isCurrent && !isFree}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
              isCurrent && !isFree
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : isPopular
                ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white hover:shadow-2xl hover:scale-105'
                : isFree
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl hover:scale-105'
                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:shadow-xl hover:scale-105'
            }`}
          >
            {isFree ? (
              <>
                <span>Choose Plan</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : isCurrent ? (
              <>
                <span>Renew Plan</span>
                <Clock className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          {isCurrent && !isFree && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Your current active plan
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;