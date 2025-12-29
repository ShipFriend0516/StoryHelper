import { create$ } from '@root/utils/dom/utilDOM';

const WEBSTORE_URL = 'https://chromewebstore.google.com/detail/storyhelper/inmbdknioncgblpeiiohmdihhidnjpfp';
const CONFETTI_EMOJIS = ['🎉', '🎊', '✨', '⭐', '🌟'];

const injectStyles = () => {
  if (document.getElementById('storyhelper-review-styles')) return;

  const style = create$('style', {
    id: 'storyhelper-review-styles',
    textContent: `
      @keyframes storyhelper-toast-slide-up {
        0% { transform: translateY(20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }

      @keyframes storyhelper-confetti-fall {
        0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
      }

      @keyframes storyhelper-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .storyhelper-review-toast {
        animation: storyhelper-toast-slide-up 0.3s ease-out;
      }

      .storyhelper-confetti {
        position: absolute;
        font-size: 20px;
        pointer-events: none;
        animation: storyhelper-confetti-fall 2s ease-out forwards;
      }

      .storyhelper-review-btn {
        transition: all 0.2s ease;
      }

      .storyhelper-review-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .storyhelper-review-btn-primary:hover {
        background-color: #6b8e6b !important;
      }

      .storyhelper-review-btn-secondary:hover {
        background-color: #e8e8e8 !important;
      }
    `,
  });

  document.head.appendChild(style);
};

const createConfetti = (container: HTMLElement) => {
  for (let i = 0; i < 12; i++) {
    const confetti = create$('span', {
      class: 'storyhelper-confetti',
      textContent: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 30 - 20}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        animationDuration: `${1.5 + Math.random() * 1}s`,
      },
    });
    container.appendChild(confetti);
  }

  // Remove confetti after animation
  setTimeout(() => {
    const confettis = container.querySelectorAll('.storyhelper-confetti');
    confettis.forEach(c => c.remove());
  }, 3000);
};

export const showReviewPrompt = async () => {
  // Check if already showing
  if (document.getElementById('storyhelper-review-prompt')) return;

  injectStyles();

  // Container
  const container = create$('div', {
    id: 'storyhelper-review-prompt',
    class: 'storyhelper-review-toast',
    style: {
      position: 'fixed',
      bottom: '140px',
      right: '20px',
      width: '320px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      padding: '20px',
      zIndex: '10000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'visible',
    },
  });

  // Close button
  const closeBtn = create$('button', {
    textContent: '✕',
    style: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      background: 'none',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      color: '#999',
      padding: '4px',
      lineHeight: '1',
    },
  });

  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.color = '#666';
  });

  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.color = '#999';
  });

  closeBtn.addEventListener('click', async () => {
    await chrome.storage.local.set({ review_dismissed_at: Date.now() });
    container.style.animation = 'storyhelper-toast-slide-up 0.2s ease-out reverse';
    setTimeout(() => container.remove(), 200);
  });

  // Header with emoji
  const header = create$('div', {
    style: {
      fontSize: '32px',
      textAlign: 'center',
      marginBottom: '12px',
    },
    textContent: '🎉',
  });

  // Title
  const title = create$('div', {
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#333',
      marginBottom: '8px',
    },
    textContent: '와! SEO 최적화를 5번 성공했어요!',
  });

  // Message
  const message = create$('div', {
    style: {
      fontSize: '14px',
      color: '#666',
      textAlign: 'center',
      marginBottom: '20px',
      lineHeight: '1.5',
    },
    textContent: 'StoryHelper가 도움이 되셨나요? 리뷰를 남겨주시면 더 많은 블로거들에게 도움이 됩니다!',
  });

  // Button container
  const btnContainer = create$('div', {
    style: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
    },
  });

  // Review button (primary) - Sage green tone
  const reviewBtn = create$('button', {
    class: ['storyhelper-review-btn', 'storyhelper-review-btn-primary'],
    textContent: '⭐ 별점 남기기',
    style: {
      flex: '1',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff',
      backgroundColor: '#7d9b76',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    },
  });

  reviewBtn.addEventListener('click', async () => {
    await chrome.storage.local.set({ review_requested: true });
    window.open(WEBSTORE_URL, '_blank');
    container.remove();
  });

  // Later button (secondary)
  const laterBtn = create$('button', {
    class: ['storyhelper-review-btn', 'storyhelper-review-btn-secondary'],
    textContent: '나중에',
    style: {
      padding: '12px 16px',
      fontSize: '14px',
      color: '#666',
      backgroundColor: '#f5f5f5',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    },
  });

  laterBtn.addEventListener('click', async () => {
    await chrome.storage.local.set({ review_dismissed_at: Date.now() });
    container.style.animation = 'storyhelper-toast-slide-up 0.2s ease-out reverse';
    setTimeout(() => container.remove(), 200);
  });

  // Assemble
  btnContainer.appendChild(reviewBtn);
  btnContainer.appendChild(laterBtn);

  container.appendChild(closeBtn);
  container.appendChild(header);
  container.appendChild(title);
  container.appendChild(message);
  container.appendChild(btnContainer);

  document.body.appendChild(container);

  // Trigger confetti animation
  createConfetti(container);
};

export const shouldShowReviewPrompt = async (): Promise<boolean> => {
  const result = await chrome.storage.local.get(['seo_success_count', 'review_requested', 'review_dismissed_at']);

  const seoSuccessCount = result.seo_success_count || 0;
  const reviewRequested = result.review_requested || false;
  const reviewDismissedAt = result.review_dismissed_at || 0;

  // Already reviewed
  if (reviewRequested) return false;

  // Not enough successes
  if (seoSuccessCount < 5) return false;

  // Dismissed within last 7 days
  if (reviewDismissedAt && Date.now() - reviewDismissedAt < 7 * 24 * 60 * 60 * 1000) {
    return false;
  }

  return true;
};
