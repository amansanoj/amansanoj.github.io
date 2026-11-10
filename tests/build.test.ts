import { test, expect } from 'bun:test';
import { readFile, access } from 'node:fs/promises';
import sharp from 'sharp';
import posts from '../src/generated/posts.json';
import tokens from '../public/assets/vendor/brand-tokens.json';

test('every Markdown post has a static, readable URL and sharing metadata',async()=>{
 for(const post of posts){
  const html=await readFile(`dist/blog/${post.slug}/index.html`,'utf8');
  expect(html).toContain('<div class="post-body">');
  expect(html).toContain(`<time class="post-date" dateTime="${post.date}"`);
  expect(html).toContain('<meta property="og:type" content="article">');
  expect(html).toContain('All Posts');
  expect(html.match(/<strong>/g)?.length).toBe(post.content.match(/<strong>/g)?.length);
 }
});
test('covers keep quarter-size thumbnails and centered social images',async()=>{
 for(const post of posts.filter(post=>post.cover)){
  const input=await sharp(`posts/${post.slug}/${post.cover}`).rotate().toBuffer();
  const original=await sharp(input).metadata();
  const thumbnail=await sharp(`dist/blog/${post.slug}/thumbnail.webp`).metadata();
  expect(thumbnail.width).toBe(Math.max(1,Math.floor(original.width!/4)));
  expect(thumbnail.height).toBe(Math.max(1,Math.floor(original.height!/4)));
  const og=sharp(`dist/blog/${post.slug}/og.jpg`);
  const meta=await og.metadata();expect(meta.width).toBe(1200);expect(meta.height).toBe(630);
  if(original.width!/original.height! !== 1200/630){
   const pixel=await og.extract({left:0,top:0,width:1,height:1}).raw().toBuffer();
   const hex=tokens.color.hex.dark.base.primary;
   for(let i=0;i<3;i++)expect(Math.abs(pixel[i]-parseInt(hex.slice(1+i*2,3+i*2),16))).toBeLessThanOrEqual(3);
  }
 }
});
test('homepage, 404, verification files and custom domain survive deployment',async()=>{
 const home=await readFile('dist/index.html','utf8');expect(home).toContain('I write software');expect(home).toContain('<h2 id="projects-title">Projects</h2>');
 const missing=await readFile('dist/404.html','utf8');expect(missing).toContain('Page Not Found');expect(missing).toContain('game-court');expect(missing).toContain('noindex');
 for(const file of ['CNAME','.nojekyll','google8640e0dd51c3c37e.html'])await access(`dist/${file}`);
 expect(await readFile('dist/CNAME','utf8')).toBe(await readFile('public/CNAME','utf8'));
});

test('all projects have readable static pages, navigation, resources and sharing images',async()=>{
 const {default:projects}=await import('../src/generated/projects.json');
 const directory=await readFile('dist/projects/index.html','utf8');
 const home=await readFile('dist/index.html','utf8');
 expect(projects.length).toBeGreaterThanOrEqual(9);
 for(const project of projects){
  const url=`/projects/${project.slug}/`;
  expect(directory).toContain(`href="${url}"`);
  const html=await readFile(`dist${url}index.html`,'utf8');
  expect(html).toContain(`<h1>${project.title}</h1>`);
  expect(html).toContain('class="post-body project-body"');
  expect(html).toContain(`<link rel="canonical" href="https://amansanoj.is-a.dev${url}">`);
  expect(html).toContain('href="/projects/" aria-current="page"');
  for(const link of project.links)expect(html).toContain(link.url.replace(/&/g,'&amp;'));
  if(project.cover){
   const thumbnail=await sharp(`dist${url}thumbnail.webp`).metadata();
   expect(thumbnail.width).toBe(project.dimensions!.thumbnailWidth);
   expect(thumbnail.height).toBe(project.dimensions!.thumbnailHeight);
   const og=await sharp(`dist${url}og.jpg`).metadata();
   expect([og.width,og.height]).toEqual([1200,630]);
   expect(html).toContain(`https://amansanoj.is-a.dev${url}og.jpg`);
  }
 }
 expect(home).toContain('href="/projects/macro-pad/"');
 expect(home).toContain('All Projects');
});

