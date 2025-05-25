import { throttle } from '@pages/content/util/optimize';

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

  const alertBox = document.createElement('div');
  alertBox.style.position = 'absolute';
  alertBox.style.bottom = '80px';
  alertBox.style.right = '10px';
  alertBox.style.backgroundColor = OPTIMIZED_BG;
  alertBox.style.color = '#000';
  alertBox.style.padding = '10px';
  alertBox.style.paddingTop = '4px';
  alertBox.style.paddingBottom = '4px';
  alertBox.style.borderRadius = '4px';
  alertBox.style.fontWeight = 'bold';
  alertBox.style.zIndex = '9999';
  alertBox.style.fontSize = '14px';
  alertBox.style.visibility = 'invisible';
  alertBox.title = 'SEO 체크 중 입니다..';
  alertBox.innerText = `${OPTIMIZED} 검색엔진 최적화가 되어있습니다.`;
  document.body.appendChild(alertBox);

  const checkSEOOptimize = () => {
    const taggedArr = checkImgAltTags(post);
    const h1Tag = checkH1Tag(post);
    const errors = [];
    if (taggedArr.includes(false)) {
      errors.push(`${NOT_OPTIMIZED} Alt 속성이 없는 이미지가 있습니다.`);
    }
    if (!h1Tag) {
      errors.push(`${NOT_OPTIMIZED}  제목1은 글에 하나만 있어야합니다.`);
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

export default checkSEO;
