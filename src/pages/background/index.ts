import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';
import { FEATURES } from '@src/shared/config/features';
import { INSTALLED_AT_KEY, updateUninstallURL } from './uninstallURL';

const uninstallURL = 'https://storyhelper.shipfriend.dev/feedback';
const introduceURL = 'https://storyhelper.shipfriend.dev/introduce';

// Refresh on every service worker start so the elapsed days stay current
updateUninstallURL(uninstallURL);

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    // Open the introduction page on first install
    chrome.tabs.create({ url: introduceURL });

    // Enable all features except preview side view on first install
    const defaultFeatureSettings: Record<string, boolean> = FEATURES.reduce(
      (acc, feature) => {
        acc[feature.key] = feature.key !== 'func_5';
        return acc;
      },
      {} as Record<string, boolean>,
    );

    console.log('Setting default feature settings:', defaultFeatureSettings);

    chrome.storage.local
      .set({ ...defaultFeatureSettings, [INSTALLED_AT_KEY]: Date.now() })
      .then(() => updateUninstallURL(uninstallURL));
  }
});

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');
