export const $ = (className: string, reference?: Document | HTMLElement) => {
  if (reference)
    return (reference as Document).querySelector(className) || (reference as HTMLElement).querySelector(className);
  else return document.querySelector(className);
};

export const $$ = (className: string, reference?: Document | HTMLElement) => {
  if (reference)
    (reference as Document).querySelectorAll(className) || (reference as HTMLElement).querySelectorAll(className);
  else return document.querySelectorAll(className);
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
  }

  return element;
};
