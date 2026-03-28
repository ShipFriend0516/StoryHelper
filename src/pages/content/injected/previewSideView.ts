import { $, create$ } from '@root/utils/dom/utilDOM';
import { createTooltip, showTooltip, hideTooltip } from '@pages/content/util/tooltip';

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

const dispatchSrcdoc = (srcdoc: string) => {
  window.dispatchEvent(new CustomEvent('sh:sideview-srcdoc', { detail: { srcdoc } }));
  dispatchLoading(false);
};

const dispatchLoading = (loading: boolean) =>
  window.dispatchEvent(new CustomEvent('sh:sideview-loading', { detail: { loading } }));

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
      dispatchLoading(true);
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
  updateToolbarButtonIcon();
};

// ── 툴바 버튼 ────────────────────────────────────────────────────

// altTager와 동일한 fill 아웃라인 방식 — 외곽 CW + 내부 CCW = 테두리만 채움
const SVG_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17">' +
  '<path d="M21,2H3C2.449,2,2,2.449,2,3V21c0,.551,.449,1,1,1H21c.551,0,1-.449,1-1V3C22,2.449,21.551,2,21,2Z' +
  'M3,22c-.551,0-1-.449-1-1V3c0-.551,.449-1,1-1H11V22H3Z' +
  'M12,22V2h9c.551,0,1,.449,1,1V21c0,.551-.449,1-1,1H12Z"/>' +
  '</svg>';

const SVG_CLOSE =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17">' +
  '<path d="M13.414,12l4.293-4.293c.391-.391,.391-1.023,0-1.414s-1.023-.391-1.414,0L12,10.586,7.707,6.293c-.391-.391-1.023-.391-1.414,0s-.391,1.023,0,1.414L10.586,12l-4.293,4.293c-.391,.391-.391,1.023,0,1.414,.195,.195,.451,.293,.707,.293s.512-.098,.707-.293L12,13.414l4.293,4.293c.195,.195,.451,.293,.707,.293s.512-.098,.707-.293c.391-.391,.391-1.023,0-1.414L13.414,12Z"/>' +
  '</svg>';

const updateToolbarButtonIcon = () => {
  const btn = document.getElementById(TOOLBAR_BTN_ID);
  if (!btn) return;
  const inner = btn.querySelector('button');
  if (inner) inner.innerHTML = sideViewActive ? SVG_CLOSE : SVG_OPEN;
};

const injectToolbarButton = (anchorEl: Element) => {
  if (document.getElementById(TOOLBAR_BTN_ID)) return;

  const btn = create$('div', {
    id: TOOLBAR_BTN_ID,
    class: 'mce-widget mce-btn mce-menubtn mce-fixed-width',
    innerHTML: `<button>${SVG_OPEN}</button>`,
  });

  const tooltip = createTooltip(chrome.i18n.getMessage('menu_side_view_on'));
  document.body.appendChild(tooltip);

  btn.addEventListener('mouseover', () => showTooltip(tooltip, btn));
  btn.addEventListener('mouseout', () => hideTooltip(tooltip));
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
  if (result.func_5 === false) return;

  // React 컴포넌트에서 새로고침 요청 수신
  window.addEventListener('sh:sideview-refresh', () => {
    srcdocTemplate = null;
    loadPreview();
  });

  // React 컴포넌트 닫기 버튼에서 요청 수신
  window.addEventListener('sh:sideview-close-request', toggleSideView);

  // React 컴포넌트에서 panel iframe ID 요청 시 응답 (필요 시 확장)
  window.dispatchEvent(new CustomEvent('sh:sideview-ready', { detail: { iframeId: PANEL_IFRAME_ID } }));

  const anchor = await waitForFirstElement(['#sh-image-sizer-btn', '#altTager', '#mceu_18']);
  injectToolbarButton(anchor);

  const editorModeBtn = await waitForElement('#editor-mode-layer-btn');

  const observer = new MutationObserver(() => {
    const stackLayout = editorModeBtn.querySelector('.mce-floatpanel .mce-stack-layout');
    if (stackLayout) injectMenuItemTo(stackLayout);
  });

  observer.observe(editorModeBtn, { childList: true, subtree: true });

  const existingStack = editorModeBtn.querySelector('.mce-floatpanel .mce-stack-layout');
  if (existingStack) injectMenuItemTo(existingStack);

  // 첫 방문 온보딩 강조 효과
  const { sh_onboarded } = await chrome.storage.local.get('sh_onboarded');
  if (!sh_onboarded) {
    await showOnboardingHighlight();
    await chrome.storage.local.set({ sh_onboarded: true });
  }
};

const ONBOARDING_STYLE_ID = 'sh-onboarding-style';
const ONBOARDING_OVERLAY_ID = 'sh-onboarding-overlay';

const showOnboardingHighlight = (): Promise<void> =>
  new Promise(resolve => {
    const selectors = ['#altTager', '#sh-image-sizer-btn', `#${TOOLBAR_BTN_ID}`];
    const els = selectors
      .map(s => document.querySelector<HTMLElement>(s))
      .filter((el): el is HTMLElement => el !== null);

    if (els.length === 0) {
      resolve();
      return;
    }

    // 세 버튼을 감싸는 단일 바운딩 박스 계산
    const rects = els.map(el => el.getBoundingClientRect());
    const top = Math.min(...rects.map(r => r.top));
    const left = Math.min(...rects.map(r => r.left));
    const right = Math.max(...rects.map(r => r.right));
    const bottom = Math.max(...rects.map(r => r.bottom));
    const pad = 4;

    // keyframe 주입
    const style = document.createElement('style');
    style.id = ONBOARDING_STYLE_ID;
    style.textContent = `
      @keyframes sh-onboarding-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(50,94,75,0.8); }
        50%       { box-shadow: 0 0 0 6px rgba(50,94,75,0); }
      }
    `;
    document.head.appendChild(style);

    // 단일 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = ONBOARDING_OVERLAY_ID;
    Object.assign(overlay.style, {
      position: 'fixed',
      top: `${top - pad}px`,
      left: `${left - pad}px`,
      width: `${right - left + pad * 2}px`,
      height: `${bottom - top + pad * 2}px`,
      border: '2px solid #325e4b',
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: '9999',
      animation: 'sh-onboarding-pulse 1.2s ease-in-out 3',
    });
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      document.getElementById(ONBOARDING_STYLE_ID)?.remove();
      resolve();
    }, 3800);
  });

// 여러 셀렉터 중 먼저 발견되는 요소 반환 (우선순위 폴백)
const waitForFirstElement = (selectors: string[]): Promise<Element> =>
  new Promise(resolve => {
    const found = selectors.map(s => $(s, document.body)).find(Boolean);
    if (found) return resolve(found);

    const observer = new MutationObserver(() => {
      const el = selectors.map(s => $(s, document.body)).find(Boolean);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

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
