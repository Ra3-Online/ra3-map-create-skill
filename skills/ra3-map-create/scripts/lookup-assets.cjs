'use strict';
// Read a small, explicitly filtered slice of the portable observation index.
const fs=require('node:fs'),path=require('node:path');
function lookup(argv,document){
 const args={};for(let i=0;i<argv.length;i+=2){const k=argv[i];if(!['--case','--category','--search','--kind','--limit','--include-supplements'].includes(k)||argv[i+1]===undefined)throw Error('Use --case, --category, --search, --kind objects|materials|environment, --limit 1..30, --include-supplements true|false');args[k.slice(2)]=argv[i+1];}
 const kind=args.kind||'objects',limit=Number(args.limit||12);if(!['objects','materials','environment'].includes(kind)||!Number.isInteger(limit)||limit<1||limit>30)throw Error('Invalid kind or limit');
 if(args['include-supplements']!==undefined&&!['true','false'].includes(args['include-supplements']))throw Error('include-supplements must be true or false');
 const includeSupplements=args['include-supplements']==='true',cases=new Map(document.cases.map(c=>[c.id,c]));
 const ids=args.case?args.case.split(','):[];for(const id of ids)if(!cases.has(id))throw Error('Unknown case '+id);
 if(kind==='environment'){if(!ids.length||args.category||args.search)throw Error('Environment lookup requires --case and does not use --category/--search');const allowed=c=>includeSupplements||['campaign-source-example','challenge-collection-example'].includes(c.sourceClass);const selected=ids.map(id=>cases.get(id)).filter(c=>c.environment&&allowed(c));return {kind,total:selected.length,returned:Math.min(selected.length,limit),truncated:selected.length>limit,results:selected.slice(0,limit).map(c=>({case:c.id,title:c.title,sourceClass:c.sourceClass,atlas:c.atlas,observed:c.environment})),missing:ids.filter(id=>!cases.get(id).environment),excluded:ids.filter(id=>!allowed(cases.get(id)))};}
 if(!ids.length&&!args.category&&!args.search)return {instructions:'Choose a case, category or object/material search. The index is observation evidence, not proof of correct usage.',categories:document.categories};
 if(args.category&&!Object.hasOwn(document.categories,args.category))throw Error('Unknown category '+args.category);
 const q=(args.search||'').toLowerCase(),official=id=>['campaign-source-example','challenge-collection-example'].includes(cases.get(id)?.sourceClass);
 const rows=document[kind].filter(r=>(!args.category||r.category===args.category)&&(!q||[r.id,r.name,r.editorName,...(r.searchNames||[])].filter(Boolean).join(' ').toLowerCase().includes(q)))
  .map(r=>({...r,selectedCases:r.evidenceCases.filter(id=>(!ids.length||ids.includes(id))&&(includeSupplements||official(id)))}))
  .filter(r=>r.selectedCases.length&&(kind!=='objects'||r.currentCatalogEntryPresent));
 return {kind,total:rows.length,returned:Math.min(rows.length,limit),truncated:rows.length>limit,
  warning:'These are observed candidates. Query current mounted resources, inspect the visible model/texture and read the relevant style/use card before placement. Challenge files can be community versions of official scenes.',
  results:rows.slice(0,limit).map(r=>kind==='objects'?{id:r.id,editorName:r.editorName,category:r.category,nativeModel:r.nativeModel,modelAppearanceVerified:r.modelAppearanceVerified,
   evidence:r.selectedCases.slice(0,5).map(id=>({case:id,title:cases.get(id).title,sourceClass:cases.get(id).sourceClass,atlas:cases.get(id).atlas})),
   placements:r.placements.filter(p=>r.selectedCases.includes(p.case)).slice(0,2),useGuide:'../references/asset-use.md'}:
   {name:r.name,availableInSample:r.availableInSample,visibleUseVerified:r.visibleUseVerified,evidence:r.selectedCases.slice(0,5).map(id=>({case:id,atlas:cases.get(id).atlas})),warning:r.warning})};
}
if(require.main===module){try{const d=JSON.parse(fs.readFileSync(path.join(__dirname,'../references/observed-assets.json'),'utf8'));console.log(JSON.stringify(lookup(process.argv.slice(2),d),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={lookup};
