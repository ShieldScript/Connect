'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export function CreateGroupClient() {
  const searchParams = useSearchParams();
  const groupType = searchParams.get('type') || 'circle';
  const isHuddle = groupType === 'huddle';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(isHuddle ? 'SPIRITUAL' : 'HOBBY');
  const [minSize, setMinSize] = useState(isHuddle ? 3 : 2);
  const [maxSize, setMaxSize] = useState(isHuddle ? 6 : 100);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Auto-set defaults for huddles
  useEffect(() => {
    if (isHuddle) {
      setType('SPIRITUAL');
      setMinSize(3);
      setMaxSize(6);
    }
  }, [isHuddle]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        type,
        category: isHuddle ? 'HUDDLE' : 'CIRCLE',
        isVirtual: true, // Default to virtual for now
        minSize,
        maxSize,
      };

      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create group');
      }

      const data = await res.json();
      toast.success(`${isHuddle ? 'Huddle' : 'Circle'} created successfully!`);
      router.push(`/groups/${data.group.id}`);
    } catch (err: any) {
      console.error('Failed to create group:', err);
      toast.error(err.message || 'Failed to create group');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {/* Huddle Info Banner */}
      {isHuddle && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Starting a Huddle</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>3-6 members for deep accountability and trust</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Built-in real-time chat for ongoing connection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Focused on spiritual growth and confidential support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <p className="text-gray-500 mb-8">
          {isHuddle
            ? 'Create a small accountability group for deep spiritual brotherhood.'
            : 'Create a space for people to connect and belong.'}
        </p>

        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g., Northwest Calgary Tech Men"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isHuddle}
            >
              <option value="HOBBY">Hobby & Interests</option>
              <option value="SPIRITUAL">Spiritual & Faith</option>
              <option value="SUPPORT">Support & Growth</option>
              <option value="SOCIAL">Social & Fun</option>
              <option value="PROFESSIONAL">Professional</option>
            </select>
            {isHuddle && (
              <p className="mt-1 text-xs text-gray-500">Huddles are always Spiritual & Faith focused</p>
            )}
          </div>

          {/* Group Size (show for huddles) */}
          {isHuddle && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Size</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    min="3"
                    max="6"
                    value={minSize}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Min: 3</p>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="3"
                    max="6"
                    value={maxSize}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Max: 6</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Huddles are limited to 3-6 members for deep accountability</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="What is the purpose of this group? What should people expect?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Link
              href="/groups"
              className="flex-1 py-3 text-center bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                isHuddle
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              {isHuddle ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
              {loading ? 'Creating...' : isHuddle ? 'Start Huddle' : 'Create Circle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
