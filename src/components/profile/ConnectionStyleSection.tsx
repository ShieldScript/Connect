'use client';

interface ConnectionStyleSectionProps {
  connectionStyle: string;
  howToConnect: string;
  isEditingStyle: boolean;
  isEditingHowTo: boolean;
  onEditStyleToggle: () => void;
  onEditHowToToggle: () => void;
  onConnectionStyleChange: (value: string) => void;
  onHowToConnectChange: (value: string) => void;
}

export function ConnectionStyleSection({
  connectionStyle,
  howToConnect,
  isEditingStyle,
  isEditingHowTo,
  onEditStyleToggle,
  onEditHowToToggle,
  onConnectionStyleChange,
  onHowToConnectChange,
}: ConnectionStyleSectionProps) {
  const getStyleLabel = (style: string) => {
    if (style === 'workshop') return { name: 'Builders', subtitle: 'Shoulder-to-Shoulder' };
    if (style === 'fireside') return { name: 'Fireside', subtitle: 'Face-to-Face' };
    if (style === 'outpost') return { name: 'Bridge', subtitle: 'Digital-to-Digital' };
    return { name: 'Not set', subtitle: '' };
  };

  return (
    <>
      {/* Connection Style */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            CONNECTION STYLE
          </label>
          <button
            onClick={onEditStyleToggle}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {isEditingStyle ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {isEditingStyle ? (
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="connectionStyle"
                value="workshop"
                checked={connectionStyle === 'workshop'}
                onChange={(e) => onConnectionStyleChange(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="text-sm font-bold text-gray-900">Builders</div>
                <div className="text-xs text-gray-600">Shoulder-to-Shoulder</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="connectionStyle"
                value="fireside"
                checked={connectionStyle === 'fireside'}
                onChange={(e) => onConnectionStyleChange(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="text-sm font-bold text-gray-900">Fireside</div>
                <div className="text-xs text-gray-600">Face-to-Face</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="connectionStyle"
                value="outpost"
                checked={connectionStyle === 'outpost'}
                onChange={(e) => onConnectionStyleChange(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="text-sm font-bold text-gray-900">Bridge</div>
                <div className="text-xs text-gray-600">Digital-to-Digital</div>
              </div>
            </label>
          </div>
        ) : (
          <div>
            <div className="text-sm font-bold text-gray-900">{getStyleLabel(connectionStyle).name}</div>
            {getStyleLabel(connectionStyle).subtitle && (
              <div className="text-xs text-gray-600 mt-1">{getStyleLabel(connectionStyle).subtitle}</div>
            )}
          </div>
        )}
      </section>

      {/* How to Connect */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            HOW TO CONNECT
          </h2>
          <button
            onClick={onEditHowToToggle}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {isEditingHowTo ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {isEditingHowTo ? (
          <div className="relative bg-gray-50 px-4 py-4 pb-2 rounded-lg">
            <textarea
              id="how-to-connect-edit"
              value={howToConnect}
              onChange={(e) => onHowToConnectChange(e.target.value)}
              placeholder=" "
              rows={3}
              className="peer w-full text-base px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors bg-transparent placeholder-transparent resize-none"
              maxLength={300}
            />
            <label htmlFor="how-to-connect-edit" className="absolute left-4 top-1 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-6 peer-focus:top-1 peer-focus:text-gray-600 peer-focus:text-sm cursor-text">
              How should brothers reach out to you?
            </label>
            <div className="text-right mt-1">
              <span className={`text-xs ${howToConnect.length > 270 ? 'text-amber-600' : 'text-gray-400'}`}>
                {howToConnect.length}/300
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 leading-relaxed">
            {howToConnect || <span className="text-gray-400 italic">Not set. Click Edit to add contact preferences.</span>}
          </div>
        )}
      </section>
    </>
  );
}
