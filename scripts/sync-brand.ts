import {createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

// Keep offline development reproducible; refresh the vendored package in CI.
export async function syncBrand(){
 const sourcesPath='public/assets/vendor/sources.json';
 const sources=JSON.parse(await readFile(sourcesPath,'utf8'));
 const response=await fetch('https://registry.npmjs.org/@amansanoj%2fbrand/latest',{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`Brand registry returned HTTP ${response.status}`);
 const manifest=await response.json() as {name:string;version:string;dist:{tarball:string;integrity:string}};
 if(manifest.name!=='@amansanoj/brand'||!/^\d+\.\d+\.\d+$/.test(manifest.version))throw new Error('Unexpected brand package metadata');
 const compare=(a:string,b:string)=>{const left=a.split('.').map(Number),right=b.split('.').map(Number);return left[0]!-right[0]!||left[1]!-right[1]!||left[2]!-right[2]!;};
 const comparison=compare(manifest.version,sources.brand.version);
 if(comparison<0||(comparison===0&&sources.brand.integrity)){console.log(`Brand ${sources.brand.version} is current`);return;}
 if(!manifest.dist.tarball.startsWith('https://registry.npmjs.org/@amansanoj/brand/-/'))throw new Error('Unexpected brand archive URL');
 const archiveResponse=await fetch(manifest.dist.tarball,{signal:AbortSignal.timeout(30000)});
 if(!archiveResponse.ok)throw new Error(`Brand archive returned HTTP ${archiveResponse.status}`);
 const archive=Buffer.from(await archiveResponse.arrayBuffer());
 const integrity='sha512-'+createHash('sha512').update(archive).digest('base64');
 if(integrity!==manifest.dist.integrity)throw new Error('Brand archive integrity mismatch');
 const folder=await mkdtemp(join(tmpdir(),'portfolio-brand-'));
 try{
  const archivePath=join(folder,'brand.tgz');await writeFile(archivePath,archive);
  const extract=(file:string)=>execFileSync('tar',['-xOf',archivePath,`package/${file}`]);
  const css=extract('globals.css'),tokens=extract('tokens.json');
  JSON.parse(tokens.toString());
  await writeFile('public/assets/vendor/brand-globals.css',css);
  await writeFile('public/assets/vendor/brand-tokens.json',tokens);
  sources.brand={name:manifest.name,version:manifest.version,integrity,source:manifest.dist.tarball};
  await writeFile(sourcesPath,JSON.stringify(sources,null,2)+'\n');
  console.log(`Synced brand ${manifest.version}`);
 }finally{await rm(folder,{recursive:true,force:true});}
}
if(import.meta.main)await syncBrand();
