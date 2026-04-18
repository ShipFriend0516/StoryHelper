import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';
import { FEATURES } from '@src/shared/config/features';

const uninstallURL = 'https://storyhelper.shipfriend.dev/feedback';
const introduceURL = 'https://storyhelper.shipfriend.dev/introduce';

chrome.runtime.setUninstallURL(uninstallURL);

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    // Open the introduction page on first install
    chrome.tabs.create({ url: introduceURL });

    // On First Install, set the default settings about feature flags
    const defaultFeatureSettings: Record<string, boolean> = FEATURES.reduce(
      (acc, feature) => {
        acc[feature.key] = false;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    console.log('Setting default feature settings:', defaultFeatureSettings);

    chrome.storage.local.set(defaultFeatureSettings);
  }
});

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
      func_4: false,
      func_5: false,
    });
  }
});

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');
