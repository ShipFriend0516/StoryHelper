import React, { useState } from 'react';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import FuncList from './components/FuncList';
import FunctionDetailSetting from './components/FunctionDetailSetting';
import Credit from './components/Credit';
import packageJson from '@root/package.json';

const Popup = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const tabList = ['기능 목록', '단축키 사용자 지정', '크레딧'];
  const currentVersion = packageJson.version;

  return (
    <main className="popup-container">
      <h1>Story Helper</h1>
      <p>티스토리 글쓰기를 더 편하게</p>
      <div className="tab">
        {tabList.map((tab, i) => (
          <button
            onClick={() => {
              setSelectedTab(i);
            }}
            className={`${selectedTab === i && 'selected'}`}
            key={i}>
            {tab}
          </button>
        ))}
      </div>
      {selectedTab === 0 && <FuncList />}
      {selectedTab === 1 && <FunctionDetailSetting />}
      {selectedTab === 2 && <Credit version={currentVersion} />}
    </main>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
