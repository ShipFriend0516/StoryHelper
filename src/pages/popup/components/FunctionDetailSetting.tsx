import { useRef, useState, useEffect } from 'react';
import { getMessage, getAriaLabel } from '@src/shared/utils/i18n';

interface Shortcut {
  keys: string;
  description: string;
  function_id?: number;
  custom?: string;
  shortcut_id: string; // ID for logic (locale-independent)
}

const FunctionDetailSetting = () => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([
    {
      keys: 'Ctrl + Shift + S',
      description: getMessage('shortcut_publish'),
      function_id: 1,
      shortcut_id: 'PUBLISH',
    },
    {
      keys: 'Ctrl + Shift + U',
      description: getMessage('shortcut_image_upload'),
      function_id: 2,
      shortcut_id: 'IMAGE_UPLOAD',
    },
    {
      keys: 'Ctrl + Shift + F',
      description: getMessage('shortcut_template'),
      function_id: 3,
      shortcut_id: 'TEMPLATE',
    },
    {
      keys: 'Ctrl + Shift + P',
      description: getMessage('shortcut_prev_post'),
      function_id: 4,
      shortcut_id: 'PREV_POST',
    },
    {
      keys: 'Ctrl + Shift + Y',
      description: getMessage('shortcut_editor_mode'),
      function_id: 5,
      shortcut_id: 'EDITOR_MODE',
    },
  ]);

  const customKeyMapRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [customizingIndex, setCustomizingIndex] = useState<number | null>(null);
  const [customKeys, setCustomKeys] = useState<string[]>([]);
  const [error, setError] = useState('');

  // store에서 초기값 불러오기
  const getShortcuts = async () => {
    try {
      const result = await chrome.storage.local.get('shortcuts');
      console.table(result.shortcuts);
      setShortcuts([...result.shortcuts]);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    getShortcuts();
  }, []);
  // 키 조합이 변경될 때마다 실행
  useEffect(() => {
    const postShortcuts = async () => {
      try {
        const response = await chrome.storage.local.set({ shortcuts: shortcuts });
        console.log('저장결과', response);
      } catch (err) {
        console.error(err);
      }
    };
    postShortcuts();
  }, [shortcuts]);

  const startCustom = (index: number) => {
    setIsEditing(true);
    setCustomizingIndex(index);
    setCustomKeys([]);
    setError(''); // 에러 초기화

    setTimeout(() => {
      customKeyMapRef.current?.focus();
    }, 100);
  };

  const handleCustomKeyMap = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const allowedKeys =
      /^(Key|Digit|Bracket|Comma|Period|Slash|Backslash|Semicolon|Quote|Backquote|Minus|Equal|Enter|Backspace|Tab|ShiftLeft|ShiftRight|ControlLeft|ControlRight|AltLeft|AltRight|MetaLeft|MetaRight).*$/;

    if (!allowedKeys.test(e.code)) {
      return;
    }

    const keyCode = e.code.toUpperCase();
    let key;
    if (keyCode.startsWith('KEY')) {
      key = keyCode.slice(3);
    } else if (['METALEFT', 'SHIFTLEFT', 'CONTROLLEFT', 'ALTLEFT'].includes(keyCode)) {
      key = keyCode.slice(0, -4);
    }
    if (e.ctrlKey && !customKeys.includes('Ctrl')) {
      setCustomKeys(prev => [...prev, 'Ctrl']);
    }
    if (e.metaKey && !customKeys.includes('Command')) {
      setCustomKeys(prev => [...prev, 'Command']);
    }
    if (e.shiftKey && !customKeys.includes('Shift')) {
      setCustomKeys(prev => [...prev, 'Shift']);
    }
    if (e.altKey && !customKeys.includes('Alt')) {
      setCustomKeys(prev => [...prev, 'Alt']);
    }
    if (key !== 'CONTROL' && key !== 'ALT' && key !== 'SHIFT' && key !== 'META' && !customKeys.includes(key)) {
      setCustomKeys(prev => [...prev, key]);
    }
  };

  const saveCustomKeys = () => {
    if (customizingIndex !== null) {
      if (shortcuts.filter(s => s.custom === customKeys.sort((a, b) => b.length - a.length).join(' + ')).length === 0) {
        const keys = customKeys.sort((a, b) => b.length - a.length).join(' + ');
        setShortcuts(prev => prev.map((s, i) => (i === customizingIndex ? { ...s, custom: keys } : s)));
      } else {
        setError(getMessage('error_duplicate_shortcut'));
      }
    }
    setIsEditing(false);
    setCustomKeys([]);
    setCustomizingIndex(null);
  };

  const resetCustomKeys = (index: number) => {
    setShortcuts(prev => prev.map((s, i) => (i === index ? { ...s, custom: undefined } : s)));
  };

  return (
    <div className="funcDetailSetting">
      <table className="table" aria-label={getAriaLabel('shortcut_table')}>
        <caption className="sr-only">단축키 목록 및 사용자 지정</caption>
        <thead>
          <tr>
            <th scope="col">{getMessage('ui_table_header_shortcut')}</th>
            <th scope="col">{getMessage('ui_table_header_description')}</th>
            <th scope="col">{getMessage('ui_table_header_custom')}</th>
          </tr>
        </thead>
        <tbody>
          {shortcuts.map((shortcut, index) => (
            <tr key={index}>
              <td>{shortcut.custom || shortcut.keys}</td>
              <td>{shortcut.description}</td>
              <td>
                {shortcut.custom ? (
                  <button
                    onClick={() => resetCustomKeys(index)}
                    aria-label={getMessage('aria_shortcut_reset', [shortcut.description])}>
                    {getMessage('ui_button_reset')}
                  </button>
                ) : (
                  <button
                    onClick={() => startCustom(index)}
                    aria-label={getMessage('aria_shortcut_edit', [shortcut.description])}>
                    {getMessage('ui_button_edit')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ARIA Live Region for errors */}
      {error && (
        <div role="alert" aria-live="assertive" aria-label={getAriaLabel('error_message')} style={{ color: 'red' }}>
          {getMessage('error_duplicate_shortcut')}
        </div>
      )}

      {isEditing && (
        <div style={{ marginTop: '5px', padding: '2px' }} role="region" aria-label="단축키 편집 영역">
          <div>{getMessage('msg_shortcut_editing', [shortcuts[customizingIndex!].description])}</div>
          <div className="customArea">
            <div className="show" aria-live="polite" aria-atomic="true" role="status">
              {customKeys.length > 0 ? (
                customKeys.sort((a, b) => b.length - a.length).join(' + ')
              ) : (
                <p>{getMessage('msg_shortcut_input_prompt')}</p>
              )}
            </div>
            <input
              ref={customKeyMapRef}
              type="text"
              onKeyDown={handleCustomKeyMap}
              aria-label={getAriaLabel('shortcut_input')}
              className="shortcut-input"
            />
            <div>
              <button onClick={saveCustomKeys} aria-label={getAriaLabel('shortcut_save')}>
                {getMessage('ui_button_save')}
              </button>
              <button onClick={() => setIsEditing(false)} aria-label={getAriaLabel('shortcut_cancel')}>
                {getMessage('ui_button_cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ment" style={{ marginTop: '3px' }} role="note">
        <span dangerouslySetInnerHTML={{ __html: getMessage('msg_shortcut_refresh_required') }} />
      </div>
      <div className="ment" role="note">
        {getMessage('msg_shortcut_may_not_work')}
      </div>
    </div>
  );
};

export default FunctionDetailSetting;
