import { useState, useEffect } from 'react';
import { getMessage, getAriaLabel } from '@src/shared/utils/i18n';
import NewBadge from './NewBadge';

interface FunctionItem {
  name: string;
  isNew?: boolean;
}

const FuncList = () => {
  const funcList: FunctionItem[] = [
    { name: '추가 단축키 활성화', isNew: false },
    { name: '이미지 대체텍스트 입력기', isNew: false },
    { name: '이미지 사이즈 조절기', isNew: false },
    { name: '글자 수 카운터', isNew: false },
    { name: '검색엔진 최적화 검증 (v1.5)', isNew: true },
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
        기능 활성화/비활성화 후 <b>새로고침</b>해야 적용됩니다.
      </div>
    </div>
  );
};

export default FuncList;
