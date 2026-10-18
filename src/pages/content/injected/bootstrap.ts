// Content scripts cannot use static module imports; load shared modules dynamically.
import('@pages/content/injected/index').catch(error => {
  console.error('[StoryHelper] Failed to load content features', error);
});
