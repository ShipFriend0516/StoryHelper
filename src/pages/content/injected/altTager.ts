async function altTager() {
  const result = await chrome.storage.local.get('func_1');
  if (typeof result.func_1 === 'boolean') {
    if (!result.func_1) {
      console.log('altTager 기능이 비활성화 되어있습니다.');
      return;
    } else {
      console.log('altTager 기능이 활성화 되어있습니다.');
    }
  }

  const menu = document.body.querySelector('#mceu_18');
  const altTager = document.createElement('div');
  altTager.classList.add('mce-widget', 'mce-btn', 'mce-menubtn', 'mce-fixed-width');

  const button = document.createElement('button');
  altTager.appendChild(button);

  button.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="17" height="17"><path d="M12.004,23.663c-.356,0-.715-.126-1.001-.38l-3.897-3.283H3.5c-1.93,0-3.5-1.57-3.5-3.5V3.5C0,1.57,1.57,0,3.5,0H20.5c1.93,0,3.5,1.57,3.5,3.5v13c0,1.93-1.57,3.5-3.5,3.5h-3.531l-3.985,3.294c-.275,.246-.626,.369-.979,.369ZM3.5,1c-1.378,0-2.5,1.122-2.5,2.5v13c0,1.378,1.122,2.5,2.5,2.5h3.789c.118,0,.232,.042,.322,.118l4.047,3.409c.199,.177,.484,.178,.675,.009l4.138-3.421c.09-.074,.202-.115,.318-.115h3.711c1.379,0,2.5-1.122,2.5-2.5V3.5c0-1.378-1.121-2.5-2.5-2.5H3.5Z"/></svg>';
  menu.insertAdjacentElement('afterend', altTager);

  // Tooltip 요소 생성
  const tooltip = document.createElement('div');
  tooltip.classList.add('tooltip');
  tooltip.style.position = 'absolute';
  tooltip.style.padding = '3px';
  tooltip.style.paddingLeft = '5px';
  tooltip.style.paddingRight = '5px';
  tooltip.style.marginTop = '10px';
  tooltip.style.backgroundColor = '#333';
  tooltip.style.color = '#fff';
  tooltip.style.borderRadius = '2px';
  tooltip.style.fontSize = '11px';
  tooltip.style.visibility = 'hidden';
  tooltip.style.zIndex = '1000';
  tooltip.textContent = 'Alt 태그 수정';
  document.body.appendChild(tooltip);

  // 마우스 이벤트 핸들러 추가
  altTager.addEventListener('mouseover', () => {
    const rect = altTager.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY}px`;
    tooltip.style.visibility = 'visible';
  });

  altTager.addEventListener('mouseout', () => {
    tooltip.style.visibility = 'hidden';
  });

  altTager.addEventListener('click', () => {
    const userInput = window.prompt('본문의 Alt 태그를 모두 수정합니다:', '');

    if (userInput !== null) {
      const post: Document = (document.getElementById('editor-tistory_ifr') as HTMLIFrameElement).contentDocument;
      const imgs: HTMLImageElement[] = Array.from(post.body.getElementsByTagName('img'));
      imgs.forEach(img => (img.alt = userInput));
    }
  });
}

export default altTager;
