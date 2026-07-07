# 작업 기록 (Progress)

> 완료된 작업을 시간 순서대로 append(추가)만 합니다. 이미 적힌 내용은 수정/삭제하지 않습니다.

---

## 2026-07-06

- 작업 환경 초기 구축
  1. `tasks/todo.md`, `tasks/progress.md` 생성
  2. `SECURITY.md` 비상 매뉴얼 작성 (키 노출 대응 절차)
  3. `README.md`로 폴더 구조 정리

- 다운로드 폴더 정리 (~/Downloads, 3394개 파일, 약 83GB)
  - images(3125)/docs(31)/videos(159)/misc(79)로 분류 이동
  - 기존 하위 폴더(Higgsfield, pikaso-creations, Runway Static Stems)는 그대로 유지
  - 이름 충돌 없이 완료, 이동 내역은 `tasks/downloads_reorg_manifest_20260706.txt`에 기록

- 논현동 날씨·미세먼지 자동 기록 스크립트 구축
  - Open-Meteo 무료 공개 API 사용 (API 키 불필요)
  - `scripts/weather_report.ps1` 작성 → `weather.txt`에 매일 덮어쓰기 저장
  - Windows 작업 스케줄러에 "WeatherReport" 작업 등록 (매일 09:30 자동 실행)
  - 수동 실행 테스트로 정상 동작 확인 완료

- Discord 웹훅 연동 추가
  - `.env`에 `DISCORD_WEBHOOK_URL` 저장 (하드코딩 아님, 환경변수로만 참조)
  - `weather_report.ps1`에 `.env` 파싱 + Discord 전송 함수 추가 (웹훅 미설정 시 자동 스킵)
  - 실제 전송 테스트 성공 확인

- claude-workspace GitHub private 레포 생성 및 업로드
  - `.gitignore` 작성 (`.env`, `docs/resume.pdf`, `weather.txt`, `tasks/downloads_reorg_manifest_*.txt` 제외)
  - `README.md` 폴더 구조 재정리
  - `git init` → 첫 커밋 "Initial setup" (7개 파일) → `gh repo create --private`로 업로드
  - 레포 주소: https://github.com/yangyezy/claude-workspace (private)

## 2026-07-07

- Todo 추가 API 만들기 (`todo-api/`)
  - Node.js(Express) 기반, 메모리 배열에 저장 (서버 재시작하면 초기화됨)
  - `POST /todos` — body의 `title`을 받아 id 자동 부여 후 저장, 저장된 항목을 응답으로 반환
  - `title`이 비어있으면 400 에러 응답
  - 실행: `todo-api` 폴더에서 `node server.js` → `http://localhost:3000`
  - PowerShell `Invoke-RestMethod`로 한글 title 정상 저장 확인, 빈 title 400 에러 확인

- Todo API → 사무실 전용 데스크톱 앱으로 확장 (`todo-api/`)
  - 백엔드를 GET/POST/PATCH(완료체크)/DELETE 전체 CRUD로 확장, 저장 방식을 메모리 → `todos.json` 파일로 변경 (재시작해도 유지)
  - `public/` 폴더에 목록/추가/체크/삭제 화면(HTML/CSS/JS) 작성, express static으로 서빙
  - Electron(`main.js`)으로 감싸서 브라우저 없이 자체 창으로 뜨는 앱으로 전환. 데이터 파일은 `app.getPath('userData')` 위치(`%APPDATA%\todo-app\todos.json`)에 저장하도록 처리해 패키징 후에도 쓰기 가능하도록 함
  - `electron-builder`로 Windows portable exe 빌드 → `todo-api/dist/내 할 일 1.0.0.exe` (설치 없이 더블클릭 실행, 아이콘은 기본 Electron 아이콘)
  - 실제 exe를 실행해 추가/완료체크 동작 확인, 프로세스 완전 종료 후 재실행해도 데이터가 남아있는 것 확인
  - 아이클라우드 캘린더 연동은 사용자 요청으로 이번 범위에서 제외 (다음 작업으로 남김)

- Todo 앱 UI를 사용자가 준 참고 이미지 디자인으로 변경 (`todo-api/public/`)
  - 노란색(크림) 배경 + 굵은 검정 헤더("Todo List" + 화살표 로고) + 테두리 박스 목록 + 오른쪽 체크박스 칸(완료 시 파란 체크마크) + 하단 "Add" 섹션(+ 아이콘) 스타일로 전면 재구성
  - Electron 앱을 실제로 띄워 스크린샷으로 참고 이미지와 비교 확인 완료 (레이아웃/색상 일치)
  - 이후 사용자 요청으로 헤더 오른쪽 화살표 로고 제거, exe도 재빌드해서 반영

- 헤더 로고 제거 후 exe를 재빌드하지 않아 옛 화면이 그대로였던 문제 발생 → 디자인/기능을 바꿀 때마다 `npm run dist`로 exe도 재빌드해야 실제 사용 파일에 반영된다는 점을 놓치지 않아야 함

- 아이클라우드 캘린더 연동 추가 (`todo-api/`)
  - Todo 데이터 관리를 `store.js`로 분리(서버 라우트와 동기화 로직이 같은 저장소를 공유하도록)
  - `icloud-sync.js`: `tsdav`로 iCloud CalDAV(`https://caldav.icloud.com`)에 Apple ID + 앱 암호(Basic Auth)로 접속, 오늘~+7일 일정을 `node-ical`로 파싱해 Todo와 대조. 새 일정은 `source:'calendar'` + `calendarEventId`로 Todo 생성, 캘린더에서 사라진 일정은 Todo에서도 삭제(캘린더가 "원본" 역할 — Todo에서 캘린더 유래 항목을 직접 지우면 다음 동기화 때 재생성됨, 완료 체크로 처리 권장)
  - `server.js`가 앱 시작 시 1회 + 15분마다 자동 동기화 실행, `/sync-status`로 활성화 여부/마지막 동기화 시각/에러를 노출
  - 인증 정보는 코드에 하드코딩하지 않고 `.env`(개발: `todo-api/.env`, 배포: `%APPDATA%\todo-app\.env`, 둘 다 git 제외)에서 읽음. 템플릿은 `todo-api/.env.example`로 제공
  - 화면에는 캘린더 유래 항목에 📅 표시, 동기화 실패 시 에러 배너 노출, 목록은 30초마다 자동 새로고침
  - 검증: 자격증명 없을 때 조용히 비활성화(정상), 가짜 자격증명으로 실제 iCloud 서버에 401 인증 실패를 재현해 에러 메시지가 `/sync-status`에 정확히 노출되는 것 확인, 실패한 동기화가 기존 Todo를 손상시키지 않는 것 확인. 패키징 시 `package.json`의 `build.files`에 새 모듈이 빠져있던 것을 발견해 추가 후 exe 재빌드, 패키징 앱에서도 `.env` 인식이 정상 동작함을 확인
  - 실제 iCloud 계정으로의 최종 동기화 확인은 사용자가 앱 암호를 발급받아 `.env`에 입력한 뒤 진행 필요
