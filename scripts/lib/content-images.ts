import { readdir, mkdir, cp } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import tokens from '../../public/assets/vendor/brand-tokens.json';

type Dimensions = { width: number; height: number; thumbnailWidth: number; thumbnailHeight: number };

export async function prepareAssets(folder: string, destination: string) {
  await mkdir(destination, { recursive: true });
  const files = await readdir(folder);
  for (const file of files) {
    if (!file.startsWith('.') && !['README.md','index.html','project.json'].includes(file)) {
      await cp(path.join(folder,file), path.join(destination,file), { recursive:true });
    }
  }
  const cover = ['cover.jpg','cover.png','cover.webp'].find(name => files.includes(name));
  let dimensions: Dimensions | null = null;
  if (cover) {
    const oriented = await sharp(path.join(folder,cover)).rotate().toBuffer();
    const metadata = await sharp(oriented).metadata();
    const width=metadata.width!, height=metadata.height!;
    const thumbnailWidth=Math.max(1,Math.floor(width/4)), thumbnailHeight=Math.max(1,Math.floor(height/4));
    await sharp(oriented).resize(thumbnailWidth,thumbnailHeight).webp({quality:85}).toFile(path.join(destination,'thumbnail.webp'));
    await sharp(oriented).resize(1200,630,{fit:'contain',background:tokens.color.hex.dark.base.primary}).flatten({background:tokens.color.hex.dark.base.primary}).jpeg({quality:90}).toFile(path.join(destination,'og.jpg'));
    dimensions={width,height,thumbnailWidth,thumbnailHeight};
  }
  return {cover,dimensions};
}

