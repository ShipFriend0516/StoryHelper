// 사이드바 코드

import { createTooltip, showTooltip, hideTooltip } from '@pages/content/util/tooltip';
import { getEditorDocument } from '@root/utils/dom/utilDOM';

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

  // Tooltip 생성
  const tooltip = createTooltip('전체 이미지 크기 수정');
  document.body.appendChild(tooltip);

  // 마우스 이벤트 핸들러 추가
  imageSizer.addEventListener('mouseover', () => {
    showTooltip(tooltip, imageSizer);
  });

  imageSizer.addEventListener('mouseout', () => {
    hideTooltip(tooltip);
  });

  imageSizer.addEventListener('click', () => {
    const userInput = window.prompt('본문의 이미지의 크기를 모두 수정합니다:', '');

    const imageSize: number = parseInt(userInput);
    if (userInput !== null && !isNaN(imageSize)) {
      const post = getEditorDocument();
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
