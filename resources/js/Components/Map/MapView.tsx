// resources/js/Components/Map/MapView.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Komponen untuk memastikan peta di-resize dengan benar
const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
};

interface MapViewProps {
  keluargaId?: number;
  point?: { lat: number; lng: number };
  polygons?: Array<{ coordinates: Array<{ lat: number; lng: number }>, nama?: string }>;
  lines?: Array<{ coordinates: Array<{ lat: number; lng: number }>, nama?: string, panjang?: number }>;
}

const MapView: React.FC<MapViewProps> = ({ keluargaId, point, polygons, lines }) => {
  const [mapData, setMapData] = useState<any>({
    point: point,
    polygons: polygons || [],
    lines: lines || []
  });
  const [center, setCenter] = useState<[number, number]>([-2.5489, 118.0149]);
  const [zoom, setZoom] = useState<number>(5);

  useEffect(() => {
    if (keluargaId) {
      axios.get(`/api/map-data/${keluargaId}`)
        .then(response => {
          setMapData(response.data);

          // Set center to point location if available
          if (response.data.point) {
            setCenter([response.data.point.lat, response.data.point.lng]);
            setZoom(15);
          }
        })
        .catch(error => {
          console.error('Error fetching map data:', error);
        });
    } else if (point) {
      setCenter([point.lat, point.lng]);
      setZoom(15);
    }
  }, [keluargaId, point]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <MapResizer />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {mapData.point && (
          <Marker position={[mapData.point.lat, mapData.point.lng]}>
            <Popup>Rumah</Popup>
          </Marker>
        )}

        {mapData.polygons && mapData.polygons.map((polygon: any, index: number) => (
          <Polygon
            key={`polygon-${index}`}
            positions={polygon.coordinates.map((coord: any) => [coord.lat, coord.lng])}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
          >
            <Popup>{polygon.nama || 'Wilayah'}</Popup>
          </Polygon>
        ))}

        {mapData.lines && mapData.lines.map((line: any, index: number) => (
          <Polyline
            key={`line-${index}`}
            positions={line.coordinates.map((coord: any) => [coord.lat, coord.lng])}
            pathOptions={{ color: 'red' }}
          >
            <Popup>{line.nama || `Jarak: ${(line.panjang / 1000).toFixed(2)} km`}</Popup>
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
