import { useState, useEffect } from 'react';
import { getMessage, getAriaLabel } from '@src/shared/utils/i18n';
import NewBadge from './NewBadge';
import { FEATURES } from '@src/shared/config/features';

const funcList = FEATURES.map(f => ({
  key: f.key,
  name: getMessage(f.messageKey),
  isNew: f.isNew,
}));

const FuncList = () => {
  const [checkedList, setCheckedList] = useState<Record<string, boolean>>({});

  const onChangeCheckBox = (event: React.ChangeEvent<HTMLInputElement>, funcKey: string) => {
    const target = event.target as HTMLInputElement;

    setCheckedList(prev => {
      return { ...prev, [funcKey]: target.checked };
    });

    chrome.storage.local.set({ [funcKey]: target.checked });
  };

  useEffect(() => {
    const arr = funcList.map(f => f.key);
    chrome.storage.local.get(arr, result => {
      setCheckedList(result);
    });
  }, []);

  return (
    <div>
      <ul className="funcList">
        {funcList.map((func, i) => {
          const checkboxId = `feature-checkbox-${i}`;

          return (
            <li key={func.key}>
              <input
                type="checkbox"
                id={checkboxId}
                checked={checkedList[func.key] || false}
                onChange={event => onChangeCheckBox(event, func.key)}
                aria-label={getMessage('aria_feature_toggle', [func.name])}
              />
              <label htmlFor={checkboxId}>
                <span>{func.name}</span>
                <NewBadge isNew={func.isNew} />
              </label>
            </li>
          );
        })}
      </ul>
      <div className="ment" role="note" aria-label={getAriaLabel('refresh_required')}>
        <span dangerouslySetInnerHTML={{ __html: getMessage('msg_refresh_required') }} />
      </div>
    </div>
  );
};

export default FuncList;
