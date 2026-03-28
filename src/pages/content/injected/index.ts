import keyMapping from '@pages/content/injected/keymap';
import textCounter from '@pages/content/injected/textCounter';
import altTager from '@pages/content/injected/altTager';
import imageSize from '@pages/content/injected/imageSize';
import checkSEO from '@pages/content/injected/checkSEO';
import previewSideView from '@pages/content/injected/previewSideView';

(async () => {
  await keyMapping();
  await altTager(); // 1. #mceu_18 뒤에 삽입
  await imageSize(); // 2. #altTager 뒤에 삽입
  await checkSEO();
  await textCounter();
  await previewSideView(); // 3. #sh-image-sizer-btn 뒤에 삽입
})();

console.log('StoryHelper Load Complete');
