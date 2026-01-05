import { useState, useEffect } from 'react';
import { getMessage, getAriaLabel } from '@src/shared/utils/i18n';
import NewBadge from './NewBadge';

interface FunctionItem {
  name: string;
  isNew?: boolean;
}

const FuncList = () => {
  const funcList: FunctionItem[] = [
    { name: getMessage('feature_extra_shortcuts'), isNew: false },
    { name: getMessage('feature_alt_tagger'), isNew: false },
    { name: getMessage('feature_image_resizer'), isNew: false },
    { name: getMessage('feature_text_counter'), isNew: false },
    { name: getMessage('feature_seo_checker'), isNew: true },
  ];
  const [checkedList, setCheckedList] = useState<Record<string, boolean>>({});

  const onChangeCheckBox = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const funcKey: string = `func_${index}`;
    const target = event.target as HTMLInputElement;

    setCheckedList(prev => {
      return { ...prev, [funcKey]: target.checked };
    });

    chrome.storage.local.set({ [funcKey]: target.checked });
  };

  const loadPreChecked = (): void => {
    const arr = funcList.map((_, i) => `func_${i}`);
    chrome.storage.local.get(arr, result => {
      setCheckedList(result);
    });
  };

  useEffect(() => {
    loadPreChecked();
  }, []);

  return (
    <div>
      <ul className="funcList">
        {funcList.map((func, i) => {
          const key = `func_${i}`;
          const checkboxId = `feature-checkbox-${i}`;

          return (
            <li key={i}>
              <input
                type="checkbox"
                id={checkboxId}
                checked={checkedList[key] || false}
                onChange={event => onChangeCheckBox(event, i)}
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
