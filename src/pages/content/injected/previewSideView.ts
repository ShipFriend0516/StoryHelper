import { $, create$ } from '@root/utils/dom/utilDOM';

const MENU_ITEM_ID = 'sh-side-view-menu-item';
const TOOLBAR_BTN_ID = 'sh-side-view-toolbar-btn';
const INTERCEPT_STYLE_ID = 'sh-preview-intercept-style';
const PANEL_IFRAME_ID = 'sh-preview-iframe';

let sideViewActive = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let editorInputHandler: (() => void) | null = null;
let srcdocTemplate: string | null = null;

// ── React 컴포넌트와의 통신 ───────────────────────────────────────

const dispatchSideViewOpen = () => window.dispatchEvent(new CustomEvent('sh:sideview-open'));

const dispatchSideViewClose = () => window.dispatchEvent(new CustomEvent('sh:sideview-close'));

const dispatchSrcdoc = (srcdoc: string) =>
  window.dispatchEvent(new CustomEvent('sh:sideview-srcdoc', { detail: { srcdoc } }));

// ── CSS 차단 (미리보기 모달 숨김) ────────────────────────────────

const injectInterceptStyle = () => {
  if (document.getElementById(INTERCEPT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = INTERCEPT_STYLE_ID;
  style.textContent = `.ReactModal__Overlay { visibility: hidden !important; pointer-events: none !important; }`;
  document.head.appendChild(style);
};

const removeInterceptStyle = () => {
  document.getElementById(INTERCEPT_STYLE_ID)?.remove();
};

// ── 미리보기 로드 ────────────────────────────────────────────────

const loadPreview = () => {
  if (srcdocTemplate) {
    updatePreviewFromTemplate();
    return;
  }
  loadInitialPreview();
};

const loadInitialPreview = (attempt = 0) => {
  if (!sideViewActive) return;
  if (attempt > 30) return;

  const previewBtn = document.getElementById('preview-btn');
  if (!previewBtn) {
    setTimeout(() => loadInitialPreview(attempt + 1), 100);
    return;
  }

  if (previewBtn.getAttribute('aria-expanded') === 'true') {
    previewBtn.click();
    setTimeout(() => loadInitialPreview(attempt + 1), 200);
    return;
  }

  if (!sideViewActive) return;
  previewBtn.click();
  pollForTemplate(previewBtn);
};

const pollForTemplate = (previewBtn: HTMLElement, attempt = 0) => {
  if (!sideViewActive) {
    if (previewBtn.getAttribute('aria-expanded') === 'true') previewBtn.click();
    return;
  }
  if (attempt > 30) return;

  const overlay = document.querySelector('.ReactModal__Overlay');
  const sourceIframe = overlay?.querySelector<HTMLIFrameElement>('iframe[name="previewIframe"]');

  if (sourceIframe?.srcdoc) {
    srcdocTemplate = sourceIframe.srcdoc;
    dispatchSrcdoc(srcdocTemplate);
    if (previewBtn.getAttribute('aria-expanded') === 'true') previewBtn.click();
    return;
  }

  setTimeout(() => pollForTemplate(previewBtn, attempt + 1), 100);
};

const updatePreviewFromTemplate = () => {
  if (!srcdocTemplate) return;

  const editorIframe = document.getElementById('editor-tistory_ifr') as HTMLIFrameElement | null;
  const editorContent = editorIframe?.contentDocument?.body?.innerHTML ?? '';
  const postTitle = (document.getElementById('post-title-inp') as HTMLTextAreaElement | null)?.value ?? '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(srcdocTemplate, 'text/html');

  const contentArea = doc.querySelector('.tt_article_useless_p_margin');
  if (contentArea) contentArea.innerHTML = editorContent;

  const titleEl = doc.querySelector('.article-info .title');
  if (titleEl) titleEl.textContent = postTitle;

  dispatchSrcdoc(doc.documentElement.outerHTML);
};

// ── 에디터 입력 감지 ──────────────────────────────────────────────

const attachEditorListener = () => {
  const tryAttach = (attempt = 0) => {
    if (!sideViewActive) return;
    if (attempt > 25) return;

    const iframe = document.getElementById('editor-tistory_ifr') as HTMLIFrameElement | null;
    const iframeBody = iframe?.contentDocument?.body ?? null;

    if (!iframeBody) {
      setTimeout(() => tryAttach(attempt + 1), 200);
      return;
    }

    const handler = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadPreview, 1500);
    };

    iframeBody.addEventListener('input', handler);
    editorInputHandler = () => iframeBody.removeEventListener('input', handler);
  };

  tryAttach();
};

