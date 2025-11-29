import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import matchingApi from "../../api/matchingApi";
import "leaflet/dist/leaflet.css";

const ClubIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
});

const UserIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [30, 30],
});

const SelectClubOnMap = ({ onSelect }) => {
  const [userPos, setUserPos] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserPos([lat, lng]);

            const nearby = await matchingApi.getNearbyClubs(lat, lng, null);
            setClubs(nearby);
            setLoading(false);
          },
          async () => {
            const nearby = await matchingApi.getNearbyClubs();
            setClubs(nearby);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error loading clubs:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading map...</p>;
  if (!clubs.length) return <p className="text-center text-gray-500">No clubs found.</p>;

  const defaultCenter = userPos || [10.762622, 106.660172];

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userPos && (
          <Marker position={userPos} icon={UserIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {clubs.map((club) => (
          <Marker
            key={club._id}
            position={[club.Location.lat, club.Location.lng]}
            icon={ClubIcon}
            eventHandlers={{
              click: () => onSelect(club),
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{club.Name}</strong><br />
                {club.Address}<br />
                {club.distance ? `Distance: ${club.distance} km` : ""}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SelectClubOnMap;