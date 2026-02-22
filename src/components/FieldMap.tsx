'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface FieldMapProps {
  persons: Array<{
    id: string;
    displayName: string;
    latitude: number | null;
    longitude: number | null;
  }>;
  gatherings: Array<{
    id: string;
    name: string;
    type: string;
    latitude: number | null;
    longitude: number | null;
    isVirtual: boolean;
  }>;
  userLat: number;
  userLng: number;
  hoveredItemId: string | null;
  onPinHover: (id: string | null) => void;
  onPinClick: (id: string) => void;
}

// Type icons for gatherings
const TYPE_ICONS: Record<string, string> = {
  HOBBY: '🥾',
  SUPPORT: '🤝',
  SPIRITUAL: '🙏',
  PROFESSIONAL: '💼',
  SOCIAL: '🎲',
  OTHER: '🔥',
};

// Create custom person pin icon
function createPersonIcon(initials: string, isHovered: boolean) {
  return L.divIcon({
    html: `
      <div class="w-8 h-8 bg-gray-400 ${
        isHovered ? 'ring-4 ring-blue-500' : ''
      } rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all" style="display: flex; align-items: center; justify-content: center;">
        ${initials}
      </div>
    `,
    className: 'person-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// Create custom gathering pin icon
function createGatheringIcon(typeIcon: string, isHovered: boolean) {
  return L.divIcon({
    html: `
      <div class="w-8 h-8 bg-amber-500 ${
        isHovered ? 'ring-4 ring-amber-600' : ''
      } rounded-full flex items-center justify-center text-white text-sm shadow-lg transition-all" style="display: flex; align-items: center; justify-content: center;">
        ${typeIcon}
      </div>
    `,
    className: 'gathering-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// Map updater component to handle center/zoom changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function FieldMap({
  persons,
  gatherings,
  userLat,
  userLng,
  hoveredItemId,
  onPinHover,
  onPinClick,
}: FieldMapProps) {
  const center: [number, number] = [userLat, userLng];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      className="h-full w-full"
      style={{ height: '100%', width: '100%' }}
    >
      <MapUpdater center={center} />

      {/* iOS-like minimal map style */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
      >
        {/* Person Pins */}
        {persons
          .filter((p) => p.latitude && p.longitude)
          .map((person) => {
            const initials = person.displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <Marker
                key={person.id}
                position={[person.latitude!, person.longitude!]}
                icon={createPersonIcon(initials, hoveredItemId === person.id)}
                eventHandlers={{
                  mouseover: () => onPinHover(person.id),
                  mouseout: () => onPinHover(null),
                  click: () => onPinClick(person.id),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{person.displayName}</p>
                    <p className="text-xs text-gray-500">Brother</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Gathering Pins (exclude virtual) */}
        {gatherings
          .filter((g) => !g.isVirtual && g.latitude && g.longitude)
          .map((gathering) => {
            const typeIcon = TYPE_ICONS[gathering.type] || TYPE_ICONS.OTHER;

            return (
              <Marker
                key={gathering.id}
                position={[gathering.latitude!, gathering.longitude!]}
                icon={createGatheringIcon(typeIcon, hoveredItemId === gathering.id)}
                eventHandlers={{
                  mouseover: () => onPinHover(gathering.id),
                  mouseout: () => onPinHover(null),
                  click: () => onPinClick(gathering.id),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{gathering.name}</p>
                    <p className="text-xs text-gray-500">{gathering.type} Gathering</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
