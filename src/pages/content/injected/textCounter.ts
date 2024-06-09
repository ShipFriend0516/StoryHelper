async function textCounter() {
  console.log('텍스트카운터 스크립트가 정상적으로 로드되었습니다.');

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

  function countWords() {
    const text = post.innerText.trim();
    const wordCount = text.split(/\s+/).length;
    const charCount = text.length;

    console.log(`글자 수: ${charCount}, 단어 수: ${wordCount}`);

    // 글자 수와 단어 수를 화면에 표시하는 요소 생성
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
    counter.style.zIndex = '9999';
    counter.innerHTML = `글자 수: ${charCount}`;

    // 기존의 글자 수 표시 요소 제거
    const existingCountElement = document.getElementById('text-counter');
    if (existingCountElement) {
      existingCountElement.remove();
    }

    // 새로운 글자 수 표시 요소 추가
    document.body.getElementsByClassName('btn-category')[0].appendChild(counter);
  }

  countWords();
  post.addEventListener('input', countWords);
}

export default textCounter();
