import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, Views, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import vi from "date-fns/locale/vi";
import "react-big-calendar/lib/css/react-big-calendar.css";
import matchingApi from "../api/matchingApi";
import billiardsBookingApi from "../api/billiardsBookingApi";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { DateTime } from "luxon";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";
import { Filter, X, ChevronDown, XCircle } from "lucide-react";

const locales = { vi };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CustomToolbar = ({ label, onNavigate, onView, view, themeStyles }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
    <h2 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold ${themeStyles.sectionHeading} truncate`}>
      {label}
    </h2>
    <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 items-center">
      <div className="flex gap-0.5 sm:gap-1">
        <button 
          className={`p-1 sm:p-1.5 md:p-2 rounded-md text-xs sm:text-sm md:text-base ${themeStyles.navButton} min-w-[32px] sm:min-w-[36px]`} 
          onClick={() => onNavigate("PREV")}
          aria-label="Previous"
        >
          ←
        </button>
        <button
          className="px-2 sm:px-3 md:px-4 py-1 sm:py-1 md:py-1.5 rounded-md bg-orange-500 text-white text-[10px] sm:text-xs md:text-sm font-medium hover:bg-orange-600 whitespace-nowrap"
          onClick={() => onNavigate("TODAY")}
        >
          Today
        </button>
        <button 
          className={`p-1 sm:p-1.5 md:p-2 rounded-md text-xs sm:text-sm md:text-base ${themeStyles.navButton} min-w-[32px] sm:min-w-[36px]`} 
          onClick={() => onNavigate("NEXT")}
          aria-label="Next"
        >
          →
        </button>
      </div>
      <div className={`flex gap-0.5 sm:gap-1 rounded overflow-hidden ${themeStyles.toolbarGroup}`}>
        {["month", "day", "agenda"].map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs md:text-sm capitalize ${
              view === v ? themeStyles.toolbarButtonActive : themeStyles.toolbarButton
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const EventChip = ({ event, themeStyles }) => {
  const colorMap = {
    Friendly: "#38bdf8",
    Practice: "#34d399",
    Match: "#f97316",
  };
  const accent = event.type === "booking" ? "#14b8a6" : colorMap[event.playType] || "#c084fc";

  return (
    <div 
      className={`flex flex-col px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg ${themeStyles.chipContainer}`} 
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <span className={`text-[10px] sm:text-xs ${themeStyles.chipTime} leading-tight`}>
        {format(event.start, "HH:mm")}
      </span>
      <span className={`text-[10px] sm:text-xs md:text-sm font-medium truncate ${themeStyles.sectionHeading} leading-tight`}>
        {event.type === "booking" ? event.clubName || "Billiards booking" : event.title}
      </span>
      {event.location && (
        <span className={`text-[9px] sm:text-[10px] md:text-xs truncate ${themeStyles.chipTime} leading-tight`}>
          {event.location}
        </span>
      )}
    </div>
  );
};

const eventTypeFilters = [
  { label: "Matching", value: "matching", color: "#f97316" },
  { label: "Table Booking", value: "booking", color: "#14b8a6" },
];

const themeConfig = {
  dark: {
    pageBg: "text-gray-100",
    cardBg: "bg-gray-900/70",
    border: "border-gray-800",
    cardShadow: "shadow-2xl shadow-black/40",
    sectionHeading: "text-white",
    secondaryText: "text-gray-400",
    badgeNeutral: "bg-gray-800/80 text-gray-300 border border-gray-700",
    badgeHighlight: "bg-orange-500/20 text-orange-200 border border-orange-400/40",
    filterButtonActive: "bg-gray-800/80 border-gray-600 text-white",
    filterButtonInactive: "bg-transparent border-gray-800 text-gray-400 hover:text-gray-200",
    upcomingCard: "border border-gray-800 bg-gray-950/40 hover:border-gray-600",
    overlay: "bg-black/70",
    modalBg: "bg-gray-900 text-gray-100 border border-gray-700",
    modalLabel: "text-gray-300",
    chipContainer: "bg-gray-900/80 text-gray-100 border border-gray-700",
    chipTime: "text-gray-400",
    toolbarButton: "text-gray-300 hover:bg-gray-800",
    toolbarButtonActive: "bg-orange-500 text-white",
    toolbarGroup: "bg-gray-900/70 border border-gray-700",
    navButton: "bg-gray-800/60 text-gray-200 hover:bg-gray-700",
    bigCalendarBg: "bg-gray-900/70 border border-gray-800",
  },
  light: {
    pageBg: "text-slate-900",
    cardBg: "bg-white",
    border: "border-slate-200",
    cardShadow: "shadow-xl shadow-slate-200",
    sectionHeading: "text-slate-900",
    secondaryText: "text-slate-500",
    badgeNeutral: "bg-slate-100 text-slate-600 border border-slate-200",
    badgeHighlight: "bg-orange-100 text-orange-700 border border-orange-200",
    filterButtonActive: "bg-white border-slate-300 text-slate-900 shadow-sm",
    filterButtonInactive: "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700",
    upcomingCard: "border border-slate-200 bg-white hover:border-slate-300",
    overlay: "bg-black/40",
    modalBg: "bg-white text-slate-900 border border-slate-200",
    modalLabel: "text-slate-600",
    chipContainer: "bg-white text-slate-900 border border-slate-200",
    chipTime: "text-slate-500",
    toolbarButton: "text-slate-500 hover:bg-slate-100",
    toolbarButtonActive: "bg-slate-900 text-white",
    toolbarGroup: "bg-white border border-slate-200",
    navButton: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    bigCalendarBg: "bg-white border border-slate-200",
  },
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState("month");
  const [activeSources, setActiveSources] = useState(() => eventTypeFilters.map((filter) => filter.value));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [calendarHeight, setCalendarHeight] = useState("75vh");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState({ type: '', text: '' });
  const { theme } = useTheme();
  const { datauser } = useUser();
  const themeStyles = themeConfig[theme];

  useEffect(() => {
    const updateCalendarHeight = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 640) {
        // Mobile: Use calc to account for header and padding
        setCalendarHeight(`${Math.max(400, height * 0.5)}px`);
      } else if (width < 1024) {
        setCalendarHeight(`${Math.max(500, height * 0.6)}px`);
      } else {
        setCalendarHeight("75vh");
      }
    };

    updateCalendarHeight();
    window.addEventListener("resize", updateCalendarHeight);
    return () => window.removeEventListener("resize", updateCalendarHeight);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [matches, bookingResponse] = await Promise.all([
          matchingApi.getUpcomingMatches(),
          datauser?.id
            ? billiardsBookingApi.getUserBookings({
                status: "pending,confirmed,completed",
              })
            : Promise.resolve({ bookings: [] }),
        ]);

        const matchEvents = matches.map((match, index) => {
          const startDate = DateTime.fromISO(match.MatchDate).setZone("Asia/Ho_Chi_Minh").toFormat("yyyy-MM-dd");
          return {
            id: `match-${index}`,
            title: `${match.PlayType} with ${match.From.Name === match.To.Name ? "yourself" : match.From.Name}`,
            start: new Date(`${startDate}T${match.TimeStart}`),
            end: new Date(`${startDate}T${match.TimeEnd}`),
            location: match.Location,
            opponent: match.From.Name,
            playType: match.PlayType,
            type: "matching",
          };
        });

        const bookingEvents = (bookingResponse?.bookings || []).map((booking) => {
          const toDate = (hourValue) => {
            const safeHour = typeof hourValue === "number" ? hourValue : 0;
            const hour = Math.floor(safeHour);
            const minutes = Math.round((safeHour - hour) * 60);
            return DateTime.fromISO(booking.BookingDate).setZone("Asia/Ho_Chi_Minh").set({ hour, minute: minutes }).toJSDate();
          };

          return {
            id: `booking-${booking._id}`,
            title: `Booking • ${booking.Club?.Name || "Billiards Club"}`,
            start: toDate(booking.StartHour || 0),
            end: toDate(booking.EndHour != null ? booking.EndHour : (booking.StartHour || 0) + 1),
            location: booking.Club?.Address || "TBD",
            clubName: booking.Club?.Name,
            tableNumber: booking.Table?.TableNumber,
            tableType: booking.Table?.Type,
            bookingStatus: booking.Status,
            bookingId: booking._id,
            type: "booking",
          };
        });

        setEvents([...matchEvents, ...bookingEvents]);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      }
    };

    fetchEvents();
  }, [datauser?.id]);

  const filteredEvents =
    activeSources.length === eventTypeFilters.length
      ? events
      : events.filter((event) => activeSources.includes(event.type));

  const sortedEvents = [...filteredEvents].sort((a, b) => a.start - b.start);
  const nextEvent = sortedEvents[0];
  const completedFilters = activeSources.length === eventTypeFilters.length;

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      setCancelMessage({ type: '', text: '' });
      
      const response = await billiardsBookingApi.cancelBooking(bookingId);
      
      setCancelMessage({ 
        type: 'success', 
        text: response.message || 'Booking cancelled successfully' 
      });
      
      // Refresh events
      const fetchEvents = async () => {
        try {
          const [matches, bookingResponse] = await Promise.all([
            matchingApi.getUpcomingMatches(),
            datauser?.id
              ? billiardsBookingApi.getUserBookings({
                  status: "pending,confirmed,completed",
                })
              : Promise.resolve({ bookings: [] }),
          ]);

          const matchEvents = matches.map((match, index) => {
            const startDate = DateTime.fromISO(match.MatchDate).setZone("Asia/Ho_Chi_Minh").toFormat("yyyy-MM-dd");
            return {
              id: `match-${index}`,
              title: `${match.PlayType} with ${match.From.Name === match.To.Name ? "yourself" : match.From.Name}`,
              start: new Date(`${startDate}T${match.TimeStart}`),
              end: new Date(`${startDate}T${match.TimeEnd}`),
              location: match.Location,
              opponent: match.From.Name,
              playType: match.PlayType,
              type: "matching",
            };
          });

          const bookingEvents = (bookingResponse?.bookings || []).map((booking) => {
            const toDate = (hourValue) => {
              const safeHour = typeof hourValue === "number" ? hourValue : 0;
              const hour = Math.floor(safeHour);
              const minutes = Math.round((hourValue - hour) * 60);
              return DateTime.fromISO(booking.BookingDate).setZone("Asia/Ho_Chi_Minh").set({ hour, minute: minutes }).toJSDate();
            };

            return {
              id: `booking-${booking._id}`,
              title: `Booking • ${booking.Club?.Name || "Billiards Club"}`,
              start: toDate(booking.StartHour || 0),
              end: toDate(booking.EndHour != null ? booking.EndHour : (booking.StartHour || 0) + 1),
              location: booking.Club?.Address || "TBD",
              clubName: booking.Club?.Name,
              tableNumber: booking.Table?.TableNumber,
              tableType: booking.Table?.Type,
              bookingStatus: booking.Status,
              bookingId: booking._id,
              type: "booking",
            };
          });

          setEvents([...matchEvents, ...bookingEvents]);
        } catch (error) {
          console.error("Error fetching calendar events:", error);
        }
      };

      fetchEvents();
      
      // Close modal
      setSelectedEvent(null);
      
      // Clear message after 5 seconds
      setTimeout(() => setCancelMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      setCancelMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to cancel booking' 
      });
      setTimeout(() => setCancelMessage({ type: '', text: '' }), 5000);
    } finally {
      setCancellingId(null);
    }
  };

  const canCancelBooking = (event) => {
    if (event.type !== 'booking' || !event.bookingId) return false;
    
    // Can cancel if status is pending or confirmed
    if (!['pending', 'confirmed'].includes(event.bookingStatus)) {
      return false;
    }

    // Check if cancellation is at least 1 hour before start time
    const now = new Date();
    const startDateTime = event.start;
    const timeUntilStart = startDateTime - now;
    const oneHourInMs = 60 * 60 * 1000;

    return timeUntilStart >= oneHourInMs;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="fixed inset-0 bg-mesh-light dark:bg-mesh-dark pointer-events-none opacity-40"></div>
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar variant="overlay" isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="pt-20 sm:pt-24 md:pt-28 relative z-10 flex flex-col lg:flex-row min-h-screen font-sans">
        <div className="hidden lg:block w-[250px] flex-shrink-0">
          <Sidebar />
        </div>
        <div className={`flex-1 px-3 sm:px-4 md:px-6 pb-3 sm:pb-6 md:pb-8 lg:pb-12 ${themeStyles.pageBg}`}>
          <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
            {/* Hero Section - Compact on mobile */}
            <div className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 ${themeStyles.cardShadow}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold ${themeStyles.sectionHeading} truncate`}>
                    Calendar Hub
                  </h1>
                  <p className={`${themeStyles.secondaryText} mt-1 text-xs sm:text-sm md:text-base hidden sm:block`}>
                    Track challenges, friendly matches, and practice sessions from one place.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 shrink-0">
                  <span className={`px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs md:text-sm ${themeStyles.badgeNeutral} whitespace-nowrap`}>
                    {events.length} events
                  </span>
                  {nextEvent && (
                    <span className={`px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs md:text-sm ${themeStyles.badgeHighlight} whitespace-nowrap`}>
                      Next: {format(nextEvent.start, "MMM dd")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-3 sm:mb-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border ${themeStyles.border} ${themeStyles.cardBg} ${themeStyles.cardShadow} transition active:scale-[0.98]`}
              >
                <div className="flex items-center gap-2">
                  <Filter className={`w-4 h-4 sm:w-5 sm:h-5 ${themeStyles.sectionHeading}`} />
                  <span className={`font-semibold text-sm sm:text-base ${themeStyles.sectionHeading}`}>
                    Filters & Events
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''} ${themeStyles.secondaryText}`} />
              </button>
            </div>

            <div className="grid gap-4 sm:gap-5 md:gap-6 lg:grid-cols-[280px,1fr] xl:grid-cols-[320px,1fr]">
              {/* Filter Sidebar - Hidden on mobile, shown when toggled */}
              <aside className={`space-y-4 sm:space-y-5 md:space-y-6 ${isFilterOpen ? 'block' : 'hidden'} lg:block`}>
                <section className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5`}>
                  <header className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className={`text-sm sm:text-base md:text-lg font-semibold ${themeStyles.sectionHeading}`}>Quick filters</h2>
                    <div className="flex items-center gap-2">
                      <button
                        className={`text-[10px] sm:text-xs transition ${themeStyles.secondaryText} hidden lg:block`}
                        onClick={() =>
                          setActiveSources(completedFilters ? [] : eventTypeFilters.map((filter) => filter.value))
                        }
                      >
                        {completedFilters ? "Clear all" : "Select all"}
                      </button>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className={`lg:hidden p-1 rounded-lg ${themeStyles.secondaryText} hover:opacity-70 transition`}
                        aria-label="Close filters"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </header>
                  <div className="lg:hidden mb-2 sm:mb-3">
                    <button
                      className={`text-[10px] sm:text-xs transition ${themeStyles.secondaryText} underline`}
                      onClick={() =>
                        setActiveSources(completedFilters ? [] : eventTypeFilters.map((filter) => filter.value))
                      }
                    >
                      {completedFilters ? "Clear all" : "Select all"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
                    {eventTypeFilters.map(({ label, value, color }) => {
                      const active = activeSources.includes(value);
                      return (
                        <button
                          key={value}
                          onClick={() =>
                            setActiveSources((prev) =>
                              prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
                            )
                          }
                          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border text-[10px] sm:text-xs md:text-sm transition ${
                            active ? themeStyles.filterButtonActive : themeStyles.filterButtonInactive
                          }`}
                        >
                          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="whitespace-nowrap">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3 md:space-y-4`}>
                  <header className="flex items-center justify-between">
                    <h2 className={`text-sm sm:text-base md:text-lg font-semibold ${themeStyles.sectionHeading}`}>Upcoming events</h2>
                    <span className={`text-[10px] sm:text-xs md:text-sm ${themeStyles.secondaryText} whitespace-nowrap`}>
                      {sortedEvents.length > 0 ? `${sortedEvents.length}` : "0"}
                    </span>
                  </header>
                  <div className="space-y-2 sm:space-y-3">
                    {sortedEvents.slice(0, 4).map((event) => (
                      <article
                        key={event.id}
                        className={`flex flex-col gap-1 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 cursor-pointer transition-transform active:scale-[0.98] ${themeStyles.upcomingCard}`}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsFilterOpen(false);
                        }}
                      >
                        <div className={`flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-wider ${themeStyles.secondaryText}`}>
                          <span className="truncate">{event.type === "booking" ? "Table booking" : event.playType || "Matching"}</span>
                          <span className="shrink-0 ml-2">{format(event.start, "dd MMM")}</span>
                        </div>
                        <p className={`font-medium text-xs sm:text-sm md:text-base ${themeStyles.sectionHeading} truncate`}>
                          {event.type === "booking" ? event.clubName || event.title : event.title}
                        </p>
                        <p className={`text-[10px] sm:text-xs md:text-sm ${themeStyles.secondaryText} truncate`}>
                          {format(event.start, "HH:mm")} • {event.location || "Updating soon"}
                        </p>
                      </article>
                    ))}
                  </div>
                  {sortedEvents.length === 0 && (
                    <p className={`${themeStyles.secondaryText} text-[10px] sm:text-xs md:text-sm`}>
                      No schedule yet—start by creating a new match.
                    </p>
                  )}
                </section>
              </aside>

              <div className={`${themeStyles.bigCalendarBg} rounded-2xl sm:rounded-3xl p-2 sm:p-3 md:p-4 lg:p-6 ${themeStyles.cardShadow} overflow-hidden`}>
                <div className="h-full overflow-x-auto">
                  <BigCalendar
                    localizer={localizer}
                    events={filteredEvents}
                    defaultView={Views.MONTH}
                    view={currentView}
                    onView={(v) => setCurrentView(v)}
                    views={["month", "day", "agenda"]}
                    startAccessor="start"
                    endAccessor="end"
                    components={{
                      toolbar: (props) => <CustomToolbar {...props} themeStyles={themeStyles} />,
                      event: (props) => (
                        <div onClick={() => setSelectedEvent(props.event)}>
                          <EventChip event={props.event} themeStyles={themeStyles} />
                        </div>
                      ),
                    }}
                    style={{ height: calendarHeight, minHeight: "400px", backgroundColor: "transparent" }}
                    eventPropGetter={() => ({ style: { backgroundColor: "transparent", border: "none", padding: 0 } })}
                    dayPropGetter={() => ({ style: {} })}
                    messages={{
                      next: "Next",
                      today: "Today",
                      previous: "Previous",
                      month: "Month",
                      day: "Day",
                      agenda: "Agenda",
                      date: "Date",
                      time: "Time",
                      event: "Event",
                      noEventsInRange: "No events in this range",
                    }}
                  />
                </div>
              </div>
            </div>

            {selectedEvent && (
              <div 
                className={`fixed inset-0 flex items-center justify-center ${themeStyles.overlay} z-50 p-3 sm:p-4`} 
                onClick={() => setSelectedEvent(null)}
              >
                <div
                  className={`${themeStyles.modalBg} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 max-w-md w-full relative max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 md:right-4 opacity-60 hover:opacity-100 transition p-1.5 sm:p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </button>
                  <h3 className={`text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4 pr-10 sm:pr-12 ${themeStyles.sectionHeading} break-words`}>
                    {selectedEvent.title}
                  </h3>
                  <div className={`text-[11px] sm:text-xs md:text-sm mb-2 sm:mb-3 ${themeStyles.modalLabel} break-words`}>
                    📅 <strong>Date:</strong> {format(selectedEvent.start, "PPP")}
                  </div>
                  <div className={`text-[11px] sm:text-xs md:text-sm mb-2 sm:mb-3 ${themeStyles.modalLabel}`}>
                    ⏰ <strong>Time:</strong> {format(selectedEvent.start, "HH:mm")} - {format(selectedEvent.end, "HH:mm")}
                  </div>
                  <div className={`text-[11px] sm:text-xs md:text-sm mb-2 sm:mb-3 ${themeStyles.modalLabel} break-words`}>
                    📍 <strong>Location:</strong> {selectedEvent.location || "Unknown"}
                  </div>
                  {selectedEvent.opponent && (
                    <div className={`text-[11px] sm:text-xs md:text-sm ${themeStyles.modalLabel} break-words`}>
                      🤼‍♂️ <strong>Opponent:</strong> {selectedEvent.opponent}
                    </div>
                  )}
                  {selectedEvent.type === 'booking' && selectedEvent.tableNumber && (
                    <div className={`text-[11px] sm:text-xs md:text-sm ${themeStyles.modalLabel} break-words`}>
                      🎱 <strong>Table:</strong> {selectedEvent.tableNumber} ({selectedEvent.tableType})
                    </div>
                  )}
                  
                  {/* Cancel Message */}
                  {cancelMessage.text && (
                    <div className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                      cancelMessage.type === 'success' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {cancelMessage.text}
                    </div>
                  )}

                  {/* Cancel Button for Bookings */}
                  {selectedEvent.type === 'booking' && canCancelBooking(selectedEvent) && (
                    <button
                      onClick={() => handleCancelBooking(selectedEvent.bookingId)}
                      disabled={cancellingId === selectedEvent.bookingId}
                      className={`mt-3 sm:mt-4 w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-red-500 text-white text-xs sm:text-sm font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
                    >
                      <XCircle className="w-4 h-4" />
                      {cancellingId === selectedEvent.bookingId ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
