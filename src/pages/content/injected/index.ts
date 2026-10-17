import keyMapping from '@pages/content/injected/keymap';
import textCounter from '@pages/content/injected/textCounter';
import altTager from '@pages/content/injected/altTager';
import imageSize from '@pages/content/injected/imageSize';
import checkSEO from '@pages/content/injected/checkSEO';
import previewSideView from '@pages/content/injected/previewSideView';

(async () => {
  // Preserve toolbar insertion order while isolating initialization failures.
  for (const feature of [keyMapping, altTager, imageSize, checkSEO, textCounter, previewSideView]) {
    try {
      await feature();
    } catch (error) {
      console.error(`[StoryHelper] Failed to initialize ${feature.name}`, error);
    }
  }

  console.log('StoryHelper Load Complete');
})();
