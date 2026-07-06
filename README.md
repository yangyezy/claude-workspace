# claude-workspace

yejee님의 Claude Code 작업 공간입니다. 이 폴더는 Claude Code가 자동으로 읽는 `CLAUDE.md` 지침에 따라 관리됩니다.

## 폴더 구조

```
claude-workspace/
├── CLAUDE.md               # Claude Code 행동 지침서 (보안 규칙, 소통 방식, 작업 원칙)
├── README.md               # 이 파일 — 폴더 구조 안내
├── SECURITY.md             # 🚨 키 노출 등 비상 상황 대응 매뉴얼
├── .env                    # 환경변수 (Discord 웹훅 URL 등) — git 미포함
├── .gitignore              # git 제외 대상 정의
├── docs/
│   └── resume.pdf          # 이력서 (개인정보) — git 미포함
├── scripts/
│   └── weather_report.ps1  # 논현동 날씨·미세먼지 조회 → weather.txt 저장 + Discord 전송 (매일 09:30 자동 실행)
├── weather.txt             # 최신 날씨·미세먼지 리포트 (매일 덮어쓰기) — git 미포함
└── tasks/
    ├── todo.md             # 오늘 할 일 체크리스트
    ├── progress.md         # 완료한 작업 기록 (append-only)
    └── downloads_reorg_manifest_*.txt  # 다운로드 폴더 정리 이력 — git 미포함
```

## 파일별 역할

| 파일 | 역할 | 비고 |
|---|---|---|
| `CLAUDE.md` | Claude Code가 매 세션 시작 시 자동으로 읽는 규칙 파일 | 보안 규칙, 위험 작업 확인, 소통 방식 등 정의 |
| `README.md` | 폴더 구조 안내 (현재 파일) | 사람이 보는 문서 |
| `SECURITY.md` | 키 노출 의심 시 대응 절차 | "키 노출 의심" 발생 시 Claude Code가 이 문서를 안내 |
| `.env` | Discord 웹훅 URL 등 민감 정보 | **git에 올리지 않음** (`.gitignore` 등록) |
| `.gitignore` | git 제외 대상 정의 | 민감 파일·개인정보·자동 생성 파일 제외 |
| `docs/resume.pdf` | 이력서 | 개인정보 포함 — **git에 올리지 않음** |
| `scripts/weather_report.ps1` | 날씨·미세먼지 조회 + weather.txt 저장 + Discord 전송 | Open-Meteo API 사용(키 불필요), Windows 작업 스케줄러 "WeatherReport"에 매일 09:30 등록됨 |
| `weather.txt` | 최신 날씨·미세먼지 리포트 | 매일 자동 갱신(덮어쓰기) — **git에 올리지 않음** |
| `tasks/todo.md` | 진행 중/예정 작업 체크리스트 | 작업 시작 시 확인 |
| `tasks/progress.md` | 완료된 작업 기록 | 작업 종료 시 append로 기록 |
| `tasks/downloads_reorg_manifest_*.txt` | 다운로드 폴더 정리 시 이동 내역 기록 | 개인 파일명 포함 — **git에 올리지 않음** |

## 참고 (아직 준비되지 않은 항목)

CLAUDE.md에 언급되었지만 아직 이 환경에 존재하지 않는 항목입니다. 필요할 때 생성하세요.

- `~/.ssh/oracle-server.key` — 오라클 서버 SSH 개인키
- SSH config의 `oracle-server` 별칭 등록
- `.env`에 OpenRouter, Oracle, WordPress 키 등은 아직 미등록 (현재는 Discord 웹훅만 설정됨)

## 작업 흐름

1. 작업 시작 전 `tasks/todo.md` 확인
2. 작업 완료 후 `tasks/progress.md`에 기록
3. 키 노출 의심 시 `SECURITY.md` 참고
4. 위험한 작업(삭제, DB 파괴, git 되돌리기 등)은 항상 사전 확인 후 진행
