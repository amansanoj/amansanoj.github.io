import { readdir, readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { marked } from 'marked';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CursorIcon } from '@phosphor-icons/react';
import tokens from '../public/assets/vendor/brand-tokens.json';
await mkdir('public/assets/cursors', { recursive: true });
for (const theme of ['light','dark'] as const) {
  const svg = renderToStaticMarkup(createElement(CursorIcon, { size:28, weight:'duotone', color:tokens.color.hex[theme].base.text }));
  await writeFile(`public/assets/cursors/cursor-${theme}.svg`, svg);
}
const out = 'public/blog';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const posts = [];
for (const entry of (await readdir('posts', { withFileTypes: true })).filter(e => e.isDirectory()).sort((a,b) => b.name.localeCompare(a.name))) {
  const slug = entry.name;
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid post directory: ${slug}`);
  const date = slug.slice(0, 10);
  if (new Date(date).toISOString().slice(0,10) !== date) throw new Error(`Invalid date: ${slug}`);
  const folder = path.join('posts', slug), destination = path.join(out, slug);
  const source = await readFile(path.join(folder, 'README.md'), 'utf8');
  const heading = source.match(/^\s*# ([^\n]+)\n/);
  if (!heading) throw new Error(`Start ${slug}/README.md with # Post Title`);
  const title = heading[1].trim();
  const content = await marked.parse(source.slice(heading[0].length));
  const summaryHtml = content.match(/<p>([\s\S]*?)<\/p>/)?.[1] || '';
  let summary = summaryHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (summary.length > 220) summary = summary.slice(0,217).replace(/\s+\S*$/, '') + '...';
  await mkdir(destination, { recursive: true });
  for (const file of await readdir(folder)) if (!file.startsWith('.') && !['README.md','index.html'].includes(file)) await cp(path.join(folder,file), path.join(destination,file), { recursive: true });
  const files = await readdir(folder);
  const cover = ['cover.jpg','cover.png','cover.webp'].find(name => files.includes(name));
  let dimensions: { width: number; height: number; thumbnailWidth: number; thumbnailHeight: number } | null = null;
  if (cover) {
    const oriented = await sharp(path.join(folder,cover)).rotate().toBuffer();
    const meta = await sharp(oriented).metadata();
    const width = meta.width!, height = meta.height!;
    const thumbnailWidth = Math.max(1,Math.floor(width/4)), thumbnailHeight = Math.max(1,Math.floor(height/4));
    await sharp(oriented).resize(thumbnailWidth,thumbnailHeight).webp({ quality:85 }).toFile(path.join(destination,'thumbnail.webp'));
    await sharp(oriented).resize(1200,630,{ fit:'contain', background: tokens.color.hex.dark.base.primary }).flatten({ background:tokens.color.hex.dark.base.primary }).jpeg({ quality:90 }).toFile(path.join(destination,'og.jpg'));
    dimensions = { width,height,thumbnailWidth,thumbnailHeight };
  }
  posts.push({ slug,title,date,content,summary,cover,dimensions });
}
await mkdir('src/generated', { recursive:true });
await writeFile('src/generated/posts.json', JSON.stringify(posts,null,2));
console.log(`Prepared ${posts.length} posts and cover variants`);
