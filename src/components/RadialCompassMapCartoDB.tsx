'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RadialCompassMapProps {
  radiusKm: number;
  userLat: number;
  userLng: number;
  persons: Array<{
    id: string;
    displayName: string;
    location?: { latitude: number; longitude: number } | null;
    distanceKm: number;
    archetype?: string;
    interests?: Array<{ name: string; proficiencyLevel: number }>;
    connectionProtocol?: string;
    bio?: string;
  }>;
  circles: Array<{
    id: string;
    name: string;
    type: string;
    latitude: number | null;
    longitude: number | null;
    distanceKm: number;
    currentSize: number;
    maxSize?: number | null;
    description?: string | null;
    protocol?: string | null;
    tags?: string[];
    creatorName?: string;
    createdBy?: string;
  }>;
  hoveredItemId: string | null;
  selectedItemId: string | null;
  onPinHover: (id: string | null) => void;
  onPinClick: (id: string, type: 'person' | 'circle') => void;
  currentUserId?: string;
}

// Create custom person icon (Slate Circle)
function createPersonIcon(isHovered: boolean, isSelected: boolean) {
  const size = isHovered || isSelected ? 12 : 8;

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${isHovered ? '<div class="absolute inset-0 w-6 h-6 bg-slate-500/30 rounded-full animate-ping"></div>' : ''}
        <div class="w-${size === 12 ? '3' : '2'} h-${size === 12 ? '3' : '2'} bg-slate-500 ${
          isSelected ? 'ring-2 ring-slate-700' : isHovered ? 'ring-2 ring-slate-400' : ''
        } rounded-full shadow-lg transition-all" style="width: ${size}px; height: ${size}px;"></div>
      </div>
    `,
    className: 'person-pin-simple',
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
  });
}

// Create custom circle icon (Amber Diamond)
function createCircleIcon(isHovered: boolean, isSelected: boolean) {
  const size = isHovered || isSelected ? 12 : 8;

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${isHovered ? '<div class="absolute inset-0 w-6 h-6 bg-amber-500/30 rotate-45 animate-ping"></div>' : ''}
        <div class="w-${size === 12 ? '3' : '2'} h-${size === 12 ? '3' : '2'} bg-amber-500 ${
          isSelected ? 'ring-2 ring-amber-700' : isHovered ? 'ring-2 ring-amber-400' : ''
        } rotate-45 shadow-lg transition-all" style="width: ${size}px; height: ${size}px;"></div>
      </div>
    `,
    className: 'circle-pin-simple',
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
  });
}

// Add small random offset to markers at the same location to create cluster effect
function applyClusterOffset(
  items: Array<{ id: string; lat: number; lng: number }>,
  index: number
): { lat: number; lng: number } {
  const item = items[index];

  // Find all items at the same location
  const sameLocation = items.filter(
    (other) =>
      Math.abs(other.lat - item.lat) < 0.00001 &&
      Math.abs(other.lng - item.lng) < 0.00001
  );

  // If only one item at this location, no offset needed
  if (sameLocation.length === 1) {
    return { lat: item.lat, lng: item.lng };
  }

  // Find the index of this item among items at the same location
  const localIndex = sameLocation.findIndex((i) => i.id === item.id);

  // Create circular cluster pattern around the original point
  const angleStep = (2 * Math.PI) / sameLocation.length;
  const angle = angleStep * localIndex;
  const radiusOffset = 0.0005; // ~50 meters offset

  const latOffset = radiusOffset * Math.cos(angle);
  const lngOffset = radiusOffset * Math.sin(angle);

  return {
    lat: item.lat + latOffset,
    lng: item.lng + lngOffset,
  };
}

// Map updater component
function MapUpdater({
  center,
  zoom,
  onReady,
}: {
  center: [number, number];
  zoom: number;
  onReady?: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
    // Signal that map is ready
    if (onReady) {
      onReady();
    }
  }, [center, zoom, map, onReady]);

  return null;
}

