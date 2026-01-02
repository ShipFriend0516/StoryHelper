// 사이드바 코드

async function imageSize() {
  const result = await chrome.storage.local.get('func_2');
  if (typeof result.func_2 === 'boolean') {
    if (!result.func_2) {
      console.log('이미지 사이징 기능이 비활성화 되어있습니다.');
      return;
    } else {
      console.log('이미지 사이징 기능이 활성화 되어있습니다.');
    }
  }
  const menu = document.body.querySelector('#mceu_18');
  const imageSizer = document.createElement('div');
  imageSizer.classList.add('mce-widget', 'mce-btn', 'mce-menubtn', 'mce-fixed-width');

  const button = document.createElement('button');
  imageSizer.appendChild(button);

  button.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="17" height="17"><path d="M9.854,14.854L1.707,23h6.293v1H1.5c-.827,0-1.5-.673-1.5-1.5v-6.5H1v6.293L9.146,14.146l.707,.707ZM22.5,0h-6.5V1h6.293L14.146,9.146l.707,.707L23,1.707v6.293h1V1.5c0-.827-.673-1.5-1.5-1.5Z"/></svg>';
  menu.insertAdjacentElement('afterend', imageSizer);
  // Tooltip 요소 생성
  const tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');
  tooltip.style.position = 'absolute';
  tooltip.style.padding = '3px 5px';
  tooltip.style.zIndex = '65000';
  tooltip.style.marginTop = '10px';
  tooltip.style.backgroundColor = '#333';
  tooltip.style.color = '#fff';
  tooltip.style.borderRadius = '2px';
  tooltip.style.fontSize = '11px';
  tooltip.style.visibility = 'hidden';
  tooltip.style.zIndex = '1000';
  tooltip.style.display = 'flex';
  tooltip.style.alignItems = 'center';
  tooltip.style.gap = '4px';
  tooltip.style.position = 'relative';

  // 로고 이미지 추가
  const logoUrl = chrome.runtime.getURL('icon-34.png');
  const logo = document.createElement('img');
  logo.src = logoUrl;
  logo.style.width = '12px';
  logo.style.height = '12px';
  logo.style.borderRadius = '2px';

  // 텍스트 추가
  const text = document.createElement('span');
  text.textContent = '전체 이미지 크기 수정';

  tooltip.appendChild(logo);
  tooltip.appendChild(text);
  document.body.appendChild(tooltip);

  // 마우스 이벤트 핸들러 추가
  imageSizer.addEventListener('mouseover', () => {
    const rect = imageSizer.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY}px`;
    tooltip.style.visibility = 'visible';
  });

  imageSizer.addEventListener('mouseout', () => {
    tooltip.style.visibility = 'hidden';
  });

  imageSizer.addEventListener('click', () => {
    const userInput = window.prompt('본문의 이미지의 크기를 모두 수정합니다:', '');

    const imageSize: number = parseInt(userInput);
    if (userInput !== null && !isNaN(imageSize)) {
      const post: Document = (document.getElementById('editor-tistory_ifr') as HTMLIFrameElement).contentDocument;
      const imgs: HTMLImageElement[] = Array.from(post.body.getElementsByTagName('img'));
      imgs.forEach(img => {
        const originWidth: number = parseInt(img.dataset.originWidth);
        const originHeight: number = parseInt(img.dataset.originHeight);
        const ratio = originHeight / originWidth;
        const imageWidth = imageSize;
        const imageHeight = Math.floor(ratio * imageWidth);
        img.width = imageSize;
        img.height = imageHeight;
      });
    } else {
      alert('유효한 숫자를 입력해주세요.');
    }
  });
}

export default imageSize;
