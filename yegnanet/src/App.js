import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './components/MapComponent';
import AddNewSpotForm from './components/AddNewSpotForm';
import HotspotList from './components/HotspotList';

function App() {
  const [hotspots, setHotspots] = useState([]);
  const [dragY, setDragY] = useState(window.innerHeight * 0.5); // start halfway down
  const [isDragging, setIsDragging] = useState(false);

  function fetchHotspots() {
    fetch("http://localhost:7071/api/get_hotspots")
      .then((res) => res.json())
      .then((data) => setHotspots(data))
      .catch((err) => console.error("Error loading hotspot list:", err));
  }

  useEffect(() => {
    fetchHotspots();
  }, []);

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="map-section">
          <MapComponent hotspots={hotspots} />
        </div>
      </div>

      <div
        className="drawer"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease"
        }}
        onMouseDown={(e) => {
          setIsDragging(true);
          e.currentTarget.startY = e.clientY;
          e.currentTarget.startDragY = dragY;
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            const delta = e.clientY - e.currentTarget.startY;
            let newY = e.currentTarget.startDragY + delta;
            newY = Math.max(0, Math.min(newY, window.innerHeight * 0.8));
            setDragY(newY);
          }
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={(e) => {
          setIsDragging(true);
          e.currentTarget.startY = e.touches[0].clientY;
          e.currentTarget.startDragY = dragY;
        }}
        onTouchMove={(e) => {
          if (isDragging) {
            const delta = e.touches[0].clientY - e.currentTarget.startY;
            let newY = e.currentTarget.startDragY + delta;
            newY = Math.max(0, Math.min(newY, window.innerHeight * 0.8));
            setDragY(newY);
          }
        }}
        onTouchEnd={() => setIsDragging(false)}
      >
        <AddNewSpotForm onNewHotspot={fetchHotspots} />
        <HotspotList hotspots={hotspots} />
      </div>

      <div className="button-container">
        <button
          className="add-spot-button"
          onClick={() => {
            if (dragY < window.innerHeight * 0.4) {
              setDragY(window.innerHeight * 0.8); // Close
            } else {
              setDragY(0); // Open
            }
          }}
        >
          {dragY < window.innerHeight * 0.5 ? "Close Form" : "+ Add New Spot"}
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}

export default App;
