import keyMapping from '@pages/content/injected/keymap';
import textCounter from '@pages/content/injected/textCounter';
import altTager from '@pages/content/injected/altTager';
import imageSize from '@pages/content/injected/imageSize';
import checkSEO from '@pages/content/injected/checkSEO';
import previewSideView from '@pages/content/injected/previewSideView';
import onboarding from '@pages/content/injected/onboarding';

(async () => {
  // Preserve toolbar insertion order while isolating initialization failures.
  for (const feature of [keyMapping, altTager, imageSize, checkSEO, textCounter, previewSideView]) {
    try {
      await feature();
    } catch (error) {
      console.error(`[StoryHelper] Failed to initialize ${feature.name}`, error);
    }
  }

  // Runs after every feature so it can highlight whichever toolbar buttons were added.
  try {
    await onboarding();
  } catch (error) {
    console.error('[StoryHelper] Failed to show onboarding', error);
  }

  console.log('StoryHelper Load Complete');
})();
