export const isFeatureEnabled = async (key: string): Promise<boolean> => {
  const settings = await chrome.storage.local.get(key);
  return settings[key] !== false;
};
