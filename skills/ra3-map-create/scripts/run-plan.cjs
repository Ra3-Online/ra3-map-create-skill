'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {connect}=require('./mcp-client.cjs');
const {args}=require('./make-plan.cjs');
const {styles,dimensions,createDesign,beautyDesign}=require('./design.cjs');
const {validate}=require('./validate-map.cjs');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
async function run(a) {
  if(!a.editor||!a.plan||!a.out)throw new Error('需要 --editor <项目或 agent-kit> --plan <plan.json> --out <新目录/同名.map>');
  const plan=JSON.parse(fs.readFileSync(path.resolve(a.plan),'utf8')),output=path.resolve(a.out),dir=path.dirname(output),source=a.source?path.resolve(a.source):null;
  if(plan.version!==1||!['create','beautify'].includes(plan.mode)||!styles[plan.style])throw new Error('不支持的计划版本、模式或风格。');
  if(!Number.isInteger(plan.seed)||plan.seed<0||plan.seed>4294967295)throw new Error('seed 应为 uint32。');
  if(path.extname(output).toLowerCase()!=='.map'||path.basename(dir)!==path.basename(output,'.map'))throw new Error('输出需要采用同名文件夹/同名.map 结构。');
  if(fs.existsSync(dir)&&fs.readdirSync(dir).length)throw new Error('输出目录已有内容；请选择新目录，避免覆盖地图或支援文件。');
  if(plan.mode==='create'&&!/^map_mp/i.test(path.basename(output,'.map')))
    throw new Error('新遭遇战地图请使用 Map_MP 前缀的同名目录与 .map，以便生成正确的多人 map.xml。');
  if(plan.mode==='create')dimensions(plan);else if(!source||!fs.existsSync(source))throw new Error('beautify 需要 --source <原图.map>');
  if(source&&source.toLowerCase()===output.toLowerCase())throw new Error('必须另存到新目录。');
  const m=await connect(a.editor),started=Date.now();let handle,originalHash,before,design,report;
  try {
    // Open through the validated map service before creating any output for an existing map.
    if(plan.mode==='beautify'){originalHash=hash(source);const r=await m.call('ra3map_open_map',{file:source});handle=r.handle;}
    const tools=(await m.listTools()).tools.map(t=>t.name);
    if(!tools.includes('ra3map_get_cell_flags'))throw new Error('工具包版本过旧，请更新含逐格通行性读取的版本。');
    const status=await m.call('ra3map_assets_status');if(!status.gameRoot)throw new Error('没有配置游戏资源；请先在地编设置中选择游戏目录。');
    const catalogs=await Promise.all(['_','OreNode','OilDerrick'].map(query=>m.call('ra3map_list_object_catalog',{query,limit:10000})));
    const catalog=catalogs.flatMap(r=>r.items||[]),canonical=new Map(catalog.map(x=>[x.id.toLowerCase(),x.id]));
    const terrain=(await m.call('ra3map_list_terrain_textures')).textures||[],known=new Map(terrain.map(x=>[x.name.toLowerCase(),x.name]));
    const style=styles[plan.style];for(const n of [...style.trees,...style.shrubs,...style.rocks,'OreNode','OilDerrick'])if(!canonical.has(n.toLowerCase()))throw new Error(`资源目录缺少 ${n}，请选择匹配的风格／MOD。`);
    for(const n of style.textures)if(!known.has(n.toLowerCase()))throw new Error(`当前游戏没有地表贴图 ${n}。`);
    if(plan.mode==='create') {
      fs.mkdirSync(dir,{recursive:true});
      const r=await m.call('ra3map_create_map',{file:output,...plan.map,defaultTexture:known.get(style.textures[3].toLowerCase()),initialHeight:223});handle=r.current||r.opened?.handle;
      if(!handle)throw new Error('新图未返回有效会话。');
      const info=await m.call('ra3map_describe_map',{handle});design=createDesign(plan,info);
      design.textures=design.textures.map(n=>known.get(n.toLowerCase()));
      console.log('阶段 1/3：地形与海岸');
      await m.call('ra3map_apply_terrain_patch',{handle,x0:0,y0:0,width:info.width,height:info.height,
        heightsBase64:design.heightsBase64,texClassBase64:design.texClassBase64,textureNames:design.textures,passabilityBase64:design.passabilityBase64});
      // Preserve the Core's new-map bit defaults. RA3 buildability polarity and
      // actual MCV deployment are separate, unverified gameplay checks.
      // The new-map template already contains a sea. Reuse it instead of drawing two surfaces.
      const water=await m.call('ra3map_get_water',{handle});
      if(water.areas?.length===1)await m.call('ra3map_set_water_area',{handle,index:0,waterHeight:design.water.waterHeight,name:design.water.name});
      else if(!water.areas?.length)await m.call('ra3map_add_water_area',{handle,...design.water});
      else throw new Error('新图出现多片预置水域，请先检查模板。');
      await m.call('ra3map_auto_edge_out_all',{handle,maxCells:info.width*info.height});
      await m.call('ra3map_render_topdown',{handle,scale:2,showObjects:false,saveTo:path.join(dir,'01-terrain.png')});
      console.log('阶段 2/3：出生点、资源与装饰');
      const starts=(await m.call('ra3map_list_objects',{handle,filter:'Waypoint',includeProps:true})).objects||[];
      for(let i=0;i<2;i++){const p=starts.find(o=>o.props?.waypointName===`Player_${i+1}_Start`);if(!p)throw new Error('缺少预置出生点');await m.call('ra3map_move_object',{handle,index:p.index,...design.starts[i],z:0});}
    } else {
      const info=await m.call('ra3map_describe_map',{handle});before=(await m.call('ra3map_list_objects',{handle,limit:100000,includeProps:true})).objects;
      const region=plan.region||{},r=region.radius;
      if(![region.cx,region.cy,r].every(Number.isFinite)||r<4||r>80)throw new Error('无效美化区域。');
      const hm=await m.call('ra3map_get_heightmap',{handle,x0:Math.floor(region.cx-r-1),y0:Math.floor(region.cy-r-1),x1:Math.ceil(region.cx+r+1),y1:Math.ceil(region.cy+r+1),step:1,maxCells:40000});
      if(hm.step!==1)throw new Error('区域高程不能降采样。');
      const flags=await m.call('ra3map_get_cell_flags',{handle,plane:'passability',...hm.rect,maxCells:40000});
      const typeNames=[...new Set(before.map(o=>o.typeName).filter(n=>!n.includes('Waypoint')))];
      const geometry=typeNames.length?(await m.call('ra3map_object_place_info',{typeNames})).place:{};
      const water=await m.call('ra3map_get_water',{handle});design=beautyDesign(plan,info,hm,water,before,flags,geometry);
      fs.mkdirSync(dir,{recursive:true});
      const saved=await m.call('ra3map_save_as',{handle,path:output,backup:true});if(!saved.Ok||!saved.VerifiedRoundTrip)throw new Error('另存或往返验证失败');
      // Close and reopen the COPY; subsequent edits cannot target the original session.
      await m.call('ra3map_close_map',{handle});handle=(await m.call('ra3map_open_map',{file:output})).handle;
      await m.call('ra3map_provision_support_files',{handle,mapPath:output,fromMapPath:source});
      await m.call('ra3map_render_topdown',{handle,scale:2,saveTo:path.join(dir,'01-before.png')});
      console.log('阶段 1/2：仅在副本增加局部装饰');
    }
    design.items=design.items.map(o=>({...o,typeName:canonical.get(o.typeName.toLowerCase())}));
    await m.call('ra3map_batch_place',{handle,items:design.items});
    if(plan.mode==='create'){
      await m.call('ra3map_set_world_info_prop',{handle,name:'mapName',value:String(plan.title||path.basename(dir))});
      await m.call('ra3map_set_world_info_prop',{handle,name:'isScenarioMultiplayer',value:true});
      await m.call('ra3map_set_world_info_prop',{handle,name:'mapDescription',value:'Two-player procedural prototype. Generated with ra3-map-create.'});
    }
    await m.call('ra3map_render_topdown',{handle,scale:2,showWaypointNames:true,saveTo:path.join(dir,'02-layout.png')});
    const saved=await m.call('ra3map_save',{handle,backup:true});if(!saved.Ok||!saved.VerifiedRoundTrip)throw new Error('保存或往返验证失败');
    const xml=await m.call('ra3map_generate_map_xml',{handle});
    if(['dirty','error','failed'].includes(xml.status))throw new Error('map.xml 生成未完成。');
    const preview=await m.call('ra3map_write_preview_tga',{handle,style:plan.style==='snow-valley'?1:0,edge:true,alsoArt:true,artSize:512});
    if(['error','failed'].includes(preview.status))throw new Error('预览 TGA 生成失败；请保留地形，并另行生成预览。');
    for(const name of ['map.xml',path.basename(output,'.map')+'.tga',path.basename(output,'.map')+'_art.tga'])if(!fs.existsSync(path.join(dir,name)))throw new Error('支援文件缺失：'+name);
    if(plan.mode==='create'&&!/IsMultiplayer="true"/.test(fs.readFileSync(path.join(dir,'map.xml'),'utf8')))
      throw new Error('map.xml 未标为多人地图，请保留输出并检查文件名前缀与出生点。');
    await m.call('ra3map_close_map',{handle});handle=(await m.call('ra3map_open_map',{file:output})).handle;
    console.log('最终验收：保存重开、基地、通路、资源');
    report=await validate(m,handle,design.checks||{},before?{preserveObjects:before}:{});
    if(source&&hash(source)!==originalHash)throw new Error('原图校验值发生变化。');
    await m.call('ra3map_render_topdown',{handle,scale:2,saveTo:path.join(dir,'03-final.png'),showObjects:false});
    report={...report,output,sourceUnchanged:source?true:null,summary:design.summary,elapsedMs:Date.now()-started,
      calls:m.trace.length,trace:m.trace,supportFilesVerified:true,visualReviewed:false,gameTested:false};
    fs.writeFileSync(path.join(dir,'validation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    fs.writeFileSync(path.join(dir,'plan.json'),JSON.stringify(plan,null,2)+'\n',{flag:'wx'});
    if(!report.passed)throw new Error(`地图检查未通过：${report.issues.join('；')}`);
    console.log(JSON.stringify({passed:true,validationScope:report.validationScope,buildabilityPolarity:report.buildabilityPolarity,
      gameplayGate:report.gameplayGate,output,objects:report.metrics.objectCount,calls:report.calls,elapsedMs:report.elapsedMs,
      visualReviewed:false,gameTested:false,report:path.join(dir,'validation.json')},null,2));return report;
  } finally {await m.close();}
}
if(require.main===module)run(args(process.argv.slice(2))).catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={run};
