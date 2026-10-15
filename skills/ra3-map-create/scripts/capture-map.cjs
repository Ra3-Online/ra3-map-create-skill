'use strict';
// Captures an isolated editor session; never attaches to a user's existing window.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {spawn}=require('node:child_process'),{createRequire}=require('node:module');
const {args}=require('./make-plan.cjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function capture(a) {
  if(!a.editor||!a.file||!a.out)throw new Error('需要 --editor <含 Electron 的地编项目> --file <地图> --out <新截图目录>');
  const root=path.resolve(a.editor),file=path.resolve(a.file),out=path.resolve(a.out);
  if(fs.existsSync(out)&&fs.readdirSync(out).length)throw new Error('截图目录已有内容，请选择新目录。');
  const runtime=createRequire(path.join(root,'package.json')),electron=runtime('electron');
  if(typeof electron!=='string')throw new Error('截图需要图形版地编和 Electron；纯 agent-kit 只能提供俯视图。');
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ra3-map-visual-')),port=Number(a.port||9465),hash=()=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),before=hash();
  const app=spawn(electron,[`--remote-debugging-port=${port}`,'--disable-renderer-backgrounding','--disable-background-timer-throttling','--disable-backgrounding-occluded-windows',`--user-data-dir=${profile}`,root],
    {cwd:root,stdio:'ignore',windowsHide:true,env:{...process.env,RA3ME_NO_REAL_SAVE:'1',RA3ME_NOCLOSEGUARD:'1'}});
  let ws,seq=0;
  async function cdp(method,params={}) {
    const id=++seq;
    return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ws.removeEventListener('message',listen);reject(new Error('截图操作超时'));},60000);
      function listen(e){const m=JSON.parse(e.data);if(m.id!==id)return;clearTimeout(timer);ws.removeEventListener('message',listen);m.error?reject(new Error(m.error.message)):resolve(m.result);}
      ws.addEventListener('message',listen);ws.send(JSON.stringify({id,method,params}));});
  }
  async function ev(expression) {
    const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||'截图脚本执行失败');return r.result?.value;
  }
  try {
    for(let k=0;k<80;k++){await sleep(500);try{const tabs=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json(),tab=tabs.find(t=>/shell-page/.test(t.url||''));
      if(!tab)continue;ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
      if(await ev('document.readyState==="complete"&&!!window.RA3Shell'))break;ws.close();ws=null;
    }catch{ws?.close();ws=null;}}
    if(!ws)throw new Error('地编窗口未准备好。');
    await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
    // If the common loader refuses input, do not capture the retained/empty scene.
    const info=await ev(`(async()=>{document.getElementById('startGo')?.click();document.getElementById('startScreen').style.display='none';
      await RA3Shell.openMap(${JSON.stringify(file)},'Visual review');const state=RA3Shell.state();const h=state.handle;
      if(!h||state.file!==${JSON.stringify(file)})throw new Error('加载失败');
      const i=await mapEditor.getMapInfo(h);if(!i.file)throw new Error('加载失败');
      RA3Layers.showObjects=false;RA3Layers.showWaypoints=false;RA3Layers.showWaypointNames=false;RA3Layers.showStarts=false;
      RA3Layers.showLabels=false;RA3Layers.showBorder=false;RA3Layers.showAreas=false;RA3Layers.showWaves=false;
      document.getElementById('leftCollapse')?.click();document.getElementById('rightCollapse')?.click();
      ${a['model-kinds']?`RA3Viewport.setModelMaxKinds(${Math.min(200,Math.max(1,Number(a['model-kinds'])||64))});`:''}
      ${a['diagnostic-fog']==='true'?"await mapEditor.setFog(h,{enabled:false});RA3Viewport.invalidateHeavyCaches();await RA3Viewport.refresh();":''}
      RA3Viewport.redraw();await RA3Viewport.setMode('3d');
      ${a['diagnostic-fog']==='true'?"Ra3View3D.setBloomEnabled(false);":''}return i;})()`);
    if(!await ev('!!window.Ra3View3D?.setCamera'))throw new Error('地编需要包含 setCamera 截图接口的版本。');
    // Only hide the editor overlay; the rendered water and map data stay intact.
    await ev(`document.getElementById('mapOverlay').style.visibility='hidden'`);
    fs.mkdirSync(out,{recursive:true});
    const b=info.border,w=info.playableWidth,h=info.playableHeight;
    const views=a.views?JSON.parse(fs.readFileSync(path.resolve(a.views),'utf8')):[
      {name:'overview',cx:b+w*.5,cy:b+h*.5,distance:Math.max(w,h)*12,yaw:-Math.PI/2,pitch:1.05},
      {name:'player-base',cx:b+w*.23,cy:b+h*.5,distance:1100,yaw:-Math.PI/2,pitch:.75},
      {name:'coast-detail',cx:b+w*.28,cy:b+h*.25,distance:1250,yaw:-Math.PI/2,pitch:.75},
    ];
    const shots=[];
    for(const v of views){
      if(!/^[a-z0-9-]+$/i.test(v.name))throw new Error('截图名称只能含字母、数字、短横线。');
      const camera=await ev(`Ra3View3D.setCamera(${JSON.stringify(v)})`);await sleep(400);
      const clip=await ev(`(()=>{const r=document.getElementById('mapCanvas3d').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,scale:1}})()`);
      const shot=await cdp('Page.captureScreenshot',{format:'png',clip});fs.writeFileSync(path.join(out,v.name+'.png'),Buffer.from(shot.data,'base64'),{flag:'wx'});
      shots.push({name:v.name,camera,width:clip.width,height:clip.height});
    }
    if(hash()!==before)throw new Error('原图校验值发生变化。');
    fs.writeFileSync(path.join(out,'views.json'),JSON.stringify({sourceUnchanged:true,
      diagnosticView:a['diagnostic-fog']==='true'?'Distance fog disabled in an unsaved session; renderer bloom disabled. Not an in-game view.':null,
      modelStats:await ev('RA3Viewport.modelStats()'),shots},null,2)+'\n',{flag:'wx'});
    console.log(JSON.stringify({captured:shots.length,out,sourceUnchanged:true},null,2));return{out,shots};
  } finally {ws?.close();app.kill();}
}
if(require.main===module)capture(args(process.argv.slice(2))).catch(e=>{console.error(e.message.includes('加载失败')?'加载失败':e.message);process.exitCode=1;});
module.exports={capture};
