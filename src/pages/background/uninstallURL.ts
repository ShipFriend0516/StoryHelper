const DAY_MS = 24 * 60 * 60 * 1000;

export const INSTALLED_AT_KEY = 'installedAt';

interface UninstallURLParams {
  version: string;
  lang: string;
  installedAt?: number;
  now?: number;
}

export const buildUninstallURL = (
  baseURL: string,
  { version, lang, installedAt, now = Date.now() }: UninstallURLParams,
) => {
  const url = new URL(baseURL);
  url.searchParams.set('v', version);
  if (typeof installedAt === 'number' && installedAt <= now) {
    url.searchParams.set('days', String(Math.floor((now - installedAt) / DAY_MS)));
  }
  url.searchParams.set('lang', lang);
  return url.toString();
};

export const updateUninstallURL = async (baseURL: string) => {
  const { [INSTALLED_AT_KEY]: installedAt } = await chrome.storage.local.get(INSTALLED_AT_KEY);
  chrome.runtime.setUninstallURL(
    buildUninstallURL(baseURL, {
      version: chrome.runtime.getManifest().version,
      lang: chrome.i18n.getUILanguage(),
      installedAt,
    }),
  );
};
