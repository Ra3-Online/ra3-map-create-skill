'use strict';
// Original procedural layouts; no map, texture or model from the learning corpus is copied.
const styles = {
  'tropical-coast': {
    textures: ['Reef_Yucatan01','Dirt_Yucatan04','Dirt_Yucatan03','Grass_Yucatan02','Grass_Yucatan05','Dirt_Yucatan04','Rock_Yucatan01','Rock_Yucatan03'],
    trees: ['CS_Palm03','CS_Palm02','HV_Tree01','CC_TREE04'],
    shrubs: ['YU_Bush01','YU_Bush03','CC_GRASS06','CC_Grass01'],
    rocks: ['YU_SMALLROCKS01','YU_SMALLROCKS02','YU_LARGEROCKS02'],
    referenceIds: ['m001','m006','m012','m080'],
  },
  'snow-valley': {
    textures: ['Sand_Cannes02','Snow_Solvang01','Snow_Solvang04','Snow_Iceland04','Snow_Solvang01','Gravel_Yucatan01','Clif_Iceland03','Snow_Iceland04'],
    trees: ['IL_Tree01','IL_TREE02','SV_TREE16','SV_Tree03'],
    shrubs: ['IL_BUSH01','IL_BUSH03','IL_BUSH05'],
    rocks: ['SV_Rocks01','SV_ROCKS02','SV_ROCKS06'],
    referenceIds: ['m005','m049'],
  },
};
function rng(seed) {
  let s=seed>>>0;
  return ()=>{ s+=0x6D2B79F5; let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296; };
}
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
function segmentDistance(x,y,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy),0,1);
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
function pointInPolygon(x,y,pts) {
  let inside=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++) {
    const a=pts[i],b=pts[j];
    if((a.y>y)!==(b.y>y) && x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;
  }
  return inside;
}
function waterAt(x,y,water) {
  let level=-Infinity;
  for(const a of water.areas||[]) if(pointInPolygon(x,y,a.points||[]))level=Math.max(level,a.waterHeight??-Infinity);
  return level;
}
function encodeHeight(h) {
  const coarse=Math.floor(clamp(h,0,2550)/10),fine=clamp(Math.round((h-coarse*10)*256/9.96),0,255);
  return (coarse<<8)|fine;
}
function dimensions(plan) {
  const m=plan.map;
  if(!m || !Number.isInteger(m.width)||!Number.isInteger(m.height)||m.width<240||m.width>640||m.height<240||m.height>640)
    throw new Error('初版生成器支持 240..640 格的可玩宽高。');
  if(!Number.isInteger(m.border)||m.border<4||m.border>40)throw new Error('border 应为 4..40 的整数。');
  if(m.startPositions!==2)throw new Error('初版自动布局支持双人；更多玩家应单独设计并验收。');
  return m;
}
function createDesign(plan, info) {
  dimensions(plan);const style=styles[plan.style];if(!style)throw new Error('未知风格。');
  const t=require('./terrain-design.cjs').createTerrain(plan,info),rand=rng(plan.seed),W=info.width,H=info.height,b=info.border,w=plan.map.width-1,h=plan.map.height-1;
  const placed=[],occupied=[];
  const put=(typeName,p,angle,kind)=>{placed.push({typeName,x:p[0]*10,y:p[1]*10,z:0,angle,owner:kind==='decoration'?'PlyrCivilian/teamPlyrCivilian':'PlyrNeutral/teamPlyrNeutral',props:{objectLayer:kind==='decoration'?'AI_Decoration':'AI_Resources'}});occupied.push(p);};
  t.ores.forEach((o,i)=>put('OreNode',o.p,i%2?45:225,'resource'));t.oils.forEach((p,i)=>put('OilDerrick',p,i?45:225,'resource'));
  const safe=(x,y,spacing=2.8)=>{
    if(x<5||y<5||x>w-5||y>h-5||t.reserved(x,y,2))return false;
    const cx=Math.floor(x+b),cy=Math.floor(y+b),i=cy*W+cx,z=t.decoded[i];
    return z>216&&t.pass[i]===0&&[i-1,i+1,i-W,i+W].every(k=>Math.abs(t.decoded[k]-z)<3)&&occupied.every(p=>Math.hypot(x-p[0],y-p[1])>=spacing);
  };
  const clusterCount=Math.round(w*h/1050);
  for(let k=0;k<clusterCount;k++){
    const x=rand()*w,y=rand()*h;if(!safe(x,y,7))continue;
    const radius=5+rand()*8,count=7+Math.floor(rand()*8);
    for(let q=0;q<count;q++){
      const a=rand()*Math.PI*2,r=Math.sqrt(rand())*radius,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r,mx=w-px,my=h-py;
      if(!safe(px,py)||!safe(mx,my))continue;
      const group=q%5===0?style.rocks:q%3===0?style.shrubs:style.trees,type=group[Math.floor(rand()*group.length)],angle=Math.floor(rand()*360);
      put(type,[px,py],angle,'decoration');put(type,[mx,my],(angle+180)%360,'decoration');
    }
  }
  return{textures:style.textures,heightsBase64:t.heights.toString('base64'),texClassBase64:t.tex.toString('base64'),passabilityBase64:t.pass.toString('base64'),
    starts:t.starts.map(([x,y])=>({x:x*10,y:y*10})),items:placed,
    water:{points:[-b*10,-b*10,(W-b-1)*10,-b*10,(W-b-1)*10,(H-b-1)*10,-b*10,(H-b-1)*10],waterHeight:200,name:'Sea'},
    checks:{players:2,baseClearRadius:18,corridorRadius:3,balancedEconomy:true,oreCount:t.summary.oreCount,oilCount:t.summary.oilCount},
    summary:{style:plan.style,seed:plan.seed,playable:[w+1,h+1],objects:placed.length,clustersAttempted:clusterCount,referenceIds:style.referenceIds,
      terrain:t.summary,routes:t.routes.map(line=>line.map(([x,y])=>[x+b,y+b]))}};
}
function beautyDesign(plan, info, heights, water, objects, flags, geometry) {
  const s=styles[plan.style];if(!s)throw new Error('未知风格。');
  const r=plan.region;if(!r||![r.cx,r.cy,r.radius].every(Number.isFinite)||r.radius<4||r.radius>80)throw new Error('美化区域需要 cx/cy 与 4..80 格的 radius。');
  const b=info.border,rand=rng(plan.seed),items=[],avoid=objects.filter(o=>/OreNode|OilDerrick|Waypoint/i.test(o.typeName));
  if(r.cx-r.radius<b||r.cy-r.radius<b||r.cx+r.radius>=info.width-b||r.cy+r.radius>=info.height-b)throw new Error('美化区域超出可玩边界。');
  const count=clamp(plan.count??60,1,300),centers=Array.from({length:Math.max(3,Math.round(count/12))},()=>{
    const a=rand()*Math.PI*2,d=Math.sqrt(rand())*r.radius*.7;return[r.cx+Math.cos(a)*d,r.cy+Math.sin(a)*d];});
  for(let k=0;k<count*30&&items.length<count;k++) {
    const c=centers[k%centers.length],a=rand()*Math.PI*2,d=Math.sqrt(rand())*7,cx=c[0]+Math.cos(a)*d,cy=c[1]+Math.sin(a)*d;
    if(Math.hypot(cx-r.cx,cy-r.cy)>r.radius)continue;
    const x=(cx-b)*10,y=(cy-b)*10,z=heights.rows[Math.floor(cy)-heights.rect.y0]?.[Math.floor(cx)-heights.rect.x0];
    const fx=Math.floor(cx)-flags.rect.x0,fy=Math.floor(cy)-flags.rect.y0;
    if(!Number.isFinite(z)||z<=waterAt(x,y,water)+2||![0,3,4].includes(flags.rows[fy]?.[fx]))continue;
    const hx=Math.floor(cx)-heights.rect.x0,hy=Math.floor(cy)-heights.rect.y0;
    const nearby=[heights.rows[hy]?.[hx-1],heights.rows[hy]?.[hx+1],heights.rows[hy-1]?.[hx],heights.rows[hy+1]?.[hx]];
    if(nearby.some(h=>!Number.isFinite(h)||Math.abs(h-z)>10))continue;
    if(avoid.some(o=>Math.hypot(o.x-x,o.y-y)<(/Waypoint/i.test(o.typeName)?200:120)))continue;
    if([...objects,...items].some(o=>Math.hypot(o.x-x,o.y-y)<Math.max(28,(geometry[o.typeName]?.fp||0)+20)))continue;
    const group=k%4===0?s.shrubs:k%7===0?s.rocks:s.trees;
    items.push({typeName:group[Math.floor(rand()*group.length)],x,y,z:0,angle:Math.floor(rand()*360),owner:'PlyrCivilian/teamPlyrCivilian',props:{objectLayer:'AI_Decoration'}});
  }
  if(!items.length)throw new Error('所选区域没有可美化的陆地或空闲位置，请换一个区域。');
  return {items,summary:{style:plan.style,seed:plan.seed,placed:items.length,requested:count,region:r,
    note:'只增加装饰，不改变原图地形、出生点、资源、玩家或脚本。'}};
}
module.exports={styles,rng,dimensions,createDesign,beautyDesign,waterAt,segmentDistance};
