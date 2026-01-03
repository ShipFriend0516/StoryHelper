import { $, getEditorDocument } from '@root/utils/dom/utilDOM';

interface Shortcut {
  keys: string;
  description: string;
  function_id?: number;
  custom?: string;
}

async function keyMapping() {
  const result = await chrome.storage.local.get('func_0');
  if (typeof result.func_0 === 'boolean') {
    if (!result.func_0) {
      console.log('단축키 기능이 비활성화 되어있습니다.');
      return;
    } else {
      console.log('단축키 기능이 활성화 되어있습니다.');
    }
  }

  const editor = $('#tinymce', getEditorDocument());

  async function getCustomShortcuts() {
    try {
      const response = await chrome.storage.local.get('shortcuts');
      if (response.shortcuts) return response.shortcuts;
      else {
        ('Error');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const shortcuts: Shortcut[] = await getCustomShortcuts();

  function handleKeyDown(event: KeyboardEvent) {
    if (shortcuts)
      shortcuts.forEach(shortcut => {
        if (shortcut.custom) {
          const customKeys = shortcut.custom.split(' + ');
          const isSatisfied = customKeys.every(key => {
            switch (key) {
              case 'Ctrl':
              case 'Meta':
              case 'Command':
                return event.metaKey || event.ctrlKey;
              case 'Shift':
                return event.shiftKey;
              case 'Alt':
                return event.altKey;
              default:
                return event.code === `Key${key.toUpperCase()}`;
            }
          });

          if (isSatisfied) {
            event.preventDefault();
            handleShortcut(shortcut);
          }
        } else if (shortcut.keys) {
          const defaultKeys = shortcut.keys.split(' + ');
          const isSatisfied = defaultKeys.every(key => {
            switch (key) {
              case 'Shift':
                return event.shiftKey;
              case 'Alt':
                return event.altKey;
              case 'Ctrl':
              case 'Meta':
              case 'Command':
                return event.metaKey || event.ctrlKey;
              default:
                return event.code === `Key${key.toUpperCase()}`;
            }
          });

          if (isSatisfied) {
            event.preventDefault();
            handleShortcut(shortcut);
          }
        }
      });
  }

  function handleShortcut(shortcut: Shortcut) {
    switch (shortcut.description) {
      case '글 발행':
        handlePublishShortcut();
        break;
      case '이미지 업로드':
        handleImageUploadShortcut();
        break;
      case '서식 창 열기':
        handleTemplateShortcut();
        break;
      case '이전 포스트 링크':
        handlePrevPostShortcut();
        break;
      case '에디터 변환':
        handleEditorModeShortcut();
        break;
      default:
        console.log(`Custom shortcut: ${shortcut.description}`);
    }
  }

  function handlePublishShortcut() {
    const targetButton = $('#publish-layer-btn') as HTMLElement;
    if (targetButton) {
      targetButton.click();
    }
  }

  function handleImageUploadShortcut() {
    const targetButton = $('#mceu_0-open') as HTMLInputElement;
    if (targetButton) {
      targetButton.click();
      const imageUploadButton = $('#attach-image') as HTMLInputElement;
      if (imageUploadButton) {
        imageUploadButton.click();
      }
    }
  }

  function handleTemplateShortcut() {
    const targetButton = $('#more-plugin-btn-open') as HTMLInputElement;
    if (targetButton) {
      targetButton.click();
      const templateBtn = $('#plugin-template') as HTMLInputElement;
      if (templateBtn) {
        templateBtn.click();
      }
    }
  }

  function handlePrevPostShortcut() {
    const targetButton = $('#more-plugin-btn-open') as HTMLInputElement;
    if (targetButton) {
      targetButton.click();
      const pluginMenu = $(
        '.mce-tistory-plugin-item.mce-menu-item.mce-menu-item-expand.mce-menu-item-normal.mce-stack-layout-item',
      ) as HTMLElement;
      if (pluginMenu) {
        pluginMenu.click();
        const prevPostPluginBtn = $('#plugin-prev-post') as HTMLInputElement;
        if (prevPostPluginBtn) {
          prevPostPluginBtn.click();
        }
      }
    }
  }

  function handleEditorModeShortcut() {
    const writeModeMenu = $('#editor-mode-layer-btn-open') as HTMLInputElement;
    writeModeMenu.click();
    const editorMode = $('#editorContainer').firstElementChild.className;
    const isNormal = editorMode === 'kakao-editor';
    const normal = $('#editor-mode-kakao') as HTMLInputElement;
    const html = $('#editor-mode-html') as HTMLInputElement;
    if (isNormal) {
      html.click();
    } else {
      normal.click();
    }
  }

  document.addEventListener('keydown', handleKeyDown);
  editor.addEventListener('keydown', handleKeyDown);
}

export default keyMapping;
