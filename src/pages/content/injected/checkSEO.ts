import { throttle } from '@pages/content/util/optimize';
import { $, create$ } from '@root/utils/dom/utilDOM';
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

  const post: Document = ($('#editor-tistory_ifr') as HTMLIFrameElement).contentDocument;
  const OPTIMIZED = '✅';
  const NOT_OPTIMIZED = '⚠️';
  const OPTIMIZED_BG = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
  const NOT_OPTIMIZED_BG = 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)';
  const OPTIMIZED_BORDER = '#7d9b76';
  const NOT_OPTIMIZED_BORDER = '#e57373';
  const alertBoxStyle = {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
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
    textContent: `${OPTIMIZED} 검색엔진 최적화가 되어있습니다.`,
  });
  alertBox.title = 'SEO 체크 중 입니다..';
  document.body.appendChild(alertBox);

  const checkSEOOptimize = async () => {
    const taggedArr = checkImgAltTags(post);
    const h1Tag = checkH1Tag(post);
    const fixedImageHeight = checkFixedImageHeight(post);
    const errors = [];
    if (taggedArr.includes(false)) {
      errors.push(`${NOT_OPTIMIZED} Alt 속성이 없는 이미지가 있습니다.`);
    }
    if (!h1Tag) {
      errors.push(`${NOT_OPTIMIZED} 제목1은 글에 하나만 있어야합니다.`);
    }
    if (!fixedImageHeight) {
      errors.push(`${NOT_OPTIMIZED} 이미지 높이가 고정되어 있지 않은 이미지가 있습니다.`);
    }
    if (errors.length > 0) {
      alertBox.style.visibility = 'visible';
      alertBox.innerText = errors.join('\n');
      alertBox.style.background = NOT_OPTIMIZED_BG;
      alertBox.style.borderColor = NOT_OPTIMIZED_BORDER;
      alertBox.style.color = '#c62828';
      // Reset success flag when errors occur (so next success counts)
      hasCountedSuccessThisSession = false;
    } else {
      alertBox.style.visibility = 'visible';
      alertBox.innerText = `${OPTIMIZED} 검색엔진 최적화가 되어있습니다.`;
      alertBox.style.background = OPTIMIZED_BG;
      alertBox.style.borderColor = OPTIMIZED_BORDER;
      alertBox.style.color = '#2e5a2e';

      // Count success only once per session
      if (!hasCountedSuccessThisSession) {
        hasCountedSuccessThisSession = true;
        const storageResult = await chrome.storage.local.get('seo_success_count');
        const currentCount = storageResult.seo_success_count || 0;
        await chrome.storage.local.set({ seo_success_count: currentCount + 1 });

        // Show review prompt if conditions are met
        if (!hasShownReviewPromptThisSession && (await shouldShowReviewPrompt())) {
          hasShownReviewPromptThisSession = true;
          showReviewPrompt();
        }
      }
    }
  };

  checkSEOOptimize();
  post.addEventListener('input', throttle(checkSEOOptimize, 1000));
  setInterval(checkSEOOptimize, 5000);
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
