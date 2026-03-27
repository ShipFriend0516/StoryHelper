import { $, create$ } from '@root/utils/dom/utilDOM';

const PANEL_ID = 'sh-preview-panel';
const PANEL_IFRAME_ID = 'sh-preview-iframe';
const MENU_ITEM_ID = 'sh-side-view-menu-item';
const TOOLBAR_BTN_ID = 'sh-side-view-toolbar-btn';
const INTERCEPT_STYLE_ID = 'sh-preview-intercept-style';

let sideViewActive = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let editorInputHandler: (() => void) | null = null;
let srcdocTemplate: string | null = null;

// ── CSS 차단 ──────────────────────────────────────────────────────

function injectInterceptStyle() {
  if (document.getElementById(INTERCEPT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = INTERCEPT_STYLE_ID;
  style.textContent = `.ReactModal__Overlay { visibility: hidden !important; pointer-events: none !important; }`;
  document.head.appendChild(style);
}

function removeInterceptStyle() {
  document.getElementById(INTERCEPT_STYLE_ID)?.remove();
}

// ── 미리보기 ──────────────────────────────────────────────────────

/**
 * 최초 1회: 미리보기 버튼 클릭 → srcdoc 캐싱
 * 이후: 캐시된 템플릿에 TinyMCE 현재 내용 치환 (버튼 클릭 없음)
 */
function loadPreview() {
  if (srcdocTemplate) {
    updatePreviewFromTemplate();
    return;
  }
  loadInitialPreview();
}

function loadInitialPreview(attempt = 0) {
  if (!sideViewActive) return;
  if (attempt > 30) return;

  const previewBtn = document.getElementById('preview-btn');
  if (!previewBtn) {
    setTimeout(() => loadInitialPreview(attempt + 1), 100);
    return;
  }

  // 이미 열려있으면 먼저 닫기
  if (previewBtn.getAttribute('aria-expanded') === 'true') {
    previewBtn.click();
    setTimeout(() => loadInitialPreview(attempt + 1), 200);
    return;
  }

  previewBtn.click();
  pollForTemplate(previewBtn);
}

function pollForTemplate(previewBtn: HTMLElement, attempt = 0) {
  // 사이드뷰가 닫혔으면 모달만 닫고 중단
  if (!sideViewActive) {
    if (previewBtn.getAttribute('aria-expanded') === 'true') previewBtn.click();
    return;
  }
  if (attempt > 30) return;

  const overlay = document.querySelector('.ReactModal__Overlay');
  const sourceIframe = overlay?.querySelector<HTMLIFrameElement>('iframe[name="previewIframe"]');

  if (sourceIframe?.srcdoc) {
    srcdocTemplate = sourceIframe.srcdoc;

    const panelIframe = document.getElementById(PANEL_IFRAME_ID) as HTMLIFrameElement | null;
    if (panelIframe) panelIframe.srcdoc = srcdocTemplate;

    if (previewBtn.getAttribute('aria-expanded') === 'true') previewBtn.click();
    return;
  }

  setTimeout(() => pollForTemplate(previewBtn, attempt + 1), 100);
}

/**
 * 캐시된 템플릿에 현재 TinyMCE 내용을 치환해 패널 업데이트
 */
function updatePreviewFromTemplate() {
  if (!srcdocTemplate) return;

  const editorIframe = document.getElementById('editor-tistory_ifr') as HTMLIFrameElement | null;
  const editorContent = editorIframe?.contentDocument?.body?.innerHTML ?? '';
  const postTitle = (document.getElementById('post-title-inp') as HTMLTextAreaElement | null)?.value ?? '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(srcdocTemplate, 'text/html');

  // 본문 교체
  const contentArea = doc.querySelector('.tt_article_useless_p_margin');
  if (contentArea) contentArea.innerHTML = editorContent;

  // 제목 교체
  const titleEl = doc.querySelector('.article-info .title');
  if (titleEl) titleEl.textContent = postTitle;

  const panelIframe = document.getElementById(PANEL_IFRAME_ID) as HTMLIFrameElement | null;
  if (panelIframe) panelIframe.srcdoc = doc.documentElement.outerHTML;
}

// ── 에디터 입력 감지 ──────────────────────────────────────────────

function attachEditorListener() {
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
}

function detachEditorListener() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  editorInputHandler?.();
  editorInputHandler = null;
}

// ── 패널 UI ───────────────────────────────────────────────────────

function buildPreviewPanel(): HTMLElement {
  const panel = create$('div', { id: PANEL_ID });

  const header = create$('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 14px',
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#fff',
      flexShrink: '0',
    },
  });

  const title = create$('span', {
    textContent: '미리보기',
    style: { fontSize: '13px', fontWeight: 'bold', color: '#333' },
  });

  const refreshBtn = create$('button', {
    textContent: '새로고침',
    style: {
      fontSize: '12px',
      padding: '4px 10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      color: '#555',
    },
  });
  refreshBtn.addEventListener('click', () => {
    // 강제 전체 재로드 (템플릿 초기화)
    srcdocTemplate = null;
    loadPreview();
  });

  header.appendChild(title);
  header.appendChild(refreshBtn);

  const iframe = create$('iframe', {
    id: PANEL_IFRAME_ID,
    attributes: { sandbox: 'allow-scripts allow-same-origin' },
    style: { flex: '1', width: '100%', border: 'none', minHeight: '600px' },
  });

  panel.appendChild(header);
  panel.appendChild(iframe);
  return panel;
}

