'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Users, Calendar, Globe } from 'lucide-react';

interface CreateCircleFormProps {
  userLat: number;
  userLng: number;
  userStation?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCircleForm({
  userLat,
  userLng,
  userStation = 'Your Location',
  onClose,
  onSuccess
}: CreateCircleFormProps) {
  const [type, setType] = useState<'physical' | 'online'>('physical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [protocol, setProtocol] = useState('');
  const [circleType, setCircleType] = useState<'HOBBY' | 'SPIRITUAL' | 'SUPPORT' | 'PROFESSIONAL' | 'SOCIAL' | 'OTHER'>('SPIRITUAL');
  const [maxSize, setMaxSize] = useState(12);
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for restart data on mount
  useEffect(() => {
    const restartData = sessionStorage.getItem('restartCircle');
    if (restartData) {
      try {
        const data = JSON.parse(restartData);
        // Pre-fill form with re-deploy data
        setTitle(data.name || '');
        setDescription(data.description || '');
        setProtocol(data.protocol || '');
        setCircleType(data.type || 'SPIRITUAL');
        setType(data.isVirtual ? 'online' : 'physical');
        setLocation(data.locationName || '');
        setMaxSize(data.maxSize || 12);

        // Clear sessionStorage after reading
        sessionStorage.removeItem('restartCircle');
      } catch (err) {
        console.error('Failed to parse restart data:', err);
      }
    }
  }, []);

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      setIsGeocoding(true);
      // Use Nominatim (OpenStreetMap) for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let lat = null;
      let lng = null;

      // Geocode address for physical circles
      if (type === 'physical') {
        if (!location.trim()) {
          throw new Error('Please enter a location');
        }

        const coords = await geocodeAddress(location);
        if (!coords) {
          throw new Error('Could not find location. Please try a more specific address (e.g., "123 Main St, Calgary, AB")');
        }
        lat = coords.lat;
        lng = coords.lng;
      }

      const payload = {
        name: title,
        description,
        protocol,
        type: circleType,
        isVirtual: type === 'online',
        locationName: type === 'physical' ? location : null,
        latitude: lat,
        longitude: lng,
        maxSize,
        tags: [],
      };

      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create circle');
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to create circle:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Start a Circle</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Type Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('physical')}
              className={`p-3 border-2 rounded-lg transition ${
                type === 'physical'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MapPin className={`w-5 h-5 mx-auto mb-1 ${type === 'physical' ? 'text-amber-600' : 'text-gray-400'}`} strokeWidth={2} />
              <div className="text-sm font-bold text-gray-900">Physical</div>
              <div className="text-xs text-gray-500">Nearby</div>
            </button>
            <button
              type="button"
              onClick={() => setType('online')}
              className={`p-3 border-2 rounded-lg transition ${
                type === 'online'
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Globe className={`w-5 h-5 mx-auto mb-1 ${type === 'online' ? 'text-emerald-600' : 'text-gray-400'}`} strokeWidth={2} />
              <div className="text-sm font-bold text-gray-900">Online</div>
              <div className="text-xs text-gray-500">Digital</div>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Weekly Bible Study, Hiking Fellowship"
            required
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will you do together? (e.g., Weekly Bible study focusing on Gospel of John)"
            rows={3}
            maxLength={300}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/300 characters</p>
        </div>

        {/* Location */}
        {type === 'physical' && (
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              <MapPin className="w-3 h-3 inline mr-1" />
              Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., 123 Main St, Calgary, AB or Starbucks Downtown"
              required={type === 'physical'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isGeocoding ? 'Finding location...' : 'Address will be geocoded automatically'}
            </p>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Category
          </label>
          <select
            value={circleType}
            onChange={(e) => setCircleType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="SPIRITUAL">Spiritual</option>
            <option value="HOBBY">Hobby</option>
            <option value="SUPPORT">Support</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="SOCIAL">Social</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            <Users className="w-3 h-3 inline mr-1" />
            Capacity
          </label>
          <input
            type="number"
            value={maxSize}
            onChange={(e) => setMaxSize(parseInt(e.target.value))}
            min={2}
            max={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum number of participants (2-100)</p>
        </div>

        {/* Connection Guide */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Connection Guide
          </label>
          <p className="text-xs text-gray-600 mb-2">
            Gate codes, what to bring, meeting links, etc.
          </p>
          <textarea
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            placeholder="Gate code: 1234. Coffee provided. Park in rear lot."
            rows={5}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
        </div>
      </form>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 p-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !title || (type === 'physical' && !location)}
          className={`flex-1 px-4 py-2.5 font-bold text-sm rounded-lg transition ${
            isLoading || !title || (type === 'physical' && !location)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
          }`}
        >
          {isLoading || isGeocoding ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isGeocoding ? 'Finding location...' : 'Creating...'}
            </span>
          ) : (
            'Create Circle'
          )}
        </button>
      </div>
    </div>
  );
}
