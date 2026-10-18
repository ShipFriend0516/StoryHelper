export const $ = (className: string, reference?: Document | HTMLElement): Element => {
  if (reference)
    return (reference as Document).querySelector(className) || (reference as HTMLElement).querySelector(className);
  else return document.querySelector(className);
};

export const $$ = (className: string, reference?: Document | HTMLElement): NodeListOf<Element> => {
  return (reference ?? document).querySelectorAll(className);
};

interface ElementProperties {
  style?: Partial<CSSStyleDeclaration>;
  id?: string;
  class?: string | string[];
  textContent?: string;
  innerHTML?: string;
  attributes?: Record<string, string>;
  dataset?: Record<string, string>;
  eventListeners?: Record<string, (event: Event) => void>;
  src?: string;
  alt?: string;
  title?: string;
}

export const create$ = <T extends keyof HTMLElementTagNameMap>(
  tagName: T,
  properties?: ElementProperties,
): HTMLElementTagNameMap[T] => {
  const element = document.createElement(tagName);

  if (properties) {
    if (properties.style) {
      Object.assign(element.style, properties.style);
    }

    if (properties.id) {
      element.id = properties.id;
    }

    if (properties.class) {
      if (Array.isArray(properties.class)) {
        element.classList.add(...properties.class);
      } else {
        element.className = properties.class;
      }
    }

    if (properties.textContent !== undefined) {
      element.textContent = properties.textContent;
    }

    if (properties.innerHTML !== undefined) {
      element.innerHTML = properties.innerHTML;
    }

    if (properties.attributes) {
      Object.entries(properties.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    if (properties.dataset) {
      Object.entries(properties.dataset).forEach(([key, value]) => {
        element.dataset[key] = value;
      });
    }

    if (properties.eventListeners) {
      Object.entries(properties.eventListeners).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    }
    if (properties.src) {
      (element as HTMLImageElement).src = properties.src;
    }
    if (properties.alt) {
      (element as HTMLImageElement).alt = properties.alt;
    }
    if (properties.title) {
      element.title = properties.title;
    }
  }

  return element;
};

// 티스토리 에디터 관련 유틸리티
export const getEditorIframe = (): HTMLIFrameElement | null => {
  return document.getElementById('editor-tistory_ifr') as HTMLIFrameElement;
};

export const getEditorDocument = (): Document | null => {
  const iframe = getEditorIframe();
  return iframe?.contentDocument || null;
};

export const getEditorImages = (editorDocument: Document): HTMLImageElement[] => {
  return Array.from(editorDocument.body.getElementsByTagName('img'));
};

export const getEditorElement = (): HTMLElement | null => {
  const doc = getEditorDocument();
  return doc?.getElementById('tinymce') || null;
};

// TinyMCE-generated IDs can change between editor versions.
export const EDITOR_TOOLBAR_ANCHOR_SELECTORS = [
  '#mceu_18',
  '.mce-toolbar .mce-btn:last-child',
  '.tox-toolbar__group .tox-tbtn:last-child',
];

export const getEditorToolbarAnchor = (): Element | null => {
  for (const selector of EDITOR_TOOLBAR_ANCHOR_SELECTORS) {
    const anchor = document.querySelector(selector);
    if (anchor) return anchor;
  }
  return null;
};
