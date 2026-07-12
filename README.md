[README.md](https://github.com/user-attachments/files/29938470/README.md)
# 법인 운영 Cashflow 관리

엑셀(Transactions / Recurring / DebtInvest / Settings → Dashboard / Cashflow) 구조를 그대로 옮긴 단일 HTML 웹 앱입니다. **Google Sheets와 실시간 연동**되어 어느 기기에서 접속해도 같은 데이터가 표시됩니다.

- `index.html` — 웹 앱 (GitHub Pages에 올림)
- `Code.gs` — 구글 시트에 붙이는 백엔드 스크립트

---

## 1단계 · GitHub Pages로 웹 앱 배포 (git 불필요, 약 5분)

1. https://github.com/new 에서 새 저장소 생성 → 이름 예: `cashflow`, **Public** 선택 → Create
2. 저장소 화면 **uploading an existing file** → `index.html` 드래그 → Commit changes
3. **Settings → Pages** → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save
4. 1~2분 뒤 접속 주소:
   ```
   https://<GitHub아이디>.github.io/cashflow/
   ```

이 시점에는 데이터가 브라우저에만 저장됩니다. 아래 2단계를 하면 구글 시트로 동기화됩니다.

---

## 2단계 · Google Sheets 연동 (약 5분)

### 2-1. 시트와 스크립트 준비
1. https://sheets.new 로 새 구글 시트 생성 (이름 예: `법인 Cashflow 데이터`)
2. 상단 메뉴 **확장 프로그램 → Apps Script**
3. 기본 `Code.gs` 내용을 모두 지우고, 이 저장소의 **`Code.gs` 내용을 전체 복사해 붙여넣기** → 저장(디스크 아이콘)

### 2-2. 웹 앱으로 배포
1. Apps Script 우측 상단 **배포 → 새 배포**
2. 톱니바퀴(유형 선택) → **웹 앱**
3. 설정:
   - 설명: 아무거나 (예: cashflow api)
   - **실행: 나(본인 계정)**
   - **액세스 권한: 모든 사용자**  ← 반드시 이걸로 설정
4. **배포** → 권한 승인 요청이 뜨면 본인 구글 계정으로 승인
   - "이 앱은 확인되지 않았습니다" 화면이 나오면 → **고급 → (프로젝트명)(으)로 이동 → 허용**
5. 배포 완료 후 표시되는 **웹 앱 URL**을 복사 (형식: `https://script.google.com/macros/s/……/exec`)

### 2-3. 웹 앱에 연결
1. GitHub Pages로 연 웹 앱에서 **Settings 탭** 이동
2. **Google Sheets 연동** 칸에 방금 복사한 `…/exec` URL 붙여넣기
3. **연결 저장 & 시트에서 불러오기** 클릭
   - 처음 연결 시 시트가 비어 있으면, 현재 앱 데이터가 시트로 자동 업로드됩니다.
   - 상단 우측 배지가 **● Google Sheets 연동됨** 으로 바뀌면 성공입니다.

이제 어느 기기에서든 같은 GitHub Pages 주소로 접속한 뒤, Settings 탭에 같은 `…/exec` URL을 한 번 입력하면 동일한 데이터가 표시됩니다. (URL은 기기별로 최초 1회만 입력하면 브라우저에 기억됩니다.)

---

## 동작 방식

- 앱에서 입력·수정·삭제할 때마다 해당 데이터셋이 구글 시트의 탭에 저장됩니다.
- 시트 탭은 엑셀과 동일하게 4개로 나뉩니다: `Transactions` / `Recurring` / `DebtInvest` / `Settings`
- 시트를 직접 열어 데이터를 확인할 수 있습니다. (직접 수정도 가능하지만, 서식이 깨질 수 있으니 웹 앱에서 입력하는 것을 권장)
- 네트워크 오류 등으로 시트 저장이 실패하면 로컬에는 저장되며 배지에 오류가 표시됩니다. 이후 Settings의 **현재 데이터를 시트로 전체 업로드**로 다시 맞출 수 있습니다.

## 동기화 버튼 (Settings 탭)

| 버튼 | 동작 |
|---|---|
| 연결 저장 & 시트에서 불러오기 | URL 저장 후 시트 데이터를 앱으로 가져옴 (빈 시트면 앱 데이터를 올림) |
| 현재 데이터를 시트로 전체 업로드 | 앱 데이터로 시트를 덮어씀 |
| 시트에서 다시 불러오기 | 시트 데이터로 앱을 덮어씀 |
| 연동 해제 | 시트 연결을 끊고 로컬 저장으로 전환 |

## 문제 해결

- **연결 실패** → 배포 설정에서 액세스 권한이 **모든 사용자**인지 확인. 코드 수정 후에는 반드시 **배포 → 배포 관리 → 편집(연필) → 버전: 새 버전 → 배포**로 재배포해야 반영됩니다.
- **날짜가 이상하게 보임** → `Code.gs`가 날짜를 텍스트 서식으로 저장하므로 정상입니다. 시트에서 직접 고치지 마세요.
- **백업** → Settings 탭에서 데이터셋별 JSON 또는 전체 백업을 언제든 내려받을 수 있습니다.
