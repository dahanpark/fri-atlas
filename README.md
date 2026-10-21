# FRI ATLAS

[FRI ATLAS 사용하기](https://dahanpark.github.io/fri-atlas/) · [공개 GitHub 저장소](https://github.com/dahanpark/fri-atlas)

무료 세계 지도에서 골프장 후보를 발견하고 비교하는 buildless HTML 앱. 한국 기본, Frutiger Aero와 에디토리얼 디자인, TOP10/TOP20 선택(기본10)을 제공합니다.

## 실행

Node.js가 있으면 `node server.mjs` 후 http://127.0.0.1:4173 에 접속합니다. 의존성 설치와 빌드가 필요 없습니다. `node --test tests/core.test.js`로 핵심 데이터 동작을 검증합니다. Leaflet·글꼴·지도 타일과 실험 검색은 인터넷 연결이 필요합니다.

## 현재 범위

- 지도 이동/확대, EXPLORER/CATCH 상태, 클릭 당시 영역 고정 검색, 취소·시간초과·과대범위 보호
- 최대10/20 후보 비교, 출처와 정보 충실도 표시. 지도 자료로 품질 순위를 만들지 않습니다.
- OSM 후보36·공식 카탈로그41필드 비교. 관심골프장은 스냅샷을 저장·복원해 별도 목록에서 열고 삭제합니다. 최대4곳 비교는 지역 이동 뒤에도 유지하며 전체 비우기를 제공합니다.
- Navigator는 현재 화면과 마지막 분석 영역·시각·통계를 구분하고 새 화면은 미조회로 표시합니다.
- 독립 HTML은 날짜·인원·선택 비교 최대4곳과 요금 조건을 보존합니다. 공유 URL은 위치·줌·검색·정렬·상한·공급자·날짜·인원을 포함합니다. 메일 작성창에서 파일 첨부는 사용자가 직접 합니다.
- 공식 검증 예약 URL만 직접 예약으로 연결합니다. OSM에 등록된 일반 웹사이트는 공식성 미검증이라고 표시합니다.

공개 Overpass는 대중 서비스의 운영 백엔드가 아닙니다. 기본은 출처·확인시각이 있는 카탈로그 모드이며, 공개 endpoint는 사용자가 선택하는 제한적 실험 조회입니다. 이동 중 자동 요청하지 않으며 재실행 간격·취소·타임아웃을 적용합니다. 전 세계 실시간 상시 서비스에는 자체/계약 공급자가 필요합니다.

가격·평가·사진·티타임은 근거 없으면 미확인입니다. 그림은 장식이며 실제 전경이 아닙니다. 지도 후보 수는 실제 지역 전체 골프장 수가 아닙니다. 중심점이 화면 안인 OSM 객체만 포함하고 같은 코스의 별도 객체 중복 가능성을 공개합니다. 종합형은 비교 항목 구성이고 현재 가중치 기반 추천은 미산정입니다.

## 배포

2026-10-22 기준 구문검사 3개 파일·핵심 테스트8/8 통과, 독립 전체 검토 결함0건·9.5/10을 확인했습니다. 공개 저장소와 Pages HTTP200, [배포 워크플로 성공](https://github.com/dahanpark/fri-atlas/actions/runs/39688000196)을 확인했으며 배포 커밋은 `c6643c0b5f8dcf9bcf75b6396cedd2183b101f87`입니다. 공개 핵심5개 파일의 SHA-256이 로컬과 일치했습니다.

실제 브라우저에서 한국 공식 카탈로그4곳, 제주 Overpass46후보·20곳 표시, OSM 관심목록의 새로고침 복원과 지역 간 비교 유지를 확인했습니다. Overpass는 첫 요청502 후 버튼 재조회에 성공했으며 외부 서버 부하로 일시 실패할 수 있습니다.

공개 GitHub 저장소의 `main`에 push하면 `.github/workflows/pages.yml`이 검사 후 `dist/`만 Pages로 배포합니다. GitHub Settings → Pages의 source를 GitHub Actions로 설정해야 합니다. 소스 업데이트 배포이며 사용자 탐색 결과는 GitHub에 자동 업로드하지 않습니다. HTML 보고서는 개인 컴퓨터에 저장됩니다. API 키/메일 비밀번호는 포함하지 않습니다.

## 자료·확장

[조사 메모](output/research.md), [제품 명세](.agents/skills/fri-atlas/references/product.md), [재사용 스킬](.agents/skills/fri-atlas/SKILL.md)를 참고하세요. Google Earth/3D, 유료 리뷰·사진, 예약 제휴 API, 이메일 자동 발송과 결과 영구 공유는 협의·권한 확보 후 추가합니다.

지도 데이터 © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL. Leaflet 1.9.4 BSD-2-Clause, 외부 CDN 로딩. 공용 타일 서버는 [이용 정책](https://operations.osmfoundation.org/policies/tiles/)을 따르며 대량 다운로드하지 않습니다. 브라우저의 외부 공급자 요청에는 IP·referrer가 전달될 수 있습니다.
