# 오늘 할 일 (Todo)

> 새 작업을 시작할 때 여기에 체크리스트로 추가하세요.
> 완료된 항목은 지우지 말고 `[x]`로 체크만 하세요. (기록은 progress.md에 남기기)

## 2026-07-07 (Todo 추가 API)

- 요청: Todo 항목을 추가하는 API 만들기
- 확정된 사양: Node.js(Express), 메모리 저장(서버 재시작 시 초기화), "추가" 기능만 (조회/삭제 없음)

- [x] `todo-api/` 폴더 생성, `npm init`으로 `package.json` 작성, `express` 설치
- [x] `server.js` 작성: 메모리 배열에 Todo 저장, `POST /todos` 엔드포인트로 항목 추가 (요청 body에 `title` 등 받아서 id 부여 후 저장, 추가된 항목 응답으로 반환)
- [x] 로컬에서 서버 실행 후 PowerShell(Invoke-RestMethod)로 실제 호출해서 정상 동작 확인 (한글 title 정상 저장, 빈 title은 400 에러 확인)
- [x] 사용법 안내 (실행 방법, 호출 예시)

## 2026-07-07 (Todo 데스크톱 앱으로 확장)

- 요청: 사무실 PC 한 대에서 혼자 쓸 수 있는 앱/웹으로 만들기
- 확정된 사양:
  - 기능: 추가 + 목록보기 + 완료체크 + 삭제 (완전한 CRUD)
  - 저장: JSON 파일에 영구 저장 (재시작해도 안 사라짐)
  - 실행: 아이콘 더블클릭으로 바로 실행되는 데스크톱 앱 (Electron)
  - 아이클라우드 캘린더 연동은 이번 범위에서 제외 (나중에 별도 진행하기로 결정)

- [x] 백엔드 확장: `server.js`를 GET/POST/PATCH/DELETE 전체 CRUD로 확장, 메모리 대신 `todos.json` 파일에 저장
- [x] 프론트엔드 화면 작성: 목록/추가입력/체크박스/삭제 버튼이 있는 `public/index.html` + `script.js` + `style.css`
- [x] Electron으로 감싸기: `electron` 설치, `main.js` 작성 (백엔드를 내부에서 실행하고 BrowserWindow로 화면 표시)
- [x] `electron-builder`로 Windows용 portable `.exe` 빌드 (설치 없이 더블클릭 실행) → `todo-api/dist/내 할 일 1.0.0.exe`
- [x] 빌드된 exe 실제로 실행해서 추가/체크/삭제 확인 + 재시작 후에도 데이터 남아있는지 확인 (데이터는 `%APPDATA%\todo-app\todos.json`에 저장됨)
- [x] 사용법 안내 (exe 위치, 데이터 파일 위치)

## 2026-07-07 (아이클라우드 캘린더 연동)

- 요청: 아이클라우드 캘린더에 등록된 일정을 자동으로 Todo 목록에 올리는 워크플로우 추가
- 확정된 사양:
  - 동기화 시점: 앱이 켜져 있는 동안 15분마다 자동 (+ 앱 시작 시 1회)
  - 가져올 범위: 오늘 + 앞으로 7일
  - 삭제 처리: 캘린더에서 지워지면 Todo에서도 자동 삭제. 반대로 Todo에서 캘린더 유래 항목을 직접 지우면 다음 동기화 때 다시 생김(완료 체크로 처리 권장) — 캘린더가 "원본" 역할
  - 인증: Apple ID + 앱 암호(App-Specific Password)를 CalDAV로 사용. 코드에 하드코딩하지 않고 설정 파일(`.env`, git 제외)에 저장, 사용자가 직접 입력

- [x] `tsdav`(CalDAV 클라이언트), `dotenv`, `node-ical`(iCalendar 파싱) 설치
- [x] `.env` 설정 방식 정리: 개발 모드는 `todo-api/.env`, 패키징된 앱은 `%APPDATA%\todo-app\.env` 에서 `ICLOUD_APPLE_ID`, `ICLOUD_APP_PASSWORD` 읽기 (미설정 시 캘린더 동기화만 조용히 비활성화, 앱은 정상 동작) — 템플릿은 `todo-api/.env.example`
- [x] `store.js`로 Todo 상태 관리를 분리(서버/동기화 모듈이 공유), `icloud-sync.js` 작성: CalDAV로 iCloud 캘린더 접속 → 오늘~+7일 일정 조회 → Todo와 대조(추가된 일정은 새 Todo 생성 `source:'calendar'`+`calendarEventId`, 캘린더에서 사라진 건 Todo에서도 삭제)
- [x] `server.js`에 15분 주기 타이머로 동기화 실행 연결 (시작 시 1회 즉시 실행 포함), `/sync-status` 엔드포인트 추가
- [x] 화면(UI)에서 캘린더 유래 항목을 📅 표시로 구분, 동기화 에러 시 화면에 안내 메시지 표시, 30초마다 목록 자동 새로고침
- [x] 사용법 안내: 애플 앱 암호 발급 방법(appleid.apple.com), `.env` 파일 위치/작성법 안내
- [x] 실제 동작 확인: 자격증명 없을 때 정상 비활성화(`enabled:false`, 에러 없음) 확인, 가짜 자격증명으로 인증 실패 시 `/sync-status`에 에러 메시지 노출 확인, 실패한 동기화가 기존 Todo를 손상시키지 않음 확인. 실제 iCloud 계정으로 정상 동기화되는지는 사용자가 진짜 앱 암호를 넣은 뒤 최종 확인 필요
- [x] `package.json` build.files에 새 모듈(`store.js`,`icloud-sync.js`) 누락된 것 발견 후 추가, exe 재빌드하여 패키징된 앱에서도 `.env` 인식/에러 처리 정상 동작 확인

