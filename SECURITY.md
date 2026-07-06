# 🚨 비상 매뉴얼 — 키 노출 의심 시

> "키가 노출된 것 같아요" 라고 말하면 Claude Code가 이 문서 순서대로 안내합니다.
> 당황하지 말고 위에서부터 순서대로 진행하세요.

---

## 0단계. 침착하게 — 어떤 키인지 먼저 특정

아래 중 무엇이 노출되었는지 확인하세요:

| 키 종류 | 위치(예상) | 확인 방법 |
|---|---|---|
| OpenRouter API 키 | `~/claude-workspace/.env` (`OPENROUTER_API_KEY`) | 키 앞부분이 `sk-or-v1-`로 시작 |
| Oracle SSH 개인키 | `~/.ssh/oracle-server.key` | SSH 접속용 개인키 파일 |
| WordPress 계정/API 키 | `~/claude-workspace/.env` (`WP_*`) | 관리자 페이지 또는 REST API 키 |
| 기타 (DB 비밀번호 등) | `~/claude-workspace/.env` | 환경변수명으로 구분 |

모르겠으면 "어떤 키인지 모르겠어요"라고 말하세요 — 같이 `.env` 파일을 마스킹된 형태로 확인합니다.

---

## 1단계. 즉시 폐기 (Revoke)

**노출된 즉시, 재발급보다 먼저 기존 키부터 무효화합니다.**

- **OpenRouter**: https://openrouter.ai/keys 접속 → 노출된 키 옆 **Delete** 클릭
- **Oracle Cloud (SSH 키)**:
  1. OCI 콘솔 → Compute → 인스턴스 → 해당 인스턴스 선택
  2. "SSH 키 추가/제거" 또는 인스턴스의 `~/.ssh/authorized_keys`에서 해당 공개키 제거
  3. 서버 접속 가능하면: `ssh oracle-server` 후 `authorized_keys`에서 직접 삭제
- **WordPress**: 관리자 → 사용자 → 프로필 → 애플리케이션 비밀번호(Application Passwords) → 해당 비밀번호 **취소(Revoke)**
- **기타 서비스**: 해당 서비스의 API 키/토큰 관리 페이지에서 즉시 삭제

⚠️ 이 단계는 되돌릴 수 없는 작업입니다. 실행 전 Claude Code가 "진행할까요?"라고 물어봅니다.

---

## 2단계. 재발급 (Reissue)

- **OpenRouter**: https://openrouter.ai/keys → **Create Key** → 새 키 발급
- **Oracle SSH 키**: 로컬에서 새 키쌍 생성
  ```
  ssh-keygen -t ed25519 -f ~/.ssh/oracle-server-new.key -C "oracle-server"
  ```
  → 새 공개키를 서버의 `authorized_keys`에 등록 (콘솔 또는 기존 접속 경로 이용)
- **WordPress**: 새 애플리케이션 비밀번호 생성

---

## 3단계. 환경변수 교체

1. `~/claude-workspace/.env` 파일을 열어 새 키 값으로 교체
   - Claude Code에게 직접 값을 보여주지 말고, 텍스트 에디터로 직접 수정하는 것을 권장
2. SSH 키를 교체했다면 `~/.ssh/config`의 `oracle-server` 항목 경로도 새 키 파일명으로 업데이트
3. 교체 후 `.env` 파일이 `.gitignore`에 포함되어 있는지 재확인

---

## 4단계. 사용 이력 확인 (악용 여부 점검)

- **OpenRouter**: https://openrouter.ai/activity 에서 노출 시점 이후 비정상적인 사용량/비용 확인
- **Oracle Cloud**: OCI 콘솔 → Audit → 로그인 이력, 인스턴스 접속 로그(`/var/log/auth.log` 또는 `/var/log/secure`) 확인
- **WordPress**: 관리자 → 사이트 상태 → 로그인 시도 이력, 알 수 없는 게시물/사용자 생성 여부 확인
- 의심스러운 활동 발견 시: 관련 리소스(서버, 사이트) 추가 잠금 및 백업 확인

---

## 평소 예방 체크리스트

- [ ] `.env`, `*.key`, `*.pem`, `id_rsa`, `credentials` 파일이 `.gitignore`에 등록되어 있는가?
- [ ] 코드에 키를 하드코딩하지 않고 환경변수(`process.env.*`)로만 참조하는가?
- [ ] 외부 서비스(GitHub, 커뮤니티 등)에 코드/로그를 올리기 전 키가 섞여있지 않은지 확인했는가?
- [ ] 정기적으로(3~6개월) 키를 교체하는가?

---

*이 문서는 CLAUDE.md의 "🚨 비상시 — 키 노출 의심" 규칙에 따라 작성되었습니다.*
