# FRI ATLAS 데이터·지도 조사 메모

확인: 2026-10-21 15:24 KST. 공식 문서 중심 웹 조사이며 국내 예약사와 별도 계약 또는 API 실호출은 수행하지 않았다.

## 한 줄 판단

무료 시제품은 OSM 골프장 위치와 검증된 별도 자료로 만들 수 있으나, 전 세계 골프장 품질 TOP20·실시간 그린피·사진·예약 직연동은 위치 검색만으로 충족되지 않는다. 공개 상용 수준에서는 지도·검색 인프라와 정보 재배포 권한, 예약 제휴를 별도로 확보해야 한다.

## 확인된 핵심 사실

1. 기존 Google Earth API는 종료됐다. Earth 화면을 임의 iframe으로 넣어 현재 화면 좌표를 제어하는 방식 대신 Maps JavaScript API 위성 또는 3D Maps를 검토한다. Maps JS는 결제 계정과 API 키를 요구하며, 3D 지역 커버리지를 별도로 확인해야 한다. [Earth API](https://developers.google.com/earth), [Maps 유형](https://developers.google.com/maps/documentation/javascript/maptypes), [3D Maps](https://developers.google.com/maps/documentation/javascript/3d/overview), [사용량·결제](https://developers.google.com/maps/documentation/javascript/usage-and-billing).
2. OSM은 전 세계 공동 편집 지도 데이터이며 `leisure=golf_course`가 골프장 전체 영역/노드에 쓰인다. 이름·주소·운영자·전화·웹사이트·운영시간·유료 여부 등이 있을 수 있다. `fee=yes`는 그린피 액수를 뜻하지 않는다. 누락 태그는 미확인으로 취급한다. [골프장 태그 정의](https://wiki.openstreetmap.org/wiki/Tag:leisure=golf_course).
3. OSM 데이터는 ODbL로 배포·변형할 수 있으나 기여자 표기와 라이선스 의무가 있다. 데이터 이용권과 공개 타일 서버 이용권은 다르다. 기본 타일은 제한된 공동체 자원으로 SLA가 없고 대량 다운로드·오프라인 타일 저장은 허용하지 않는다. [저작권·라이선스](https://www.openstreetmap.org/copyright), [타일 정책](https://operations.osmfoundation.org/policies/tiles/).
4. Google Places 데이터는 임의 저장·캐시·재호스팅이 제한된다. 지도에 Places 결과를 표시할 때 Google 지도를 사용해야 하며, 사진·리뷰의 저자·출처 링크 등 표시 의무가 있다. 따라서 리뷰·사진을 내려받아 GitHub 정적 JSON이나 발송 HTML에 영구 포함하는 기능은 기본 허용으로 간주하면 안 된다. [Places 정책](https://developers.google.com/maps/documentation/places/web-service/policies).
5. 스마트스코어 ERP 공식 소개에는 예약 API 연동이 명시돼 있지만 일반 개발자용 공개 키·스펙·무료 개방 여부는 확인되지 않았다. 카카오골프예약은 공식 제휴 창구를 제공한다. API 가능성과 계약 없이 즉시 사용 가능함은 구분해야 한다. [스마트스코어 ERP](https://smartscore-erp.smartscore.global/ko/branding-site), [카카오 VX 제휴](https://biz.kakao.golf/alliance).

## 구현 권고: 무료 MVP와 확장판을 구분

| 항목 | 무료 MVP 권고 | 확장판·추가 합의 |
|---|---|---|
| 지도 | Leaflet + OSM 기본 지도, 기여자 링크 유지 | Google Maps 위성/3D 또는 계약된 타일 공급자 |
| 탐색 | 현재 화면 bounds를 버튼 시점에 복사, OSM 위치 탐색 | 자체 세계 골프장 인덱스·검색 API |
| 순서 | 화면 중심 직선거리 또는 자료 충실도 등 명시된 정렬 | 검증된 리뷰/가격 기준 사용자 가중치 |
| TOP20 | 최대20개 탐색 결과. 품질 순위가 아니라고 표시 | 표본·일자·가중치·결측 처리 공개 후 추천 순위 |
| 요금 | 검증 자료 없으면 미확인, 공식 요금표 링크 | 공식/제휴 요금 API, 날짜·시간·인원 조건 조회 |
| 사진 | 재사용 허가·라이선스가 확인된 실제 사진만 | 업체 제공 미디어 또는 실시간 Places 표시 |
| 예약 | 검증한 공식 예약 URL 외부 새 탭 이동 | 계약 API의 조회·예약·취소·결제별 권한 |
| 저장 | 자체 작성 자료·OSM 속성/출처·검색 조건 HTML | 공급자별 exportAllowed 정책을 지키는 보고서 |

Google 지도 사진은 훌륭한 시각자료이나 모든 골프장을 입체로 볼 수 있다는 약속은 피한다. 한국의 관심 골프장으로 실제 커버리지·속도·모바일 메모리를 시험한다. 현재 시제품에서 Earth 구현 완료라고 명명하지 않는다.

## Overpass 사용 경계와 쿼리

공식 Overpass 운영 문서는 공용 인스턴스에 하루 약 10,000 요청/1GB 이하라는 가이드와 부하에 따른 제한을 설명하며, 일반 대중 앱이 공용 인스턴스를 백엔드로 의존하는 경우 자체 인스턴스를 권고한다. 이 수치는 앱 운영을 보장하는 무료 할당량이 아니다. [운영 원칙](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html).

일회성 개발 검증/소규모 시제품에서는 명시적 버튼 한 번에 한 쿼리, 30초 타임아웃, 연속 실행 제한, 이전 요청 취소, 동일 영역 캐시, 실패 표시를 둔다. 이동 중 매 프레임 조회하지 않는다. 지도 이동 중 Navigator는 좌표·줌·기존 관측 표본만 갱신하고, 최신 화면의 개수로 오인시키지 않는다. 대중 공개 기본 모드는 미리 만든 출처·시각 포함 OSM JSON을 필터링하고, 임의 해외 지역은 연결된 서비스가 없으면 조회 미지원으로 명시한다. 실시간 전 세계 탐색을 핵심 기능으로 공개하려면 자체/계약 검색 공급자로 전환하는 것이 권고안이다.

```overpass
[out:json][timeout:25];
nwr["leisure"="golf_course"](SOUTH,WEST,NORTH,EAST);
out meta center;
```

위 좌표는 검증한 유한 숫자만 삽입한다. 순서는 남·서·북·동이다. `nwr`는 노드·웨이·관계를 포함한다. `out meta center`는 태그·수정시각과 비노드 요소의 중심을 받는 경량 탐색용이다. 중심은 입구·클럽하우스·기하학적 중심을 보장하지 않는다. [bounds 공식 문서](https://dev.overpass-api.de/overpass-doc/en/full_data/bbox.html).

경계와 교차하는 코스는 중심점이 화면 밖일 수 있다. MVP는 응답을 받아 중심점 bounds 재필터링 후 “대표점이 화면 안에 있는 OSM 등록 골프장”으로 정의한다. 이를 화면과 겹치는 모든 골프장 수로 부르면 안 된다. 완전한 교차 판정은 geom+공간 연산/서버 인덱스가 필요하다. 중복된 노드·영역도 있어 응답 요소 수와 실제 운영 골프장 수를 구분한다. OSM ID의 type/id로 식별하고, 가까운 동일 이름 중복은 자동 삭제보다 검토 대상으로 기록한다.

권고 보호값은 제품 정책이지 공급자의 보장치가 아니다: 1회 요청, 30초 취소, 10초 재실행 간격, 가로 300km 초과 시 확대 안내, 500개 초과 시 과대범위 안내. 날짜변경선은 bounds를 나누거나 명시적으로 지원하지 않는다고 안내하고, 음수/Infinity/극지·180도 초과 세계 래핑을 검증한다. 429/504/응답 `remark`는 결과 없음과 구분하며 자동 무한 재시도나 공용 서버 회전으로 제한을 우회하지 않는다.

## 개발용 데이터 계약 제안

```json
{
  "schemaVersion": "1.0",
  "query": {"bounds": [0, 0, 0, 0], "capturedAt": "ISO8601", "method": "representative-point"},
  "coverage": {"provider": "OpenStreetMap", "complete": false, "status": "partial"},
  "courses": [{
    "id": "osm:way:ID", "name": "원문 이름", "lat": 0, "lon": 0,
    "sourceUrl": "https://www.openstreetmap.org/way/ID",
    "sourceUpdatedAt": "ISO8601 또는 null", "fetchedAt": "ISO8601",
    "website": null, "phone": null, "holes": null, "access": null,
    "greenFee": null, "rating": null, "reviewCount": null,
    "photos": [], "booking": {"url": null, "verified": false},
    "evidence": [], "missing": ["greenFee", "rating", "photos"]
  }]
}
```

추가 사실은 필드별 `value, unit, sourceUrl, retrievedAt, validFrom, validTo, status, license, exportAllowed`를 둔다. 상태는 `verified / source-reported / missing / stale / conflicting`; OSM 태그만으로 공식 검증됨을 부여하지 않는다. 가격은 `currency, perPersonOrTeam, holes, date, weekdayClass, teeTime, membership, cartIncluded, caddieIncluded, taxesIncluded, mandatoryExtras`가 필요하다. 1인 예상 총액은 그린피 + 필수 1인 비용 + 팀 카트/캐디 비용÷정원이며, 조건이나 항목이 빠지면 확정 합계를 계산하지 않는다. 한국 원화 가격을 해외 골프장에 적용하지 않는다.

`rating`은 공급자·점수척도·표본 수·최신 리뷰 일자와 묶는다. 4.8/5와 9.2/10을 단순 비교하거나 리뷰 수 없는 평균으로 순위를 만들지 않는다. OSM 위치 검색에는 고객 평가가 없으므로 장단점은 “공식 웹사이트 태그 있음/예약 URL 미검증/가격 정보 없음” 같은 자료 관찰만 자동 생성한다. 경관·관리·친절도·가성비·난이도에 대한 사실 판단은 근거 확보 후 추가한다.

## Google Places 확장 시 유의

Text Search(New)는 field mask가 필수이며 요청 필드가 요금에 영향을 준다. 최대 검색 결과 제한과 동일 쿼리 결과 변동이 있으므로 공급자 검색 개수를 지역 전체 골프장 수로 표시할 수 없다. `locationBias`는 경계 제한이 아니다. 화면 고정 검색은 사각 `locationRestriction` 지원 조건과 반환 좌표 재검사를 적용한다. [Text Search](https://developers.google.com/maps/documentation/places/web-service/text-search).

사진은 Places 응답의 사진 리소스와 저자 표시를 사용하며, 임의 웹 검색 이미지나 공식 사이트 이미지의 사용권을 추정하지 않는다. [사진 API](https://developers.google.com/maps/documentation/places/web-service/place-photos). 결제 사용량 상한·도메인 제한 키·API 제한을 설계하고, 서버용 비밀 키를 HTML·GitHub에 넣지 않는다. 정확한 비용은 과금 SKU·호출량·필드 선택·현재 무료 범위를 확인해 별도 견적한다.

## 예약 연동 조사와 기능명

| 공급자 | 공식 확인 | 이 조사에서 미확인 |
|---|---|---|
| 카카오골프예약 | 부킹·서비스 등 제휴 제안 양식 존재 | 공개 예약 API·공식 딥링크 스키마·재배포 계약 |
| 스마트스코어 | ERP가 대행사/포털과 API 실시간 예약 연동을 소개 | 외부 공개 스펙·가격·심사·개발 키 |
| XGOLF | 공식 회사소개서에 골프장 예약 솔루션·제휴 사업 소개 | 무료 공개 API·공식 URL 파라미터 보장 |
| 티스캐너 | 공식 사이트 확인 | 공개 개발 문서·예약 API·가격 피드 |

참고: [XGOLF 공식 소개서](https://www.xgolf.com/showgolf_2024.pdf), [티스캐너](https://www.teescanner.com/). XGOLF 메인 페이지는 조사 도구에서 403으로 열리지 않았다. 공개 API를 찾지 못했다는 사실은 비공개 제휴 API가 없다는 뜻이 아니다.

직접 확인한 골프장 예약 페이지는 “공식 예약 페이지”로, OSM website만 있으면 “홈페이지(OSM 등록)”로, 플랫폼 일반 사이트는 “예약 서비스 열기”로 표시한다. URL 이름을 추측해 `/reservation`을 붙이거나 일반 검색 링크를 직접예약이라고 표시하지 않는다. 실제 예약·결제·취소 자동 수행은 별도 범위이며 이번 MVP에 포함하지 않는다.

## 추가 합의가 필요한 제안

① 무료 공개 시제품과 유료 위성/3D 중 우선순위 ② API 예산·접속량 ③ TOP20의 목적(가성비/경관/초보/접대)과 가중치 ④ 공식 요금표 수집 또는 제휴 추진 대상 ⑤ 재배포 허가 사진 확보 ⑥ 보고서 공개 여부와 보존기간. 메일은 MVP에서 `mailto:`로 작성창을 여는 것으로 명명한다. HTML 자동 첨부·실제 발송은 브라우저 단독 기능이 아니며 서버/메일 서비스가 필요하다. 공개 링크 복사는 현재 검색 조건의 재현과 분석 시점 스냅샷 공유를 구분한다.

한계: 유료 API 실제 호출·국내 예약사 계약 조건·한국 골프장별 가격과 사진 권리는 추가 확인 필요.
