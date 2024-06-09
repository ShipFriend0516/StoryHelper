<div align="center">
<img src="public/icon-128.png" alt="logo"/>

</div>

# 티스토리 글쓰기 향상 크롬 익스텐션
티스토리 블로그 글쓰기 사용자 경험 향상을 위해 제작, React + Vite + TypeScript 보일러플레이트를 사용해서 제작

![image](https://github.com/ShipFriend0516/StoryHelper/assets/98446924/56e3330f-d756-4b69-9bad-79e57a464b94)
사용하려는 기능을 활성화하고 새로고침하면 적용

## 기능

### 단축키 추가
- 일단은 3개
- 이미지 업로드, 글 발행, 서식 단축키 추가
- 단축키 키 조합은 확장프로그램 팝업창 확인

### 대체 이미지 텍스트 한번에 넣기
- 구글 SEO를 위해서 이미지의 alt 태그는 필수이다. 하지만 매번 이미지를 클릭해서 텍스트를 입력할 때, 이미지의 수가 많아지면 오래걸리기 때문에 alt 태그를 한번에 넣을 수 있도록 상단에 버튼을 추가

### 이미지 사이즈 조절기
- 이미지 사이즈 임의로 조절 안하면 width와 height 속성이 없어서 자동으로 auto 값이 들어간다.
- 이렇게 되면 이미지가 모두 로딩되기 전에는 아무런 공간도 차지하지 않다가 로딩되면 각 값이 적용이 되기 때문에 CLS 값이 올라간다.
- CLS값이 높으면 검색 색인에 악영향을 주기 떄문에 임의로 조절 해주는 것이 필요하다. 그래서 만듬

### 글자 수 카운터
- 글자 수 카운터

  
### 추가 기능
도움


## 적용 방법
> Release > 최신 버전 다운로드 > 압축해제

크롬 확장프로그램 관리 탭 > 개발자 모드 활성화 > "압축해제된 확장프로그램을 로드합니다" > 프로젝트의 dist 폴더 지정
