import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import keyMapping from './keymap';
import { createEditor } from '@root/test-utils/editor';

beforeEach(() => {
  document.body.innerHTML = '<div role="status"></div>';
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('추가 단축키', () => {
  // 이미지 메뉴의 자동 ID 변경 후에도 아이콘·도구 속성으로 업로드를 열어야 함.
  test.each([
    '<button id="mceu_0-open">이미지</button>',
    '<button class="tox-tbtn" data-mce-name="image">이미지</button>',
    '<button><i class="mce-i-image"></i>이미지</button>',
  ])('이미지 메뉴를 찾아 업로드를 선택한다: %s', async toolbar => {
    const editor = createEditor();
    document.body.insertAdjacentHTML('beforeend', toolbar);
    const opener = screen.getByRole('button', { name: '이미지' });
    opener.addEventListener('click', () => {
      const upload = document.createElement('button');
      upload.id = 'attach-image';
      upload.addEventListener('click', () => {
        screen.getByRole('status').textContent = '이미지 업로드 선택됨';
      });
      document.body.appendChild(upload);
    });
    vi.spyOn(chrome.storage.local, 'get').mockImplementation(async () => ({
      func_0: true,
      shortcuts: [{ keys: 'Ctrl + Shift + U', shortcut_id: 'IMAGE_UPLOAD' }],
    }));
    await keyMapping();

    // iframe 내부 입력은 상위 document로 전파되지 않으므로 편집 영역에서 실행.
    editor.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyU', ctrlKey: true, shiftKey: true, cancelable: true }),
    );

    expect(screen.getByRole('status').textContent).toBe('이미지 업로드 선택됨');
  });

  // 편집 영역이 아직 없는 페이지에서 초기화가 예외로 중단되는 회귀 방지.
  test('편집 영역이 없으면 단축키 등록을 건너뛴다', async () => {
    vi.spyOn(chrome.storage.local, 'get').mockImplementation(async () => ({ func_0: true }));

    await expect(keyMapping()).resolves.toBeUndefined();
  });
});

describe.each(['기본', '사용자 지정'])('%s 단축키 매칭', mode => {
  // 추가 보조키 오작동과 숫자 키 미매칭 회귀를 실제 발행 버튼 동작으로 검증.
  test.each([
    { combo: 'Ctrl + P', code: 'KeyP', ctrlKey: true, shiftKey: true, active: false },
    { combo: 'Ctrl + P', code: 'KeyP', ctrlKey: true, altKey: true, active: false },
    { combo: 'Ctrl + P', code: 'KeyP', ctrlKey: true, metaKey: true, active: false },
    { combo: 'Ctrl + Shift + P', code: 'KeyP', ctrlKey: true, shiftKey: true, active: true },
    { combo: 'Ctrl + P', code: 'KeyP', metaKey: true, active: true },
    { combo: 'Ctrl + 1', code: 'Digit1', ctrlKey: true, active: true },
    { combo: 'Ctrl + 1', code: 'Numpad1', ctrlKey: true, active: true },
  ])('$combo를 입력 보조키와 숫자 키에 맞춰 실행한다: $code', async ({ combo, active, ...event }) => {
    const editor = createEditor();
    document.body.insertAdjacentHTML('beforeend', '<button id="publish-layer-btn">발행</button>');
    const publish = screen.getByRole('button', { name: '발행' });
    publish.addEventListener('click', () => {
      screen.getByRole('status').textContent = '발행 실행';
    });
    const shortcut = { keys: combo, shortcut_id: 'PUBLISH', ...(mode === '사용자 지정' ? { custom: combo } : {}) };
    vi.spyOn(chrome.storage.local, 'get').mockImplementation(async () => ({ func_0: true, shortcuts: [shortcut] }));
    await keyMapping();

    editor.dispatchEvent(new KeyboardEvent('keydown', { ...event, cancelable: true }));

    expect(screen.getByRole('status').textContent).toBe(active ? '발행 실행' : '');
  });
});
