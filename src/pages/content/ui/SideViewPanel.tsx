import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const PANEL_IFRAME_ID = 'sh-preview-iframe';

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
  padding: '12px 16px',
  borderBottom: '1px solid #e0e0e0',
  fontSize: '14px',
  color: '#666',
  flexShrink: 0,
};

const iframeStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  width: '100%',
};

const SideViewPanel = () => {
  const [active, setActive] = useState(false);
  const [srcdoc, setSrcdoc] = useState('');
  const [headerHeight, setHeaderHeight] = useState(58);

  useEffect(() => {
    const onOpen = () => {
      const h = document.getElementById('kakaoHead')?.getBoundingClientRect().height ?? 58;
      setHeaderHeight(h);
      setActive(true);
    };

    const onClose = () => setActive(false);

    const onSrcdoc = (e: Event) => {
      setSrcdoc((e as CustomEvent<{ srcdoc: string }>).detail.srcdoc);
    };

    window.addEventListener('sh:sideview-open', onOpen);
    window.addEventListener('sh:sideview-close', onClose);
    window.addEventListener('sh:sideview-srcdoc', onSrcdoc);

    return () => {
      window.removeEventListener('sh:sideview-open', onOpen);
      window.removeEventListener('sh:sideview-close', onClose);
      window.removeEventListener('sh:sideview-srcdoc', onSrcdoc);
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
      <div style={headerStyle}>사이드뷰로 미리보는 중...</div>
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
