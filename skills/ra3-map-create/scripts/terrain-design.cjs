'use strict';
// Original landform graph: base terraces -> ramps -> low approach / flank -> raised expansion.
// Shapes are procedural, not extracted heightmaps or copies of the reference maps.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
function segment(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy,t=den?clamp(((x-a[0])*dx+(y-a[1])*dy)/den):0;return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
function polygonDistance(x,y,points){let inside=false,d=Infinity;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];d=Math.min(d,segment(x,y,a,b));if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside?d:-d;}
function options(plan){
  const t=plan.terrain||{},e=plan.economy||{},relief=t.relief||'gentle';
  if(t.layout&&t.layout!=='terraced-island')throw new Error('生成器支持 terraced-island；其他主地貌请通过 MCP 单独设计。');
  if(!['gentle','standard'].includes(relief))throw new Error('relief: gentle 或 standard');
  const oreCount=e.oreCount??6,oilCount=e.oilCount??2;
  if(![6,10].includes(oreCount)||![0,2].includes(oilCount))throw new Error('草稿经济支持 6/10 矿、0/2 油井。');
  return{layout:'terraced-island',relief,oreCount,oilCount};
}
function createTerrain(plan,info){
  const opt=options(plan),b=info.border,W=info.width,H=info.height,w=plan.map.width-1,h=plan.map.height-1,scale=Math.min(w,h)/399;
  const pt=([x,y])=>[x*w,y*h],mirror=([x,y])=>[w-x,h-y],paired=poly=>[poly,poly.map(mirror)];
  const baseHeight=opt.relief==='gentle'?240:250,highHeight=opt.relief==='gentle'?270:290,lowHeight=220;
  const starts=[pt([.22,.5]),pt([.78,.5])];
  const localOres=[{p:pt([.225,.385]),height:baseHeight},{p:pt([.21,.615]),height:baseHeight},{p:pt([.57,.28]),height:highHeight}];
  if(opt.oreCount===10)localOres.push({p:pt([.16,.72]),height:lowHeight},{p:pt([.33,.81]),height:lowHeight});
  const ores=localOres.flatMap(o=>[o,{...o,p:mirror(o.p)}]),oils=opt.oilCount?[pt([.42,.51]),pt([.58,.49])]:[];
  const zones=[];
  function zonePair(name,vertices,height,gates){const polygon=vertices.map(pt);for(const [i,poly] of paired(polygon).entries())zones.push({name:name+(i?'-B':'-A'),polygon:poly,height,gates:gates.map(g=>({line:g.map(p=>i?mirror(pt(p)):pt(p)),halfWidth:Math.max(9,11*scale)}))});}
  zonePair('base-terrace',[[.12,.4],[.18,.32],[.30,.34],[.36,.45],[.32,.58],[.27,.67],[.15,.64]],baseHeight,
    [[[.28,.49],[.40,.49]],[[.20,.59],[.20,.72]]]);
  zonePair('raised-expansion',[[.40,.35],[.45,.20],[.56,.18],[.65,.25],[.70,.35],[.63,.42],[.53,.38],[.46,.44]],highHeight,
    [[[.51,.30],[.46,.49]],[[.60,.33],[.75,.32]]]);
  const centerHeight=baseHeight+10;
  const centerZone={name:'central-saddle',polygon:[[.45,.47],[.5,.445],[.55,.47],[.55,.53],[.5,.555],[.45,.53]].map(pt),height:centerHeight,gates:[{line:[pt([.38,.5]),pt([.62,.5])],halfWidth:Math.max(11,13*scale)}]};zones.push(centerZone);
  const upper=[[.22,.5],[.35,.49],[.46,.49],[.51,.35],[.59,.32],[.75,.32],[.78,.5]].map(pt);
  const outer=[[.22,.5],[.20,.70],[.33,.81],[.53,.75],[.71,.62],[.78,.5]].map(pt);
  const routes=[upper,upper.map(mirror).reverse(),outer,outer.map(mirror).reverse()];
  const lineDistance=(x,y)=>Math.min(...routes.flatMap(a=>a.slice(1).map((q,i)=>segment(x,y,a[i],q))));
  const pads=[...starts.map(p=>({p,height:baseHeight,inner:21,outer:27,kind:'base'})),...ores.map(o=>({...o,inner:10,outer:15,kind:'ore'})),...oils.map(p=>({p,height:lowHeight,inner:7,outer:12,kind:'oil'}))];
  const reserved=(x,y,margin=0)=>pads.some(a=>Math.hypot(x-a.p[0],y-a.p[1])<a.outer+margin)||lineDistance(x,y)<7+margin||Math.hypot(x-w/2,y-h/2)<10+margin;
  const heights=Buffer.alloc(W*H*2),tex=Buffer.alloc(W*H),pass=Buffer.alloc(W*H),decoded=new Float32Array(W*H);
  const f=(x,y)=>.48*Math.sin(x*.026+y*.019+plan.seed*.007)+.32*Math.cos(x*.035-y*.029)+.2*Math.sin(x*.055+y*.02);
  const noise=(x,y)=>(f(x,y)+f(w-x,h-y))*.5;
  function surface(x,y){
    const ux=(x-w/2)/(w*.445),uy=(y-h/2)/(h*.43),r=Math.hypot(ux,uy),a=Math.atan2(uy,ux);
    const edge=1+.065*Math.cos(4*a+.5)+.045*Math.sin(6*a),inward=(edge-r)*Math.min(w*.445,h*.43);
    const coves=[pt([.49,.065]),pt([.51,.935])];
    const coast=Math.min(inward,...coves.map(p=>Math.hypot(x-p[0],y-p[1])-Math.min(w,h)*.155));
    let z=130+72*smooth(-22*scale,0,coast)+18*smooth(0,10*scale,coast),cliff=false,zoneName='coastal-lowland';
    const dry=smooth(5*scale,12*scale,coast);
    for(const q of zones){
      const d=polygonDistance(x,y,q.polygon)+noise(x,y)*1.5*scale,gateD=Math.min(...q.gates.map(g=>segment(x,y,...g.line))),gateW=q.gates[0].halfWidth;
      const gate=1-smooth(gateW-2,gateW+3,gateD),edgeWidth=2.5+gate*18;
      const amount=smooth(-edgeWidth/2,edgeWidth/2,d)*dry;
      z=z*(1-amount)+q.height*amount;
      if(amount>.5)zoneName=q.name;
      if(Math.abs(d)<2.5&&gate<.8&&dry>.95)cliff=true;
    }
    // Microrelief is a surface finish. It cannot substitute for terraces and connecting ramps.
    z+=noise(x,y)*.7*dry;
    for(const q of pads){const amount=1-smooth(q.inner,q.outer,Math.hypot(x-q.p[0],y-q.p[1]));if(amount){z=z*(1-amount)+q.height*amount;if(amount>.6)cliff=false;}}
    return{z,cliff,zoneName};
  }
  const encode=z=>{const c=Math.floor(clamp(z,0,2550)/10);return(c<<8)|clamp(Math.round((z-c*10)*256/9.96),0,255);};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=y*W+x,j=(H-1-y)*W+W-1-x;if(i>j)continue;
    const px=x-b,py=y-b,{z,cliff}=surface(px,py),n=noise(px,py);
    const value=encode(z);heights.writeUInt16LE(value,i*2);heights.writeUInt16LE(value,j*2);decoded[i]=decoded[j]=(value>>8)*10+(value&255)*9.96/256;
    const rock=cliff||z>highHeight-3&&n>.35;
    const orePad=ores.some(o=>Math.hypot(px-o.p[0],py-o.p[1])<6);
    // Thin painted polylines look like stairs in 3D. Routes remain geometric reservations;
    // use real road segments later when the user wants roads.
    tex[i]=tex[j]=z<185?0:z<216?1:rock?6:orePad?2:n<-.3?4:3;
    pass[i]=pass[j]=cliff||px<0||py<0||px>w||py>h?1:0;
  }
  // Store actual steep edges, including transitions created by local pad grading.
  for(let y=b;y<H-b;y++)for(let x=b;x<W-b;x++){const i=y*W+x,z=decoded[i];if(z<200.5)continue;if([i-1,i+1,i-W,i+W].some(k=>Math.abs(decoded[k]-z)>10))pass[i]=1;}
  return{heights,tex,pass,decoded,starts,ores,oils,routes,pads,reserved,
    summary:{...opt,levels:{water:200,lowland:lowHeight,base:baseHeight,raisedExpansion:highHeight,centralSaddle:centerHeight},
      zones:zones.map(z=>({name:z.name,height:z.height,polygon:z.polygon,gates:z.gates})),
      principle:'Terraces separate approaches; broad graded ramps connect playable flats. Roads follow terrain; reserves keep each terrain level rather than flattening all routes.'}};
}
module.exports={createTerrain,options,polygonDistance};
