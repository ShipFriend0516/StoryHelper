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

  const editor = (document.getElementById('editor-tistory_ifr') as HTMLIFrameElement).contentDocument.getElementById(
    'tinymce',
  );
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
    const targetButton: HTMLInputElement = document.querySelector('#publish-layer-btn');
    if (targetButton) {
      targetButton.click();
    }
  }

  function handleImageUploadShortcut() {
    const targetButton: HTMLInputElement = document.querySelector('#mceu_0-open');
    if (targetButton) {
      targetButton.click();
      const imageUploadButton: HTMLInputElement = document.querySelector('#attach-image');
      if (imageUploadButton) {
        imageUploadButton.click();
      }
    }
  }

  function handleTemplateShortcut() {
    const targetButton: HTMLInputElement = document.querySelector('#more-plugin-btn-open');
    if (targetButton) {
      targetButton.click();
      const templateBtn: HTMLInputElement = document.querySelector('#plugin-template');
      if (templateBtn) {
        templateBtn.click();
      }
    }
  }

  function handlePrevPostShortcut() {
    const targetButton: HTMLInputElement = document.querySelector('#more-plugin-btn-open');
    if (targetButton) {
      targetButton.click();
      const pluginMenu: HTMLInputElement = document.querySelector(
        '.mce-tistory-plugin-item.mce-menu-item.mce-menu-item-expand.mce-menu-item-normal.mce-stack-layout-item',
      );
      if (pluginMenu) {
        pluginMenu.click();
        const prevPostPluginBtn: HTMLInputElement = document.querySelector('#plugin-prev-post');
        if (prevPostPluginBtn) {
          prevPostPluginBtn.click();
        }
      }
    }
  }

  function handleEditorModeShortcut() {
    const writeModeMenu: HTMLInputElement = document.querySelector('#editor-mode-layer-btn-open');
    writeModeMenu.click();
    const editorMode = document.querySelector('#editorContainer').firstElementChild.className;
    const isNormal = editorMode === 'kakao-editor';
    const normal: HTMLInputElement = document.querySelector('#editor-mode-kakao');
    const html: HTMLInputElement = document.querySelector('#editor-mode-html');
    if (isNormal) {
      html.click();
    } else {
      normal.click();
    }
  }

  document.addEventListener('keydown', handleKeyDown);
  editor.addEventListener('keydown', handleKeyDown);
}

export default keyMapping();
