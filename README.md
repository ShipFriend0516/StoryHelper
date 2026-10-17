![StoryHelper 로고](public/icon-128.png)

# StoryHelper — 티스토리 글쓰기 도우미

티스토리 편집기에서 단축키, 이미지 일괄 편집, SEO 점검과 미리보기 제공

[Chrome 웹 스토어에서 설치](https://chromewebstore.google.com/detail/storyhelper/inmbdknioncgblpeiiohmdihhidnjpfp) 후 티스토리 글쓰기 화면에서 바로 사용

[서비스 소개](https://storyhelper.shipfriend.dev) · [버그 신고·기능 제안](https://github.com/ShipFriend0516/StoryHelper/issues)

## 글쓰기·이미지 편집·발행 전 점검 지원

| 기능 | 제공 내용 |
| --- | --- |
| 추가 단축키 | 글 발행, 이미지 업로드, 서식 창, 이전 포스트 링크, 편집 모드 전환 |
| Alt 태그 입력기 | 본문 이미지의 대체 텍스트 일괄 입력·수정 |
| 이미지 크기 조절 | 지정한 너비와 원본 비율을 기준으로 본문 이미지 크기 일괄 변경 |
| 글자 수 카운터 | 본문 입력에 따른 글자 수 표시 |
| SEO 점검 | 이미지 Alt 속성 누락·높이 미지정·제목1 중복 확인 |
| 미리보기 사이드뷰 | 편집기 오른쪽에서 미리보기 확인 및 본문 입력 후 갱신 |
| 상태 표시기 | 편집 화면에서 기능 활성화 상태 확인·전환 및 표시기 접기·펼치기 |

SEO 점검은 편집 내용의 일부 항목 확인용이며, 검색 순위나 노출 증가를 보장하는 기능은 아님

## 설치 후 필요한 기능 선택

### Chrome 웹 스토어에서 설치

1. [StoryHelper 설치 페이지](https://chromewebstore.google.com/detail/storyhelper/inmbdknioncgblpeiiohmdihhidnjpfp)에서 확장프로그램 추가
2. 티스토리 글쓰기 화면을 열고 사용 시작
3. 이미 열어 둔 글쓰기 페이지는 새로고침
4. 필요 없는 기능은 팝업의 **기능 목록**에서 비활성화

- 최초 설치 시 미리보기 사이드뷰는 비활성화, 나머지 기능은 활성화 상태로 시작
- 미리보기 사이드뷰는 팝업의 **기능 목록**에서 활성화 후 사용
- 기존 사용자의 기능 설정은 업데이트 시 유지
- 기능이나 단축키 변경 후 글쓰기 페이지 새로고침 필요

### 빌드 파일로 직접 설치

1. [GitHub Actions](https://github.com/ShipFriend0516/StoryHelper/actions/workflows/build-zip.yml)의 성공한 실행에서 `extension-dist` 산출물 다운로드 후 압축 해제
2. Chrome의 `chrome://extensions`에서 **개발자 모드** 활성화
3. **압축해제된 확장 프로그램을 로드합니다** 선택
4. `manifest.json`이 들어 있는 폴더 지정

로컬 빌드 시 아래 개발 절차로 생성한 `dist` 폴더 지정

## 팝업에서 단축키 확인·변경

**단축키 사용자 지정** 탭에서 키 조합 수정·저장 및 기본값 복원 지원

| 동작 | 기본 단축키 |
| --- | --- |
| 글 발행 | `Ctrl + Shift + S` |
| 이미지 업로드 | `Ctrl + Shift + U` |
| 서식 창 열기 | `Ctrl + Shift + F` |
| 이전 포스트 링크 | `Ctrl + Shift + P` |
| 편집 모드 전환 | `Ctrl + Shift + Y` |

macOS에서는 `Ctrl` 대신 `Command` 키로도 실행 가능
브라우저·운영체제 단축키와 충돌하면 사용자 지정 키 조합으로 변경 필요

## pnpm으로 개발·빌드

React 18 · TypeScript · Vite 기반 Chrome 확장프로그램, Manifest V3 사용

| 도구 | 프로젝트 기준 |
| --- | --- |
| Node.js | 22.14.0, `.nvmrc` 기준 |
| pnpm | 10.11.0, 패키지 설정 기준 |

### 소스 준비와 의존성 설치

```sh
git clone https://github.com/ShipFriend0516/StoryHelper.git
cd StoryHelper
nvm use
corepack enable
pnpm install --frozen-lockfile
```

`nvm` 사용 시 Node.js 버전 전환, 미사용 시 동일 버전 별도 설치 필요
의존성 잠금 파일은 `pnpm-lock.yaml` 사용

### 개발 모드와 배포 빌드

```sh
pnpm dev
```

개발 모드 실행 후 Chrome에 `dist` 폴더 로드

```sh
pnpm build
```

타입 검사 후 배포용 파일을 `dist` 폴더에 생성

### 변경사항 검증

```sh
pnpm lint
pnpm test --run
pnpm build
```

CI에서도 pnpm 잠금 파일 기준 설치, 테스트 및 배포 빌드 실행

## 이슈·PR로 개선 제안

- 버그 신고: 재현 순서, 브라우저 버전, 관련 화면 첨부
- 기능 제안: 해결하려는 글쓰기 불편과 기대 동작 설명
- 코드 기여: 변경 목적·범위와 검증 결과를 포함한 PR 작성
- 라이선스: [MIT](LICENSE)
