import { throttle } from '@pages/content/util/optimize';

async function textCounter() {
  const result = await chrome.storage.local.get('func_3');
  if (typeof result.func_3 === 'boolean') {
    if (!result.func_3) {
      console.log('단축키 기능이 비활성화 되어있습니다.');
      return;
    } else {
      console.log('단축키 기능이 활성화 되어있습니다.');
    }
  }

  const post = (document.getElementById('editor-tistory_ifr') as HTMLIFrameElement).contentDocument.getElementById(
    'tinymce',
  );

  const countWords = () => {
    const text = post.innerText.trim();

    const charCount = text.length;

    // 글자 수와 단어 수를 화면에 표시하는 요소 생성
    const counter = createTextCounterBox();
    counter.innerHTML = `글자 수: ${charCount}`;

    // 기존의 글자 수 표시 요소 제거
    const existingCountElement = document.getElementById('text-counter');
    if (existingCountElement) {
      existingCountElement.remove();
    }

    // 새로운 글자 수 표시 요소 추가
    document.body.getElementsByClassName('btn-category')[0].appendChild(counter);
  };

  countWords();
  post.addEventListener('input', throttle(countWords, 100));
}

const createTextCounterBox = () => {
  const counter = document.createElement('div');
  counter.id = 'text-counter';
  counter.style.display = 'inline-block';
  counter.style.position = 'absolute';
  counter.style.right = '3px';
  counter.style.backgroundColor = 'white';
  counter.style.color = 'black';
  counter.style.padding = '3px 5px';
  counter.style.marginLeft = '5px';
  counter.style.borderRadius = '4px';
  counter.style.boxShadow = 'rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset';
  counter.style.fontFamily = 'Arial, sans-serif';
  counter.style.fontSize = '14px';
  counter.style.zIndex = '999';
  return counter;
};

export default textCounter;
