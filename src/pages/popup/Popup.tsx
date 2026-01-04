import React, { useState, useRef } from 'react';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import FuncList from './components/FuncList';
import FunctionDetailSetting from './components/FunctionDetailSetting';
import Credit from './components/Credit';
import packageJson from '@root/package.json';
import { getAriaLabel, getMessage } from '@src/shared/utils/i18n';

const Popup = () => {
  const currentVersion = packageJson.version;
  const [selectedTab, setSelectedTab] = useState(0);
  const tabList = [getMessage('ui_tab_features'), getMessage('ui_tab_shortcuts'), getMessage('ui_tab_credits')];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabContent = {
    0: <FuncList />,
    1: <FunctionDetailSetting />,
    2: <Credit version={currentVersion} />,
  };

  // 탭 간 키보드 네비게이션 (Arrow keys)
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabList.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabList.length) % tabList.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabList.length - 1;
    } else {
      return; // 다른 키는 무시
    }

    e.preventDefault();
    setSelectedTab(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  return (
    <main className="popup-container" aria-label={getAriaLabel('popup_main')}>
      <div className="popup-header">
        <img src={chrome.runtime.getURL('icon-128.png')} alt="StoryHelper Logo" className="popup-logo" />
        <div>
          <h1>Story Helper</h1>
          <p dangerouslySetInnerHTML={{ __html: getMessage('ui_header_title') }} />
        </div>
      </div>

      <div className="tab" role="tablist" aria-label={getAriaLabel('tablist')}>
        {tabList.map((tab, i) => (
          <button
            key={i}
            ref={el => (tabRefs.current[i] = el)}
            role="tab"
            aria-selected={selectedTab === i}
            aria-controls={`tabpanel-${i}`}
            id={`tab-${i}`}
            tabIndex={selectedTab === i ? 0 : -1}
            onClick={() => setSelectedTab(i)}
            onKeyDown={e => handleTabKeyDown(e, i)}
            className={selectedTab === i ? 'selected' : ''}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tabpanel with proper ARIA */}
      <div role="tabpanel" id={`tabpanel-${selectedTab}`} aria-labelledby={`tab-${selectedTab}`} tabIndex={0}>
        {tabContent[selectedTab]}
      </div>
    </main>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div>{getMessage('msg_loading')}</div>),
  <div>{getMessage('msg_error')}</div>,
);
