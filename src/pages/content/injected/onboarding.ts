import { injectStyle } from '@src/shared/utils/style';
import { TOOLBAR_BTN_ID } from '@pages/content/injected/previewSideView';

const ONBOARDED_KEY = 'sh_onboarded';
const STYLE_ID = 'sh-onboarding-style';
const OVERLAY_ID = 'sh-onboarding-overlay';
const HINT_ID = 'sh-onboarding-hint';
const TARGET_SELECTORS = ['#altTager', '#sh-image-sizer-btn', `#${TOOLBAR_BTN_ID}`];
const DISPLAY_MS = 8000;
const PAD = 4;

// 첫 에디터 방문 시 추가된 도구 버튼 위치를 1회 강조
async function onboarding() {
  const { [ONBOARDED_KEY]: onboarded } = await chrome.storage.local.get(ONBOARDED_KEY);
  if (onboarded) return;

  const targets = TARGET_SELECTORS.map(s => document.querySelector<HTMLElement>(s)).filter(
    (el): el is HTMLElement => el !== null,
  );
  // 표시할 버튼이 없으면 다음 방문에 다시 시도
  if (targets.length === 0) return;

  showHighlight(targets);
  await chrome.storage.local.set({ [ONBOARDED_KEY]: true });
}

const showHighlight = (targets: HTMLElement[]) => {
  const rects = targets.map(el => el.getBoundingClientRect());
  const top = Math.min(...rects.map(r => r.top)) - PAD;
  const left = Math.min(...rects.map(r => r.left)) - PAD;
  const right = Math.max(...rects.map(r => r.right)) + PAD;
  const bottom = Math.max(...rects.map(r => r.bottom)) + PAD;

  injectStyle(
    STYLE_ID,
    `
    @keyframes sh-onboarding-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(50,94,75,0.8); }
      50%       { box-shadow: 0 0 0 6px rgba(50,94,75,0); }
    }
  `,
  );

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  Object.assign(overlay.style, {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${right - left}px`,
    height: `${bottom - top}px`,
    border: '2px solid #325e4b',
    borderRadius: '4px',
    pointerEvents: 'none',
    zIndex: '9999',
    animation: 'sh-onboarding-pulse 1.2s ease-in-out infinite',
  });

  const hint = document.createElement('div');
  hint.id = HINT_ID;
  hint.textContent = chrome.i18n.getMessage('onboarding_toolbar_hint');
  Object.assign(hint.style, {
    position: 'fixed',
    top: `${bottom + 8}px`,
    left: `${left}px`,
    maxWidth: '260px',
    padding: '8px 12px',
    backgroundColor: '#325e4b',
    color: '#fff',
    borderRadius: '6px',
    fontSize: '12px',
    lineHeight: '1.5',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    zIndex: '10000',
  });

  const dismiss = () => {
    overlay.remove();
    hint.remove();
    document.getElementById(STYLE_ID)?.remove();
  };
  hint.addEventListener('click', dismiss);
  setTimeout(dismiss, DISPLAY_MS);

  document.body.append(overlay, hint);
};

export default onboarding;
