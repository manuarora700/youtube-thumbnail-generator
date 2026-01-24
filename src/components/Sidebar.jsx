import { useState, useCallback } from 'react';
import { Youtube, Eye, EyeOff } from 'lucide-react';

function Sidebar({ 
  openaiApiKey, 
  geminiApiKey, 
  provider,
  onOpenaiApiKeyChange, 
  onGeminiApiKeyChange,
  onProviderChange,
  thumbnailCount, 
  onThumbnailCountChange 
}) {
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [localOpenaiKey, setLocalOpenaiKey] = useState(openaiApiKey);
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiApiKey);

  const handleSaveOpenaiKey = useCallback(() => {
    onOpenaiApiKeyChange(localOpenaiKey);
  }, [localOpenaiKey, onOpenaiApiKeyChange]);

  const handleSaveGeminiKey = useCallback(() => {
    onGeminiApiKeyChange(localGeminiKey);
  }, [localGeminiKey, onGeminiApiKeyChange]);

  const currentApiKeyValid = provider === 'openai' ? !!openaiApiKey : !!geminiApiKey;

  return (
    <div className="w-72 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <Youtube className="w-5 h-5" />
          <h1 className="font-display text-lg font-semibold">Thumbnail AI</h1>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 p-5 space-y-6 overflow-y-auto">
        {/* Provider */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
            Provider
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onProviderChange('openai')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                provider === 'openai'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              OpenAI
            </button>
            <button
              onClick={() => onProviderChange('gemini')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                provider === 'gemini'
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              Gemini
            </button>
          </div>
        </div>

        {/* Count */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">
            Thumbnails
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="10"
              value={thumbnailCount}
              onChange={(e) => onThumbnailCountChange(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full appearance-none cursor-pointer accent-[var(--color-accent)]"
            />
            <span className="text-sm font-medium w-6 text-center">{thumbnailCount}</span>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="p-5 border-t border-[var(--color-border)] space-y-4">
        <label className="block text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
          API Keys
        </label>

        {/* OpenAI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">OpenAI</span>
            {provider === 'openai' ? (
              <span className="text-xs text-[var(--color-success)]">Active</span>
            ) : null}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showOpenaiKey ? 'text' : 'password'}
                value={localOpenaiKey}
                onChange={(e) => setLocalOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-9 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
              <button
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleSaveOpenaiKey}
              className="px-3 py-2 text-sm font-medium bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-light)] transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Gemini */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">Gemini</span>
            {provider === 'gemini' ? (
              <span className="text-xs text-[var(--color-success)]">Active</span>
            ) : null}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={localGeminiKey}
                onChange={(e) => setLocalGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 pr-9 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
              <button
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleSaveGeminiKey}
              className="px-3 py-2 text-sm font-medium bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-light)] transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {!currentApiKeyValid ? (
          <p className="text-xs text-[var(--color-error)]">
            Add your {provider === 'openai' ? 'OpenAI' : 'Gemini'} API key
          </p>
        ) : null}

        <p className="text-xs text-[var(--color-text-muted)] pt-2">
          Keys stored locally only
        </p>
      </div>
    </div>
  );
}

export default Sidebar;
