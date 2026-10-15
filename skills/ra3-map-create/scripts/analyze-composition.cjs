'use strict';
// Read-only composition measurements; map bytes are never parsed here.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {connect}=require('./mcp-client.cjs');
const round=n=>Math.round(n*1000)/1000;
const norm=a=>((a%360)+360)%360;
const top=(m,n=12)=>[...m].sort((a,b)=>b[1]-a[1]).slice(0,n);
function count(rows,key){const m=new Map();for(const r of rows){const k=key(r);m.set(k,(m.get(k)||0)+1)}return top(m,1000)}
function distanceToSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)}
function analyze(objects,catalog=[],info={}){
  const byId=new Map(catalog.map(o=>[o.id.toLowerCase(),o])),meta=o=>byId.get(o.typeName.toLowerCase());
  const isHouse=o=>/^(Civilian)$/i.test(meta(o)?.nativeSide||meta(o)?.side||'')
    && meta(o)?.editorSorting==='STRUCTURE'
    && !/Wall|Fence|Border|Trim|Roof|Segment/i.test(o.typeName)
    && /House|Hut|Hotel|Apartment|Building|Store|Shop|Restaurant|Cafe|Church|Barn|Garage|GasStation|School|Palace|Cabin|Chalet|Warehouse|Factory|TownHall|Shack/i.test(o.typeName);
  const houses=objects.filter(isHouse),decors=objects.filter(o=>/SHRUBBERY|MISC_|DEBRIS|PROPS/.test(meta(o)?.editorSorting||''));
  const buckets=new Map();for(const o of decors){const key=`${Math.floor(o.x/200)},${Math.floor(o.y/200)}`;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o)}
  const segments=[],unpaired=[];
  for(let i=0;i<objects.length;i++){
    const a=objects[i],f=a.roadOption|0;if(!(f&(2|16)))continue;
    const b=objects[i+1],end=(f&16)?32:4;
    if(!b||!(b.roadOption&end)||b.typeName.toLowerCase()!==a.typeName.toLowerCase()){unpaired.push(a.index);continue}
    const length=Math.hypot(b.x-a.x,b.y-a.y);
    segments.push({typeName:a.typeName,a:{x:a.x,y:a.y,index:a.index},b:{x:b.x,y:b.y,index:b.index},length:round(length),
      heading:round(norm(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI)),bridge:end===32,
      corner:(f&8)?'angled':(f&64)?'tight':'broad',join:(f&128)!==0});i++;
  }
  const endpoints=new Map();for(const s of segments)for(const [p,q]of[[s.a,s.b],[s.b,s.a]]){
    const key=`${s.typeName.toLowerCase()}:${Math.round(p.x*4)},${Math.round(p.y*4)}`;
    if(!endpoints.has(key))endpoints.set(key,[]);endpoints.get(key).push({s,p,q});
  }
  const turns=[];let junctions=0,straightConnections=0;
  for(const linked of endpoints.values()){
    if(linked.length>2){junctions++;continue}if(linked.length!==2)continue;
    const [a,b]=linked,ax=a.q.x-a.p.x,ay=a.q.y-a.p.y,bx=b.q.x-b.p.x,by=b.q.y-b.p.y;
    const denom=Math.hypot(ax,ay)*Math.hypot(bx,by);if(!denom)continue;
    const turn=180-Math.acos(Math.max(-1,Math.min(1,(ax*bx+ay*by)/denom)))*180/Math.PI;
    if(turn<5){straightConnections++;continue}
    turns.push({x:round(a.p.x),y:round(a.p.y),typeName:a.s.typeName,turn:round(turn),
      shortLeg:round(Math.min(a.s.length,b.s.length)),corner:a.s.corner,join:a.s.join||b.s.join});
  }
  const neighborhoods=[],cooccur=new Map();
  for(const house of houses){
    const radius=Math.max(30,meta(house)?.geom?.fp||30)+120,near=[];
    for(let x=Math.floor((house.x-radius)/200);x<=Math.floor((house.x+radius)/200);x++)
      for(let y=Math.floor((house.y-radius)/200);y<=Math.floor((house.y+radius)/200);y++)
        for(const o of buckets.get(`${x},${y}`)||[])if(Math.hypot(o.x-house.x,o.y-house.y)<=radius)near.push(o);
    const kinds=count(near,o=>o.typeName);for(const [kind] of kinds){const key=`${house.typeName}|${kind}`;cooccur.set(key,(cooccur.get(key)||0)+1)}
    let distance=Infinity;for(const s of segments)distance=Math.min(distance,distanceToSegment(house,s.a,s.b));
    neighborhoods.push({typeName:house.typeName,x:round(house.x),y:round(house.y),angle:round(norm(house.angle)),
      radius:round(radius),nearbyDecorationCount:near.length,decoration:kinds.slice(0,8),nearestRoad:distance===Infinity?null:round(distance)});
  }
  const ores=objects.filter(o=>/^(OreNode|OreMine)/i.test(o.typeName));
  const oreDetails=ores.map(o=>{
    const g=meta(o)?.geom,a=o.angle*Math.PI/180,scale=Number(o.props?.objectPrototypeScale)||1;
    let residual=null,heightPhaseResidual=null;if(g?.mj){const mn=g.mn??g.mj;
      const dx=(Math.cos(a)*g.mj-Math.sin(a)*mn)*scale,dy=(Math.cos(a)*mn+Math.sin(a)*g.mj)*scale;
      const u=(o.x+dx+o.y+dy)/Math.SQRT2/30,v=(o.y+dy-o.x-dx)/Math.SQRT2/30;
      residual=round(30*Math.hypot(u-Math.round(u),v-Math.round(v)));
      if(Number.isFinite(info.playableHeight)){
        const vp=v-info.playableHeight*10/Math.SQRT2/30;
        heightPhaseResidual=round(30*Math.hypot(u-Math.round(u),vp-Math.round(vp)));
      }
    }
    return{typeName:o.typeName,x:round(o.x),y:round(o.y),angle:round(norm(o.angle)),
      worldOriginCornerResidual:residual,observedMapHeightPhaseResidual:heightPhaseResidual,
      headingOn45Plus90:Math.abs((norm(o.angle)-45)/90-Math.round((norm(o.angle)-45)/90))<.001};
  });
  return{houseCount:houses.length,houseTypes:count(houses,o=>o.typeName),decorationTypes:count(decors,o=>o.typeName),
    theatreCounts:count(objects,o=>meta(o)?.theatre||'unclassified'),houseDecorationCooccurrence:top(cooccur,60),
    neighborhoods:neighborhoods.sort((a,b)=>b.nearbyDecorationCount-a.nearbyDecorationCount).slice(0,40),
    roads:{segments:segments.length,types:count(segments,s=>s.typeName),corners:count(segments,s=>s.corner),
      joinSegments:segments.filter(s=>s.join).length,bridges:segments.filter(s=>s.bridge).length,unpairedNodes:unpaired,
      lengthMedian:segments.length?round(segments.map(s=>s.length).sort((a,b)=>a-b)[Math.floor(segments.length/2)]):null,
      geometricTurns:turns.length,junctions,straightConnections,turnAngles:count(turns,s=>Math.round(s.turn/15)*15),
      examples:turns.filter(s=>s.shortLeg>50).sort((a,b)=>b.shortLeg-a.shortLeg).slice(0,16),
      polylines:segments.map(s=>({type:s.typeName,a:[s.a.x,s.a.y],b:[s.b.x,s.b.y],corner:s.corner,join:s.join}))},
    ore:oreDetails,neutralTypes:count(objects.filter(o=>/OilDerrick|Observation|ObsPost|Hospital|Garage|Airport|Academy|OreNode|OreMine/i.test(o.typeName)),o=>o.typeName),
    notes:['Road endpoints require adjacent compatible point1/point2 records; unpaired nodes are reported, never guessed.',
      'Matching road endpoints use a 0.25-world-unit bucket; crossings, terrain height and renderer seams need visual review.',
      'House/decor proximity records observed co-occurrence, not collision clearance or a prescription to copy density.',
      'Ore diagnostics compare two explicit phases: world origin and an observed playable-height offset in this corpus. Neither residual alone certifies native grid placement.',
      'Catalog half-axes, prototype scale, inherited geometry, custom models and map transforms require confirmation before correcting existing ore positions.']};
}
async function inspect(m,file,catalog){
  const source=path.resolve(file),hash=()=>crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),before=hash();let handle;
  try{handle=(await m.call('ra3map_open_map',{file:source})).handle;
    const objects=(await m.call('ra3map_list_objects',{handle,limit:100000,includeProps:true,exact:true})).objects;
    if(objects.some(o=>typeof o.roadOption!=='number'))throw new Error('需要支持 list_objects exact:true 的新版 MCP');
    const info=await m.call('ra3map_describe_map',{handle});
    const data=analyze(objects,catalog,info);if(before!==hash())throw new Error('原图发生变化');
    return{sourceName:path.basename(source,'.map'),sha256:before,sourceUnchanged:true,...data};
  }finally{if(handle)await m.call('ra3map_close_map',{handle})}
}
if(require.main===module)(async()=>{
  const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].replace(/^--/,'')]=process.argv[i+1];
  if(!args.editor||!args.file||!args.out)throw new Error('需要 --editor、--file、--out');
  if(fs.existsSync(args.out))throw new Error('输出已存在');
  const catalog=JSON.parse(fs.readFileSync(path.join(args.editor,'data/object-catalog.json'),'utf8')).objects;
  const m=await connect(args.editor);try{const r=await inspect(m,args.file,catalog);fs.mkdirSync(path.dirname(path.resolve(args.out)),{recursive:true});fs.writeFileSync(args.out,JSON.stringify(r,null,2),'utf8');console.log('Composition analysis completed; source unchanged.')}finally{await m.close()}
})().catch(e=>{console.error(e.message.includes('加载失败')?'加载失败':e.message);process.exitCode=1});
module.exports={analyze,inspect,distanceToSegment};
