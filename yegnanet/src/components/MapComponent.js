import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapComponent({ hotspots }) {
  return (
    <MapContainer 
    center = {[9.03, 38.74]}
    zoom={13}
    className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hotspots.map((spot) => {
        let lat = undefined;
        let lon = undefined;

        if (spot.location && typeof spot.location === "string") {
          const parts = spot.location.split(",").map((p) => p.trim());
          lat = parseFloat(parts[0]);
          lon = parseFloat(parts[1]);
        }

        if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) return null;

        return (
          <Marker key={spot.id} position={[lat, lon]} icon={markerIcon}>
            <Popup>
              <strong>{spot.name}</strong><br />
              {spot.notes || "No notes"}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default MapComponent;
