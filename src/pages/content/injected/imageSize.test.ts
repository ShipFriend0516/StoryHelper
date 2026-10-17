import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import imageSize from './imageSize';
import { createEditor } from '@root/test-utils/editor';

beforeEach(() => {
  document.body.innerHTML = '<button id="mceu_18">기존 도구</button><div role="status"></div>';
  createEditor();
  vi.spyOn(chrome.storage.local, 'get').mockImplementation(async () => ({ func_2: true }));
  vi.spyOn(window, 'alert').mockImplementation(() => {
    screen.getByRole('status').textContent = '입력 오류';
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

async function resize(input: string | null) {
  vi.spyOn(window, 'prompt').mockReturnValue(input);
  await imageSize();
  const [, button] = screen.getAllByRole('button');
  button.click();
}

function addImage(attributes: string) {
  const editorDocument = document.querySelector('iframe').contentDocument;
  editorDocument.body.insertAdjacentHTML('beforeend', `<img ${attributes}>`);
  return editorDocument.querySelector('img');
}

describe('이미지 크기 조절', () => {
  // 입력 취소가 숫자 오류 경고로 처리되던 회귀 방지.
  test('입력을 취소하면 경고 없이 기존 크기를 유지한다', async () => {
    const image = addImage('width="800" height="600"');
    await resize(null);
    expect(screen.getByRole('status').textContent).toBe('');
    expect([image.width, image.height]).toEqual([800, 600]);
  });

  // 원본 크기 속성이 없는 이미지의 높이가 0으로 손상되던 회귀 방지.
  test.each([
    {
      name: '원본 속성',
      attributes: 'width="800" height="600" data-origin-width="800" data-origin-height="600"',
      height: 300,
    },
    { name: '잘못된 원본 속성', attributes: 'width="800" height="600" data-origin-width="invalid"', height: 200 },
    { name: '실제 이미지 크기', attributes: 'width="800" height="600"', height: 200 },
  ])('$name의 비율로 이미지 크기를 변경한다', async ({ attributes, height }) => {
    const image = addImage(attributes);
    Object.defineProperties(image, { naturalWidth: { value: 1200 }, naturalHeight: { value: 600 } });
    await resize('400');
    expect([image.width, image.height]).toEqual([400, height]);
  });

  test('원본 속성과 실제 크기가 없으면 표시 크기의 비율을 유지한다', async () => {
    const image = addImage('width="800" height="600"');
    await resize('400');
    expect([image.width, image.height]).toEqual([400, 300]);
  });

  test('높이를 구할 수 없는 이미지는 기존 크기를 유지한다', async () => {
    const image = addImage('width="800"');
    await resize('400');
    expect([image.width, image.height]).toEqual([800, 0]);
  });

  test.each(['', '0', '-10', '400px', '1.5'])('잘못된 크기 입력을 거절한다: %s', async input => {
    const image = addImage('width="800" height="600"');
    await resize(input);
    expect(screen.getByRole('status').textContent).toBe('입력 오류');
    expect([image.width, image.height]).toEqual([800, 600]);
  });
});
