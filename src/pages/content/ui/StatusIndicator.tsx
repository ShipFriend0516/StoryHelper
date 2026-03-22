import { useState, useEffect, useCallback } from 'react';
import { FEATURES } from '@src/shared/config/features';
import { AltTag, Command, ImageScale, SEO, TextCounter } from '@pages/content/injected/components/SVG';

const FEATURE_ICONS: Record<string, string> = {
  func_0: Command,
  func_1: AltTag,
  func_2: ImageScale,
  func_3: TextCounter,
  func_4: SEO,
};

const features = FEATURES.map(f => ({
  id: f.key,
  name: chrome.i18n.getMessage(f.messageKey),
  icon: FEATURE_ICONS[f.key],
}));

export default function StatusIndicator() {
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    const keys = features.map(f => f.id);
    chrome.storage.local.get([...keys, 'statusIndicator_minimized'], result => {
      const map: Record<string, boolean> = {};
      keys.forEach(k => {
        map[k] = result[k] === true;
      });
      setEnabledMap(map);
      setIsMinimized(result.statusIndicator_minimized === true);
    });

    const listener = (changes: Record<string, chrome.storage.StorageChange>, namespace: string) => {
      if (namespace !== 'local') return;
      const updated: Record<string, boolean> = {};
      Object.keys(changes).forEach(key => {
        if (key.startsWith('func_')) {
          updated[key] = changes[key].newValue === true;
        }
      });
      if (Object.keys(updated).length > 0) {
        setEnabledMap(prev => ({ ...prev, ...updated }));
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const toggleFeature = useCallback(
    async (id: string) => {
      const newValue = !enabledMap[id];
      await chrome.storage.local.set({ [id]: newValue });
      setEnabledMap(prev => ({ ...prev, [id]: newValue }));
    },
    [enabledMap],
  );

  const minimize = useCallback(async () => {
    await chrome.storage.local.set({ statusIndicator_minimized: true });
    setIsMinimized(true);
  }, []);

  const expand = useCallback(async () => {
    await chrome.storage.local.set({ statusIndicator_minimized: false });
    setIsMinimized(false);
  }, []);

  if (isMinimized) {
    return (
      <button
        type="button"
        className="si-minimized"
        onClick={expand}
        title={chrome.i18n.getMessage('tooltip_statusbar')}>
        <img src={chrome.runtime.getURL('icon-128.png')} alt="StoryHelper Logo" className="si-logo" />
      </button>
    );
  }

  return (
    <div className="si-container">
      <div className="si-header">
        <img src={chrome.runtime.getURL('icon-128.png')} alt="StoryHelper Logo" className="si-logo" />
        <span title={chrome.i18n.getMessage('tooltip_more_options')}>StoryHelper</span>
      </div>

      {features.map(func => {
        const enabled = enabledMap[func.id] ?? false;
        const statusText = chrome.i18n.getMessage(enabled ? 'ui_status_enabled' : 'ui_status_disabled');

        return (
          <div
            key={func.id}
            className="si-icon-wrapper"
            onMouseEnter={() => setTooltip(func.id)}
            onMouseLeave={() => setTooltip(null)}>
            <button
              type="button"
              className={`si-icon ${enabled ? 'si-icon--enabled' : 'si-icon--disabled'}`}
              onClick={() => toggleFeature(func.id)}
              dangerouslySetInnerHTML={{ __html: func.icon }}
            />
            {tooltip === func.id && (
              <div className="si-tooltip">
                <strong>{func.name}</strong>
                <br />
                <span style={{ color: enabled ? '#4CAF50' : '#f44336', fontSize: '11px' }}>● {statusText}</span>
                <div className="si-tooltip-arrow" />
              </div>
            )}
          </div>
        );
      })}

      <button type="button" className="si-toggle-btn" onClick={minimize}>
        ◀
      </button>
    </div>
  );
}
