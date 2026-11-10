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
 const home=await readFile('dist/index.html','utf8');expect(home).toContain('I write software');expect(home).toContain('Selected Projects');
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
