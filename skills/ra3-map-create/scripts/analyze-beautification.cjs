'use strict';
// Read-only spatial observations from the common validated map service, never map-file parsing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {connect}=require('./mcp-client.cjs');
const {analyze:composition,distanceToSegment}=require('./analyze-composition.cjs');
const {waterAt}=require('./design.cjs');
const round=n=>Math.round(n*100)/100;
const norm=a=>((a%360)+360)%360;
const delta=(a,b)=>((a-b+540)%360)-180;
function counts(rows,key,limit=20){const m=new Map();for(const o of rows){const k=key(o);m.set(k,(m.get(k)||0)+1)}return[...m].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]))).slice(0,limit)}
function quantiles(values){if(!values.length)return null;const a=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!a.length)return null;const q=p=>round(a[Math.floor((a.length-1)*p)]);return{n:a.length,p10:q(.1),p50:q(.5),p90:q(.9)}}
function decorRole(type){
  if(/Cliff|RockWall/i.test(type))return'cliff';
  if(/LightPole|LampPost|StreetLight|StreetLamp|(?:^|_)Light\d|(?:^|_)Lamp\d|Lantern|LightPlant/i.test(type))return'lighting';
  if(/Garbage|Trash|Dumpster|Bin\d|Waste/i.test(type))return'waste';
  if(/Bench|Chair|Table|Umbrella|Picnic/i.test(type))return'seating';
  if(/(?:Tree|Palm|Bamboo)(?:\d|_|$)/i.test(type)&&!/Fence/i.test(type))return'trees';
  if(/Shrub|Bush|Fern|Plant|Flower|Grass/i.test(type))return'greenery';
  if(/Fence|Wall|Border|Trim|Gate|Barrier/i.test(type))return'enclosure';
  if(/Auto\d|Truck|Car\d|Parking|StreetSegment/i.test(type))return'street';
  if(/WoodPile|Barrel|Crate|Fork|Hay|Logs/i.test(type))return'yard';
  if(/Statue|Fountain|Monument|Gazebo/i.test(type))return'landmark';
  return'other';
}
function analyze(objects,catalog,info,hm,terrain,water={areas:[]}){
  if(!Array.isArray(objects)||objects.some(o=>![o.x,o.y,o.angle,o.roadOption].every(Number.isFinite)))throw new Error('需要 exact:true 的物体数据');
  if(hm.step!==terrain.step||JSON.stringify(hm.rect)!==JSON.stringify(terrain.rect)||hm.rows.length!==terrain.textureRows.length
    ||hm.rows.some((r,y)=>r.length!==terrain.textureRows[y].length))throw new Error('高程与材质采样范围不一致');
  const byId=new Map(catalog.map(o=>[o.id.toLowerCase(),o])),meta=o=>byId.get(o.typeName.toLowerCase());
  const step=terrain.step,b=info.border,rect=terrain.rect;
  const at=(rows,x,y)=>rows[Math.round((y/10+b-rect.y0)/step)]?.[Math.round((x/10+b-rect.x0)/step)];
  const heightAt=(x,y)=>at(hm.rows,x,y),textureAt=(x,y)=>terrain.textures[at(terrain.textureRows,x,y)]?.name??null;
  const cliffs=objects.filter(o=>/Cliff|RockWall/i.test(o.typeName)&&!(o.roadOption&(2|4|16|32)));
  const decors=objects.filter(o=>/SHRUBBERY|MISC_|DEBRIS|PROPS/.test(meta(o)?.editorSorting||'')&&!(o.roadOption&(2|4|16|32)));
  const decorIds=new Set(decors.map(o=>o.index));
  const comp=composition(objects,catalog,info),roads=comp.roads.polylines.map(r=>({type:r.type,a:{x:r.a[0],y:r.a[1]},b:{x:r.b[0],y:r.b[1]}}));
  const buckets=new Map();for(const o of objects){const k=`${Math.floor(o.x/250)},${Math.floor(o.y/250)}`;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(o)}
  function nearby(o,r){const out=[];for(let x=Math.floor((o.x-r)/250);x<=Math.floor((o.x+r)/250);x++)for(let y=Math.floor((o.y-r)/250);y<=Math.floor((o.y+r)/250);y++)
    for(const p of buckets.get(`${x},${y}`)||[])if(p!==o&&Math.hypot(p.x-o.x,p.y-o.y)<=r)out.push(p);return out}
  function closestRoad(o){let best=null;for(const r of roads){const d=distanceToSegment(o,r.a,r.b);if(!best||d<best.distance)best={distance:round(d),type:r.type,heading:round(norm(Math.atan2(r.b.y-r.a.y,r.b.x-r.a.x)*180/Math.PI))}}return best}
  const cliffIds=new Set(cliffs.map(o=>o.index));
  const cliffSamples=cliffs.map(o=>{
    const g=meta(o)?.geom,r=Math.min(600,Math.max(160,(g?.fp||60)*3)),a=o.angle*Math.PI/180;
    const neighbors=nearby(o,r).filter(p=>cliffIds.has(p.index)).map(p=>{
      const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy);return{index:p.index,type:p.typeName,distance:round(d),
        localX:round(dx*Math.cos(a)+dy*Math.sin(a)),localY:round(-dx*Math.sin(a)+dy*Math.cos(a)),
        bearingFromHeading:round(delta(Math.atan2(dy,dx)*180/Math.PI,o.angle)),headingDelta:round(delta(p.angle,o.angle))};
    }).sort((a,b)=>a.distance-b.distance).slice(0,3);
    const left=heightAt(o.x-40,o.y),right=heightAt(o.x+40,o.y),down=heightAt(o.x,o.y-40),up=heightAt(o.x,o.y+40);
    const probes=[0,1,2,3].map(k=>{const t=a+k*Math.PI/2;const x=o.x+60*Math.cos(t),y=o.y+60*Math.sin(t);return{relativeHeading:k*90,height:heightAt(x,y)??null,texture:textureAt(x,y)}});
    const dz=probes.filter(p=>Number.isFinite(p.height)).map(p=>p.height);
    const gradient=[left,right,down,up].every(Number.isFinite)?Math.hypot(right-left,up-down)/80:null;
    return{index:o.index,type:o.typeName,x:round(o.x),y:round(o.y),angle:round(norm(o.angle)),z:round(o.z||0),
      scale:Number(o.props?.objectPrototypeScale)||1,groundHeight:heightAt(o.x,o.y)??null,probes,
      probeHeightRange:dz.length?round(Math.max(...dz)-Math.min(...dz)):null,
      downhillFromHeading:gradient&&gradient>.02?round(delta(Math.atan2(down-up,left-right)*180/Math.PI,o.angle)):null,neighbors};
  });
  const byType=new Map();for(const c of cliffSamples){if(!byType.has(c.type))byType.set(c.type,[]);byType.get(c.type).push(c)}
  const cliffTypes=[...byType].map(([type,rows])=>({type,count:rows.length,theatre:byId.get(type.toLowerCase())?.theatre??null,
    catalogHalfAxes:byId.get(type.toLowerCase())?.geom??null,headings:counts(rows,c=>Math.round(c.angle/15)*15,8),
    nearestCenterDistance:quantiles(rows.map(c=>c.neighbors[0]?.distance)),probeHeightRange:quantiles(rows.map(c=>c.probeHeightRange)),
    relativeDownhill:counts(rows.filter(c=>c.downhillFromHeading!==null),c=>Math.round(c.downhillFromHeading/15)*15,8),
    examples:rows.filter(c=>c.neighbors.length).slice(0,3)})).sort((a,b)=>b.count-a.count);
  const texStats=new Map(),adj=new Map();let baseCells=0,b1=0,b2=0,both=0,unblendedNeighborSamples=0,boundaries=0;
  const blendInfo=new Map((terrain.blendInfo||[]).map(e=>[e.id,e])),blendPairs=new Map(),unresolvedBlendTextures=new Map();
  const materialName=t=>terrain.textures[t]?.name||`<unresolved:${t}>`;
  const addPair=(map,a,b)=>{const k=[a,b].sort().join(' | ');map.set(k,(map.get(k)||0)+1)};
  for(let y=0;y<terrain.textureRows.length;y++)for(let x=0;x<terrain.textureRows[y].length;x++){
    const cx=rect.x0+x*step,cy=rect.y0+y*step;if(cx<b||cy<b||cx>=info.width-b||cy>=info.height-b)continue;
    const t=terrain.textureRows[y][x],name=materialName(t);
    if(!texStats.has(name))texStats.set(name,{name,textureIndex:t,available:!!terrain.textures[t]?.name,cells:0,dryCells:0,wetCells:0,heights:[],flat:0,gentle:0,steep:0,withBlend:0});const s=texStats.get(name),z=hm.rows[y][x];
    const zs=[hm.rows[y]?.[x-1],hm.rows[y]?.[x+1],hm.rows[y-1]?.[x],hm.rows[y+1]?.[x]].filter(Number.isFinite);
    const grade=Math.max(0,...zs.map(v=>Math.abs(v-z)))/(step*10),dry=z>waterAt((cx-b)*10,(cy-b)*10,water)+.5;
    s.cells++;s[dry?'dryCells':'wetCells']++;if(dry){s.heights.push(z);s[grade<=.1?'flat':grade<=.5?'gentle':'steep']++;}baseCells++;
    const a=terrain.blend1Rows?.[y]?.[x]||0,c=terrain.blend2Rows?.[y]?.[x]||0;if(a)b1++;if(c)b2++;if(a&&c)both++;if(a||c)s.withBlend++;
    for(const id of[a,c])if(id){const e=blendInfo.get(id);if(!e)throw new Error('混合引用不完整');
      if(!terrain.textures[e.textureIndex]?.name)unresolvedBlendTextures.set(e.textureIndex,(unresolvedBlendTextures.get(e.textureIndex)||0)+1);
      addPair(blendPairs,name,materialName(e.textureIndex))}
    for(const [xx,yy]of[[x+1,y],[x,y+1]]){const q=terrain.textureRows[yy]?.[xx];if(q!==undefined&&q!==t){boundaries++;addPair(adj,name,materialName(q));
      if(!(a||c||terrain.blend1Rows?.[yy]?.[xx]||terrain.blend2Rows?.[yy]?.[xx]))unblendedNeighborSamples++;}}
  }
  const dryCells=[...texStats.values()].reduce((s,t)=>s+t.dryCells,0);
  const materials=[...texStats.values()].map(s=>({name:s.name,textureIndex:s.textureIndex,available:s.available,cells:s.cells,percent:round(s.cells/baseCells*100),dryCells:s.dryCells,wetCells:s.wetCells,
    dryPercent:dryCells?round(s.dryCells/dryCells*100):null,heights:quantiles(s.heights),
    sampledGrade:{flat:s.flat,gentle:s.gentle,steep:s.steep},withBlend:s.withBlend})).sort((a,b)=>b.cells-a.cells);
  const houseIds=new Set(comp.houseTypes.map(([t])=>t.toLowerCase()));
  const buildings=objects.filter(o=>houseIds.has(o.typeName.toLowerCase()));
  const neighborhoods=buildings.map(o=>{
    const radius=Math.min(300,Math.max(30,meta(o)?.geom?.fp||30)+120),ns=nearby(o,radius),decor=ns.filter(o=>decorIds.has(o.index));
    const a=o.angle*Math.PI/180,buildingNeighbors=ns.filter(p=>houseIds.has(p.typeName.toLowerCase()));
    return{index:o.index,type:o.typeName,x:round(o.x),y:round(o.y),angle:round(norm(o.angle)),groundHeight:heightAt(o.x,o.y)??null,radius,
      nearestRoad:closestRoad(o),decorationCount:decor.length,roles:counts(decor,o=>decorRole(o.typeName),12),decorationTypes:counts(decor,o=>o.typeName,18),
      buildingNeighbors:buildingNeighbors.slice(0,6).map(p=>({type:p.typeName,distance:round(Math.hypot(p.x-o.x,p.y-o.y)),angleDelta:round(delta(p.angle,o.angle))})),
      groundAround:counts([textureAt(o.x,o.y),...[-1,1].flatMap(k=>[textureAt(o.x+k*radius*.7,o.y),textureAt(o.x,o.y+k*radius*.7)])].filter(Boolean),s=>s,5),
      placements:decor.filter(p=>!['cliff','other'].includes(decorRole(p.typeName))).map(p=>{const dx=p.x-o.x,dy=p.y-o.y;return{type:p.typeName,role:decorRole(p.typeName),
        localX:round(dx*Math.cos(a)+dy*Math.sin(a)),localY:round(-dx*Math.sin(a)+dy*Math.cos(a)),angleDelta:round(delta(p.angle,o.angle))}}).slice(0,90)};
  });
  const street=decors.filter(o=>['lighting','waste','seating','landmark'].includes(decorRole(o.typeName)));
  const streetRelations=street.map(o=>({index:o.index,type:o.typeName,role:decorRole(o.typeName),x:round(o.x),y:round(o.y),angle:round(norm(o.angle)),
    road:closestRoad(o),ground:textureAt(o.x,o.y),nearestSame:nearby(o,600).filter(p=>p.typeName.toLowerCase()===o.typeName.toLowerCase())
      .map(p=>Math.hypot(p.x-o.x,p.y-o.y)).sort((a,b)=>a-b)[0]??null}));
  return{sample:{step,cells:baseCells,dryCells,wetCells:baseCells-dryCells,includesUnderwater:true},cliffs:{count:cliffs.length,types:cliffTypes,observations:cliffSamples},
    materials:{types:materials,adjacentSamplePairs:[...adj].sort((a,b)=>b[1]-a[1]).slice(0,32),blendPairs:[...blendPairs].sort((a,b)=>b[1]-a[1]).slice(0,32),
      blend1Cells:b1,blend2Cells:b2,bothBlendCells:both,sampledBoundaryPairs:boundaries,unblendedNeighborSamples,
      unresolvedBaseTextures:materials.filter(t=>!t.available).map(t=>({textureIndex:t.textureIndex,cells:t.cells,dryCells:t.dryCells})),
      unresolvedBlendTextures:[...unresolvedBlendTextures].map(([textureIndex,references])=>({textureIndex,references})),
      caveat:'At step > 1, adjacent samples span skipped cells; neither adjacency nor a missing blend proves a hard seam. Underwater and hidden foundation cells are included.'},
    houses:{count:buildings.length,types:comp.houseTypes,neighborhoods},decor:{types:counts(decors,o=>o.typeName,40),roles:counts(decors,o=>decorRole(o.typeName),12),
      streetTypes:counts(street,o=>o.typeName,40),streetRelations},roads:comp.roads,
    notes:['Cliff neighbor distances are between object centers, not mesh endpoints or guaranteed seams. Local X/Y is the rotated object frame; the visible front must be checked on the actual model.',
      'Catalog geometry is collision metadata, not rendered cliff size. Prototype scale and ground-relative Z are preserved; a small metadata radius must not imply tiny visual spacing.',
      'Decor roles are name-based search hints; semantic use and building frontage require visual confirmation. Co-occurrence is not a density target.',
      'Sampled grade is max axis height difference / sample world spacing, not native pathfinding. Materials on foundations and underwater may be invisible.']};
}
async function inspect(m,file,catalog,{step=2,includeRaw=false}={}){
  const source=path.resolve(file),hash=()=>crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),before=hash();let handle;
  try{
    handle=(await m.call('ra3map_open_map',{file:source})).handle;if(!handle)throw new Error('加载失败');
    const info=await m.call('ra3map_describe_map',{handle});const rect={x0:0,y0:0,x1:info.width-1,y1:info.height-1};
    const [obj,hm,terrain,water]=await Promise.all([m.call('ra3map_list_objects',{handle,limit:100000,includeProps:true,exact:true}),
      m.call('ra3map_get_heightmap',{handle,...rect,step,maxCells:1000000}),
      m.call('ra3map_get_terrain_cells',{handle,...rect,step,includeBlends:true,maxCells:1000000}),m.call('ra3map_get_water',{handle})]);
    if(!obj.objects||obj.objects.length!==info.objectCount)throw new Error('物体清单不完整，拒绝推断');
    const result=analyze(obj.objects,catalog,info,hm,terrain,water);if(before!==hash())throw new Error('原图发生变化');
    return{sourceName:path.basename(source,'.map'),sha256:before,sourceUnchanged:true,info,...result,
      ...(includeRaw?{raw:{objects:obj.objects,heightmap:hm,terrain,water}}:{})};
  }finally{if(handle)await m.call('ra3map_close_map',{handle})}
}
if(require.main===module)(async()=>{
  const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].replace(/^--/,'')]=process.argv[i+1];
  if(!args.editor||!args.file||!args.out)throw new Error('需要 --editor、--file、--out');
  if(fs.existsSync(args.out))throw new Error('输出已存在');
  const catalog=JSON.parse(fs.readFileSync(path.join(args.editor,'data/object-catalog.json'),'utf8')).objects,m=await connect(args.editor);
  try{const r=await inspect(m,args.file,catalog,{step:Number(args.step||2)});fs.mkdirSync(path.dirname(path.resolve(args.out)),{recursive:true});fs.writeFileSync(args.out,JSON.stringify(r,null,2)+'\n');console.log('Beautification observations completed; source unchanged.')}finally{await m.close()}
})().catch(e=>{console.error(e.message.includes('加载失败')?'加载失败':e.message);process.exitCode=1});
module.exports={analyze,inspect,decorRole,delta,quantiles};