const detachEditorListener = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  editorInputHandler?.();
  editorInputHandler = null;
};

// ── 모달 닫기 ────────────────────────────────────────────────────

const closePreviewModal = () => {
  const overlay = document.querySelector<HTMLElement>('.ReactModal__Overlay');
  if (!overlay) return;
  overlay.click();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true, cancelable: true }));
};

const waitForOverlayRemoved = (attempt = 0) => {
  const overlay = document.querySelector('.ReactModal__Overlay');
  if (!overlay) {
    removeInterceptStyle();
    return;
  }
  if (attempt > 20) {
    (overlay as HTMLElement).remove();
    removeInterceptStyle();
    return;
  }
  setTimeout(() => waitForOverlayRemoved(attempt + 1), 100);
};

// ── 사이드뷰 토글 ────────────────────────────────────────────────

const activateSideView = () => {
  sideViewActive = true;
  injectInterceptStyle();
  dispatchSideViewOpen();
  loadPreview();
  attachEditorListener();
};

const deactivateSideView = () => {
  sideViewActive = false;
  detachEditorListener();
  srcdocTemplate = null;
  closePreviewModal();
  dispatchSideViewClose();
  waitForOverlayRemoved();
};

const toggleSideView = () => {
  if (sideViewActive) {
    deactivateSideView();
  } else {
    activateSideView();
  }
  updateMenuItemLabel();
};

// ── 툴바 버튼 ────────────────────────────────────────────────────

const injectToolbarButton = (anchorEl: Element) => {
  if (document.getElementById(TOOLBAR_BTN_ID)) return;

  const btn = create$('div', {
    id: TOOLBAR_BTN_ID,
    class: 'mce-widget mce-btn mce-menubtn mce-fixed-width',
    innerHTML:
      '<button><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg></button>',
  });

  btn.addEventListener('click', toggleSideView);
  anchorEl.insertAdjacentElement('afterend', btn);
};

// ── 드롭다운 메뉴 ────────────────────────────────────────────────

const updateMenuItemLabel = () => {
  const menuItem = document.getElementById(MENU_ITEM_ID);
  if (!menuItem) return;
  const span = menuItem.querySelector('span.mce-text');
  if (span) {
    span.textContent = sideViewActive
      ? chrome.i18n.getMessage('menu_side_view_off')
      : chrome.i18n.getMessage('menu_side_view_on');
  }
};

const injectMenuItemTo = (panel: Element) => {
  if (panel.querySelector(`#${MENU_ITEM_ID}`)) return;

  const menuItem = create$('div', {
    id: MENU_ITEM_ID,
    class: 'mce-menu-item mce-menu-item-normal mce-stack-layout-item',
    attributes: { role: 'menuitem' },
  });

  const text = create$('span', {
    class: 'mce-text',
    textContent: chrome.i18n.getMessage('menu_side_view_on'),
  });

  menuItem.appendChild(text);
  panel.appendChild(menuItem);

  menuItem.addEventListener('click', () => {
    toggleSideView();
    const modeBtn = document.getElementById('editor-mode-layer-btn-open');
    if (modeBtn) (modeBtn as HTMLButtonElement).click();
  });
};

// ── 진입점 ───────────────────────────────────────────────────────

const previewSideView = async () => {
  const result = await chrome.storage.local.get('func_5');
  if (typeof result.func_5 === 'boolean' && !result.func_5) return;

  // React 컴포넌트에서 새로고침 요청 수신
  window.addEventListener('sh:sideview-refresh', () => {
    srcdocTemplate = null;
    loadPreview();
  });

  // React 컴포넌트에서 panel iframe ID 요청 시 응답 (필요 시 확장)
  window.dispatchEvent(new CustomEvent('sh:sideview-ready', { detail: { iframeId: PANEL_IFRAME_ID } }));

  const anchor = await waitForElement('#altTager');
  injectToolbarButton(anchor);

  const editorModeBtn = await waitForElement('#editor-mode-layer-btn');

  const observer = new MutationObserver(() => {
    const stackLayout = editorModeBtn.querySelector('.mce-floatpanel .mce-stack-layout');
    if (stackLayout) injectMenuItemTo(stackLayout);
  });

  observer.observe(editorModeBtn, { childList: true, subtree: true });

  const existingStack = editorModeBtn.querySelector('.mce-floatpanel .mce-stack-layout');
  if (existingStack) injectMenuItemTo(existingStack);
};

const waitForElement = (selector: string): Promise<Element> =>
  new Promise(resolve => {
    const el = $(selector, document.body);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const found = $(selector, document.body);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

export default previewSideView;
