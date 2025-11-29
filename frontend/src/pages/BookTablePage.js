import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import billiardsClubApi from "../api/billiardsClubApi";
import tableApi from "../api/tableApi";
import tableRateApi from "../api/tableRateApi";
import billiardsBookingApi from "../api/billiardsBookingApi";
import paymentApi from "../api/paymentApi";
import { Clock, MapPin, DollarSign, Info, QrCode, CheckCircle2, XCircle } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import socket from "../socket";

export default function BookTablePage() {
  const { id } = useParams();
  const { datauser } = useUser();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [tables, setTables] = useState({});
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  // Booking states
  const [type, setType] = useState("Pool");
  const [bookingDate, setBookingDate] = useState("");
  const [startHour, setStartHour] = useState(null);
  const [endHour, setEndHour] = useState(null);

  const [timeSlots, setTimeSlots] = useState([]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [available, setAvailable] = useState(null);
  
  // Payment states
  const [paymentStep, setPaymentStep] = useState('booking'); // 'booking', 'payment', 'success'
  const [qrUrl, setQrUrl] = useState(null);
  const [orderCode, setOrderCode] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [paymentPolling, setPaymentPolling] = useState(null);

  // --------------------------------------------------
  // Generate time slots
  // --------------------------------------------------
  const generateTimeSlots = (openTime, closeTime) => {
    const [openH, openM] = openTime.split(":").map(Number);
    const [closeH, closeM] = closeTime.split(":").map(Number);

    let start = openH + openM / 60;
    let end = closeH + closeM / 60;

    const slots = [];
    while (start < end) {
      slots.push(start);
      start += 0.5;
    }
    return slots;
  };

  const formatHour = (h) => {
    const hour = Math.floor(h);
    const minute = h % 1 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  };

  // --------------------------------------------------
  // Load data
  // --------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubData = await billiardsClubApi.getClubById(id);
        const tableData = await tableApi.getTableByClub(id);

        const typeStats = {
          Pool: { total: 0, available: 0 },
          Carom: { total: 0, available: 0 },
          Snooker: { total: 0, available: 0 },
        };

        tableData.forEach((t) => {
          typeStats[t.Type].total++;
          if (t.Status === "available") typeStats[t.Type].available++;
        });

        setTables(typeStats);

        const ratePool = await tableRateApi.getTableRate(id, "Pool").catch(() => null);
        const rateCarom = await tableRateApi.getTableRate(id, "Carom").catch(() => null);
        const rateSnooker = await tableRateApi.getTableRate(id, "Snooker").catch(() => null);

        setRates({
          Pool: ratePool?.data?.PricePerHour || null,
          Carom: rateCarom?.data?.PricePerHour || null,
          Snooker: rateSnooker?.data?.PricePerHour || null,
        });

        setClub(clubData);
        setTimeSlots(generateTimeSlots(clubData.OpenTime, clubData.CloseTime));
      } catch (e) {
        console.error("Error loading data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Auto-check availability when date/time changes
  useEffect(() => {
    if (bookingDate && startHour !== null && endHour !== null) {
      // Small delay to avoid too many API calls
      const timer = setTimeout(() => {
        checkAvailable();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Reset availability when date/time is cleared
      setAvailable(null);
    }
  }, [bookingDate, startHour, endHour]);

  // --------------------------------------------------
  // Socket: Join club room for real-time updates
  // --------------------------------------------------
  useEffect(() => {
    if (!id) return;

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Wait a bit for connection, then join room
    const connectAndJoin = () => {
      if (socket.connected) {
        socket.emit('join_club_room', id);
        console.log('Joined club room:', id);
      } else {
        // Retry after connection
        socket.once('connect', () => {
          socket.emit('join_club_room', id);
          console.log('Joined club room after reconnect:', id);
        });
      }
    };

    connectAndJoin();

    // Listen for booking updates
    const handleBookingUpdated = (data) => {
      console.log('Booking updated:', data);
      // If the booking affects current selection, refresh availability
      if (data.clubId === id && bookingDate && startHour !== null && endHour !== null) {
        // Check if the booking overlaps with selected time slot
        const overlaps = 
          (data.bookingDate === bookingDate) &&
          (data.startHour < endHour && data.endHour > startHour);
        
        if (overlaps) {
          // Refresh availability immediately
          checkAvailable();
        }
      }
    };

    // Listen for availability changes
    const handleAvailabilityChanged = (data) => {
      console.log('Availability changed:', data);
      // If it affects current selection, refresh
      if (data.clubId === id && bookingDate && startHour !== null && endHour !== null) {
        // Check if the change overlaps with selected time slot
        const overlaps = 
          (data.bookingDate === bookingDate) &&
          (data.startHour < endHour && data.endHour > startHour);
        
        if (overlaps) {
          // Refresh availability
          checkAvailable();
        }
      }
    };

    socket.on('booking_updated', handleBookingUpdated);
    socket.on('availability_changed', handleAvailabilityChanged);

    // Cleanup: leave room and remove listeners
    return () => {
      socket.emit('leave_club_room', id);
      socket.off('booking_updated', handleBookingUpdated);
      socket.off('availability_changed', handleAvailabilityChanged);
      console.log('Left club room:', id);
    };
  }, [id, bookingDate, startHour, endHour]);

  // --------------------------------------------------
  // Check available tables
  // --------------------------------------------------
  const checkAvailable = async () => {
    try {
      const res = await billiardsBookingApi.checkAvailable(id, bookingDate, startHour, endHour);
      setAvailable(res.available);
      setStatus(null);
    } catch (err) {
      setStatus({
        error: err.response?.data?.message || "Unable to check availability.",
      });
    }
  };

  // --------------------------------------------------
  // Handle booking with payment
  // --------------------------------------------------
  const handleBook = async () => {
    if (!bookingDate || startHour === null || endHour === null) {
      setStatus({ error: "Please select date and time first" });
      return;
    }

    // Validate that the booking time is not in the past
    const now = new Date();
    const selectedDate = new Date(bookingDate);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(Math.floor(startHour), Math.round((startHour % 1) * 60), 0, 0);

    if (startDateTime < now) {
      setStatus({ error: "Cannot book a time slot in the past. Please select a future date and time." });
      return;
    }

    // Check availability before booking
    if (!available) {
      setStatus({ error: "Please check availability first" });
      return;
    }

    const selectedTableAvailable = available[type]?.available || 0;
    if (selectedTableAvailable <= 0) {
      setStatus({ error: `No ${type} tables available for the selected time slot. Please choose another time or table type.` });
      return;
    }

    setSubmitting(true);

    try {
      // Create payment order first
      const bookingData = {
        clubId: id,
        type,
        bookingDate,
        startHour,
        endHour,
        note,
      };

      const paymentRes = await paymentApi.createBookingPaymentOrder(bookingData);
      
      setQrUrl(paymentRes.qrUrl);
      setOrderCode(paymentRes.orderCode);
      setPaymentAmount(paymentRes.amount);
      setPaymentStep('payment');
      setStatus(null);

      // Start polling for payment status
      const interval = setInterval(async () => {
        try {
          const statusRes = await paymentApi.getOrderStatus(paymentRes.orderCode);
          if (statusRes.status === 'PAID') {
            clearInterval(interval);
            setPaymentStep('success');
            setStatus({ success: 'Payment successful! Your booking has been confirmed.' });
            
            // Refresh availability
            if (bookingDate && startHour !== null && endHour !== null) {
              checkAvailable();
            }
            
            // Reset after 3 seconds
            setTimeout(() => {
              setPaymentStep('booking');
              setQrUrl(null);
              setOrderCode(null);
              setPaymentAmount(null);
              setStatus(null);
            }, 3000);
          } else if (statusRes.status === 'FAILED') {
            clearInterval(interval);
            setPaymentStep('booking');
            setStatus({ error: 'Payment failed. Please try again.' });
            setQrUrl(null);
            setOrderCode(null);
            setPaymentAmount(null);
          }
        } catch (e) {
          console.error('Error checking payment status:', e);
        }
      }, 3000);

      setPaymentPolling(interval);
    } catch (err) {
      setStatus({ error: err.response?.data?.message || "Failed to create payment order." });
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (paymentPolling) {
        clearInterval(paymentPolling);
      }
    };
  }, [paymentPolling]);

  // Disable book button logic
  // Check if selected table type has available tables
  const selectedTableAvailable = available ? (available[type]?.available || 0) > 0 : false;
  const hasCheckedAvailability = available !== null;
  
  // Check if booking time is in the past
  const isTimeInPast = (() => {
    if (!bookingDate || startHour === null) return false;
    const now = new Date();
    const selectedDate = new Date(bookingDate);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(Math.floor(startHour), Math.round((startHour % 1) * 60), 0, 0);
    return startDateTime < now;
  })();
  
  const bookDisabled = submitting || !hasCheckedAvailability || !selectedTableAvailable || isTimeInPast;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  if (loading)
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading...</div>;

  if (!club)
    return <div className="text-center text-gray-500 mt-10">Club not found.</div>;

  const tableSummary = ["Pool", "Carom", "Snooker"]
    .map((key) => ({
      type: key,
      ...tables[key],
    }))
    .filter((item) => item.total > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-50 to-white px-5 lg:px-8 py-8 text-luxury-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4 bg-white border border-luxury-100 rounded-3xl shadow-sm px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-luxury-400 mb-2">
              Reserve your session
            </p>
            <h1 className="text-3xl font-bold text-luxury-900">{club.Name}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-luxury-500">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sport-500" />
                {club.Address}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-sport-500" />
                {club.OpenTime} – {club.CloseTime}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/billiards-club")}
              className="px-4 py-2 rounded-2xl border border-luxury-200 text-sm font-semibold text-luxury-600 hover:bg-luxury-50 transition-colors"
            >
              ← Browse other clubs
            </button>
            <button
              type="button"
              onClick={() => navigate("/homefeed")}
              className="px-4 py-2 rounded-2xl bg-sport-600 text-white text-sm font-semibold shadow-sport hover:bg-sport-500 transition-colors"
            >
              Back to Homefeed
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="bg-white rounded-3xl border border-luxury-100 shadow-lg p-6 space-y-6">
            <div>
              <p className="text-xs font-semibold text-sport-500 uppercase tracking-[0.4em] mb-1">
                Step 1
              </p>
              <h2 className="text-xl font-semibold text-luxury-900">Pick your schedule</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-luxury-600 mb-1">
                  Booking date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-2xl border border-luxury-200 py-2.5 px-3 text-sm focus:ring-2 focus:ring-sport-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-luxury-600 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Need a table near the entrance..."
                  className="w-full rounded-2xl border border-luxury-200 py-2.5 px-3 text-sm focus:ring-2 focus:ring-sport-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-luxury-600 mb-1">
                  Start time
                </label>
                <select
                  className="w-full rounded-2xl border border-luxury-200 py-2.5 px-3 text-sm focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  value={startHour ?? ""}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                >
                  <option value="">Select...</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {formatHour(t)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-luxury-600 mb-1">
                  End time
                </label>
                <select
                  className="w-full rounded-2xl border border-luxury-200 py-2.5 px-3 text-sm focus:ring-2 focus:ring-sport-500 focus:outline-none"
                  value={endHour ?? ""}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                >
                  <option value="">Select...</option>
                  {timeSlots
                    .filter((t) => !startHour || t > startHour)
                    .map((t) => (
                      <option key={t} value={t}>
                        {formatHour(t)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <button
              onClick={checkAvailable}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sport-600 to-sport-500 text-white font-semibold shadow-sport hover:shadow-sport/60 transition-all"
            >
              {available ? "Refresh availability" : "Check availability"}
            </button>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-sport-500 uppercase tracking-[0.4em] mb-1">
                  Step 2
                </p>
                <h2 className="text-xl font-semibold text-luxury-900">Choose a table style</h2>
              </div>
              <div className="space-y-3">
                {["Pool", "Carom", "Snooker"].map((t) => {
                  const statSource = available || tables;
                  const stat = statSource?.[t] || { total: 0, available: 0 };
                  const rate = rates[t];

                  return (
                    <label
                      key={t}
                      className={`flex flex-wrap items-center gap-4 border rounded-2xl p-4 cursor-pointer transition-all
                      hover:shadow-md ${
                        type === t ? "border-sport-400 bg-sport-50/40" : "border-luxury-100"
                      }`}
                    >
                      <div className="flex-1 min-w-[160px]">
                        <p className="text-base font-semibold text-luxury-900">{t}</p>
                        <p className="text-sm text-luxury-500">
                          {rate ? (
                            <>
                              <DollarSign size={14} className="inline mr-1 text-sport-500" />
                              {rate.toLocaleString()} VND / hour
                            </>
                          ) : (
                            "No pricing data"
                          )}
                        </p>
                      </div>
                      <div className="text-sm text-luxury-500">
                        {stat.available}/{stat.total} available
                      </div>
                      <input
                        type="radio"
                        value={t}
                        name="type"
                        checked={type === t}
                        onChange={(e) => setType(e.target.value)}
                        disabled={available && stat.available === 0}
                        className="w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Payment QR Code Step */}
            {paymentStep === 'payment' && qrUrl && (
              <div className="space-y-4 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <QrCode className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Scan to Pay</h3>
                </div>
                
                <div className="flex justify-center bg-white p-4 rounded-xl">
                  <img
                    src={qrUrl}
                    alt="Payment QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>

                <div className="bg-white rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Order Code:</span>
                    <span className="font-mono font-semibold text-gray-900">{orderCode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-lg font-bold text-orange-600">
                      {paymentAmount?.toLocaleString()} VND
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 text-center">
                  Please scan the QR code with your banking app. The system will automatically verify your payment.
                </p>

                <button
                  onClick={() => {
                    if (paymentPolling) clearInterval(paymentPolling);
                    setPaymentStep('booking');
                    setQrUrl(null);
                    setOrderCode(null);
                    setPaymentAmount(null);
                    setStatus(null);
                  }}
                  className="w-full py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel Payment
                </button>
              </div>
            )}

            {/* Success Step */}
            {paymentStep === 'success' && (
              <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900">Payment Successful!</h3>
                <p className="text-sm text-gray-600">Your booking has been confirmed.</p>
              </div>
            )}

            {/* Booking Form */}
            {paymentStep === 'booking' && (
              <div className="space-y-3">
                {status?.error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-2">
                    {status.error}
                  </p>
                )}
                {status?.success && (
                  <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-2xl px-4 py-2">
                    {status.success}
                  </p>
                )}

                <button
                  onClick={handleBook}
                  disabled={bookDisabled || !bookingDate || startHour === null || endHour === null}
                  className={`w-full py-3 rounded-2xl text-white font-semibold transition-all ${
                    bookDisabled || !bookingDate || startHour === null || endHour === null
                      ? "bg-luxury-200 cursor-not-allowed"
                      : "bg-luxury-900 hover:bg-black shadow-lg shadow-luxury-900/20"
                  }`}
                >
                  {submitting ? "Processing..." : 
                   (isTimeInPast ? "Cannot book past time" :
                   (!hasCheckedAvailability ? "Check availability first" : 
                   (!selectedTableAvailable ? "No tables available" : "Confirm Booking & Pay")))}
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-3xl border border-luxury-100 shadow p-6 space-y-4">
              <h3 className="text-lg font-semibold text-luxury-900">Club information</h3>
              {club.Description && (
                <p className="text-sm text-luxury-500">{club.Description}</p>
              )}
              <div className="space-y-3 text-sm text-luxury-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-sport-500 mt-0.5" />
                  <span>{club.Address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-sport-500 mt-0.5" />
                  <span>
                    {club.OpenTime} – {club.CloseTime}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-sport-500 mt-0.5" />
                  <span>Please arrive at least 10 minutes before your slot.</span>
                </div>
              </div>
            </div>

            {tableSummary.length > 0 && (
              <div className="bg-white rounded-3xl border border-luxury-100 shadow p-6 space-y-4">
                <h3 className="text-lg font-semibold text-luxury-900">Table overview</h3>
                <div className="space-y-3">
                  {tableSummary.map((item) => (
                    <div
                      key={item.type}
                      className="flex items-center justify-between rounded-2xl border border-luxury-100 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-luxury-900">{item.type}</p>
                        <p className="text-xs text-luxury-500">Total {item.total} tables</p>
                      </div>
                      <span className="text-sm font-semibold text-sport-600">
                        {item.available} available
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
