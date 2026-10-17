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

      const imageSize: number = parseInt(userInput);
      if (userInput !== null && !isNaN(imageSize)) {
        const post = getEditorDocument();
        if (!post?.body) return;
        const imgs: HTMLImageElement[] = getEditorImages(post);
        imgs.forEach(img => {
          const originWidth: number = parseInt(img.dataset.originWidth);
          const originHeight: number = parseInt(img.dataset.originHeight);
          const ratio = originHeight / originWidth;
          const imageWidth = imageSize;
          const imageHeight = Math.floor(ratio * imageWidth);
          img.width = imageSize;
          img.height = imageHeight;
        });
      } else {
        alert(chrome.i18n.getMessage('error_invalid_number'));
      }
    },
  });
}

export default imageSize;
