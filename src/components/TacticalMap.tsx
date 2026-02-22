'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TacticalMapProps {
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
  }>;
  userLat: number;
  userLng: number;
  radiusKm: number;
  hoveredItemId: string | null;
  selectedItemId: string | null;
  onPinHover: (id: string | null) => void;
  onPinClick: (id: string, type: 'person' | 'gathering') => void;
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

// Create custom person pin icon (Gray Circle)
function createPersonIcon(initials: string, isHovered: boolean, isSelected: boolean) {
  const size = isHovered ? 48 : 32; // 2x size on hover
  const pulseClass = isHovered ? 'animate-pulse' : '';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${
          isHovered
            ? '<div class="absolute inset-0 w-12 h-12 bg-blue-500/30 rounded-full animate-ping"></div>'
            : ''
        }
        <div class="${pulseClass} w-${
      size === 48 ? '12' : '8'
    } h-${
      size === 48 ? '12' : '8'
    } bg-gray-400 ${
      isSelected ? 'ring-4 ring-blue-500' : isHovered ? 'ring-2 ring-blue-400' : ''
    } rounded-full flex items-center justify-center text-white text-${
      size === 48 ? 'sm' : 'xs'
    } font-bold shadow-lg transition-all" style="display: flex; align-items: center; justify-content: center;">
          ${initials}
        </div>
      </div>
    `,
    className: 'person-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Create custom gathering pin icon (Amber Hexagon)
function createGatheringIcon(typeIcon: string, isHovered: boolean, isSelected: boolean) {
  const size = isHovered ? 48 : 32;
  const pulseClass = isHovered ? 'animate-pulse' : '';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${
          isHovered
            ? '<div class="absolute inset-0 w-12 h-12 bg-amber-500/30 rounded animate-ping"></div>'
            : ''
        }
        <div class="${pulseClass} w-${
      size === 48 ? '12' : '8'
    } h-${
      size === 48 ? '12' : '8'
    } bg-amber-500 ${
      isSelected ? 'ring-4 ring-amber-600' : isHovered ? 'ring-2 ring-amber-400' : ''
    } clip-hexagon flex items-center justify-center text-white text-${
      size === 48 ? 'base' : 'sm'
    } shadow-lg transition-all" style="display: flex; align-items: center; justify-content: center; clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);">
          ${typeIcon}
        </div>
      </div>
    `,
    className: 'gathering-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Map updater component
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function TacticalMap({
  persons,
  gatherings,
  userLat,
  userLng,
  radiusKm,
  hoveredItemId,
  selectedItemId,
  onPinHover,
  onPinClick,
}: TacticalMapProps) {
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

      {/* Range Circle - Shows active search radius */}
      <Circle
        center={center}
        radius={radiusKm * 1000} // Convert km to meters
        pathOptions={{
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.05,
          weight: 2,
          opacity: 0.3,
          dashArray: '5, 10',
        }}
      />

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
      >
        {/* Person Pins (Gray Circles) */}
        {persons
          .filter((p) => p.latitude && p.longitude)
          .map((person) => {
            const initials = person.displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const isHovered = hoveredItemId === person.id;
            const isSelected = selectedItemId === person.id;

            return (
              <Marker
                key={person.id}
                position={[person.latitude!, person.longitude!]}
                icon={createPersonIcon(initials, isHovered, isSelected)}
                eventHandlers={{
                  mouseover: () => onPinHover(person.id),
                  mouseout: () => onPinHover(null),
                  click: () => onPinClick(person.id, 'person'),
                }}
              />
            );
          })}

        {/* Gathering Pins (Amber Hexagons) */}
        {gatherings
          .filter((g) => g.latitude && g.longitude)
          .map((gathering) => {
            const typeIcon = TYPE_ICONS[gathering.type] || TYPE_ICONS.OTHER;
            const isHovered = hoveredItemId === gathering.id;
            const isSelected = selectedItemId === gathering.id;

            return (
              <Marker
                key={gathering.id}
                position={[gathering.latitude!, gathering.longitude!]}
                icon={createGatheringIcon(typeIcon, isHovered, isSelected)}
                eventHandlers={{
                  mouseover: () => onPinHover(gathering.id),
                  mouseout: () => onPinHover(null),
                  click: () => onPinClick(gathering.id, 'gathering'),
                }}
              />
            );
          })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