## 2026-07-06

- [x] `tasks/` 폴더 + `todo.md`, `progress.md` 생성
- [x] `SECURITY.md` 비상 매뉴얼 작성
- [x] 폴더 구조 정리한 `README.md` 작성

- [x] 다운로드 폴더 정리 (images/docs/videos/misc)
  - 대상: `~/Downloads` 최상위 파일 3394개, 약 83GB (하위 폴더 3개는 건드리지 않음: `Higgsfield`, `pikaso-creations-2026-03-03_05_02`, `Runway Static Stems`)
  - 새 폴더 생성: `images/`, `docs/`, `videos/`, `misc/`
  - 분류 기준
    - `images` (약 3125개): png, jpg, jpeg, psd
    - `docs` (약 31개): pdf, hwp, xlsx, pptx, md
    - `videos` (약 159개): mp4
    - `misc` (나머지 약 79개): mp3, exe, zip, safetensors, pt, pth, zxp, msi, ccx, ini, html, abr, 확장자 없는 파일 등
  - 안전장치: 이름 충돌 검사 결과 각 카테고리 내 중복 없음 → 덮어쓰기 발생 안 함. 혹시라도 대상 폴더에 동일 이름 파일이 있으면 덮어쓰지 않고 `_1`, `_2` 접미사를 붙여 저장 (백업 없이 덮어쓰지 않음 원칙)
  - 방식: 같은 드라이브 내 이동(move) — 복사가 아니므로 83GB라도 비교적 빠름
  - 실행 전 이동 대상 전체 파일 목록을 `tasks/downloads_reorg_manifest_YYYYMMDD.txt`로 저장해 되돌릴 수 있게 기록

- [x] 서울 강남구 논현동 날씨·미세먼지 자동 기록 스크립트
  - API 키 불필요: Open-Meteo (무료, 회원가입/키 없음) 사용
    - 날씨: api.open-meteo.com/v1/forecast
    - 대기질(PM10/PM2.5): air-quality-api.open-meteo.com/v1/air-quality
  - 좌표: 논현동 근사치 (lat 37.5104, lon 127.0359)
  - 스크립트: `scripts/weather_report.ps1` (PowerShell)
    - 온도/체감온도/습도/풍속/날씨상태(WMO 코드→한글) + PM10/PM2.5(+한국 환경부 기준 등급) 출력
    - `weather.txt`에 매일 덮어쓰기 저장 (사용자 확인 완료)
  - Windows 작업 스케줄러(schtasks)에 매일 09:30 자동 실행 등록 (사용자 확인 완료)
  - 스크립트 작성 후 수동 1회 실행하여 정상 동작 확인 → 이상 없으면 스케줄 등록

## 2026-07-06 (GitHub 업로드)

- [x] `.gitignore` 작성 (제외 대상: `.env`, `*.key`, `*.pem`, `id_rsa`, `credentials*`, `docs/resume.pdf`, `tasks/downloads_reorg_manifest_*.txt`, `weather.txt`)
- [x] `README.md`를 폴더 구조 보기 좋게 정리 (트리 구조 + 파일별 역할 갱신)
- [x] `git init` (로컬 저장소 초기화)
- [x] git 커밋 대상 확인 (`git status`)로 민감 파일이 안 걸리는지 재검증
- [x] 첫 커밋: 커밋 메시지 "Initial setup"
- [x] `gh repo create claude-workspace --private --source=. --remote=origin` 으로 private 레포 생성
- [x] `git push -u origin main` 으로 첫 푸시 (실제로는 master 브랜치로 push됨)

---

## 사용법

1. 새 작업이 생기면 이 파일 맨 위에 날짜(`## YYYY-MM-DD`)와 함께 체크리스트 추가
2. 작업 시작 전 이 파일을 먼저 확인
3. 작업 완료 시 체크박스를 `[x]`로 표시하고, `progress.md`에 요약 기록
