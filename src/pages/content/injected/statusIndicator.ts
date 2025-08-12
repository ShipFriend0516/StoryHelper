import { $, create$ } from '@root/utils/dom/utilDOM';

interface FunctionStatus {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

const statusIndicator = async () => {
  // 기능 정의
  const functions: Omit<FunctionStatus, 'enabled'>[] = [
    { id: 'func_0', name: '추가 단축키', icon: '⌨️' },
    { id: 'func_1', name: 'Alt태그 입력기', icon: '🏷️' },
    { id: 'func_2', name: '이미지 사이즈 일괄 조절기능', icon: '📐' },
    { id: 'func_3', name: '글자수 카운터', icon: '📝' },
    { id: 'func_4', name: 'SEO 최적화 검증기능', icon: '🔍' },
  ];

  // 컨테이너 스타일
  const containerStyle = {
    position: 'fixed' as const,
    bottom: '80px',
    left: '20px',
    display: 'flex',
    gap: '8px',
    zIndex: '9998',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '8px 12px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  };

  // 아이콘 스타일 (활성화)
  const iconStyleEnabled = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    backgroundColor: '#f0f7ff',
    border: '1px solid #4a90e2',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: '1',
    position: 'relative' as const,
  };

  // 아이콘 스타일 (비활성화)
  const iconStyleDisabled = {
    ...iconStyleEnabled,
    opacity: '0.3',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
  };

  // 툴팁 스타일
  const tooltipStyle = {
    position: 'absolute' as const,
    bottom: '110%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    whiteSpace: 'nowrap' as const,
    visibility: 'hidden' as const,
    opacity: '0',
    transition: 'all 0.2s ease',
    pointerEvents: 'none' as const,
    zIndex: '10000',
  };

  // 화살표 스타일 (툴팁용)
  const arrowStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '5px solid rgba(0, 0, 0, 0.9)',
  };

  // 헤더 스타일
  const headerStyle = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
    marginRight: '8px',
    paddingRight: '8px',
    borderRight: '1px solid #ddd',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  // 로고 스타일
  const logoStyle = {
    width: '16px',
    height: '16px',
    objectFit: 'contain' as const,
  };

  // 컨테이너 생성
  const container = create$('div', {
    id: 'storyhelper-status-indicator',
    style: containerStyle,
  });

  // 헤더 추가
  const header = create$('div', {
    style: headerStyle,
  });

  // 로고 이미지 추가
  const logo = create$('img', {
    src: chrome.runtime.getURL('icon-128.png'),
    alt: 'StoryHelper Logo',
    style: logoStyle,
  }) as HTMLImageElement;

  const headerText = create$('span', {
    textContent: 'StoryHelper',
  });

  header.appendChild(logo);
  header.appendChild(headerText);
  container.appendChild(header);

  // 각 기능의 상태를 가져와서 아이콘 생성
  const createStatusIcon = async (func: Omit<FunctionStatus, 'enabled'>) => {
    const storageKey = func.id;
    const result = await chrome.storage.local.get(storageKey);
    const isEnabled = result[storageKey] === true;

    // 아이콘 컨테이너
    const iconWrapper = create$('div', {
      style: { position: 'relative' },
    });

    // 아이콘
    const icon = create$('div', {
      style: isEnabled ? iconStyleEnabled : iconStyleDisabled,
      textContent: func.icon,
      id: `status-${func.id}`,
      dataset: {
        function: func.id,
        enabled: String(isEnabled),
      },
    });

    // 호버 효과
    icon.addEventListener('mouseenter', () => {
      if (isEnabled) {
        icon.style.backgroundColor = '#e8f2ff';
        icon.style.transform = 'translateY(-2px)';
        icon.style.boxShadow = '0 4px 8px rgba(74, 144, 226, 0.2)';
      } else {
        icon.style.backgroundColor = '#f0f0f0';
      }
      tooltip.style.visibility = 'visible';
      tooltip.style.opacity = '1';
    });

    icon.addEventListener('mouseleave', () => {
      if (isEnabled) {
        icon.style.backgroundColor = '#f0f7ff';
      } else {
        icon.style.backgroundColor = '#f5f5f5';
      }
      icon.style.transform = 'translateY(0)';
      icon.style.boxShadow = 'none';
      tooltip.style.visibility = 'hidden';
      tooltip.style.opacity = '0';
    });

    // 클릭 이벤트 (옵션: 클릭시 기능 토글)
    icon.addEventListener('click', async () => {
      const currentStatus = icon.dataset.enabled === 'true';
      const newStatus = !currentStatus;

      // 스토리지 업데이트
      await chrome.storage.local.set({ [func.id]: newStatus });

      // UI 업데이트
      icon.dataset.enabled = String(newStatus);
      Object.assign(icon.style, newStatus ? iconStyleEnabled : iconStyleDisabled);

      // 툴팁 업데이트
      const statusText = newStatus ? '활성화' : '비활성화';
      const statusColor = newStatus ? '#4CAF50' : '#f44336';
      tooltip.innerHTML = `
        <strong>${func.name}</strong><br/>
        <span style="color: ${statusColor}; font-size: 11px;">● ${statusText}</span>
      `;

      // 애니메이션 효과
      icon.style.transform = 'scale(0.9)';
      setTimeout(() => {
        icon.style.transform = 'scale(1)';
      }, 100);
    });

    // 툴팁
    const tooltip = create$('div', {
      style: tooltipStyle,
    });

    const statusText = isEnabled ? '활성화' : '비활성화';
    const statusColor = isEnabled ? '#4CAF50' : '#f44336';
    tooltip.innerHTML = `
      <strong>${func.name}</strong><br/>
      <span style="color: ${statusColor}; font-size: 11px;">● ${statusText}</span>
    `;

    // 툴팁 화살표
    const arrow = create$('div', {
      style: arrowStyle,
    });
    tooltip.appendChild(arrow);

    iconWrapper.appendChild(icon);
    iconWrapper.appendChild(tooltip);

    return iconWrapper;
  };

