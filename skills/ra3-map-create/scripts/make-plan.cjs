'use strict';
const fs=require('node:fs'),path=require('node:path');
const {styles,dimensions}=require('./design.cjs');
function args(argv) {
  const a={};for(let i=0;i<argv.length;i+=2){if(!argv[i].startsWith('--')||argv[i+1]==null)throw new Error('参数需为 --名称 值');a[argv[i].slice(2)]=argv[i+1];}return a;
}
function make(a) {
  const mode=a.mode||'create',style=a.style||'tropical-coast';if(!styles[style])throw new Error('style: tropical-coast 或 snow-valley');
  if(!['create','beautify'].includes(mode))throw new Error('mode: create 或 beautify');
  const seed=Number(a.seed??20261005);if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw new Error('seed 应为 uint32。');
  const p={version:1,mode,style,seed,title:a.title||'AI Coastal Crossing'};
  if(mode==='create'){
    p.map={width:Number(a.width??320),height:Number(a.height??320),border:Number(a.border??10),startPositions:2};dimensions(p);
    p.terrain={layout:'terraced-island',relief:a.relief||'gentle'};p.economy={oreCount:Number(a.ores??6),oilCount:Number(a.oils??2)};
    require('./terrain-design.cjs').options(p);
  }
  else {p.region={cx:Number(a.cx),cy:Number(a.cy),radius:Number(a.radius??24)};p.count=Number(a.count??60);if(!Number.isFinite(p.region.cx)||!Number.isFinite(p.region.cy))throw new Error('beautify 需要 --cx 和 --cy（格坐标包含 border）。');}
  return p;
}
if(require.main===module)try{const a=args(process.argv.slice(2)),p=make(a);if(!a.out)throw new Error('缺少 --out <plan.json>');const file=path.resolve(a.out);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({plan:file,...p},null,2));}catch(e){console.error(e.message);process.exitCode=1;}
module.exports={args,make};
