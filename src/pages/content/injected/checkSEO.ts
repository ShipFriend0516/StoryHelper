import { throttle } from '@pages/content/util/optimize';
import { create$ } from '@root/utils/dom/utilDOM';

const checkSEO = async () => {
  const result = await chrome.storage.local.get('func_4');

  if (typeof result.func_4 === 'boolean') {
    if (!result.func_4) {
      console.log('SEO 체크 기능이 비활성화 되어있습니다.');
      return;
    } else {
      console.log('SEO 체크 기능이 활성화 되어있습니다.');
    }
  }

  const post: Document = (document.getElementById('editor-tistory_ifr') as HTMLIFrameElement).contentDocument;

  const OPTIMIZED = '✅';
  const NOT_OPTIMIZED = '⚠️';
  const OPTIMIZED_BG = '#d4edda';
  const NOT_OPTIMIZED_BG = '#ffcccc';
  const alertBoxStyle = {
    position: 'absolute',
    bottom: '80px',
    right: '10px',
    backgroundColor: OPTIMIZED_BG,
    color: '#000',
    padding: '10px',
    paddingTop: '4px',
    paddingBottom: '4px',
    borderRadius: '4px',
    fontWeight: 'bold',
    zIndex: '9999',
    fontSize: '14px',
    visibility: 'invisible',
  };

  const alertBox = create$('div', {
    style: alertBoxStyle,
    textContent: `${OPTIMIZED} 검색엔진 최적화가 되어있습니다.`,
  });
  alertBox.title = 'SEO 체크 중 입니다..';
  document.body.appendChild(alertBox);

  const checkSEOOptimize = () => {
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
      alertBox.style.backgroundColor = NOT_OPTIMIZED_BG;
    } else {
      alertBox.style.visibility = 'visible';
      alertBox.innerText = `${OPTIMIZED} 검색엔진 최적화가 되어있습니다.`;
      alertBox.style.backgroundColor = OPTIMIZED_BG;
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
