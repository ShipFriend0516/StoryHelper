import { isFeatureEnabled } from '@src/shared/utils/features';
import { createToolbarButton } from '@pages/content/util/toolbar';
import { getEditorDocument, getEditorImages, getEditorToolbarAnchor } from '@root/utils/dom/utilDOM';

async function imageSize() {
  if (!(await isFeatureEnabled('func_2'))) return;
  const anchor = document.body.querySelector('#altTager') ?? getEditorToolbarAnchor();
  if (!anchor) return;
  createToolbarButton(anchor, {
    id: 'sh-image-sizer-btn',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="17" height="17"><path d="M9.854,14.854L1.707,23h6.293v1H1.5c-.827,0-1.5-.673-1.5-1.5v-6.5H1v6.293L9.146,14.146l.707,.707ZM22.5,0h-6.5V1h6.293L14.146,9.146l.707,.707L23,1.707v6.293h1V1.5c0-.827-.673-1.5-1.5-1.5Z"/></svg>',
    tooltip: chrome.i18n.getMessage('tooltip_image_resizer'),
    onClick: () => {
      const userInput = window.prompt(chrome.i18n.getMessage('prompt_image_size_bulk_edit'), '');

      if (userInput === null) return;
      const imageSize = Number(userInput);
      if (!Number.isSafeInteger(imageSize) || imageSize <= 0) {
        alert(chrome.i18n.getMessage('error_invalid_number'));
        return;
      }

      const post = getEditorDocument();
      if (!post?.body) return;
      getEditorImages(post).forEach(img => {
        const dimensions = [
          [Number(img.dataset.originWidth), Number(img.dataset.originHeight)],
          [img.naturalWidth, img.naturalHeight],
          [img.width, img.height],
        ].find(([width, height]) => Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0);
        if (!dimensions) return;

        const [width, height] = dimensions;
        const imageHeight = Math.max(1, Math.floor((height / width) * imageSize));
        if (!Number.isFinite(imageHeight)) return;
        img.width = imageSize;
        img.height = imageHeight;
      });
    },
  });
}

export default imageSize;
