import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import onboarding from './onboarding';

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(chrome.storage.local, 'set').mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const mockOnboarded = (value?: boolean) =>
  vi
    .spyOn(chrome.storage.local, 'get')
    .mockImplementation(async () => (value === undefined ? {} : { sh_onboarded: value }));

describe('에디터 첫 방문 온보딩', () => {
  // 미리보기 기능이 꺼진 기본 설정에서도 다른 도구 버튼으로 안내해야 함.
  test('추가된 도구 버튼이 있으면 강조와 안내 문구를 표시하고 완료로 기록한다', async () => {
    mockOnboarded();
    document.body.innerHTML = '<div id="altTager"></div><div id="sh-image-sizer-btn"></div>';

    await onboarding();

    expect(document.getElementById('sh-onboarding-overlay')).toBeTruthy();
    expect(document.getElementById('sh-onboarding-hint')?.textContent).toBe('onboarding_toolbar_hint');
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ sh_onboarded: true });
  });

  test('안내 문구를 누르거나 시간이 지나면 사라진다', async () => {
    mockOnboarded();
    document.body.innerHTML = '<div id="altTager"></div>';

    await onboarding();
    document.getElementById('sh-onboarding-hint')?.click();
    expect(document.getElementById('sh-onboarding-overlay')).toBeNull();

    document.body.innerHTML = '<div id="altTager"></div>';
    await onboarding();
    vi.advanceTimersByTime(8000);
    expect(document.getElementById('sh-onboarding-hint')).toBeNull();
  });

  test('표시할 버튼이 없으면 완료로 기록하지 않는다', async () => {
    mockOnboarded();

    await onboarding();

    expect(document.getElementById('sh-onboarding-overlay')).toBeNull();
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });

  test('이미 안내를 본 사용자에게는 다시 표시하지 않는다', async () => {
    mockOnboarded(true);
    document.body.innerHTML = '<div id="altTager"></div>';

    await onboarding();

    expect(document.getElementById('sh-onboarding-overlay')).toBeNull();
  });
});
