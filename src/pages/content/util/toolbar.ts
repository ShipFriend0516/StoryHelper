import { create$ } from '@root/utils/dom/utilDOM';
import { createTooltip, showTooltip, hideTooltip } from './tooltip';

interface ToolbarButtonOptions {
  id: string;
  icon: string;
  tooltip: string;
  onClick: () => void;
}

export const createToolbarButton = (anchor: Element, options: ToolbarButtonOptions): HTMLDivElement => {
  const container = create$('div', {
    id: options.id,
    class: 'mce-widget mce-btn mce-menubtn mce-fixed-width',
  });
  container.appendChild(create$('button', { innerHTML: options.icon }));

  const tooltip = createTooltip(options.tooltip);
  document.body.appendChild(tooltip);
  container.addEventListener('mouseover', () => showTooltip(tooltip, container));
  container.addEventListener('mouseout', () => hideTooltip(tooltip));
  container.addEventListener('click', options.onClick);
  anchor.insertAdjacentElement('afterend', container);
  return container;
};
