import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useRideStore from '../../stores/rideStore';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom SVG icons for better visual appeal
const createCustomIcon = (color: string, innerColor: string = '#fff', isDriver: boolean = false) => {
  const svg = isDriver
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>
        <path d="M7 13.5L9.5 11L7 11V10H10L12 8L14 10H17V11L14.5 11L17 13.5V15H15.5L12 12L8.5 15H7V13.5Z" fill="${innerColor}"/>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path d="M20 0C10 0 2 8 2 18C2 31.5 20 50 20 50C20 50 38 31.5 38 18C38 8 30 0 20 0Z" fill="${color}" filter="url(#shadow)"/>
        <circle cx="20" cy="18" r="8" fill="${innerColor}"/>
      </svg>`;

  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: isDriver ? [40, 40] : [40, 50],
    iconAnchor: isDriver ? [20, 20] : [20, 50],
    popupAnchor: [0, isDriver ? -20 : -50],
  });
};

const pickupIcon = createCustomIcon('#10b981', '#fff');
const destinationIcon = createCustomIcon('#ef4444', '#fff');
const driverIcon = createCustomIcon('#3b82f6', '#fff', true);

interface MapClickHandlerProps {
  mode: 'pickup' | 'destination' | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ mode, onLocationSelect }: MapClickHandlerProps) {
  const map = useMap();

  useMapEvents({
    click: (e) => {
      if (mode) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  // Change cursor based on mode
  useEffect(() => {
    const container = map.getContainer();
    if (mode) {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = 'grab';
    }
    return () => {
      container.style.cursor = 'grab';
    };
  }, [mode, map]);

  return null;
}

interface FitBoundsProps {
  pickup: { latitude: number; longitude: number } | null;
  destination: { latitude: number; longitude: number } | null;
  driver: { latitude: number; longitude: number } | null;
}

function FitBounds({ pickup, destination, driver }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [];

    if (pickup) points.push([pickup.latitude, pickup.longitude]);
    if (destination) points.push([destination.latitude, destination.longitude]);
    if (driver) points.push([driver.latitude, driver.longitude]);

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
    }
  }, [map, pickup, destination, driver]);

  return null;
}

interface RideMapProps {
  selectionMode: 'pickup' | 'destination' | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function RideMap({ selectionMode, onLocationSelect }: RideMapProps) {
  const { pickupLocation, destinationLocation, driverLocation, currentRide } = useRideStore();
  const mapRef = useRef<L.Map | null>(null);

  // Default center (Bangalore, India)
  const defaultCenter: [number, number] = [12.9716, 77.5946];

  // Create route line between pickup and destination
  const routePositions: [number, number][] = [];
  if (pickupLocation) {
    routePositions.push([pickupLocation.latitude, pickupLocation.longitude]);
  }
  if (destinationLocation) {
    routePositions.push([destinationLocation.latitude, destinationLocation.longitude]);
  }

  return (
    <div className="h-full w-full relative">
      {/* Map Styles */}
      <style>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-content {
          margin: 12px 16px;
          line-height: 1.5;
        }
        .leaflet-popup-tip {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .custom-popup {
          font-family: 'Inter', system-ui, sans-serif;
        }
        .custom-popup h4 {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .custom-popup p {
          color: #64748b;
          font-size: 13px;
          margin: 0;
        }
        .custom-popup .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          margin-top: 8px;
        }
        .custom-popup .badge-pickup {
          background: #d1fae5;
          color: #059669;
        }
        .custom-popup .badge-destination {
          background: #fee2e2;
          color: #dc2626;
        }
        .custom-popup .badge-driver {
          background: #dbeafe;
          color: #2563eb;
        }
        .custom-popup .driver-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }
        .custom-popup .rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #f59e0b;
          font-weight: 500;
        }
      `}</style>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="h-full w-full"
        ref={mapRef}
        zoomControl={false}
      >
        {/* Use a more aesthetic map tile */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler mode={selectionMode} onLocationSelect={onLocationSelect} />

        <FitBounds
          pickup={pickupLocation}
          destination={destinationLocation}
          driver={driverLocation}
        />

        {/* Route line */}
        {routePositions.length === 2 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#6366f1',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10',
              lineCap: 'round',
            }}
          />
        )}

        {/* Driver to pickup line */}
        {driverLocation && pickupLocation && currentRide && (
          <Polyline
            positions={[
              [driverLocation.latitude, driverLocation.longitude],
              [pickupLocation.latitude, pickupLocation.longitude],
            ]}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 0.6,
              dashArray: '5, 5',
              lineCap: 'round',
            }}
          />
        )}

        {/* Pickup marker */}
        {pickupLocation && (
          <Marker
            position={[pickupLocation.latitude, pickupLocation.longitude]}
            icon={pickupIcon}
          >
            <Popup className="custom-popup">
              <div className="custom-popup">
                <h4>Pickup Location</h4>
                <p>
                  {pickupLocation.address ||
                    `${pickupLocation.latitude.toFixed(5)}, ${pickupLocation.longitude.toFixed(5)}`}
                </p>
                <span className="badge badge-pickup">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Pickup Point
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destinationLocation && (
          <Marker
            position={[destinationLocation.latitude, destinationLocation.longitude]}
            icon={destinationIcon}
          >
            <Popup className="custom-popup">
              <div className="custom-popup">
                <h4>Destination</h4>
                <p>
                  {destinationLocation.address ||
                    `${destinationLocation.latitude.toFixed(5)}, ${destinationLocation.longitude.toFixed(5)}`}
                </p>
                <span className="badge badge-destination">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Drop-off
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Driver marker */}
        {driverLocation && currentRide?.driver && (
          <Marker
            position={[driverLocation.latitude, driverLocation.longitude]}
            icon={driverIcon}
          >
            <Popup className="custom-popup">
              <div className="custom-popup">
                <h4>{currentRide.driver.name}</h4>
                <p>{currentRide.driver.vehicleNumber}</p>
                <div className="driver-info">
                  <span className="rating">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    {currentRide.driver.rating.toFixed(1)}
                  </span>
                  <span className="badge badge-driver">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-1.9-4.2c-.3-.7-1-1.1-1.8-1.1H9.7c-.8 0-1.5.4-1.8 1.1L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
                      <circle cx="7" cy="17" r="2"/>
                      <circle cx="17" cy="17" r="2"/>
                    </svg>
                    En Route
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Zoom controls overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => mapRef.current?.setZoom((mapRef.current?.getZoom() || 13) + 1)}
          className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={() => mapRef.current?.setZoom((mapRef.current?.getZoom() || 13) - 1)}
          className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
