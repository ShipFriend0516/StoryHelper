/**
 * Chrome Extension을 위한 국제화 유틸리티 함수
 * chrome.i18n API를 사용하여 지역화된 메시지를 가져옴
 */

/**
 * chrome.i18n에서 국제화된 메시지를 가져옴
 * @param key - messages.json의 메시지 키
 * @param substitutions - 선택적 치환 문자열 배열
 * @returns 지역화된 메시지 또는 폴백으로 키 자체
 */
export const getMessage = (key: string, substitutions?: string[]): string => {
  return chrome.i18n.getMessage(key, substitutions) || key;
};

/**
 * messages.json에서 ARIA 라벨을 가져옴
 * 키에 'aria_' 접두사를 자동으로 추가함
 * @param key - ARIA 라벨 키 ('aria_' 접두사 제외)
 * @returns 지역화된 ARIA 라벨
 */
export const getAriaLabel = (key: string): string => {
  return getMessage(`aria_${key}`);
};
