import('@pages/content/injected/keymap');
import('@pages/content/injected/textCounter');
import altTager from '@pages/content/injected/altTager';
import imageSize from '@pages/content/injected/imageSize';

await imageSize();
await altTager();
console.log('StoryHelper Load Complete');
