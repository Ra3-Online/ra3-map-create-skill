'use strict';
const fs=require('node:fs'),path=require('node:path');
const {connect}=require('./mcp-client.cjs');
const {waterAt}=require('./design.cjs');
const {args}=require('./make-plan.cjs');
function erodeMask(mask,w,h,r) {
  const stride=w+1,integral=new Int32Array(stride*(h+1)),out=new Uint8Array(mask.length);
  for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){row+=mask[y*w+x]?0:1;integral[(y+1)*stride+x+1]=integral[y*stride+x+1]+row;}}
  for(let y=r;y<h-r;y++)for(let x=r;x<w-r;x++) {
    const x0=x-r,y0=y-r,x1=x+r+1,y1=y+r+1;
    if(integral[y1*stride+x1]-integral[y0*stride+x1]-integral[y1*stride+x0]+integral[y0*stride+x0]===0)out[y*w+x]=1;
  }
  return out;
}
function floodDistance(mask,w,h,start) {
  const dist=new Int32Array(mask.length).fill(-1),queue=new Int32Array(mask.length);let head=0,tail=0;
  if(!mask[start])return dist;queue[tail++]=start;dist[start]=0;
  while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w),neighbors=[];
    if(x>0)neighbors.push(i-1);if(x<w-1)neighbors.push(i+1);if(y>0)neighbors.push(i-w);if(y<h-1)neighbors.push(i+w);
    for(const k of neighbors)if(mask[k]&&dist[k]<0){dist[k]=dist[i]+1;queue[tail++]=k;}}
  return dist;
}
async function validate(m,handle,checks={},options={}) {
  const call=(name,p={})=>m.call(name,{handle,...p});
  const info=await call('ra3map_describe_map'),objs=await call('ra3map_list_objects',{limit:100000,includeProps:true});
  const water=await call('ra3map_get_water'),textures=await call('ra3map_check_terrain_textures'),starts=await call('ra3map_start_positions');
  const issues=[],notes=[],metrics={objectCount:objs.total,playable:[info.playableWidth,info.playableHeight],
    buildability:{status:'not_read',counts:null,polarity:'unverified'}};
  const result=()=>({passed:!issues.length,validationScope:checks.players==null?'preserved-objects-and-textures':'terrain-occupancy-and-connectivity',
    issues,notes,metrics,buildabilityPolarity:'unverified',
    gameplayGate:{status:'unverified',landMcvDeploy:'not_tested',waterMcvDeploy:'not_tested',pathsAndScripts:'not_tested'},gameTested:false});
  if(info.parseIncomplete||info.parseResynced||info.lossyStringsTotal)issues.push('地图存在解析不完整或有损字符串。');
  const missing=Array.isArray(textures.missing)?textures.missing.length:Number(textures.missing||0);
  if(missing)issues.push('存在当前环境无法读取的地表贴图。');
  const points=objs.objects.filter(o=>/^Player_\d+_Start$/i.test(o.props?.waypointName||''));
  if(checks.players!=null&&points.length!==checks.players)issues.push('出生点数量不符。');
  if(starts.duplicateStartNames?.length)issues.push('出生点名称重复。');
  if(checks.players!=null&&starts.mapXml?.NumPlayersBefore!==checks.players)issues.push('map.xml 人数与设计不符。');
  if(options.preserveObjects) {
    const actual=new Map(objs.objects.map(o=>[o.index,o]));
    for(const before of options.preserveObjects){const after=actual.get(before.index);if(!after||JSON.stringify(before)!==JSON.stringify(after)){issues.push('局部美化改变了原有对象。');break;}}
    metrics.preservedOriginalObjects=options.preserveObjects.length;
  }
  if(checks.players==null){notes.push('局部美化验收：校验原有对象和贴图，未重新认证整图寻路、可部署性或平衡；gameplayGate 未实测。');return result();}
  const w=info.width,h=info.height,b=info.border;
  if(w*h>1000000)throw new Error('全图验证超过 100 万格；请分区设计验证。');
  const hm=await call('ra3map_get_heightmap',{step:1,maxCells:w*h}),flags=await call('ra3map_get_cell_flags',{
    plane:'passability',x0:0,y0:0,x1:w-1,y1:h-1,maxCells:w*h});
  const build=await call('ra3map_get_cell_flags',{plane:'buildability',x0:0,y0:0,x1:w-1,y1:h-1,maxCells:w*h});
  if(hm.step!==1||hm.rows.length!==h||hm.rows.some(r=>r.length!==w))throw new Error('高程验证被降采样或数据不完整。');
  for(const [label,plane] of [['通行',flags],['buildability',build]])
    if(plane.rows.length!==h||plane.rows.some(r=>r.length!==w))throw new Error(`${label}平面数据不完整。`);
  const buildCounts={0:0,1:0};
  for(const row of build.rows)for(const bit of row){if(bit!==0&&bit!==1)throw new Error('buildability 平面包含非 0/1 位值。');buildCounts[bit]++;}
  metrics.buildability={status:'unverified',counts:buildCounts,cells:w*h,polarity:'unverified'};
  const mask=new Uint8Array(w*h),index=o=>Math.floor(o.y/10+b)*w+Math.floor(o.x/10+b);
  for(let y=b;y<h-b;y++)for(let x=b;x<w-b;x++) {
    const z=hm.rows[y][x],p=flags.rows[y][x];
    mask[y*w+x]=z>=waterAt((x-b)*10,(y-b)*10,water)+.5&&(p===0||p===3||p===4)?1:0;
  }
  const typeNames=[...new Set(objs.objects.map(o=>o.typeName).filter(n=>!n.includes('Waypoint')))];
  const geometry=typeNames.length?(await m.call('ra3map_object_place_info',{typeNames})).place||{}:{};
  const footprint=o=>Math.ceil((geometry[o.typeName]?.fp||0)/10);
  const resources=objs.objects.filter(o=>o.typeName.toLowerCase()==='orenode'),oils=objs.objects.filter(o=>o.typeName.toLowerCase()==='oilderrick');
  if(checks.oreCount!=null&&resources.length!==checks.oreCount)issues.push('矿点数量不符。');
  if(checks.oilCount!=null&&oils.length!==checks.oilCount)issues.push('油井数量不符。');
  const structures=objs.objects.filter(o=>geometry[o.typeName]?.sorting==='STRUCTURE'&&footprint(o)>1);
  for(const o of structures) {
    const cx=Math.floor(o.x/10+b),cy=Math.floor(o.y/10+b),r=footprint(o);
    for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if(x>=0&&y>=0&&x<w&&y<h&&Math.hypot(x-cx,y-cy)<=r)mask[y*w+x]=0;
    if(cx<b||cy<b||cx>=w-b||cy>=h-b||hm.rows[cy]?.[cx]<waterAt(o.x,o.y,water)+1)issues.push(`资源或陆地建筑位置无效：#${o.index}`);
  }
  metrics.baseAreas=[];
  for(const p of points) {
    const cx=Math.floor(p.x/10+b),cy=Math.floor(p.y/10+b),r=checks.baseClearRadius??18;let lo=Infinity,hi=-Infinity,valid=true;
    const areaBits={0:0,1:0};
    for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if(Math.hypot(x-cx,y-cy)<=r){
      const z=hm.rows[y]?.[x];if(z==null||!mask[y*w+x])valid=false;lo=Math.min(lo,z);hi=Math.max(hi,z);
      const bit=build.rows[y]?.[x];if(bit===0||bit===1)areaBits[bit]++;}
    metrics.baseAreas.push({player:p.props.waypointName,buildabilityCounts:areaBits,
      staticTerrainClear:valid&&hi-lo<=5,landMcvDeploy:'not_tested'});
    if(!valid||hi-lo>5)issues.push(`基地展开候选区不平整、通行受限或被占用：${p.props.waypointName}`);
  }
  const wide=erodeMask(mask,w,h,checks.corridorRadius??3);
  const resourceDistance=(dist,o)=>{
    const x=Math.floor(o.x/10+b),y=Math.floor(o.y/10+b),r=footprint(o)+(checks.corridorRadius??3)+2;let best=Infinity;
    for(let cy=y-r;cy<=y+r;cy++)for(let cx=x-r;cx<=x+r;cx++)if(cx>=0&&cy>=0&&cx<w&&cy<h&&Math.hypot(cx-x,cy-y)<=r){const d=dist[cy*w+cx];if(d>=0)best=Math.min(best,d*10);}
    return Number.isFinite(best)?best:null;
  };
  const paths=points.map(p=>{const dist=floodDistance(wide,w,h,index(p));return{
    player:p.props.waypointName,otherStarts:points.filter(q=>q!==p).map(q=>({name:q.props.waypointName,distance:dist[index(q)]<0?null:dist[index(q)]*10})),
    resources:resources.map(o=>({index:o.index,distance:resourceDistance(dist,o)})),oil:oils.map(o=>({index:o.index,distance:resourceDistance(dist,o)})),
    nearestOreWorld:resources.map(o=>Math.hypot(p.x-o.x,p.y-o.y)).sort((a,b)=>a-b).slice(0,2)};});
  if(paths.some(p=>p.otherStarts.some(x=>x.distance==null)||p.resources.some(x=>x.distance==null)||p.oil.some(x=>x.distance==null)))issues.push('有出生点或资源无法经足够宽的陆路抵达。');
  if(checks.balancedEconomy&&paths.length===2)for(let i=0;i<2;i++) {
    const a=paths[0].nearestOreWorld[i],c=paths[1].nearestOreWorld[i];
    if(a==null||c==null||Math.abs(a-c)>Math.max(10,Math.max(a,c)*.1))issues.push('两方起始矿距离差异过大。');
  }
  metrics.paths=paths;metrics.corridorRadiusCells=checks.corridorRadius??3;metrics.textureCheck=textures;
  notes.push('连通性是保守的地形标志／水位／建筑占地网格检查，不等于游戏引擎寻路实测。');
  notes.push('buildability 仅报告原始 0/1 分布，RA3 极性未证实；passed 仅表示静态检查，陆地/水面 MCV 与 gameplayGate 仍未实测。');
  return result();
}
if(require.main===module)(async()=>{const a=args(process.argv.slice(2));if(!a.editor||!a.file)throw new Error('需要 --editor 和 --file');
  const m=await connect(a.editor);try{const r=await m.call('ra3map_open_map',{file:path.resolve(a.file)}),checks=a.checks?JSON.parse(fs.readFileSync(a.checks,'utf8')):{players:2,baseClearRadius:18,corridorRadius:3,balancedEconomy:true};
    const result=await validate(m,r.handle,checks);if(a.out)fs.writeFileSync(path.resolve(a.out),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
  }finally{await m.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={validate,erodeMask,floodDistance};
