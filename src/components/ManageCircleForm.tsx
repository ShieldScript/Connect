'use client';

import { useState } from 'react';
import { X, MapPin, Users, AlertTriangle, ChevronLeft } from 'lucide-react';
import { GroupWithRelations } from '@/types';

interface ManageCircleFormProps {
  circle: GroupWithRelations;
  currentUserId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManageCircleForm({
  circle,
  currentUserId,
  onClose,
  onSuccess
}: ManageCircleFormProps) {
  const [title, setTitle] = useState(circle.name);
  const [capacity, setCapacity] = useState(circle.maxSize || 12);
  const [protocol, setProtocol] = useState(circle.protocol || circle.description || '');
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>(
    circle.status === 'ACTIVE' || circle.status === 'PAUSED' ? circle.status : 'ACTIVE'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const joinedCount = circle.currentSize || 0;
  const isCreator = circle.createdBy === currentUserId;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        name: title,
        protocol,
        maxSize: capacity,
        status,
      };

      const res = await fetch(`/api/groups/${circle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update circle');
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update circle:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCircle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/groups/${circle.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel circle');
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to cancel circle:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-wide">Back</span>
        </button>
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Manage Circle</h2>
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wide"
        >
Close Circle
        </button>
      </div>

      {/* Status Bar */}
      <div className="border-b border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status:</span>
          <button
            onClick={() => setStatus(status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition border ${
              status === 'ACTIVE'
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-gray-100 text-gray-500 border-gray-300'
            }`}
          >
            <span className={status === 'ACTIVE' ? 'text-green-500' : 'text-gray-400'}>●</span>
            {status === 'ACTIVE' ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-4 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* MISSION INTEL */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Circle Info
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {circle.isVirtual ? 'Link' : 'Location'}
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                {circle.isVirtual ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">ONLINE</span>
                    <span className="text-xs">Add link in protocol below</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    <span>{circle.locationName || 'Location not specified'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LOGISTICS */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            Logistics
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                min={joinedCount} // Can't reduce below current members
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Joined
              </label>
              <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" strokeWidth={2} />
                  <span className="text-sm font-bold text-amber-900">{joinedCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Attendance</span>
              <span className="font-semibold">{Math.round((joinedCount / capacity) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  joinedCount >= capacity ? 'bg-green-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min((joinedCount / capacity) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* CONNECTION GUIDE / SPECIAL INSTRUCTIONS */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Connection Guide
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            Gate codes, what to bring, meeting links, etc.
          </p>
          <textarea
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            rows={5}
            maxLength={500}
            placeholder="Gate code: 1234. Coffee provided. Park in rear lot."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {protocol.length}/500 characters
          </p>
        </div>
      </form>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleUpdate}
          disabled={isLoading || !title}
          className={`w-full px-4 py-3 font-bold text-sm rounded-lg transition ${
            isLoading || !title
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Updating...
            </span>
          ) : (
            'Update Circle Changes'
          )}
        </button>
      </div>

      {/* Close Circle Confirmation */}
      {showCancelConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-30">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Close Circle?</h3>
                <p className="text-sm text-gray-600">
                  {joinedCount > 1
                    ? `This will notify the ${joinedCount} joined brothers that this circle is closed. This action cannot be undone.`
                    : 'This will permanently delete this circle. This action cannot be undone.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition"
              >
Keep Circle
              </button>
              <button
                onClick={handleCloseCircle}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Closing...' : 'Close Circle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
