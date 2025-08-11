import { $, create$ } from '@root/utils/dom/utilDOM';

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
  let altTag = '';

  const menu = $('#mceu_18', document.body);
  const altTager = create$('div', {
    id: 'altTager',
    class: 'mce-widget mce-btn mce-menubtn mce-fixed-width',
  });

  const button = create$('button', {
    innerHTML:
      '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="17" height="17"><path d="M12.004,23.663c-.356,0-.715-.126-1.001-.38l-3.897-3.283H3.5c-1.93,0-3.5-1.57-3.5-3.5V3.5C0,1.57,1.57,0,3.5,0H20.5c1.93,0,3.5,1.57,3.5,3.5v13c0,1.93-1.57,3.5-3.5,3.5h-3.531l-3.985,3.294c-.275,.246-.626,.369-.979,.369ZM3.5,1c-1.378,0-2.5,1.122-2.5,2.5v13c0,1.378,1.122,2.5,2.5,2.5h3.789c.118,0,.232,.042,.322,.118l4.047,3.409c.199,.177,.484,.178,.675,.009l4.138-3.421c.09-.074,.202-.115,.318-.115h3.711c1.379,0,2.5-1.122,2.5-2.5V3.5c0-1.378-1.121-2.5-2.5-2.5H3.5Z"/></svg>',
  });
  altTager.appendChild(button);

  menu.insertAdjacentElement('afterend', altTager);

  // Tooltip 요소 생성
  const tooltip = create$('div', {
    class: 'tooltip',
    style: {
      position: 'absolute',
      padding: '3px 5px',
      marginTop: '10px',
      backgroundColor: '#333',
      color: '#fff',
      borderRadius: '2px',
      fontSize: '11px',
      visibility: 'hidden',
      zIndex: '1000',
    },
    textContent: 'Alt 태그 수정',
  });
  document.body.appendChild(tooltip);

  const altTagerMouseOverHandler = () => {
    const rect = altTager.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY}px`;
    tooltip.style.visibility = 'visible';
  };

  const altTagerMouseOutHandler = () => {
    tooltip.style.visibility = 'hidden';
  };

  const altTagerClickHandler = () => {
    const userInput = window.prompt('본문의 Alt 태그를 모두 수정합니다:', altTag);
    altTag = userInput || '';
    if (userInput !== null) {
      const post: Document = (document.getElementById('editor-tistory_ifr') as HTMLIFrameElement).contentDocument;
      const imgs: HTMLImageElement[] = Array.from(post.body.getElementsByTagName('img'));
      imgs.forEach(img => (img.alt = userInput));
    }
  };

  // 마우스 이벤트 핸들러 추가
  altTager.addEventListener('mouseover', altTagerMouseOverHandler);
  altTager.addEventListener('mouseout', altTagerMouseOutHandler);
  altTager.addEventListener('click', altTagerClickHandler);
}

export default altTager;
