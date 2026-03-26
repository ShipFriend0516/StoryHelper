import { $, create$ } from '@root/utils/dom/utilDOM';

// const WRAPPER_ID = 'sh-side-view-wrapper'; // reserved for future use
const PANEL_ID = 'sh-preview-panel';
const PANEL_IFRAME_ID = 'sh-preview-iframe';
const MENU_ITEM_ID = 'sh-side-view-menu-item';
const TOOLBAR_BTN_ID = 'sh-side-view-toolbar-btn';

let sideViewActive = false;
let modalObserver: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let editorInputHandler: (() => void) | null = null;

// ── 에디터 입력 감지 ──────────────────────────────────────────────

function attachEditorListener() {
  const iframe = document.getElementById('editor-tistory_ifr') as HTMLIFrameElement | null;
  if (!iframe) return;

  const tryAttach = () => {
    const editorBody = iframe.contentDocument?.body;
    if (!editorBody) return;

    editorInputHandler = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadPreview, 1500);
    };
    editorBody.addEventListener('input', editorInputHandler);
  };

  // iframe이 이미 로드된 경우
  if (iframe.contentDocument?.readyState === 'complete') {
    tryAttach();
  } else {
    // 아직 로드 중이면 load 이벤트 후 부착
    iframe.addEventListener('load', tryAttach, { once: true });
  }
}

function detachEditorListener() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  const iframe = document.getElementById('editor-tistory_ifr') as HTMLIFrameElement | null;
  const editorBody = iframe?.contentDocument?.body;
  if (editorBody && editorInputHandler) {
    editorBody.removeEventListener('input', editorInputHandler);
  }
  editorInputHandler = null;
}

// ── 패널 내부 구조 ────────────────────────────────────────────────

function buildPreviewPanel(): HTMLElement {
  const panel = create$('div', {
    id: PANEL_ID,
    style: {
      flex: '0 0 50%',
      maxWidth: '50%',
      minWidth: '0',
      borderLeft: '2px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      backgroundColor: '#f9f9f9',
    },
  });

  // 헤더
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
  refreshBtn.addEventListener('click', loadPreview);

  header.appendChild(title);
  header.appendChild(refreshBtn);

  // iframe
  const iframe = create$('iframe', {
    id: PANEL_IFRAME_ID,
    attributes: { sandbox: 'allow-scripts allow-same-origin' },
    style: {
      flex: '1',
      width: '100%',
      border: 'none',
      minHeight: '600px',
    },
  });

  panel.appendChild(header);
  panel.appendChild(iframe);
  return panel;
}

// ── 미리보기 로드 ────────────────────────────────────────────────

const INTERCEPT_STYLE_ID = 'sh-preview-intercept-style';

// 사이드뷰 활성 중 항상 유지 — visibility:hidden으로 React 내부 렌더링은 허용
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

function loadPreview() {
  const previewBtn = document.getElementById('preview-btn');
  if (!previewBtn) return;

  modalObserver?.disconnect();

  const isOpen = previewBtn.getAttribute('aria-expanded') === 'true';

  if (isOpen) {
    // 열려있으면 닫고 → 짧은 대기 → 다시 열기
    previewBtn.click();
    setTimeout(() => openAndCapture(previewBtn), 80);
  } else {
    openAndCapture(previewBtn);
  }
}

function openAndCapture(previewBtn: HTMLElement) {
  modalObserver?.disconnect();

  modalObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        const overlay = node.classList.contains('ReactModal__Overlay')
          ? node
          : node.querySelector<HTMLElement>('.ReactModal__Overlay');
        if (!overlay) continue;
        modalObserver?.disconnect();
        waitForPreviewIframe(overlay);
        return;
      }
    }
  });

  modalObserver.observe(document.body, { childList: true, subtree: true });
  previewBtn.click();
}

// iframe srcdoc이 채워질 때까지 대기
function waitForPreviewIframe(overlay: HTMLElement) {
  const tryInject = (): boolean => {
    const iframe = overlay.querySelector<HTMLIFrameElement>('iframe[name="previewIframe"]');
    if (!iframe?.srcdoc) return false;
    injectSrcdocToPanel(overlay, iframe.srcdoc);
    return true;
  };

  if (tryInject()) return;

  const inner = new MutationObserver(() => {
    if (tryInject()) inner.disconnect();
  });
  inner.observe(overlay, { childList: true, subtree: true, attributes: true });
}

function injectSrcdocToPanel(_overlay: HTMLElement, srcdoc: string) {
  const panelIframe = document.getElementById(PANEL_IFRAME_ID) as HTMLIFrameElement | null;
  if (!panelIframe) return;

  panelIframe.srcdoc = srcdoc;

  // srcdoc 주입 후 모달 닫기 (toggle)
  const previewBtn = document.getElementById('preview-btn');
  if (previewBtn?.getAttribute('aria-expanded') === 'true') {
    previewBtn.click();
  }
}

// ── 레이아웃 활성화/비활성화 ────────────────────────────────────

function activateSideView() {
  const headerHeight = document.getElementById('kakaoHead')?.getBoundingClientRect().height ?? 58;

  // 기존 DOM 구조를 건드리지 않고, body 오른쪽에 공간만 확보
  document.body.style.setProperty('margin-right', '50vw', 'important');

  // 미리보기 패널을 오른쪽에 fixed로 고정
  const previewPanel = buildPreviewPanel();
  previewPanel.style.position = 'fixed';
  previewPanel.style.top = `${headerHeight}px`;
  previewPanel.style.right = '0';
  previewPanel.style.width = '50vw';
  previewPanel.style.height = `calc(100vh - ${headerHeight}px)`;
  previewPanel.style.zIndex = '1000';
  previewPanel.style.flex = '';
  previewPanel.style.maxWidth = '';
  previewPanel.style.minWidth = '';

  document.body.appendChild(previewPanel);

  injectInterceptStyle();
  sideViewActive = true;
  loadPreview();
  attachEditorListener();
}

function deactivateSideView() {
  modalObserver?.disconnect();
  detachEditorListener();
  removeInterceptStyle();
  document.body.style.removeProperty('margin-right');
  document.getElementById(PANEL_ID)?.remove();
  sideViewActive = false;
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

// ── 드롭다운 메뉴 아이템 ──────────────────────────────────────────

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
