"""Read-only MCST PDF table audit. No automatic joins or coordinates invented."""
import json, re, hashlib
from pathlib import Path
import pdfplumber

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'.tmp/data/mcst-sports-register-2024.pdf'
# Printed page ranges of registration tables from the official contents; PDF offset +8.
RANGES=[('서울',72,72),('부산',270,270),('대구',344,344),('인천',406,406),('광주',472,472),('대전',508,508),('울산',548,548),('세종',584,584),('경기',604,611),('강원',938,942),('충북',996,998),('충남',1046,1046),('전북',1106,1107),('전남',1158,1159),('경북',1210,1212),('경남',1284,1286),('제주',1368,1369)]
rows=[]
with pdfplumber.open(PDF) as pdf:
    for region,start,end in RANGES:
        n=0
        # The next section can start on the same page as the final golf rows.
        for printed in range(start,end+2):
            page=pdf.pages[printed+7]
            for table in page.extract_tables():
                header=''.join(str(c or '') for row in table[:2] for c in row)
                if '홀수' not in re.sub(r'\s+','',header) or '업소명' not in header: continue
                for row in table[2:]:
                    if len(row)<5: continue
                    name=re.sub(r'\s+','',row[0] or '')
                    if not name or name in ['합계','업소명']: continue
                    rows.append({'region':region,'name':name,'nameRaw':row[0],'address':re.sub(r'\s+',' ',row[1] or '').strip(),'areaM2':row[2],'holes':row[3],'registrationType':re.sub(r'\s+','',row[4] or ''),'pdfPage':printed+8,'printedPage':printed,'coordinateStatus':'not-provided-in-table','operatingStatus':'not-verified-current'})
                    n+=1
        print(region,n,flush=True)

osm=json.loads((ROOT/'dist/courses-kr.json').read_text(encoding='utf-8'))
index={}
for c in osm['courses']:
    for name in [c['tags'].get('name'),c['tags'].get('name:ko'),c['tags'].get('name:en')]:
        if name: index.setdefault(re.sub(r'\s+','',name).casefold(),set()).add(c['id'])
for row in rows:
    ids=sorted(index.get(row['name'].casefold(),[]))
    row['exactNormalizedNameCandidates']=ids
    row['matchStatus']='name-only-candidate-not-joined' if ids else 'no-exact-normalized-name'
summary={'officialPrintedNationalRegistrationCount':539,'extractedRegistrationRows':len(rows),'extractionReconciledWithPrintedTotal':False,'coordinateProvidedRows':0,'currentOperatingStatusVerifiedRows':0,'exactNameCandidateRows':sum(bool(r['exactNormalizedNameCandidates']) for r in rows),'noExactNameCandidateRows':sum(not r['exactNormalizedNameCandidates'] for r in rows),'confirmedNationwideOsmMatches':None,'sourceDate':'2024-12-31','collectedDate':'2026-10-22','note':'공식 요약539와 상세표 추출행 합계 불일치 미해결인 부분자료. 원문 표 정합성/추출 누락·오독 추가 확인 필요. 공식 등록행은 회원/대중 등 동일시설 복수등록 가능. exact name 후보는 주소·시설동일성 검증이 없어 실제매칭이나 OSM미등재 판정 아님.'}
out={'sourceUrl':'https://www.mcst.go.kr/site/s_policy/dept/deptView.jsp?pSeq=2115&pDataCD=0417000000&pType=07','sourceTitle':'2025 전국 등록 신고 체육시설업 현황 (2024년 말 기준)','pdfSha256':hashlib.sha256(PDF.read_bytes()).hexdigest(),'summary':summary,'rows':rows}
(ROOT/'output/official-register-audit-v2.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False),flush=True)
