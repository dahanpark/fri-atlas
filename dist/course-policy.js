import {safeURL} from './core.js?v=20261023-5';

const types=new Set(['회원제','대중제','비회원제']);
export function isEligibleCourse(c){const r=c?.eligibility;return r?.verified===true&&Number.isFinite(r.holes)&&r.holes>=18&&types.has(r.courseType)&&Boolean(safeURL(r.sourceUrl));}
export function applyCoursePolicy(courses,registry={},ratings={},cache={}){
  const rows=new Map((registry.courses||[]).map(r=>[r.id,r]));
  const scores=new Map((ratings.courses||[]).map(r=>[r.id,r]));
  const roads=new Map((cache.courses||[]).map(r=>[r.id,r]));
  return courses.flatMap(c=>{
    const entry=rows.get(c.id);if(!entry)return [];
    const result={...c,eligibility:structuredClone(entry)};
    if(!isEligibleCourse(result))return [];
    result.address=c.official?.address?.value||c.address||entry.address||null;
    result.website=c.website||entry.officialWebsite||null;
    result.facilityType={value:'코스',verified:true,sourceUrl:entry.sourceUrl};
    result.tags={...c.tags,'golf:holes':entry.holes};
    const rating=scores.get(c.id);
    if(rating?.verified===true&&safeURL(rating.sourceUrl)&&rating.group===ratings.rankingGroup)result.evaluation=structuredClone(rating);
    const cached=roads.get(c.id);
    if(cached&&Math.abs(cached.lat-c.lat)<0.000001&&Math.abs(cached.lon-c.lon)<0.000001){
      result.routes=structuredClone(cached.routes||{});
      result.routeState=['seoul','busan'].every(k=>result.routes[k]?.verified===true)?'success':'unavailable';
      result.routeCacheCheckedAt=cached.checkedAt;
    }
    return [result];
  });
}
