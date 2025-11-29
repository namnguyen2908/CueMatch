import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import billiardsClubApi from '../api/billiardsClubApi';
import {
  MapPin,
  Phone,
  Clock,
  Search,
  Users,
} from 'lucide-react';

export default function BilliardsClubList() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showOpenNow, setShowOpenNow] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const navigate = useNavigate();

  const parseTimeToMinutes = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const isClubOpenNow = (club) => {
    const openMinutes = parseTimeToMinutes(club.OpenTime);
    const closeMinutes = parseTimeToMinutes(club.CloseTime);
    if (openMinutes === null || closeMinutes === null) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (closeMinutes < openMinutes) {
      return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    }

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  };

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await billiardsClubApi.getAllClubs();
        setClubs(data);
      } catch (err) {
        console.error('❌ Error fetching clubs list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('ready');
      },
      () => setLocationStatus('error')
    );
  };

  const getClubCoordinates = (club) => {
    if (!club.Location) return null;
    if (
      typeof club.Location.lat === 'number' &&
      typeof club.Location.lng === 'number'
    ) {
      return { lat: club.Location.lat, lng: club.Location.lng };
    }
    if (Array.isArray(club.Location.coordinates)) {
      const [lng, lat] = club.Location.coordinates;
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { lat, lng };
      }
    }
    return null;
  };

  const calculateDistanceKm = (club) => {
    if (!userLocation) return null;
    const clubCoords = getClubCoordinates(club);
    if (!clubCoords) return null;

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(clubCoords.lat - userLocation.lat);
    const dLon = toRad(clubCoords.lng - userLocation.lng);
    const lat1 = toRad(userLocation.lat);
    const lat2 = toRad(clubCoords.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredClubs = useMemo(() => {
    let result = clubs.filter((club) =>
      club.Name?.toLowerCase().includes(search.toLowerCase().trim())
    );

    if (showOpenNow) {
      result = result.filter((club) => isClubOpenNow(club));
    }

    if (showNearby) {
      if (userLocation) {
        result = result
          .map((club) => ({
            ...club,
            distance: calculateDistanceKm(club),
          }))
          .filter((club) => club.distance !== null)
          .sort((a, b) => a.distance - b.distance);
      } else {
        result = [];
      }
    }

    return result;
  }, [clubs, search, showOpenNow, showNearby, userLocation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading billiards lounges...
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        No clubs found at the moment.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-50 to-white px-5 lg:px-16 py-8 text-luxury-900">
      <div className="max-w-7xl mx-auto space-y-10">
        <section className="bg-white rounded-3xl shadow-lg border border-luxury-100 p-6 space-y-4">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <h1 className="text-2xl font-semibold text-luxury-900">
              Billiards Clubs
            </h1>
            <button
              type="button"
              onClick={() => navigate('/homefeed')}
              className="inline-flex items-center gap-2 rounded-2xl border border-sport-100 px-4 py-2 text-sm font-semibold text-sport-600 bg-sport-50 hover:bg-sport-100 transition-colors"
            >
              ← Back to Homefeed
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by club name"
                className="w-full rounded-2xl border border-luxury-100 py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-sport-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowOpenNow((prev) => !prev)}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${showOpenNow
                  ? 'bg-sport-600 text-white border-sport-600 shadow-lg shadow-sport-500/30'
                  : 'border-luxury-100 text-luxury-500 hover:border-sport-200 hover:text-sport-600'
                }`}
            >
              <Clock className="w-4 h-4" />
              Only show clubs open now
            </button>

            <button
              type="button"
              onClick={() => {
                if (!showNearby) {
                  if (!userLocation) {
                    requestUserLocation();
                  }
                  setShowNearby(true);
                } else {
                  setShowNearby(false);
                }
              }}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${showNearby
                  ? 'bg-sport-600 text-white border-sport-600 shadow-lg shadow-sport-500/30'
                  : 'border-luxury-100 text-luxury-500 hover:border-sport-200 hover:text-sport-600'
                }`}
            >
              <MapPin className="w-4 h-4" />
              Showing nearest clubs
            </button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredClubs.map((club) => {
            const openNow = isClubOpenNow(club);
            const scheduleAvailable = club.OpenTime && club.CloseTime;
            return (
              <div
                key={club._id}
                className="group bg-white border border-luxury-100 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col p-6 h-full"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-luxury-900">
                      {club.Name}
                    </h2>
                    {club.Description && (
                      <p className="text-sm text-luxury-500 mt-1 max-w-md">
                        {club.Description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${scheduleAvailable
                        ? openNow
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                        : 'bg-luxury-100 text-luxury-500'
                      }`}
                  >
                    {scheduleAvailable
                      ? openNow
                        ? 'Open now'
                        : 'Closed'
                      : 'Hours unavailable'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-luxury-600 flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-sport-500 w-4 h-4" />
                    <span>{club.Address || 'Address updating...'}</span>
                  </div>
                  {showNearby && typeof club.distance === 'number' && (
                    <div className="text-xs text-sport-500">
                      ~{club.distance.toFixed(1)} km away
                    </div>
                  )}
                  {club.Phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="text-sport-500 w-4 h-4" />
                      <span>{club.Phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="text-sport-500 w-4 h-4" />
                    <span>
                      {scheduleAvailable
                        ? `${club.OpenTime} – ${club.CloseTime}`
                        : 'Operating hours not provided'}
                    </span>
                  </div>
                  {club.Tables?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="text-sport-500 w-4 h-4" />
                      <span>{club.Tables.length} tables available</span>
                    </div>
                  )}
                  {club.Capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="text-sport-500 w-4 h-4" />
                      <span>Capacity: {club.Capacity} guests</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/book-table/${club._id}`)}
                  className="mt-4 w-full rounded-2xl bg-gradient-to-r from-sport-600 to-sport-500 text-white py-3 text-sm font-semibold shadow-lg shadow-sport-500/30 hover:shadow-sport-500/40 transition-all"
                >
                  Book a Table
                </button>
              </div>
            );
          })}
        </section>

        {filteredClubs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-luxury-200">
            <p className="text-lg font-semibold text-luxury-700">
              No clubs match your filters yet.
            </p>
            <p className="text-sm text-luxury-500 mt-2">
              Try a different area or show all venues to explore more options.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}