  // 모든 아이콘 생성 및 추가
  for (const func of functions) {
    const icon = await createStatusIcon(func);
    container.appendChild(icon);
  }

  // 최소화/확대 버튼
  const toggleButton = create$('div', {
    style: {
      ...iconStyleEnabled,
      width: '24px',
      height: '24px',
      fontSize: '14px',
      marginLeft: '8px',
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      cursor: 'pointer',
    },
    textContent: '◀',
    id: 'status-toggle',
  });

  // 버튼 호버 효과
  toggleButton.addEventListener('mouseenter', () => {
    toggleButton.style.backgroundColor = '#f0f0f0';
    toggleButton.style.transform = 'scale(1.1)';
  });

  toggleButton.addEventListener('mouseleave', () => {
    toggleButton.style.backgroundColor = '#fff';
    toggleButton.style.transform = 'scale(1)';
  });

  container.appendChild(toggleButton);

  // 최소화 상태 관리
  let isMinimized = false;

  // 토글 버튼 클릭 이벤트 - 최소화
  toggleButton.addEventListener('click', () => {
    isMinimized = true;

    // 최소화 - 로고만 보이게
    container.style.padding = '8px';
    container.style.minWidth = '32px';
    container.style.backgroundColor = 'transparent';
    container.style.boxShadow = 'none';
    container.style.border = 'none';
    headerText.style.display = 'none';
    header.style.marginRight = '0';
    header.style.paddingRight = '0';
    header.style.borderRight = 'none';

    // 토글 버튼 숨기기
    toggleButton.style.display = 'none';

    // 아이콘들 숨기기
    const iconWrappers = container.querySelectorAll('[id^="status-func"]');
    iconWrappers.forEach((icon: HTMLElement) => {
      if (icon.parentElement) {
        icon.parentElement.style.display = 'none';
      }
    });

    // 로고 크기 살짝 키우기
    logo.style.width = '40px';
    logo.style.height = '40px';
    logo.style.cursor = 'pointer';

    // 컨테이너 호버 효과
    container.title = '클릭하여 확장';
  });

  // 로고 클릭 이벤트 - 확대
  logo.addEventListener('mouseenter', () => {
    if (isMinimized) {
      logo.style.transform = 'scale(1.1)';
    }
  });

  logo.addEventListener('mouseleave', () => {
    logo.style.transform = 'scale(1)';
  });

  logo.addEventListener('click', () => {
    if (isMinimized) {
      isMinimized = false;

      // 확대 - 모든 요소 보이게
      container.style.padding = '8px 12px';
      container.style.minWidth = 'auto';
      container.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      container.style.border = '1px solid rgba(0, 0, 0, 0.05)';
      headerText.style.display = 'inline';
      header.style.marginRight = '8px';
      header.style.paddingRight = '8px';
      header.style.borderRight = '1px solid #ddd';

      // 토글 버튼 다시 보이기
      toggleButton.style.display = 'flex';

      // 아이콘들 보이기
      const iconWrappers = container.querySelectorAll('[id^="status-func"]');
      iconWrappers.forEach((icon: HTMLElement) => {
        if (icon.parentElement) {
          icon.parentElement.style.display = 'block';
        }
      });

      // 로고 크기 원래대로
      logo.style.width = '16px';
      logo.style.height = '16px';
      logo.style.cursor = 'default';

      container.title = '';
    }
  });

  // DOM에 추가
  document.body.appendChild(container);

  // 스토리지 변경 감지
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      Object.keys(changes).forEach(async key => {
        if (key.startsWith('func_')) {
          const icon = $(`#status-${key}`) as HTMLElement;
          if (icon) {
            const newValue = changes[key].newValue;
            const isEnabled = newValue === true;

            // 아이콘 스타일 업데이트
            Object.assign(icon.style, isEnabled ? iconStyleEnabled : iconStyleDisabled);
            icon.dataset.enabled = String(isEnabled);

            // 툴팁 업데이트
            const tooltip = icon.nextElementSibling as HTMLElement;
            if (tooltip) {
              const funcName = functions.find(f => f.id === key)?.name || '';
              const statusText = isEnabled ? '활성화' : '비활성화';
              const statusColor = isEnabled ? '#4CAF50' : '#f44336';
              tooltip.innerHTML = `
                <strong>${funcName}</strong><br/>
                <span style="color: ${statusColor}; font-size: 11px;">● ${statusText}</span>
                <div style="${Object.entries(arrowStyle)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('; ')}"></div>
              `;
            }
          }
        }
      });
    }
  });

  console.log('StoryHelper 상태 표시기가 활성화되었습니다.');
};

export default statusIndicator;
