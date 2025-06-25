import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import './App.css';
import MapComponent from './components/MapComponent';
import AddNewSpotForm from './components/AddNewSpotForm';
import HotspotList from './components/HotspotList';

function App() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "10px 20px",
          marginBottom: "20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        {showForm ? "Close Form" : "+ Add New Spot"}
      </button>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 2 }}>
          <MapComponent />
        </div>
        {showForm && (
          <div style={{ flex: 1 }}>
            <AddNewSpotForm />
            <HotspotList />
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}
export default App;
