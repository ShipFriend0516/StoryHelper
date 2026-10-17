import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { createEditor } from '@root/test-utils/editor';

const settings = { func_0: false, func_1: true, func_2: true, func_3: true, func_4: false, func_5: false };

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '<div class="btn-category"></div>';
  createEditor();
  vi.spyOn(chrome.storage.local, 'get').mockImplementation(async () => settings);
  vi.spyOn(chrome.i18n, 'getMessage').mockImplementation((key, substitutions) =>
    key === 'text_counter_label' ? `글자 수: ${substitutions[0]}` : key,
  );
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('기능 초기화', () => {
  // Alt 입력기의 실패가 이후 이미지 조절기와 카운터까지 중단시키는 회귀 방지.
  test.each(['동기 예외', '비동기 거부'])('%s가 발생해도 나머지 기능을 표시한다', async failure => {
    document.body.insertAdjacentHTML('afterbegin', '<button id="mceu_18">기존 도구</button>');
    vi.mocked(chrome.storage.local.get).mockImplementation(key => {
      if (key === 'func_1') {
        const error = new Error('Feature initialization failed');
        if (failure === '동기 예외') throw error;
        return Promise.reject(error);
      }
      return Promise.resolve(settings);
    });

    await import('./index');

    await vi.waitFor(() => {
      expect(screen.getByText('글자 수: 3')).toBeTruthy();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });

  // TinyMCE의 자동 ID가 바뀌어도 툴바 구조를 이용해 편집 버튼을 제공해야 함.
  test.each([
    '<button id="mceu_18">기존 도구</button>',
    '<div class="mce-toolbar"><div class="mce-btn"><button>기존 도구</button></div></div>',
    '<div class="tox-toolbar__group"><button class="tox-tbtn">기존 도구</button></div>',
  ])('사용 가능한 툴바에 편집 버튼들을 추가한다: %s', async toolbar => {
    document.body.insertAdjacentHTML('afterbegin', toolbar);

    await import('./index');

    await vi.waitFor(() => {
      expect(screen.getByText('글자 수: 3')).toBeTruthy();
      expect(screen.getAllByRole('button')).toHaveLength(3);
    });
  });

  // 툴바가 없는 편집 화면에서도 독립적인 카운터는 동작해야 함.
  test('툴바가 없으면 편집 버튼을 건너뛰고 카운터를 표시한다', async () => {
    await import('./index');

    await vi.waitFor(() => expect(screen.getByText('글자 수: 3')).toBeTruthy());
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // 공통 설정 조회로 바꿔도 미설정 기능은 활성화되고 명시적으로 끈 기능은 표시되지 않아야 함.
  test.each([
    { enabled: undefined, buttons: 3 },
    { enabled: false, buttons: 2 },
  ])('저장된 기능 활성화 상태에 맞춰 편집 버튼을 표시한다: $enabled', async ({ enabled, buttons }) => {
    document.body.insertAdjacentHTML('afterbegin', '<button id="mceu_18">기존 도구</button>');
    vi.mocked(chrome.storage.local.get).mockImplementation(async () => ({ ...settings, func_1: enabled }));

    await import('./index');

    await vi.waitFor(() => {
      expect(screen.getByText('글자 수: 3')).toBeTruthy();
      expect(screen.getAllByRole('button')).toHaveLength(buttons);
    });
  });

  // 툴바·이미지 조회 공통화 이후에도 각 버튼이 본문 이미지에 기존 편집을 적용해야 함.
  test('공통 툴바의 버튼으로 대체 텍스트와 이미지 크기를 수정한다', async () => {
    document.body.insertAdjacentHTML('afterbegin', '<button id="mceu_18">기존 도구</button>');
    const editorDocument = document.querySelector('iframe').contentDocument;
    const image = editorDocument.createElement('img');
    image.dataset.originWidth = '800';
    image.dataset.originHeight = '600';
    editorDocument.body.appendChild(image);
    vi.spyOn(window, 'prompt').mockReturnValueOnce('이미지 설명').mockReturnValueOnce('400');

    await import('./index');

    await vi.waitFor(() => expect(screen.getAllByRole('button')).toHaveLength(3));
    const [, altButton, resizeButton] = screen.getAllByRole('button');
    altButton.click();
    expect(image.alt).toBe('이미지 설명');
    resizeButton.click();
    expect(image.width).toBe(400);
    expect(image.height).toBe(300);
  });
});
