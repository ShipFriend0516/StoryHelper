import { afterEach, expect, test, vi } from 'vitest';
import textCounter from './textCounter';
import { createEditor } from '@root/test-utils/editor';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

// 카운터를 붙일 영역이 없는 화면에서 예외가 발생하던 문제의 기존 수정 보존.
test('카운터 표시 영역이 없으면 예외 없이 종료한다', async () => {
  createEditor();
  vi.spyOn(chrome.storage.local, 'get').mockImplementation(async () => ({ func_3: true }));
  await expect(textCounter()).resolves.toBeUndefined();
});
