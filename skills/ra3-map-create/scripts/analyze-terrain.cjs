'use strict';
// Reads only validated map-service data. Diagnostics describe terrain; they do not certify gameplay.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {connect}=require('./mcp-client.cjs'),{args}=require('./make-plan.cjs');
const {waterAt}=require('./design.cjs'),{erodeMask,floodDistance}=require('./validate-map.cjs');
const round=v=>Math.round(v*100)/100;
function distribution(values) {
  if(!values.length)return null;
  const a=values.slice().sort((x,y)=>x-y),q=p=>round(a[Math.min(a.length-1,Math.floor((a.length-1)*p))]);
  return{cells:a.length,min:q(0),p05:q(.05),p10:q(.1),p25:q(.25),p50:q(.5),p75:q(.75),p90:q(.9),p95:q(.95),max:q(1)};
}
function components(mask,w,h,heights,minimum=80) {
  const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length),out=[];
  for(let start=0;start<mask.length;start++) {
    if(!mask[start]||seen[start])continue;
    let head=0,tail=1;queue[0]=start;seen[start]=1;
    let minX=w,minY=h,maxX=0,maxY=0,sum=0;
    while(head<tail) {
      const i=queue[head++],x=i%w,y=Math.floor(i/w);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);sum+=heights[y][x];
      const ns=[];if(x)ns.push(i-1);if(x<w-1)ns.push(i+1);if(y)ns.push(i-w);if(y<h-1)ns.push(i+w);
      for(const k of ns)if(mask[k]&&!seen[k]&&(mask[k]===mask[i])){seen[k]=1;queue[tail++]=k;}
    }
    if(tail>=minimum)out.push({cells:tail,height:round(sum/tail),bounds:{x0:minX,y0:minY,x1:maxX,y1:maxY}});
  }
  return out.sort((a,b)=>b.cells-a.cells);
}
function analyze(info,hm,flags,water,objects,{gridStep=3}={}) {
  const w=info.width,h=info.height,b=info.border;
  if(hm.step!==1||hm.rows.length!==h||hm.rows.some(r=>r.length!==w)||flags.rows.length!==h||flags.rows.some(r=>r.length!==w))throw new Error('地形诊断需要完整逐格数据。');
  const land=new Uint8Array(w*h),pass=new Uint8Array(w*h),blocked=new Uint8Array(w*h),levels=new Uint16Array(w*h),slope=new Float32Array(w*h);
  const zs=[],seaLevels=new Set();let flooded=0,steep=0,blockedCount=0;
  for(let y=b;y<h-b;y++)for(let x=b;x<w-b;x++) {
    const i=y*w+x,z=hm.rows[y][x],sea=waterAt((x-b)*10,(y-b)*10,water);if(Number.isFinite(sea))seaLevels.add(sea);
    if(z<sea+.5){flooded++;continue;}land[i]=1;zs.push(z);
    // Maximum axis grade is a conservative diagnostic, separate from stored passability flags.
    const neighbors=[hm.rows[y]?.[x-1],hm.rows[y]?.[x+1],hm.rows[y-1]?.[x],hm.rows[y+1]?.[x]];
    slope[i]=Math.max(0,...neighbors.filter(Number.isFinite).map(v=>Math.abs(z-v)));
    if(slope[i]>10)steep++;
    const p=flags.rows[y][x],storedBlocked=![0,3,4].includes(p);
    if(storedBlocked){blocked[i]=1;blockedCount++;}
    if(!storedBlocked&&slope[i]<=10)pass[i]=1;
    // Flat patches are grouped by a 5-world-unit band; a diagonal slope is not a plateau.
    if(slope[i]<=2)levels[i]=Math.max(1,Math.floor(z/5)+1);
  }
  const core=erodeMask(land,w,h,4),coreZ=[],hist=new Map();let coreSteep=0,coreBlocked=0;
  for(let i=0;i<core.length;i++)if(core[i]){const z=hm.rows[Math.floor(i/w)][i%w];coreZ.push(z);const band=Math.floor(z/5)*5;hist.set(band,(hist.get(band)||0)+1);if(slope[i]>10)coreSteep++;if(blocked[i])coreBlocked++;}
  const bands=[...hist].sort((a,c)=>c[1]-a[1]).slice(0,8).map(([height,cells])=>({from:height,to:height+5,cells,percent:round(cells/coreZ.length*100)}));
  const plateauPatches=components(levels,w,h,hm.rows).slice(0,16);
  const barriers=components(blocked,w,h,hm.rows).slice(0,12);
  const wide=erodeMask(pass,w,h,3),wideComponents=components(wide,w,h,hm.rows,1);
  const heightAt=o=>hm.rows[Math.floor(o.y/10+b)]?.[Math.floor(o.x/10+b)];
  const starts=objects.filter(o=>/^Player_\d+_Start$/i.test(o.props?.waypointName||''));
  const ores=objects.filter(o=>/^(OreNode|OreMine)/i.test(o.typeName));
  const startInfo=starts.map(p=>{
    const index=Math.floor(p.y/10+b)*w+Math.floor(p.x/10+b),dist=floodDistance(wide,w,h,index),z=heightAt(p);
    const nearest=ores.map(o=>({worldDistance:round(Math.hypot(o.x-p.x,o.y-p.y)),height:heightAt(o),heightDifference:round(heightAt(o)-z)})).sort((a,c)=>a.worldDistance-c.worldDistance).slice(0,2);
    return{name:p.props.waypointName,x:round(p.x),y:round(p.y),height:z,nearestOre:nearest,otherStarts:starts.filter(o=>o!==p).map(o=>{
      const d=dist[Math.floor(o.y/10+b)*w+Math.floor(o.x/10+b)];return{name:o.props.waypointName,terrainPathWorld:d<0?null:d*10};})};
  });
  const grid={step:gridStep,width:Math.ceil((w-2*b)/gridStep),height:Math.ceil((h-2*b)/gridStep),heights:[],land:[],blocked:[],steep:[]};
  for(let y=b;y<h-b;y+=gridStep){const zrow=[],lrow=[],brow=[],srow=[];for(let x=b;x<w-b;x+=gridStep){const i=y*w+x;zrow.push(hm.rows[y][x]);lrow.push(land[i]);brow.push(blocked[i]);srow.push(slope[i]>10?1:0);}grid.heights.push(zrow);grid.land.push(lrow);grid.blocked.push(brow);grid.steep.push(srow);}
  const crossSection=(from,to)=>{
    const samples=Math.ceil(Math.hypot(to[0]-from[0],to[1]-from[1])),out=[];
    for(let k=0;k<=samples;k++){const t=k/samples,x=Math.round(from[0]+(to[0]-from[0])*t),y=Math.round(from[1]+(to[1]-from[1])*t),z=hm.rows[y]?.[x];if(Number.isFinite(z))out.push({distance:round(t*samples*10),height:z,land:land[y*w+x],blocked:blocked[y*w+x]});}return out;
  };
  const sections={westEast:crossSection([b,Math.floor(h/2)],[w-b-1,Math.floor(h/2)]),southNorth:crossSection([Math.floor(w/2),b],[Math.floor(w/2),h-b-1])};
  if(starts.length===2)sections.startLine=crossSection(starts.map(o=>[Math.floor(o.x/10+b),Math.floor(o.y/10+b)])[0],starts.map(o=>[Math.floor(o.x/10+b),Math.floor(o.y/10+b)])[1]);
  const percent=(n,total)=>total?round(n/total*100):null;
  return{metrics:{playable:[w-2*b,h-2*b],waterLevels:[...seaLevels],floodedPercent:percent(flooded,(w-2*b)*(h-2*b)),
    land:distribution(zs),interiorLand:distribution(coreZ),interiorInsetCells:4,dominantInteriorBands:bands,
    steepLandPercent:percent(steep,zs.length),storedBlockedLandPercent:percent(blockedCount,zs.length),
    steepInteriorPercent:percent(coreSteep,coreZ.length),blockedInteriorPercent:percent(coreBlocked,coreZ.length),
    plateauPatches,barrierComponents:barriers,wideLandComponents:wideComponents.slice(0,6),starts:startInfo,
    oreHeights:ores.map(o=>({x:round(o.x),y:round(o.y),height:heightAt(o)})),
    bridgeObjects:objects.filter(o=>/bridge/i.test(o.typeName)).length},grid,sections,
    notes:['Only playable cells; exposed land is above the containing water surface by at least 0.5 world units. Interior excludes a four-cell shoreline/border margin.',
      'Height bands and >45-degree axis slopes are diagnostics, not universal design requirements or engine pathfinding. Rivers, bridges and object collisions are not modeled in this terrain-only analysis.',
      'A flat land map can have strong coastline/route structure; height variation alone does not measure quality.']};
}
async function inspect(m,file,options={}) {
  const source=path.resolve(file),hash=()=>crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),before=hash();let handle;
  try {
    handle=(await m.call('ra3map_open_map',{file:source})).handle;if(!handle)throw new Error('加载失败');
    const info=await m.call('ra3map_describe_map',{handle});if(info.width*info.height>1000000)throw new Error('逐格诊断超过 100 万格，请分区读取。');
    const [hm,flags,water,objs]=await Promise.all([
      m.call('ra3map_get_heightmap',{handle,step:1,maxCells:info.width*info.height}),
      m.call('ra3map_get_cell_flags',{handle,plane:'passability',x0:0,y0:0,x1:info.width-1,y1:info.height-1,maxCells:info.width*info.height}),
      m.call('ra3map_get_water',{handle}),m.call('ra3map_list_objects',{handle,limit:100000,includeProps:true,exact:true})]);
    const result=analyze(info,hm,flags,water,objs.objects,options);
    if(hash()!==before)throw new Error('原图校验值发生变化。');
    return{sourceName:path.basename(source,'.map'),sha256:before,sourceUnchanged:true,...result};
  }finally{if(handle)await m.call('ra3map_close_map',{handle});}
}
if(require.main===module)(async()=>{
  const a=args(process.argv.slice(2));if(!a.editor||!a.out||(!a.file&&!a.list))throw new Error('需要 --editor、--out，以及 --file <map> 或 --list <含 id/file 的 JSON 数组>');
  const out=path.resolve(a.out);if(fs.existsSync(out)&&fs.readdirSync(out).length)throw new Error('诊断输出目录已有内容。');
  const entries=a.list?JSON.parse(fs.readFileSync(path.resolve(a.list),'utf8')):[{id:'terrain',file:a.file}];
  if(!Array.isArray(entries)||entries.some(e=>!e.file||!/^[a-z0-9-]+$/i.test(e.id)))throw new Error('诊断清单格式不正确。');
  fs.mkdirSync(out,{recursive:true});const m=await connect(a.editor),reports=[];
  try{for(const entry of entries){const result=await inspect(m,entry.file);fs.writeFileSync(path.join(out,entry.id+'.json'),JSON.stringify(result)+'\n',{flag:'wx'});reports.push({id:entry.id,sourceName:result.sourceName,sha256:result.sha256,sourceUnchanged:true,metrics:result.metrics});console.log(entry.id+' '+result.sourceName+' land p10..p90 '+(result.metrics.land?result.metrics.land.p10+'..'+result.metrics.land.p90:'no exposed land'));}
    fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify({maps:reports,gameTested:false,calls:m.trace.length},null,2)+'\n',{flag:'wx'});
  }finally{await m.close();}
})().catch(e=>{console.error(e.message.includes('加载失败')?'加载失败':e.message);process.exitCode=1;});
module.exports={distribution,components,analyze,inspect};
