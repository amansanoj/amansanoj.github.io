import { renderToString } from 'react-dom/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { App, posts, route } from '../src/App';
const template=await readFile('dist/index.html','utf8');
const origin='https://amansanoj.is-a.dev';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
for(const path of ['/','/blog/','/404.html',...posts.map(p=>`/blog/${p.slug}/`)]){
 const page=route(path),post=page.post;
 const title=post?`${post.title} - Aman Sanoj`:page.home?'Aman Sanoj':page.list?'Blog - Aman Sanoj':'Page Not Found - Aman Sanoj';
 const description=post?.summary||(page.home?'Aman Sanoj develops macOS apps, web applications, and ESP32 firmware. Explore Macro Pad, Tether, NeonOS, and Cardputer Now Playing.':'Posts on software, electronics, and self-hosting by Aman Sanoj.');
 let meta=`<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="${post?'article':'website'}"><meta property="og:url" content="${origin}${path}">`;
 if(path==='/404.html')meta+='<meta name="robots" content="noindex">';else meta+=`<link rel="canonical" href="${origin}${path}">`;
 if(post?.cover)meta+=`<meta property="og:image" content="${origin}${path}og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/jpeg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${origin}${path}og.jpg">`;
 const html=template.replace('<!--page-meta-->',meta).replace('<div id="root"></div>',`<div id="root">${renderToString(<App path={path}/>)}</div>`);
 const target=path.endsWith('.html')?`dist${path}`:`dist${path}index.html`;
 await mkdir(target.slice(0,target.lastIndexOf('/')),{recursive:true});await writeFile(target,html);
}
console.log(`Prerendered ${posts.length+3} static pages`);
