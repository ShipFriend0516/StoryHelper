import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import FunctionDetailSetting from './FunctionDetailSetting';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// 숫자 입력이 undefined로 저장되어 실행할 수 없는 단축키가 되던 회귀 방지.
test.each(['Digit1', 'Numpad1'])('%s 키를 숫자 단축키로 저장한다', async code => {
  vi.spyOn(chrome.storage.local, 'get').mockImplementation(async () => ({
    shortcuts: [{ keys: 'Ctrl + P', description: '글 발행 테스트', shortcut_id: 'PUBLISH' }],
  }));
  render(<FunctionDetailSetting />);
  await screen.findByText('글 발행 테스트');
  fireEvent.click(screen.getByRole('button', { name: 'aria_shortcut_edit' }));
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'aria_shortcut_input' }), { code, key: '1', ctrlKey: true });
  fireEvent.click(screen.getByRole('button', { name: 'aria_shortcut_save' }));
  expect(await screen.findByText('Ctrl + 1')).toBeTruthy();
});
