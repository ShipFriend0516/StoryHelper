import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const PANEL_IFRAME_ID = 'sh-preview-iframe';
const PULSE_STYLE_ID = 'sh-pulse-style';

const containerStyle = (top: number, height: string): React.CSSProperties => ({
  position: 'fixed',
  top,
  right: 0,
  width: '50vw',
  height,
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  borderLeft: '1px solid #e0e0e0',
  boxShadow: '-2px 0 8px rgba(0,0,0,0.06)',
});

const headerStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderBottom: '1px solid #e0e0e0',
  fontSize: '13px',
  color: '#666',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const iframeStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  width: '100%',
};

const dotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#4a90e2',
  animation: 'sh-pulse 1.2s ease-in-out infinite',
  flexShrink: 0,
};

const injectPulseStyle = () => {
  if (document.getElementById(PULSE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PULSE_STYLE_ID;
  style.textContent = `
    @keyframes sh-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.3; transform: scale(0.6); }
    }
  `;
  document.head.appendChild(style);
};

const removePulseStyle = () => {
  document.getElementById(PULSE_STYLE_ID)?.remove();
};

const SideViewPanel = () => {
  const [active, setActive] = useState(false);
  const [srcdoc, setSrcdoc] = useState('');
  const [headerHeight, setHeaderHeight] = useState(58);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    injectPulseStyle();
    return () => removePulseStyle();
  }, []);

  useEffect(() => {
    const onOpen = () => {
      const h = document.getElementById('kakaoHead')?.getBoundingClientRect().height ?? 58;
      setHeaderHeight(h);
      setActive(true);
    };

    const onClose = () => {
      setActive(false);
      setLoading(false);
    };

    const onSrcdoc = (e: Event) => {
      setSrcdoc((e as CustomEvent<{ srcdoc: string }>).detail.srcdoc);
    };

    const onLoading = (e: Event) => {
      setLoading((e as CustomEvent<{ loading: boolean }>).detail.loading);
    };

    window.addEventListener('sh:sideview-open', onOpen);
    window.addEventListener('sh:sideview-close', onClose);
    window.addEventListener('sh:sideview-srcdoc', onSrcdoc);
    window.addEventListener('sh:sideview-loading', onLoading);

    return () => {
      window.removeEventListener('sh:sideview-open', onOpen);
      window.removeEventListener('sh:sideview-close', onClose);
      window.removeEventListener('sh:sideview-srcdoc', onSrcdoc);
      window.removeEventListener('sh:sideview-loading', onLoading);
    };
  }, []);

  useEffect(() => {
    if (active) {
      document.body.style.setProperty('margin-right', '50vw', 'important');
    } else {
      document.body.style.removeProperty('margin-right');
    }
  }, [active]);

  if (!active) return null;

  return createPortal(
    <div style={containerStyle(headerHeight, `calc(100vh - ${headerHeight}px)`)}>
      <div style={headerStyle}>
        <span>{loading ? '리렌더링 중...' : '미리보기'}</span>
        {loading && <span style={dotStyle} />}
      </div>
      <iframe
        id={PANEL_IFRAME_ID}
        title="미리보기"
        srcDoc={srcdoc || undefined}
        sandbox="allow-scripts allow-same-origin"
        style={iframeStyle}
      />
    </div>,
    document.body,
  );
};

export default SideViewPanel;
