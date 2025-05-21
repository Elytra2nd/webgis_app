import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, Polygon, Polyline } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
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

interface MapDrawingProps {
  keluargaId: number;
  initialData?: any;
  onSave?: (data: any) => void;
}

interface LatLng {
  lat: number;
  lng: number;
}

const MapDrawing: React.FC<MapDrawingProps> = ({ keluargaId, initialData, onSave }) => {
  const [center] = useState<[number, number]>([-2.5489, 118.0149]); // Koordinat tengah Indonesia
  const [zoom] = useState<number>(5);
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const [mapData, setMapData] = useState<any>(initialData || null);

  useEffect(() => {
    if (!initialData && keluargaId) {
      // Fetch data dari server jika tidak ada initialData
      axios.get(`/api/map-data/${keluargaId}`)
        .then(response => {
          setMapData(response.data);
        })
        .catch(error => {
          console.error('Error fetching map data:', error);
        });
    }
  }, [keluargaId, initialData]);

  const handleCreated = (e: any) => {
    const { layerType, layer } = e;

    if (layerType === 'marker') {
      const latLng = layer.getLatLng();
      console.log('Marker ditambahkan:', latLng);

      // Simpan marker ke database
      saveMapData('point', [latLng], 'Rumah');

      layer.bindPopup('Rumah').openPopup();
    } else if (layerType === 'polygon') {
      const latLngs = layer.getLatLngs()[0];
      console.log('Polygon ditambahkan:', latLngs);

      // Simpan polygon ke database
      saveMapData('polygon', latLngs, 'Wilayah');

      layer.bindPopup('Wilayah').openPopup();
    } else if (layerType === 'polyline') {
      const latLngs = layer.getLatLngs();
      console.log('Polyline ditambahkan:', latLngs);

      // Hitung jarak
      let totalDistance = 0;
      for (let i = 0; i < latLngs.length - 1; i++) {
        totalDistance += latLngs[i].distanceTo(latLngs[i + 1]);
      }

      const distanceKm = (totalDistance / 1000).toFixed(2);
      console.log('Jarak:', distanceKm, 'km');

      // Simpan polyline ke database
      saveMapData('linestring', latLngs, `Jarak: ${distanceKm} km`);

      layer.bindPopup(`Jarak: ${distanceKm} km`).openPopup();
    }
  };

  const saveMapData = (type: string, coordinates: any, name: string) => {
    const data = {
      keluarga_id: keluargaId,
      type: type,
      data: JSON.stringify(coordinates.map((coord: any) => ({
        lat: coord.lat,
        lng: coord.lng
      }))),
      nama: name
    };

    axios.post('/api/map-data', data)
      .then(response => {
        console.log('Data saved:', response.data);
        if (onSave) {
          onSave(response.data);
        }
      })
      .catch(error => {
        console.error('Error saving map data:', error);
      });
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Render existing data */}
      {mapData && mapData.point && (
        <Marker position={[mapData.point.lat, mapData.point.lng]}>
          <Popup>Rumah</Popup>
        </Marker>
      )}

      {mapData && mapData.polygons && mapData.polygons.map((polygon: any, index: number) => (
        <Polygon
          key={`polygon-${index}`}
          positions={polygon.coordinates.map((coord: LatLng) => [coord.lat, coord.lng])}
        >
          <Popup>{polygon.nama || 'Wilayah'}</Popup>
        </Polygon>
      ))}

      {mapData && mapData.lines && mapData.lines.map((line: any, index: number) => (
        <Polyline
          key={`line-${index}`}
          positions={line.coordinates.map((coord: LatLng) => [coord.lat, coord.lng])}
          color="red"
        >
          <Popup>{line.nama || `Jarak: ${(line.panjang / 1000).toFixed(2)} km`}</Popup>
        </Polyline>
      ))}

      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={handleCreated}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: true,
            polyline: true,
            polygon: true
          }}
        />
      </FeatureGroup>
    </MapContainer>
  );
};

export default MapDrawing;
