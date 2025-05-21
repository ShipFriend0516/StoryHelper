import('@pages/content/injected/keymap');
import('@pages/content/injected/textCounter');
import altTager from '@pages/content/injected/altTager';
import imageSize from '@pages/content/injected/imageSize';
import checkSEO from '@pages/content/injected/checkSEO';

(async () => {
  await imageSize();
  await altTager();
  await checkSEO();
})();

console.log('StoryHelper Load Complete');
