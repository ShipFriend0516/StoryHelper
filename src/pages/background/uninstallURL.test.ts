import { describe, expect, it } from 'vitest';
import { buildUninstallURL } from './uninstallURL';

const BASE = 'https://storyhelper.shipfriend.dev/feedback';
const DAY_MS = 24 * 60 * 60 * 1000;

describe('buildUninstallURL', () => {
  it('버전, 경과일, 언어를 쿼리로 붙인다', () => {
    const now = Date.UTC(2026, 9, 18);
    const url = buildUninstallURL(BASE, { version: '1.7.3', lang: 'ko', installedAt: now - 12.5 * DAY_MS, now });
    expect(url).toBe(`${BASE}?v=1.7.3&days=12&lang=ko`);
  });

  it('설치 당일은 days=0으로 보낸다', () => {
    const now = Date.UTC(2026, 9, 18);
    const url = new URL(buildUninstallURL(BASE, { version: '1.7.3', lang: 'en-US', installedAt: now - 1000, now }));
    expect(url.searchParams.get('days')).toBe('0');
    expect(url.searchParams.get('lang')).toBe('en-US');
  });

  it('설치 시각이 없거나 미래면 days를 생략한다', () => {
    const now = Date.UTC(2026, 9, 18);
    expect(buildUninstallURL(BASE, { version: '1.7.3', lang: 'ko', now })).toBe(`${BASE}?v=1.7.3&lang=ko`);
    expect(buildUninstallURL(BASE, { version: '1.7.3', lang: 'ko', installedAt: now + DAY_MS, now })).toBe(
      `${BASE}?v=1.7.3&lang=ko`,
    );
  });
});