export function RadialCompassMapCartoDB({
  radiusKm,
  userLat,
  userLng,
  persons,
  circles,
  hoveredItemId,
  selectedItemId,
  onPinHover,
  onPinClick,
}: RadialCompassMapProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const center: [number, number] = [userLat, userLng];

  // Calculate zoom level based on radius - Ensures full radius circle is visible
  // while showing good street detail
  const getZoomLevel = (radius: number) => {
    if (radius <= 5) return 13;   // More detailed - see most street names, radius edges visible
    if (radius <= 10) return 12;  // Good detail - main streets visible, full radius shown
    if (radius <= 25) return 11;  // Medium detail - full 25km radius visible
    if (radius <= 50) return 10;  // Lower detail - full 50km radius visible
    return 8;                      // Global view - shows wide region
  };

  const currentZoom = getZoomLevel(radiusKm);

  // Reset map ready state when zoom/radius changes
  useEffect(() => {
    setIsMapReady(false);
  }, [currentZoom, userLat, userLng]);

  // Prepare all marker positions with clustering offsets
  const personsWithLocation = persons.filter((p) => p.location?.latitude && p.location?.longitude);
  const circlesWithLocation = circles.filter((c) => c.latitude && c.longitude);

  // Log for debugging
  console.log('Map data:', {
    totalPersons: persons.length,
    personsWithLocation: personsWithLocation.length,
    totalCircles: circles.length,
    circlesWithLocation: circlesWithLocation.length
  });

  const allMarkers = [
    ...personsWithLocation.map((p) => ({
        id: p.id,
        lat: p.location!.latitude,
        lng: p.location!.longitude,
        type: 'person' as const,
        data: p,
      })),
    ...circlesWithLocation.map((c) => ({
        id: c.id,
        lat: c.latitude!,
        lng: c.longitude!,
        type: 'circle' as const,
        data: c,
      })),
  ];

  const personMarkersWithOffset = persons
    .filter((p) => p.location?.latitude && p.location?.longitude)
    .map((person, index) => {
      const markerIndex = allMarkers.findIndex((m) => m.id === person.id);
      const position = applyClusterOffset(allMarkers, markerIndex);
      return { person, position };
    });

  const circleMarkersWithOffset = circles
    .filter((c) => c.latitude && c.longitude)
    .map((circle) => {
      const markerIndex = allMarkers.findIndex((m) => m.id === circle.id);
      const position = applyClusterOffset(allMarkers, markerIndex);
      return { circle, position };
    });

  return (
    <div className="relative w-full h-full bg-white">
      {/* HUD Coordinates - Top Left */}
      <div className="absolute top-4 left-4 font-mono text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded border border-gray-200 z-[1000]">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-bold">●</span>
          <span>LAT: {userLat.toFixed(4)}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-slate-600 font-bold">●</span>
          <span>LON: {userLng.toFixed(4)}</span>
        </div>
      </div>

      {/* Legend - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 shadow-sm z-[1000]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
          <span className="text-xs font-medium text-gray-700">Brothers ({personsWithLocation.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rotate-45"></div>
          <span className="text-xs font-medium text-gray-700">Circles ({circlesWithLocation.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-4 h-4 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <polygon
                points="8,2 2,14 14,14"
                fill="#334155"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-700">Your Location</span>
        </div>
      </div>

      {/* HUD Status - Top Right */}
      <div className="absolute top-4 right-4 font-mono text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded border border-gray-200 z-[1000]">
        <div>RADIUS: {radiusKm}km</div>
        <div className="mt-0.5">CONTACTS: {persons.length + circles.length}</div>
      </div>

      <MapContainer
        key={`map-${currentZoom}-${userLat}-${userLng}`}
        center={center}
        zoom={currentZoom}
        scrollWheelZoom={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapUpdater
          center={center}
          zoom={currentZoom}
          onReady={() => setIsMapReady(true)}
        />

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

        {/* User Location - Always visible, not clustered */}
        {isMapReady && (
          <Marker
            position={center}
            icon={L.divIcon({
              html: `
                <div class="flex items-center justify-center">
                  <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-slate-700 shadow-lg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));"></div>
                </div>
              `,
              className: 'user-location-pin',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          />
        )}

        {/* Person Pins (Slate Dots) - with cluster offsets */}
        {isMapReady &&
          personMarkersWithOffset.map(({ person, position }) => {
            const isHovered = hoveredItemId === person.id;
            const isSelected = selectedItemId === person.id;

            return (
              <Marker
                key={person.id}
                position={[position.lat, position.lng]}
                icon={createPersonIcon(isHovered, isSelected)}
                eventHandlers={{
                  mouseover: () => onPinHover(person.id),
                  mouseout: () => onPinHover(null),
                  click: () => onPinClick(person.id, 'person'),
                }}
              />
            );
          })}

        {/* Circle Pins (Amber Diamonds) - with cluster offsets */}
        {isMapReady &&
          circleMarkersWithOffset.map(({ circle, position }) => {
            const isHovered = hoveredItemId === circle.id;
            const isSelected = selectedItemId === circle.id;

            return (
              <Marker
                key={circle.id}
                position={[position.lat, position.lng]}
                icon={createCircleIcon(isHovered, isSelected)}
                eventHandlers={{
                  mouseover: () => onPinHover(circle.id),
                  mouseout: () => onPinHover(null),
                  click: () => onPinClick(circle.id, 'circle'),
                }}
              />
            );
          })}
      </MapContainer>
    </div>
  );
}
