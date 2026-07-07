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
