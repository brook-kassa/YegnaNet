import { useEffect, useState } from "react";

function HotspotList() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetch("http://localhost:7071/api/getHotspots")
      .then((res) => res.json())
      .then((data) => setHotspots(data))
      .catch((err) => console.error("Error loading hotspot list:", err));
  }, []);

  return (
    <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "20px" }}>
      <h3>Submitted Spots</h3>
      {hotspots.map((spot) => (
        <div
          key={spot.id}
          style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}
        >
          <strong>{spot.name}</strong><br />
          {spot.notes}
        </div>
      ))}
    </div>
  );
}

export default HotspotList;
