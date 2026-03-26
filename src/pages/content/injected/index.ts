import keyMapping from '@pages/content/injected/keymap';
import textCounter from '@pages/content/injected/textCounter';
import altTager from '@pages/content/injected/altTager';
import imageSize from '@pages/content/injected/imageSize';
import checkSEO from '@pages/content/injected/checkSEO';
import previewSideView from '@pages/content/injected/previewSideView';

(async () => {
  await keyMapping();
  await imageSize();
  await altTager();
  await checkSEO();
  await textCounter();
  await previewSideView();
})();

console.log('StoryHelper Load Complete');
