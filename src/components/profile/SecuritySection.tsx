'use client';

import { Key, Trash2 } from 'lucide-react';

export function SecuritySection() {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
        SECURITY
      </h2>
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          <Key className="w-4 h-4" strokeWidth={2} />
          CHANGE PASSWORD
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition">
          <Trash2 className="w-4 h-4" strokeWidth={2} />
          DELETE ACCOUNT
        </button>
      </div>
    </section>
  );
}
