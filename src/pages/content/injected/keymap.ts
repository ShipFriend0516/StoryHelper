import { isFeatureEnabled } from '@src/shared/utils/features';
import { $, getEditorElement } from '@root/utils/dom/utilDOM';

interface Shortcut {
  keys: string;
  description: string;
  function_id?: number;
  custom?: string;
  shortcut_id: string; // ID for logic (locale-independent)
}

const matchesShortcut = (event: KeyboardEvent, combination: string): boolean => {
  const keys = combination.split(' + ');
  const wantsCtrl = keys.includes('Ctrl');
  const wantsMeta = keys.includes('Meta') || keys.includes('Command');
  // Preserve Ctrl/Command interchangeability, but reject extra modifier keys.
  const primaryMatches =
    wantsCtrl && wantsMeta
      ? event.ctrlKey && event.metaKey
      : wantsCtrl || wantsMeta
        ? event.ctrlKey !== event.metaKey
        : !event.ctrlKey && !event.metaKey;
  if (!primaryMatches || keys.includes('Shift') !== event.shiftKey || keys.includes('Alt') !== event.altKey)
    return false;

  const mainKeys = keys.filter(key => !['Ctrl', 'Meta', 'Command', 'Shift', 'Alt'].includes(key));
  if (mainKeys.length !== 1) return false;
  const [key] = mainKeys;
  if (/^[a-z]$/i.test(key)) return event.code === `Key${key.toUpperCase()}`;
  if (/^\d$/.test(key)) return event.code === `Digit${key}` || event.code === `Numpad${key}`;
  return event.code === key;
};

async function keyMapping() {
  if (!(await isFeatureEnabled('func_0'))) return;

  const editor = getEditorElement();
  if (!editor) return;

  async function getCustomShortcuts() {
    try {
      const response = await chrome.storage.local.get('shortcuts');
      return response.shortcuts ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  const shortcuts: Shortcut[] = await getCustomShortcuts();

  function handleKeyDown(event: KeyboardEvent) {
    shortcuts.forEach(shortcut => {
      const combination = shortcut.custom || shortcut.keys;
      if (combination && matchesShortcut(event, combination)) {
        event.preventDefault();
        handleShortcut(shortcut);
      }
    });
  }

  function handleShortcut(shortcut: Shortcut) {
    switch (shortcut.shortcut_id) {
      case 'PUBLISH':
        handlePublishShortcut();
        break;
      case 'IMAGE_UPLOAD':
        handleImageUploadShortcut();
        break;
      case 'TEMPLATE':
        handleTemplateShortcut();
        break;
      case 'PREV_POST':
        handlePrevPostShortcut();
        break;
      case 'EDITOR_MODE':
        handleEditorModeShortcut();
        break;
      default:
        console.log(chrome.i18n.getMessage('console_custom_shortcut', [shortcut.shortcut_id]));
    }
  }

  function handlePublishShortcut() {
    const targetButton = $('#publish-layer-btn') as HTMLElement;
    if (targetButton) {
      targetButton.click();
    }
  }

  function handleImageUploadShortcut() {
    const imageUploadButton = document.getElementById('attach-image');
    if (imageUploadButton) {
      imageUploadButton.click();
      return;
    }

    const targetButton =
      document.getElementById('mceu_0-open') ??
      document.querySelector<HTMLElement>('.tox-tbtn[data-mce-name="image"]') ??
      document.querySelector('.mce-i-image')?.closest('button');
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
    const writeModeMenu = document.getElementById('editor-mode-layer-btn-open');
    const editorContainer = document.getElementById('editorContainer');
    if (!writeModeMenu || !editorContainer?.firstElementChild) return;
    writeModeMenu.click();
    const editorMode = editorContainer.firstElementChild.className;
    const isNormal = editorMode === 'kakao-editor';
    const normal = $('#editor-mode-kakao') as HTMLInputElement;
    const html = $('#editor-mode-html') as HTMLInputElement;
    if (isNormal) {
      html?.click();
    } else {
      normal?.click();
    }
  }

  document.addEventListener('keydown', handleKeyDown);
  editor.addEventListener('keydown', handleKeyDown);
}

export default keyMapping;
