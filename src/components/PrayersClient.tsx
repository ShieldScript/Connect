'use client';

import { CreatePrayerForm } from './CreatePrayerForm';
import { PrayerWallFeed } from './PrayerWallFeed';
import { HandHeart, Plus, X, Sparkles, Heart, User } from 'lucide-react';
import { useState } from 'react';

interface PrayersClientProps {
  personId: string;
  personName: string;
}

type TabType = 'all' | 'prayed' | 'mine';

export function PrayersClient({ personId, personName }: PrayersClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  return (
    <main className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <HandHeart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prayer Wall</h1>
              <p className="text-gray-600 text-sm mt-0.5">
                Support each other through prayer
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Share Prayer Request
          </button>
        </div>

        {/* Tabs - Underline Style */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-3 pb-4 border-b-2 transition ${
              activeTab === 'all'
                ? 'border-blue-600'
                : 'border-transparent'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${
              activeTab === 'all' ? 'text-gray-900' : 'text-gray-400'
            }`} strokeWidth={2} />
            <span className={`font-semibold ${
              activeTab === 'all' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              New Requests
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prayed')}
            className={`flex items-center gap-3 pb-4 border-b-2 transition ${
              activeTab === 'prayed'
                ? 'border-blue-600'
                : 'border-transparent'
            }`}
          >
            <Heart className={`w-5 h-5 ${
              activeTab === 'prayed' ? 'text-gray-900' : 'text-gray-400'
            }`} strokeWidth={2} />
            <span className={`font-semibold ${
              activeTab === 'prayed' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              I Prayed For
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mine')}
            className={`flex items-center gap-3 pb-4 border-b-2 transition ${
              activeTab === 'mine'
                ? 'border-blue-600'
                : 'border-transparent'
            }`}
          >
            <User className={`w-5 h-5 ${
              activeTab === 'mine' ? 'text-gray-900' : 'text-gray-400'
            }`} strokeWidth={2} />
            <span className={`font-semibold ${
              activeTab === 'mine' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              My Requests
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Prayer Feed with Tab Filtering */}
          <PrayerWallFeed
            currentUserId={personId}
            filterMode={activeTab}
          />
        </div>
      </div>

      {/* Create Prayer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <HandHeart className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Share a Prayer Request</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <CreatePrayerForm onPrayerCreated={() => setShowCreateModal(false)} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