test('homepage shows three selected projects and current education',async()=>{
 const html=await readFile('dist/index.html','utf8');
 const selection=html.split('id="projects"')[1].split('id="about"')[0];
 expect(selection.match(/<article /g)?.length).toBe(3);
 expect(selection).not.toContain('Other Projects');
 for(const name of ['Terminal Portfolio','NanoLink','UI Components','Cardputer Now Playing'])expect(selection).not.toContain(name);
 expect(selection).toContain('All Projects');
 expect(html).toContain('University of Wollongong in Dubai');
 expect(html).toContain('Bachelor of Computer Science, Cyber Security');
 expect(html).toContain('September 2026 - 2029');
 expect(html).toContain('GEMS Our Own Indian School');
 const navigation=html.split('aria-label="Main navigation"')[1].split('</nav>')[0];
 expect(navigation.indexOf('>About<')).toBeLessThan(navigation.indexOf('>Projects<'));
 expect(navigation.indexOf('>Projects<')).toBeLessThan(navigation.indexOf('>Blog<'));
});

test('shared cover processing preserves 4:5 and 4:3 originals and creates thumbnails and OG images',async()=>{
 const {prepareAssets}=await import('../scripts/lib/content-images');
 const {mkdtemp,mkdir,rm}=await import('node:fs/promises');
 const {tmpdir}=await import('node:os');
 const {join}=await import('node:path');
 const root=await mkdtemp(join(tmpdir(),'portfolio-covers-'));
 try{
  for(const [width,height] of [[800,1000],[800,600]]){
   const source=join(root,`${width}-${height}`),destination=join(root,`${width}-${height}-output`);
   await mkdir(source);
   const original=await sharp({create:{width,height,channels:3,background:{r:25,g:100,b:180}}}).jpeg().toBuffer();
   await Bun.write(join(source,'cover.jpg'),original);
   const result=await prepareAssets(source,destination);
   expect(result.dimensions).toEqual({width,height,thumbnailWidth:width/4,thumbnailHeight:height/4});
   expect((await readFile(join(source,'cover.jpg'))).equals(original)).toBe(true);
   expect((await readFile(join(destination,'cover.jpg'))).equals(original)).toBe(true);
   const thumb=await sharp(join(destination,'thumbnail.webp')).metadata();
   expect([thumb.width,thumb.height]).toEqual([width/4,height/4]);
   const og=sharp(join(destination,'og.jpg'));
   const info=await og.metadata();expect([info.width,info.height]).toEqual([1200,630]);
   const corner=await og.clone().extract({left:0,top:0,width:1,height:1}).raw().toBuffer();
   const primary=tokens.color.hex.dark.base.primary;
   for(let i=0;i<3;i++)expect(Math.abs(corner[i]-parseInt(primary.slice(1+i*2,3+i*2),16))).toBeLessThanOrEqual(3);
   const center=await og.clone().extract({left:600,top:315,width:1,height:1}).raw().toBuffer();
   for(const [i,value] of [25,100,180].entries())expect(Math.abs(center[i]-value)).toBeLessThanOrEqual(3);
  }
 }finally{await rm(root,{recursive:true,force:true});}
});

test('every prerendered page links to existing local routes, images and anchors',async()=>{
 const {readdir}=await import('node:fs/promises');
 const {join,relative}=await import('node:path');
 const files=await readdir('dist',{recursive:true});
 for(const file of files.filter(file=>file.endsWith('.html'))){
  const html=await readFile(join('dist',file),'utf8');
  const pageUrl=new URL(file,'https://portfolio.test/');
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
   const url=new URL(match[1].replace(/&amp;/g,'&'),pageUrl);
   if(url.origin!==pageUrl.origin)continue;
   const path=decodeURIComponent(url.pathname);
   const target=join('dist',path.endsWith('/')?`${path}index.html`:path);
   try { await access(target); } catch { throw new Error(`${file}: missing local target ${match[1]}`); }
   if(url.hash&&target.endsWith('.html')){
    const destination=await readFile(target,'utf8');
    expect(destination,`${relative('dist',target)}: ${url.hash}`).toContain(`id="${decodeURIComponent(url.hash.slice(1))}"`);
   }
  }
 }
});
