import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Clock, QrCode, AlertCircle, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import paymentApi from '../api/paymentApi';
import subscriptionPlanApi from '../api/subscriptionPlanApi';

const Payment = () => {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Details, 2: QR, 3: Result
  const [qrUrl, setQrUrl] = useState(null);
  const [orderCode, setOrderCode] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' or 'failed'
  const [pollingInterval, setPollingInterval] = useState(null);
  // Step 1: Load plan details
  useEffect(() => {
    const loadPlanDetails = async () => {
      try {
        setLoading(true);
        const res = await subscriptionPlanApi.getPlanById(planId);
        setPlanDetails(res);
      } catch (error) {
        console.error('Error loading plan details:', error);
        alert('Không thể tải thông tin gói. Vui lòng thử lại!');
        navigate('/pricing');
      } finally {
        setLoading(false);
      }
    };

    loadPlanDetails();
  }, [planId, navigate]);

  // Step 2: Create order and show QR
  const handleProceedToPayment = async () => {
    try {
      setLoading(true);
      const res = await paymentApi.createPaymentOrder({ planId });
      setQrUrl(res.qrUrl);
      setOrderCode(res.orderCode);
      setStep(2);
      // Start polling
      const interval = setInterval(async () => {
        try {
          console.log(res)
          const statusRes = await paymentApi.getOrderStatus(res.orderCode);
          if (statusRes.status === 'PAID') {
            clearInterval(interval);
            setPaymentStatus('success');
            setStep(3);
          } else if (statusRes.status === 'FAILED') {
            clearInterval(interval);
            setPaymentStatus('failed');
            setStep(3);
          }
        } catch (e) {
          console.error('Lỗi kiểm tra trạng thái đơn:', e);
        }
      }, 3000);

      setPollingInterval(interval);
    } catch (error) {
      console.error('Lỗi khi tạo đơn thanh toán:', error);
      alert('Không thể tạo đơn thanh toán. Vui lòng thử lại!');
      navigate('/pricing');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step > s
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : step === s
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white scale-110 shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}
                  >
                    {step > s ? <Check className="w-6 h-6" /> : s}
                  </div>
                  <span className={`text-xs font-semibold ${step >= s ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                    {s === 1 ? 'Details' : s === 2 ? 'Payment' : 'Result'}
                  </span>
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-16 rounded-full transition-all duration-300 ${step > s ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Step 1: Plan Details */}
          {step === 1 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  Confirm Your Plan
                </h2>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Loading plan details...</p>
                </div>
              ) : planDetails ? (
                <>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {planDetails.Name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-orange-600 dark:text-orange-400">
                        {planDetails.Price.toLocaleString()}₫
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        / {planDetails.Duration} days
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      What's included:
                    </p>
                    {planDetails.Features.map((feature, idx) => {
                      const description = feature.Description || feature.Key; // fallback nếu Description rỗng
                      const limitText = feature.MonthlyLimit === null ? 'Unlimited' : `${feature.MonthlyLimit} / month`;

                      return (
                        <div key={idx} className="flex items-start gap-3 bg-white dark:bg-gray-700 rounded-xl p-4">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mt-0.5">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{limitText}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/pricing')}
                      className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProceedToPayment}
                      disabled={loading}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white font-bold hover:shadow-xl transition-all duration-300 disabled:opacity-60"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  Unable to load plan details
                </p>
              )}
            </div>
          )}

          {/* Step 2: QR Code */}
          {step === 2 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  Scan to Pay
                </h2>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Generating QR code...</p>
                </div>
              ) : qrUrl ? (
                <>
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 mb-6 flex justify-center">
                    <img
                      src={qrUrl}
                      alt="Payment QR Code"
                      className="w-72 h-72 object-contain rounded-xl"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                        Waiting for payment...
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Please scan the QR code with your banking app. The system will automatically verify your payment.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Order Code:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{orderCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                        {planDetails?.Price.toLocaleString()}₫
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (pollingInterval) clearInterval(pollingInterval);
                      navigate('/pricing');
                    }}
                    className="w-full mt-6 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    Cancel Payment
                  </button>
                </>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  Unable to generate QR code
                </p>
              )}
            </div>
          )}

          {/* Step 3: Result */}
          {step === 3 && (
            <div className="p-8">
              {paymentStatus === 'success' ? (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                    Payment Successful!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Your subscription has been activated successfully. Enjoy your premium features!
                  </p>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 mb-8">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Plan:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{planDetails?.Name}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{planDetails?.Duration} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Order Code:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{orderCode}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:shadow-xl transition-all duration-300"
                  >
                    Back to Pricing
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
                    Payment Failed
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Your payment could not be processed. Please try again or contact support if the problem persists.
                  </p>
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6 mb-8 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                        Common issues:
                      </p>
                      <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                        <li>Incorrect payment amount</li>
                        <li>Payment timeout</li>
                        <li>Network connection issues</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (planDetails?.Type === 'partner') {
                          navigate('/partner/create-club');
                        } else {
                          navigate('/pricing');
                        }
                      }}
                      className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:shadow-xl transition-all duration-300"
                    >
                      {planDetails?.Name === 'Partner' ? 'Create Your Club' : 'Back to Pricing'}
                    </button>
                    <button
                      onClick={() => {
                        setStep(1);
                        setQrUrl(null);
                        setOrderCode(null);
                        setPaymentStatus(null);
                      }}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white font-bold hover:shadow-xl transition-all duration-300"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;