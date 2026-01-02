/**
 * StoryHelper 확장프로그램 툴팁 생성 유틸리티
 * 모든 도구 버튼에 일관된 스타일의 툴팁을 제공합니다.
 */

/**
 * 로고가 포함된 툴팁 요소를 생성합니다.
 * @param text - 툴팁에 표시할 텍스트
 * @returns 생성된 툴팁 HTMLDivElement
 */
export const createTooltip = (text: string): HTMLDivElement => {
  const tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');
  tooltip.style.position = 'absolute';
  tooltip.style.padding = '3px 5px';
  tooltip.style.marginTop = '10px';
  tooltip.style.backgroundColor = '#333';
  tooltip.style.color = '#fff';
  tooltip.style.borderRadius = '2px';
  tooltip.style.fontSize = '11px';
  tooltip.style.visibility = 'hidden';
  tooltip.style.zIndex = '1000';
  tooltip.style.display = 'flex';
  tooltip.style.alignItems = 'center';
  tooltip.style.gap = '4px';
  tooltip.style.whiteSpace = 'nowrap';
  tooltip.style.transform = 'translateX(-50%)'; // 버튼 중앙 정렬

  // 로고 이미지 추가
  const logoUrl = chrome.runtime.getURL('icon-34.png');
  const logo = document.createElement('img');
  logo.src = logoUrl;
  logo.style.width = '12px';
  logo.style.height = '12px';
  logo.style.borderRadius = '2px';

  // 텍스트 추가
  const textSpan = document.createElement('span');
  textSpan.textContent = text;

  tooltip.appendChild(logo);
  tooltip.appendChild(textSpan);

  return tooltip;
};

/**
 * 툴팁을 버튼 위치에 표시합니다.
 * @param tooltip - 툴팁 요소
 * @param button - 버튼 요소
 */
export const showTooltip = (tooltip: HTMLDivElement, button: HTMLElement): void => {
  const rect = button.getBoundingClientRect();
  // 버튼의 중앙 위치를 계산 (translateX(-50%)와 함께 사용하여 중앙 정렬)
  const left = rect.left + rect.width / 2 + window.scrollX;
  const top = rect.bottom + window.scrollY;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.visibility = 'visible';
};

/**
 * 툴팁을 숨깁니다.
 * @param tooltip - 툴팁 요소
 */
export const hideTooltip = (tooltip: HTMLDivElement): void => {
  tooltip.style.visibility = 'hidden';
};
