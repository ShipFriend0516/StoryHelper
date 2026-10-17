import { afterEach, expect, test } from 'vitest';
import { $$ } from './utilDOM';

afterEach(() => {
  document.body.innerHTML = '';
});

// reference를 전달하면 검색 결과 대신 undefined를 반환하던 회귀 방지.
test.each(['요소', '문서'])('%s를 기준으로 조회한 결과를 반환한다', referenceType => {
  document.body.innerHTML = '<span>바깥</span><section><span>안쪽</span></section>';
  const reference = referenceType === '요소' ? document.querySelector('section') : document;
  const results = $$('span', reference);
  expect(Array.from(results, element => element.textContent)).toEqual(
    referenceType === '요소' ? ['안쪽'] : ['바깥', '안쪽'],
  );
});
