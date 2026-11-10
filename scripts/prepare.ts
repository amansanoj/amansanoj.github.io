import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { marked } from 'marked';
import { prepareAssets } from './lib/content-images';

type ProjectMetadata = { order?: number; kind?: string; period?: string; stack?: string[]; links?: Array<{label:string;url:string}> };


async function readContent(folder: string) {
  const source = await readFile(path.join(folder,'README.md'),'utf8');
  const heading = source.match(/^\s*# ([^\n]+)\n/);
  if (!heading) throw new Error(`Start ${folder}/README.md with # Project or Post Title`);
  let content = await marked.parse(source.slice(heading[0].length));
  // Reserve space for local images before they load, including animated demos.
  for (const match of [...content.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g)]) {
    const file=path.resolve(folder,match[1]);
    if (!file.startsWith(path.resolve(folder)+path.sep)) continue;
    try {
      const image=await sharp(file).metadata();
      if(image.width&&image.height&&!/\bwidth=/.test(match[0]))content=content.replace(match[0],match[0].replace('<img ',`<img width="${image.width}" height="${image.pageHeight||image.height}" `));
    } catch { /* Remote or unavailable images keep their natural fallback. */ }
  }
  let summary=(content.match(/<p>([\s\S]*?)<\/p>/)?.[1]||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
  if(summary.length>220)summary=summary.slice(0,217).replace(/\s+\S*$/,'')+'...';
  return {title:heading[1].trim(),content,summary};
}

async function directories(folder: string) {
  return (await readdir(folder,{withFileTypes:true})).filter(entry=>entry.isDirectory());
}

await mkdir('src/generated',{recursive:true});
await rm('public/blog',{recursive:true,force:true});
await mkdir('public/blog',{recursive:true});
const posts=[];
for (const entry of (await directories('posts')).sort((a,b)=>b.name.localeCompare(a.name))) {
  const slug=entry.name;
  if(!/^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error(`Invalid post directory: ${slug}`);
  const date=slug.slice(0,10);
  if(new Date(date).toISOString().slice(0,10)!==date)throw new Error(`Invalid date: ${slug}`);
  const folder=path.join('posts',slug);
  posts.push({slug,date,...await readContent(folder),...await prepareAssets(folder,path.join('public/blog',slug))});
}
await writeFile('src/generated/posts.json',JSON.stringify(posts,null,2));

await rm('public/projects',{recursive:true,force:true});
await mkdir('public/projects',{recursive:true});
const projects=[];
for(const entry of await directories('projects')) {
  const slug=entry.name;
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error(`Invalid project directory: ${slug}`);
  const folder=path.join('projects',slug);
  let metadata: ProjectMetadata={};
  try { metadata=JSON.parse(await readFile(path.join(folder,'project.json'),'utf8')); }
  catch(error) { if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error; }
  for(const key of ['kind','period'] as const)if(metadata[key]!==undefined&&typeof metadata[key]!=='string')throw new Error(`${slug}: ${key} must be text`);
  if(metadata.order!==undefined&&(!Number.isFinite(metadata.order)))throw new Error(`${slug}: order must be a number`);
  if(metadata.stack&&(!Array.isArray(metadata.stack)||metadata.stack.some(item=>typeof item!=='string')))throw new Error(`${slug}: stack must be an array of strings`);
  if(metadata.links&&(!Array.isArray(metadata.links)||metadata.links.some(link=>typeof link.label!=='string'||!link.label.trim()||typeof link.url!=='string'||! /^(https:\/\/|\/(?!\/))/.test(link.url))))throw new Error(`${slug}: links require a label and HTTPS or site-relative URL`);
  projects.push({slug,...await readContent(folder),...await prepareAssets(folder,path.join('public/projects',slug)),kind:metadata.kind||'',period:metadata.period||'',stack:metadata.stack||[],links:metadata.links||[],order:metadata.order??1000});
}
projects.sort((a,b)=>a.order-b.order||a.title.localeCompare(b.title));
await writeFile('src/generated/projects.json',JSON.stringify(projects,null,2));
console.log(`Prepared ${posts.length} posts and ${projects.length} projects with image variants`);
