import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import billiardsClubApi from '../../api/billiardsClubApi';
import { toast } from 'react-toastify';
import ErrorToast from '../../components/ErrorToast/ErrorToast';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import userApi from '../../api/userApi';

// 🧭 Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// Automatically move map to current position
function MapAutoCenter({ position }) {
  const map = useMap();
  React.useEffect(() => {
    if (position?.lat && position?.lng) {
      map.setView([position.lat, position.lng]);
    }
  }, [position, map]);
  return null;
}

// 📍 Component for clicking on map to pick a location
function LocationPicker({ position, setPosition, setAddress, setError }) {
  useMapEvents({
    click: async (e) => {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newPos.lat}&lon=${newPos.lng}`
        );
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          toast.warning('No address found for this point');
          setAddress('');
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err);
        if (setError) setError(err);
      }
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={markerIcon}>
      <Popup>Selected Club Location</Popup>
    </Marker>
  ) : null;
}

const CreateClub = () => {
  const navigate = useNavigate();
  const { Datalogin, datauser } = useUser();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    Name: '',
    Address: '',
    Phone: '',
    Description: '',
    OpenTime: '09:00',
    CloseTime: '23:00',
    Location: { lat: 21.0285, lng: 105.8542 }, // default: Hanoi
  });

  // 🔍 Geocoding (convert address → coordinates)
  const geocodeAddress = async (address) => {
    if (!address) return toast.warning('Please enter an address first');
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setForm((prev) => ({
          ...prev,
          Location: { lat: parseFloat(lat), lng: parseFloat(lon) },
        }));
        toast.success('Location found on map');
      } else {
        toast.warning('Address not found');
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setSearching(false);
    }
  };

  // 🧾 Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 💾 Submit new club
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const response = await billiardsClubApi.createClub(form);
      
      // Lấy clubId từ response
      const clubId = response?.club?._id || response?.club?.id;
      
      if (clubId) {
        // Cập nhật clubId vào local storage
        try {
          // Fetch updated user info để đảm bảo đồng bộ
          const updatedUser = await userApi.getUserDetail();
          
          if (updatedUser) {
            const userData = {
              id: updatedUser.id || updatedUser._id,
              name: updatedUser.Name,
              avatar: updatedUser.Avatar,
              clubId: clubId,
              role: datauser?.role || 'partner',
            };
            Datalogin(userData);
          } else if (datauser) {
            // Fallback: cập nhật clubId từ data hiện có
            const userData = {
              ...datauser,
              clubId: clubId,
            };
            Datalogin(userData);
          }
        } catch (updateError) {
          console.error('Error updating user info:', updateError);
          // Vẫn cập nhật clubId nếu fetch user info thất bại
          if (datauser) {
            const userData = {
              ...datauser,
              clubId: clubId,
            };
            Datalogin(userData);
          }
        }
      }
      
      toast.success('Club created successfully!');
      navigate('/club-dashboard');
    } catch (err) {
      console.error('Error creating club:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 dark:from-gray-900 dark:to-gray-950 flex justify-center items-center p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-3xl w-full">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">
          Create a New Billiards Club
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Club Name *
            </label>
            <input
              type="text"
              name="Name"
              value={form.Name}
              onChange={handleChange}
              required
              placeholder="Enter your club name"
              className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Address *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                name="Address"
                value={form.Address}
                onChange={handleChange}
                required
                placeholder="Enter address or pick on map"
                className="flex-1 mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => geocodeAddress(form.Address)}
                disabled={searching}
                className={`px-4 py-2 mt-1 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all ${
                  searching ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {searching ? 'Searching...' : 'Find on Map'}
              </button>
            </div>
          </div>

          {/* 🗺️ Map Section */}
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 h-[400px]">
            <MapContainer
              center={[form.Location.lat, form.Location.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapAutoCenter position={form.Location} />
              <LocationPicker
                position={form.Location}
                setPosition={(pos) => setForm((prev) => ({ ...prev, Location: pos }))}
                setAddress={(addr) => setForm((prev) => ({ ...prev, Address: addr }))}
                setError={setError}
              />
            </MapContainer>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 Tip: Type an address and press <strong>Find on Map</strong> or click directly on the map.
          </p>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              type="text"
              name="Phone"
              value={form.Phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="Description"
              rows="3"
              value={form.Description}
              onChange={handleChange}
              placeholder="Short description about your club"
              className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Opening Time
              </label>
              <input
                type="time"
                name="OpenTime"
                value={form.OpenTime}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                Closing Time
              </label>
              <input
                type="time"
                name="CloseTime"
                value={form.CloseTime}
                onChange={handleChange}
                className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Club'}
          </button>
        </form>
      </div>
      <ErrorToast error={error} onClose={() => setError(null)} />
    </div>
  );
};

export default CreateClub;