// ── 레이아웃 ─────────────────────────────────────────────────────

function activateSideView() {
  const headerHeight = document.getElementById('kakaoHead')?.getBoundingClientRect().height ?? 58;

  document.body.style.setProperty('margin-right', '50vw', 'important');

  const previewPanel = buildPreviewPanel();
  Object.assign(previewPanel.style, {
    position: 'fixed',
    top: `${headerHeight}px`,
    right: '0',
    width: '50vw',
    height: `calc(100vh - ${headerHeight}px)`,
    zIndex: '1000',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
  });

  document.body.appendChild(previewPanel);
  injectInterceptStyle();
  sideViewActive = true;
  loadPreview();
  attachEditorListener();
}

function closePreviewModal() {
  const overlay = document.querySelector<HTMLElement>('.ReactModal__Overlay');
  if (!overlay) return;

  // ReactModal은 overlay 클릭 또는 Escape로 닫힘
  overlay.click();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true, cancelable: true }));
}

function deactivateSideView() {
  sideViewActive = false;
  detachEditorListener();
  srcdocTemplate = null;

  closePreviewModal();

  document.body.style.removeProperty('margin-right');
  document.getElementById(PANEL_ID)?.remove();

  // overlay가 DOM에서 사라진 뒤 CSS 제거, 최대 2초 대기 후 강제 제거
  waitForOverlayRemoved();
}

function waitForOverlayRemoved(attempt = 0) {
  const overlay = document.querySelector('.ReactModal__Overlay');
  if (!overlay) {
    removeInterceptStyle();
    return;
  }
  if (attempt > 20) {
    // 강제 제거 후 CSS 해제
    (overlay as HTMLElement).remove();
    removeInterceptStyle();
    return;
  }
  setTimeout(() => waitForOverlayRemoved(attempt + 1), 100);
}

function toggleSideView() {
  if (sideViewActive) {
    deactivateSideView();
  } else {
    activateSideView();
  }
  updateMenuItemLabel();
}

// ── 툴바 버튼 ────────────────────────────────────────────────────

function injectToolbarButton(anchorEl: Element) {
  if (document.getElementById(TOOLBAR_BTN_ID)) return;

  const btn = create$('div', {
    id: TOOLBAR_BTN_ID,
    class: 'mce-widget mce-btn mce-menubtn mce-fixed-width',
    innerHTML:
      '<button><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg></button>',
  });

  btn.addEventListener('click', toggleSideView);
  anchorEl.insertAdjacentElement('afterend', btn);
}

// ── 드롭다운 메뉴 ────────────────────────────────────────────────

function updateMenuItemLabel() {
  const menuItem = document.getElementById(MENU_ITEM_ID);
  if (!menuItem) return;
  const span = menuItem.querySelector('span.mce-text');
  if (span) {
    span.textContent = sideViewActive
      ? chrome.i18n.getMessage('menu_side_view_off')
      : chrome.i18n.getMessage('menu_side_view_on');
  }
}

function injectMenuItemTo(panel: Element) {
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
}

// ── 진입점 ───────────────────────────────────────────────────────

async function previewSideView() {
  const result = await chrome.storage.local.get('func_5');
  if (typeof result.func_5 === 'boolean' && !result.func_5) return;

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
}

function waitForElement(selector: string): Promise<Element> {
  return new Promise(resolve => {
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
}

export default previewSideView;
