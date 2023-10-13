import React, { useState, useEffect } from "react";
import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import axios from "axios";
import { BinDetail } from "./bindetail";

export const Map = ({ center, onMarkerClick }) => {
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [binData, setBinData] = useState(null);

  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
    onMarkerClick(marker); // Call the callback
  };
  

  const handleOnLoad = (map) => {
    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
    map.fitBounds(bounds);
  };

  const fetchBinData = (markerId) => {
    axios.get(`http://localhost:8080/bin/${markerId}`)
      .then(response => {
        // Check if 'response.data' and 'response.data.response' exist
        if (response.data && response.data.response && response.data.response[0]) {
          setBinData(response.data.response[0]);
        } else {
          console.error("Invalid response structure:", response.data);
        }
      })
      .catch(error => {
        console.error("Error fetching bin details:", error);
      });
  };

  const defaultMapOptions = {
    disableDefaultUI: true,
  };

  useEffect(() => {
    axios.get("http://localhost:8080/bin")
      .then(response => {
        setMarkers(response.data.response);
      })
      .catch(error => {
        console.error("Error fetching marker data:", error);
      });
  }, []);

  return (
    <>
      <GoogleMap
        onLoad={handleOnLoad}
        onClick={() => setActiveMarker(null)}
        mapContainerStyle={{ width: "100vw", height: "100vh" }}
        zoom={12}
        options={defaultMapOptions}
        center={center}
      >
        {markers.map(({ id, location, lat, lng }) => (
          <Marker
            key={id}
            icon={{
              url: "https://media.discordapp.net/attachments/1154651284788498432/1154658283232178186/BinMarker-removebg-preview.png",
              scaledSize: new window.google.maps.Size(60, 60),
            }}
            position={{ lat: parseFloat(lat), lng: parseFloat(lng) }}
            onClick={() => handleActiveMarker(id)}
          >
            {selectedMarkerId === id && (
                <InfoWindow onCloseClick={() => setSelectedMarkerId(null)}>
                  <div>
                    {location}
                    {binData && <BinDetail onClose={() => setSelectedMarkerId(null)} binData={binData} />}
                  </div>
                </InfoWindow>
              )}


          </Marker>
        ))}
      </GoogleMap>
      {selectedMarkerId !== null && binData !== null && (
        <BinDetail
          onClose={() => setSelectedMarkerId(null)}
          binData={binData}
        />
      )}
    </>
  );
};
