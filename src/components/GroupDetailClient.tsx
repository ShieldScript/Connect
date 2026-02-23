'use client';

import { useState } from 'react';
import { Users, MessageSquare, Settings, Shield, MapPin, Calendar, ChevronLeft } from 'lucide-react';
import { HuddleChat } from './HuddleChat';
import Link from 'next/link';

interface GroupDetailClientProps {
  group: any;
  personId: string;
  personName: string;
  membership: any;
}

type Tab = 'overview' | 'members' | 'chat' | 'settings';

export function GroupDetailClient({
  group,
  personId,
  personName,
  membership,
}: GroupDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const isHuddle = group.category === 'HUDDLE';
  const isMember = !!membership && membership.status === 'ACTIVE';
  const isCreator = group.createdBy === personId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`border-b ${isHuddle ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' : 'bg-white border-gray-200'}`}>
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Groups
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {isHuddle && (
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    HUDDLE
                  </span>
                )}
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              </div>
              {group.description && (
                <p className="text-gray-600 max-w-2xl">{group.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {group.currentSize}/{group.maxSize || '∞'} members
                </span>
                {group.locationName && !group.isVirtual && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {group.locationName}
                  </span>
                )}
                {group.isVirtual && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Virtual
                  </span>
                )}
              </div>
            </div>

            {!isMember && (
              <button
                className={`px-6 py-3 rounded-lg font-semibold ${
                  isHuddle
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition`}
              >
                Join {isHuddle ? 'Huddle' : 'Circle'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'members'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="inline w-4 h-4 mr-1.5" />
              Members ({group.memberships.filter((m: any) => m.status === 'ACTIVE').length})
            </button>
            {isHuddle && isMember && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === 'chat'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="inline w-4 h-4 mr-1.5" />
                Chat
              </button>
            )}
            {isCreator && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 border-b-2 font-medium transition ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="inline w-4 h-4 mr-1.5" />
                Settings
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This {isHuddle ? 'Huddle' : 'Circle'}</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</div>
                  <div className="capitalize">{group.type.replace('_', ' ').toLowerCase()}</div>
                </div>
                {group.protocol && (
                  <div>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Guidelines</div>
                    <div className="whitespace-pre-wrap">{group.protocol}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Created By</div>
                  <div>{group.creator.displayName}</div>
                </div>
              </div>
            </div>

            {isHuddle && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Huddle Features</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Private real-time chat for ongoing support</li>
                      <li>• Small group (3-6 members) for deep accountability</li>
                      <li>• Confidential space for spiritual growth</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Members</h2>
            <div className="space-y-3">
              {group.memberships
                .filter((m: any) => m.status === 'ACTIVE' && m.person)
                .map((m: any) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {m.person?.displayName?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{m.person?.displayName || 'Unknown'}</div>
                        {m.role === 'CREATOR' && (
                          <span className="text-xs text-gray-500">Creator</span>
                        )}
                        {m.role === 'LEADER' && (
                          <span className="text-xs text-gray-500">Leader</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && isHuddle && isMember && (
          <HuddleChat
            huddleId={group.id}
            personId={personId}
            personName={personName}
          />
        )}

        {activeTab === 'settings' && isCreator && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Group settings coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
