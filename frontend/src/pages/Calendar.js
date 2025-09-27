import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, Views, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import vi from "date-fns/locale/vi";
import "react-big-calendar/lib/css/react-big-calendar.css";
import matchingApi from "../api/matchingApi";
import Header from "../components/Header/Header";
import { DateTime } from "luxon";

const locales = { vi };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });


const CustomToolbar = ({ label, onNavigate, onView, view }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h2 className="text-2xl font-bold text-gray-800">{label}</h2>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Date navigation */}
        <div className="flex gap-1">
          <button
            className="p-2 rounded-md hover:bg-gray-200 transition"
            onClick={() => onNavigate("PREV")}
          >
            ←
          </button>
          <button
            className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            onClick={() => onNavigate("TODAY")}
          >
            Today
          </button>
          <button
            className="p-2 rounded-md hover:bg-gray-200 transition"
            onClick={() => onNavigate("NEXT")}
          >
            →
          </button>
        </div>

        {/* View mode selection */}
        <div className="flex gap-1 ml-4 border rounded overflow-hidden">
          {["month", "day", "agenda"].map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={`px-3 py-1 text-sm capitalize ${view === v ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Custom Event (Google-like chip) ---------- */
const EventChip = ({ event }) => {
  const colorMap = {
    Friendly: "#1E90FF",
    Practice: "#10B981",
    Match: "#EF4444",
  };
  const accent = colorMap[event.playType] || "#6366F1";

  return (
    <div
      className="flex flex-col px-2 py-1 rounded shadow-sm hover:shadow-md cursor-pointer transition bg-white border-l-4"
      style={{ borderColor: accent }}
    >
      <span className="text-xs text-gray-400">
        {format(event.start, "HH:mm")}
      </span>
      <span className="text-sm font-medium truncate">{event.title}</span>
      {event.location && (
        <span className="text-xs text-gray-500 truncate">{event.location}</span>
      )}
    </div>
  );
};

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState("month");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matches = await matchingApi.getUpcomingMatches();

        const eventList = matches.map((match, index) => {
          const startDate = DateTime.fromISO(match.MatchDate)
            .setZone("Asia/Ho_Chi_Minh")
            .toFormat("yyyy-MM-dd");

          return {
            id: index,
            title: `${match.PlayType} with ${match.From.Name === match.To.Name ? "Yourself" : match.From.Name}`,
            start: new Date(`${startDate}T${match.TimeStart}`),
            end: new Date(`${startDate}T${match.TimeEnd}`),
            location: match.Location,
            opponent: match.From.Name,
            playType: match.PlayType,
          };
        });

        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      }
    };

    fetchMatches();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const eventPropGetter = () => ({
    style: {
      backgroundColor: "transparent",
      border: "none",
      padding: 0,
    },
  });

  const dayPropGetter = () => ({ style: {} });

  return (
    <>
      <Header />
      <div className="pt-28 px-4 sm:px-6 bg-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 sm:p-8">
          <BigCalendar
            localizer={localizer}
            events={events}
            defaultView={Views.MONTH}
            view={currentView}
            onView={(v) => setCurrentView(v)}
            views={["month", "day", "agenda"]}
            startAccessor="start"
            endAccessor="end"
            components={{
              toolbar: CustomToolbar,
              event: (props) => (
                <div onClick={() => handleSelectEvent(props.event)}>
                  <EventChip event={props.event} />
                </div>
              ),
            }}
            style={{ height: "75vh", backgroundColor: "transparent" }}
            eventPropGetter={eventPropGetter}
            dayPropGetter={dayPropGetter}
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

          {/* Event Detail Modal */}
          {selectedEvent && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
              onClick={() => setSelectedEvent(null)}
            >
              <div
                className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                  aria-label="Close modal"
                >
                  &times;
                </button>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {selectedEvent.title}
                </h3>

                <div className="text-sm text-gray-600 mb-2">
                  📅 <strong>Date:</strong> {format(selectedEvent.start, "PPP")}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  ⏰ <strong>Time:</strong> {format(selectedEvent.start, "HH:mm")} - {format(selectedEvent.end, "HH:mm")}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  📍 <strong>Location:</strong> {selectedEvent.location || "Unknown"}
                </div>
                <div className="text-sm text-gray-600">
                  🤼‍♂️ <strong>Opponent:</strong> {selectedEvent.opponent}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Calendar;
