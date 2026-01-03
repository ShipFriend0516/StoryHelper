import { debounce } from '@pages/content/util/optimize';
import { create$, getEditorDocument } from '@root/utils/dom/utilDOM';
import { showReviewPrompt, shouldShowReviewPrompt } from '@pages/content/injected/reviewPrompt';

const checkSEO = async () => {
  // Track if we've already counted success in this session
  let hasCountedSuccessThisSession = false;
  let hasShownReviewPromptThisSession = false;
  const result = await chrome.storage.local.get('func_4');

  if (typeof result.func_4 === 'boolean') {
    if (!result.func_4) {
      console.log('SEO 체크 기능이 비활성화 되어있습니다.');
      return;
    } else {
      console.log('SEO 체크 기능이 활성화 되어있습니다.');
    }
  }

  const post: Document = getEditorDocument();
  const OPTIMIZED_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check-icon lucide-badge-check"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>';
  const NOT_OPTIMIZED_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
  const OPTIMIZED_BG = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
  const NOT_OPTIMIZED_BG = 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)';
  const OPTIMIZED_BORDER = '#7d9b76';
  const NOT_OPTIMIZED_BORDER = '#e57373';

  const alertBoxStyle = {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    background: OPTIMIZED_BG,
    color: '#2e5a2e',
    padding: '12px 16px',
    borderRadius: '12px',
    fontWeight: '600',
    zIndex: '9999',
    fontSize: '13px',
    visibility: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${OPTIMIZED_BORDER}`,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: '1.5',
    maxWidth: '320px',
  };

  const alertBox = create$('div', {
    style: alertBoxStyle,
    innerHTML: `${OPTIMIZED_SVG} 검색엔진 최적화가 되어있습니다.`,
  });
  alertBox.title = 'SEO 체크 중 입니다..';
  document.body.appendChild(alertBox);

  const checkSEOOptimize = async () => {
    // 검증 실행
    const taggedArr = checkImgAltTags(post);
    const h1Tag = checkH1Tag(post);
    const fixedImageHeight = checkFixedImageHeight(post);
    const errors = [];
    if (taggedArr.includes(false)) {
      errors.push('Alt 속성이 없는 이미지가 있습니다.');
    }
    if (!h1Tag) {
      errors.push('제목1은 글에 하나만 있어야합니다.');
    }
    if (!fixedImageHeight) {
      errors.push('이미지 높이가 고정되어 있지 않은 이미지가 있습니다.');
    }
    if (errors.length > 0) {
      alertBox.style.visibility = 'visible';
      alertBox.innerHTML = errors
        .map(
          error => `
        <div style="display: flex; align-items: center; gap: 8px;">
          ${NOT_OPTIMIZED_SVG}
          <span>${error}</span>
        </div>
      `,
        )
        .join('');
      alertBox.style.background = NOT_OPTIMIZED_BG;
      alertBox.style.borderColor = NOT_OPTIMIZED_BORDER;
      alertBox.style.color = '#c62828';
      hasCountedSuccessThisSession = false;
    } else {
      alertBox.style.visibility = 'visible';
      alertBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          ${OPTIMIZED_SVG}
          <span>검색엔진 최적화가 되어있습니다.</span>
        </div>
      `;
      alertBox.style.background = OPTIMIZED_BG;
      alertBox.style.borderColor = OPTIMIZED_BORDER;
      alertBox.style.color = '#2e5a2e';

      if (!hasCountedSuccessThisSession) {
        hasCountedSuccessThisSession = true;
        const storageResult = await chrome.storage.local.get('seo_success_count');
        const currentCount = storageResult.seo_success_count || 0;
        await chrome.storage.local.set({ seo_success_count: currentCount + 1 });

        if (!hasShownReviewPromptThisSession && (await shouldShowReviewPrompt())) {
          hasShownReviewPromptThisSession = true;
          showReviewPrompt();
        }
      }
    }
  };

  checkSEOOptimize();
  post.addEventListener('input', debounce(checkSEOOptimize, 2000));

  // MutationObserver로 DOM 변경 감지 (임시저장 복구 등)
  const observer = new MutationObserver(debounce(checkSEOOptimize, 2000));
  observer.observe(post.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

const checkImgAltTags = (post: Document) => {
  const imgs: HTMLImageElement[] = Array.from(post.body.getElementsByTagName('img'));
  const altTags = Array(imgs.length).fill(false);
  imgs.forEach(img => {
    altTags[imgs.indexOf(img)] = img.hasAttribute('alt');
  });
  return altTags;
};

const checkH1Tag = (post: Document) => {
  const h2Tags: HTMLHeadingElement[] = Array.from(post.body.getElementsByTagName('h2'));
  return h2Tags.length === 1;
};

const checkFixedImageHeight = (post: Document) => {
  const imgs: HTMLImageElement[] = Array.from(post.body.getElementsByTagName('img'));

  if (imgs.length === 0) return true;
  return imgs.every(img => img.hasAttribute('height') && img.height > 0);
};

export default checkSEO;
