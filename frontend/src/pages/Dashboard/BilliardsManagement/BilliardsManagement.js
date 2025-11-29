// src/pages/BilliardsManagement.js
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';
import billiardsClubApi from '../../../api/billiardsClubApi';
import ErrorToast from '../../../components/ErrorToast/ErrorToast';

// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const DEFAULT_CENTER = [21.028511, 105.854167];

const BilliardsManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchClubs = async () => {
      try {
        const data = await billiardsClubApi.getAllClubs();
        if (!isMounted) return;
        setClubs(data || []);
      } catch (err) {
        console.error('Fetch clubs error:', err);
        if (!isMounted) return;
        setError('Unable to load billiards clubs.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClubs();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const mapCenter = useMemo(() => {
    const firstWithLocation = clubs.find(
      (club) => club?.Location?.lat && club?.Location?.lng
    );
    return firstWithLocation
      ? [firstWithLocation.Location.lat, firstWithLocation.Location.lng]
      : DEFAULT_CENTER;
  }, [clubs]);

  const clubsWithLocation = useMemo(
    () =>
      clubs.filter((club) => club?.Location?.lat && club?.Location?.lng),
    [clubs]
  );

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading billiards clubs...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <div className="p-6 flex flex-col gap-6 overflow-auto bg-gray-50 flex-1">
          {error && (
            <div className="text-sm text-rose-600 border border-rose-200 rounded p-3 bg-rose-50">
              {error}
            </div>
          )}
          <div className="flex gap-6">
            {/* Club list */}
            <div className="w-1/3 bg-white p-4 rounded border border-gray-200 max-h-[600px] overflow-y-auto space-y-4">
              {clubs.length ? (
                clubs.map(club => (
                  <div key={club._id} className="border-b border-gray-100 pb-3 last:border-none last:pb-0">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900">{club.Name}</h2>
                      <span className="text-xs text-gray-500">
                        {club.Location?.lat && club.Location?.lng ? 'Has location' : 'Missing location'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{club.Address}</p>
                    {club.Phone && (
                      <p className="text-sm text-gray-500">Phone: {club.Phone}</p>
                    )}
                    {(club.OpenTime || club.CloseTime) && (
                      <p className="text-sm text-gray-500">
                        Hours: {club.OpenTime || '--'} - {club.CloseTime || '--'}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No clubs available.</p>
              )}
            </div>

            {/* Map */}
            <div className="w-2/3 h-[600px] rounded border border-gray-200 overflow-hidden bg-white relative">
              <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {clubsWithLocation.map(club => (
                  <Marker key={club._id} position={[club.Location.lat, club.Location.lng]}>
                    <Popup>
                      <div>
                        <h2 className="font-bold">{club.Name}</h2>
                        <p>{club.Address}</p>
                        {club.Phone && <p>Phone: {club.Phone}</p>}
                        {(club.OpenTime || club.CloseTime) && (
                          <p>Hours: {club.OpenTime || '--'} - {club.CloseTime || '--'}</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              {!clubsWithLocation.length && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 bg-white/70">
                  No clubs provide location data yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ErrorToast error={error} onClose={() => setError('')} />
    </div>
  );
};

export default BilliardsManagement;
