/** National OSM snapshot; never called by map movement. Node >=18. No retries. */
import { readFile, writeFile, rename, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const QUERY = '[out:json][timeout:120];area["ISO3166-1"="KR"]["admin_level"="2"]->.kr;nwr["leisure"="golf_course"](area.kr);out center tags;';
export const ENDPOINT = 'https://overpass-api.de/api/interpreter';
export function normalizeSnapshot(raw, collectedAt, rawSha256) {
  if (!Array.isArray(raw.elements) || raw.remark) throw new Error('Missing elements or partial/error Overpass result; preserve previous snapshot');
  const seen = new Set(), courses = [], rejected = [];
  let duplicate_ids = 0;
  for (const e of raw.elements) {
    const key = `${e.type}/${e.id}`, p = e.type === 'node' ? e : e.center;
    if (seen.has(key)) { duplicate_ids++; continue; }
    seen.add(key);
    if (!['node','way','relation'].includes(e.type) || !Number.isInteger(e.id) || !p || !Number.isFinite(p.lat) || !Number.isFinite(p.lon) || p.lat < 32 || p.lat > 39 || p.lon < 124 || p.lon > 132) { rejected.push({id:key,reason:'invalid coordinate/type or outside KR sanity envelope'}); continue; }
    const t = e.tags || {};
    if (t.leisure !== 'golf_course') { rejected.push({id:key,reason:'not leisure=golf_course'}); continue; }
    const name = t['name:ko'] || t.name || t['name:en'] || `이름 미등록 (${key})`;
    const address = t['addr:full'] || [t['addr:province'],t['addr:city'],t['addr:district'],t['addr:subdistrict'],t['addr:street'],t['addr:housenumber']].filter(Boolean).join(' ') || null;
    const status = t.disused === 'yes' || t['disused:leisure'] === 'golf_course' ? 'disused' : t.access === 'no' || t.abandoned === 'yes' ? 'restricted-or-abandoned' : 'unverified';
    courses.push({id:`osm:${key}`,osmType:e.type,osmId:e.id,name,lat:p.lat,lon:p.lon,coordinateMethod:e.type === 'node' ? 'node' : 'osm-bounding-box-center',address,region:t['addr:province'] || t['addr:city'] || null,website:t.website || t['contact:website'] || null,image:t.image || null,wikimediaCommons:t.wikimedia_commons || null,operatingStatus:status,sourceUrl:`https://www.openstreetmap.org/${key}`,tags:t});
  }
  courses.sort((a,b)=>a.id.localeCompare(b.id,'en',{numeric:true}));
  if (courses.length < 100) throw new Error('Unexpectedly small national response; preserve previous snapshot');
  const named = courses.filter(c=>c.tags.name || c.tags['name:ko'] || c.tags['name:en']).length;
  const byType = {}, addressRegions = {};
  for (const c of courses) { byType[c.osmType]=(byType[c.osmType]||0)+1; const r=c.region || '미기재'; addressRegions[r]=(addressRegions[r]||0)+1; }
  const nameGroups = new Map();
  for (const c of courses) { if (c.tags.name || c.tags['name:ko']) { const ids=nameGroups.get(c.name)||[];ids.push(c.id);nameGroups.set(c.name,ids); } }
  const namePatternGroups = [
    ['practice-or-screen','연습|스크린|골프존|driving|screen'],
    ['park-golf','파크골프|park[ -]?golf'],
    ['indoor','실내|indoor']
  ].map(([label,pattern])=>({label,pattern,ids:courses.filter(c=>new RegExp(pattern,'i').test(c.name)).map(c=>c.id)}));
  return {schemaVersion:1,generatedAt:collectedAt,source:{provider:'OpenStreetMap / Overpass',endpoint:ENDPOINT,query:QUERY,collectedAt,osmBaseTimestamp:raw.osm3s?.timestamp_osm_base || null,license:'ODbL-1.0',licenseUrl:'https://opendatacommons.org/licenses/odbl/1-0/',attribution:'© OpenStreetMap contributors',attributionUrl:'https://www.openstreetmap.org/copyright',rawSha256},coverage:{label:'대한민국 영역 OSM 골프장 지도 객체 스냅샷',complete:false,raw_count:raw.elements.length,accepted_count:courses.length,duplicate_ids,rejected_count:rejected.length,named_count:named,unnamed_count:courses.length-named,byType,addressRegions,missing_address:courses.filter(c=>!c.address).length,missing_website:courses.filter(c=>!c.website).length,operating_status_unverified:courses.filter(c=>c.operatingStatus==='unverified').length,official_registry_crosscheck:'not-completed',limitations:['OSM 지도 객체 수는 실제 영업 골프장 수가 아님','동일 시설의 별도 node/way/relation 및 코스는 자동 병합하지 않음','way/relation 대표점은 경계 상자의 중심으로 출입구·클럽하우스가 아님','주소·영업상태·사진 사용권은 원문 태그만으로 검증되지 않음','전국 실제 골프장 완전성은 공식 명부 대조 전까지 미확인']},audit:{rejected,sameExactNameGroups:[...nameGroups].filter(([,ids])=>ids.length>1).map(([name,ids])=>({name,ids})),namePatternGroups,namePatternNote:'명칭 패턴 감사이며 시설 분류 확정이나 제외 목록이 아님. 그룹 간 중복 가능.',nameBasedMerging:false},courses};
}

async function main() {
  const args=process.argv.slice(2), i=args.indexOf('--input');
  let body, collectedAt;
  if (i>=0) { const input=resolve(args[i+1]); body=await readFile(input,'utf8'); collectedAt=(await stat(input)).mtime.toISOString(); }
  else {
    const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'FRI-ATLAS/0.2 one-time national snapshot'},body:new URLSearchParams({data:QUERY}),signal:AbortSignal.timeout(150000)});
    if (!r.ok) throw new Error(`Overpass HTTP ${r.status}; no automatic retry; previous snapshot preserved`);
    body=await r.text();
    collectedAt=new Date().toISOString();
  }
  const raw=JSON.parse(body), snapshot=normalizeSnapshot(raw,collectedAt,createHash('sha256').update(body).digest('hex'));
  snapshot.generatedAt=new Date().toISOString();
  await mkdir(resolve('dist'),{recursive:true});
  const target=resolve('dist/courses-kr.json'), temp=`${target}.tmp`;
  await writeFile(temp,JSON.stringify(snapshot,null,2)+'\n','utf8'); await rename(temp,target);
  console.log(JSON.stringify({target,collectedAt,coverage:snapshot.coverage}));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(e=>{console.error(e.message);process.exitCode=1;});
