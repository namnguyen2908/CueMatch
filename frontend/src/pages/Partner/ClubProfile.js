import React, { useEffect, useState } from 'react';
import PartnerLayout from './PartnerLayout';
import { toast } from 'react-toastify';
import billiardsClubApi from '../../api/billiardsClubApi';
import ErrorToast from '../../components/ErrorToast/ErrorToast';
import {
  FaSave,
  FaStore,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaAlignLeft,
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🧭 Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// 🗺️ Automatically move map to marker
function MapAutoCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position?.lat && position?.lng) {
      map.setView([position.lat, position.lng]);
    }
  }, [position, map]);
  return null;
}

// 📍 Click-to-select map component (reverse geocoding)
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
          setAddress('');
          toast.warning('No address found for this location');
        }
      } catch (error) {
        console.error('❌ Reverse geocoding error:', error);
        if (setError) setError(error);
      }
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={markerIcon}>
      <Popup>Club Location</Popup>
    </Marker>
  ) : null;
}

const ClubProfile = () => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    Name: '',
    Address: '',
    Phone: '',
    Description: '',
    OpenTime: '',
    CloseTime: '',
    Location: { lat: 21.0285, lng: 105.8542 },
  });

  // 🔎 Convert address to coordinates (geocoding)
  const geocodeAddress = async (address) => {
    if (!address) return toast.warning('Please enter an address first');
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setFormData((prev) => ({
          ...prev,
          Location: { lat: parseFloat(lat), lng: parseFloat(lon) },
        }));
        toast.success('Location found on map');
      } else {
        toast.warning('Address not found on map');
      }
    } catch (err) {
      setError(err);
    } finally {
      setSearching(false);
    }
  };

  const fetchClub = async () => {
    try {
      setError(null);
      const response = await billiardsClubApi.getMyClubs();
      if (response.length > 0) {
        const clubData = response[0];
        setClub(clubData);
        setFormData({
          Name: clubData.Name || '',
          Address: clubData.Address || '',
          Phone: clubData.Phone || '',
          Description: clubData.Description || '',
          OpenTime: clubData.OpenTime || '',
          CloseTime: clubData.CloseTime || '',
          Location: clubData.Location || { lat: 21.0285, lng: 105.8542 },
        });
      } else {
        toast.warning('You have not created any clubs yet');
      }
    } catch (error) {
      console.error('❌ Failed to load club:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!club?._id) return;
    setSaving(true);
    setError(null);
    try {
      await billiardsClubApi.updateClub(club._id, formData);
      toast.success('Club details updated successfully');
    } catch (error) {
      console.error('❌ Update error:', error);
      setError(error);
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ icon: Icon, label, name, type = 'text', placeholder }) => (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
        </div>
        <input
          id={name}
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
      </div>
    </div>
  );

  return (
    <PartnerLayout>
      <div className="max-w-6xl mx-auto w-full p-6 lg:p-8">
          {loading ? (
            <div className="animate-pulse h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FaStore size={24} />
                  Club Information
                </h2>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField icon={FaStore} label="Club Name" name="Name" placeholder="Enter your billiards club name" />
                  <InputField icon={FaPhone} label="Phone Number" name="Phone" placeholder="Enter contact number" />
                  <InputField icon={FaClock} label="Opening Time" name="OpenTime" type="time" />
                  <InputField icon={FaClock} label="Closing Time" name="CloseTime" type="time" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <FaAlignLeft className="text-gray-400" size={18} />
                    </div>
                    <textarea
                      id="Description"
                      name="Description"
                      rows={6}
                      value={formData.Description}
                      onChange={handleChange}
                      placeholder="Write a short description about your billiards club..."
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>
                </div>

                {/* Address + Map */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Address and Map Location
                  </label>

                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      </div>
                      <input
                        id="Address"
                        type="text"
                        name="Address"
                        value={formData.Address}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            Address: e.target.value,
                          }))
                        }
                        placeholder="Enter club address or click directly on map"
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => geocodeAddress(formData.Address)}
                      disabled={searching}
                      className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 ${searching ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {searching ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Searching...
                        </>
                      ) : (
                        <>
                          <FaMapMarkerAlt size={16} />
                          Locate
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 h-[500px]">
                    <MapContainer
                      center={[formData.Location.lat, formData.Location.lng]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapAutoCenter position={formData.Location} />
                      <LocationPicker
                        position={formData.Location}
                        setPosition={(pos) =>
                          setFormData((prev) => ({ ...prev, Location: pos }))
                        }
                        setAddress={(addr) =>
                          setFormData((prev) => ({ ...prev, Address: addr }))
                        }
                        setError={setError}
                      />
                    </MapContainer>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    💡 You can type an address and press <strong>Locate</strong> or click directly on the map to pick the club’s position.
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={saving}
                    className={`inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
                      saving ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
      <ErrorToast error={error} onClose={() => setError(null)} />
    </PartnerLayout>
  );
};

export default ClubProfile;