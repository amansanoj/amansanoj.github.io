import { test,expect } from '@playwright/test';
for(const width of [390,1440])test(`theme, hydration, dialog, blog and 404 at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(message.text());});
 await page.goto('/');await expect(page.getByRole('heading',{name:'Aman Sanoj',exact:true})).toBeVisible();
 for(const mode of ['dark','light','dark']){await page.locator('#theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme',mode);await expect(page.locator('html')).not.toHaveAttribute('data-magicui-theme-vt','active');}
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:/Enlarge image/}).first().click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 await dialog.locator('img').first().evaluate(async(image:HTMLImageElement)=>image.decode());const lens=dialog.getByRole('region',{name:/Magnify:/});await lens.hover();await expect(lens.locator('img')).toHaveCount(2);await lens.focus();await page.keyboard.press('ArrowRight');await expect(lens.locator('[style*="scale(1.3)"]')).toHaveCount(1);await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 await page.goto('/blog/');const links=page.locator('.post-entry h2 a');expect(await links.count()).toBeGreaterThan(0);await links.first().click();await expect(page.locator('.post-body')).toBeVisible();await expect(page.locator('.reading-progress')).toHaveCount(1);
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await expect(page.locator('.rough-annotation').first()).toBeAttached();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.goto('/404.html');await page.locator('summary').click();await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Resume',exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});

test('highlights stay attached through magnetic movement, scrolling and reflow',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/blog/');await page.locator('.post-entry h2 a').first().click();
 await page.evaluate(()=>document.fonts.ready);
 const strong=page.locator('.post-body strong').first();
 await strong.evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
 await expect(page.locator('.rough-annotation path').first()).toBeAttached();
 await page.waitForTimeout(700);
 const alignment=()=>strong.evaluate(element=>{
  const text=element.getBoundingClientRect();
  const marker=element.closest('.highlight-host')!.querySelector('path')!.getBoundingClientRect();
  return {dx:marker.x-text.x,dy:marker.y-text.y,width:marker.width,height:marker.height};
 });
 const baseline=await alignment();expect(Math.abs(baseline.dx)).toBeLessThan(15);expect(Math.abs(baseline.dy)).toBeLessThan(20);
 const text=await strong.boundingBox();
 for(const point of [{x:text!.x+text!.width,y:text!.y+10},{x:text!.x-50,y:text!.y+20},{x:10,y:10}]){
  await page.mouse.move(point.x,point.y);await page.waitForTimeout(250);
  const current=await alignment();expect(Math.abs(current.dx-baseline.dx)).toBeLessThan(2);expect(Math.abs(current.dy-baseline.dy)).toBeLessThan(2);
 }
 await page.evaluate(()=>scrollBy({top:100,behavior:'instant'}));await page.waitForTimeout(200);
 const scrolled=await alignment();expect(Math.abs(scrolled.dy-baseline.dy)).toBeLessThan(2);
 await page.setViewportSize({width:390,height:900});await strong.evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForTimeout(700);
 const resized=await alignment();expect(Math.abs(resized.dx)).toBeLessThan(15);expect(Math.abs(resized.dy)).toBeLessThan(20);
});

test('theme defaults to the system, toggles only light/dark and respects reduced motion',async({page})=>{
 await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await expect(page.locator('.theme-dark')).toBeVisible();await expect(page.locator('.theme-system')).toHaveCount(0);
 await page.emulateMedia({colorScheme:'light'});await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.locator('#theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await expect(page.locator('html')).not.toHaveAttribute('data-magicui-theme-vt','active');
 await page.emulateMedia({colorScheme:'dark'});await page.emulateMedia({colorScheme:'light'});await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>Object.defineProperty(document,'startViewTransition',{value:undefined,configurable:true}));
 await page.locator('#theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');await expect(page.locator('.theme-light')).toBeVisible();
 await expect(page.locator('html')).not.toHaveAttribute('data-magicui-theme-vt','active');
});

test('bottom blur remains unchanged while the theme wipe is in flight',async({page})=>{
 await page.setViewportSize({width:1000,height:800});
 await page.addInitScript(()=>{
  const animate=Element.prototype.animate;
  Element.prototype.animate=function(keyframes,options){
   const themeWipe=typeof options==='object'&&options?.pseudoElement==='::view-transition-new(root)';
   const animation=animate.call(this,keyframes,themeWipe?{...options,duration:10000}:options);
   if(themeWipe){animation.pause();animation.currentTime=80;}
   return animation;
  };
 });
 await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 await page.locator('.screenshot img').evaluate(async(image:HTMLImageElement)=>image.decode());
 await expect(page.locator('.bottom-blur')).toHaveClass(/is-visible/);
 const clip={x:0,y:744,width:1000,height:56};
 const before=await page.screenshot({clip});
 // Isolate the wipe from magnetic motion triggered by moving the mouse.
 await page.locator('#theme').evaluate((button:HTMLButtonElement)=>button.click());
 await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement,'::view-transition-group(theme-edge-blur-7)').backdropFilter)).toBe('blur(8px)');
 // Let the named backdrop layers reach the compositor while the wipe stays paused.
 await page.waitForTimeout(100);
 const during=await page.screenshot({clip});
 const {default:sharp}=await import('sharp');
 expect((await sharp(before).raw().toBuffer()).equals(await sharp(during).raw().toBuffer())).toBe(true);
 await page.evaluate(()=>document.getAnimations().forEach(animation=>animation.finish()));
 await expect(page.locator('html')).not.toHaveAttribute('data-magicui-theme-vt','active');
 await expect(page.locator('[style*="view-transition-name: theme-edge-blur"]')).toHaveCount(0);
});

test('bottom blur fades continuously toward the footer and reverses on scroll up',async({page})=>{
 await page.setViewportSize({width:1000,height:800});await page.goto('/');
 const strength=()=>page.locator('.bottom-blur > div').first().evaluate(element=>Number(getComputedStyle(element).opacity));
 const scrollToFraction=async(fraction:number)=>{
  await page.evaluate(fraction=>{const footer=document.querySelector('footer')!;const rect=footer.getBoundingClientRect();const distance=Math.min(300,rect.height+100);const target=innerHeight-rect.height+distance*fraction;scrollTo({top:scrollY+rect.top-target,behavior:'instant'});},fraction);
  await page.waitForTimeout(80);
  return strength();
 };
 const values=[];for(const fraction of [1,.75,.5,.25,0])values.push(await scrollToFraction(fraction));
 expect(values[0]).toBeCloseTo(1,1);expect(values[4]).toBeCloseTo(0,1);
 for(let i=1;i<values.length;i++)expect(values[i]).toBeLessThan(values[i-1]);
 for(const [index,fraction] of [0,.25,.5,.75,1].entries())expect(await scrollToFraction(fraction)).toBeCloseTo(values[4-index],1);
 await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await page.waitForTimeout(80);expect(await strength()).toBe(0);
});

test('thumbnail opens the original image and supports touch lens dragging',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4173/blog/');await page.locator('.post-cover-link').first().tap();
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 const lens=dialog.getByRole('region',{name:/Magnify:/});await expect(lens).toBeVisible();await expect(lens.locator('img')).toHaveCount(2);
 await expect(lens.locator('img').first()).toHaveAttribute('src',/\/cover\.(jpg|png|webp)$/);
 const mask=lens.locator('[style*="mask-image"]').first();const before=await mask.evaluate(e=>getComputedStyle(e).maskImage);
 const rect=await lens.boundingBox();const x=rect!.x+rect!.width*.5,y=rect!.y+rect!.height*.5;
 const cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+30,y:y+20}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(()=>mask.evaluate(e=>getComputedStyle(e).maskImage)).not.toBe(before);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await expect(page.locator('.magnify-pointer')).toHaveCount(0);
 await page.getByRole('button',{name:'Close',exact:true}).tap();await expect(dialog).toHaveCount(0);await context.close();
});

test('only the dialog Lens magnifies images, with no legacy click zoom or hint',async({page})=>{
 await page.goto('/');const trigger=page.locator('.image-view-trigger').first();
 await trigger.hover();await expect(page.getByRole('region',{name:/Magnify:/})).toHaveCount(0);
 expect(await trigger.evaluate(e=>getComputedStyle(e).cursor)).toBe('zoom-in');await expect(page.locator('.magnify-pointer')).toHaveCount(0);
 await trigger.click();const dialog=page.getByRole('dialog');
 const lens=dialog.getByRole('region',{name:/Magnify:/});await expect(lens).toBeVisible();
 await expect(dialog.locator('.viewer-zoom,.viewer-help')).toHaveCount(0);
 await expect(dialog.getByText('Hover to magnify, drag on touch screens, or focus the image and use arrow keys.')).toHaveCount(0);
 const base=lens.locator('img').first();await base.evaluate(async(image:HTMLImageElement)=>image.decode());
 const before=await base.boundingBox();await lens.click();const after=await base.boundingBox();
 expect(after!.width).toBeCloseTo(before!.width,0);expect(after!.height).toBeCloseTo(before!.height,0);
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
});

test('native cursors remain in both themes with zoom-in only on image triggers',async({page})=>{
 for(const theme of ['light','dark']){
  await page.goto('/');await page.evaluate(theme=>localStorage.setItem('theme',theme),theme);await page.reload();
  expect(await page.locator('html').evaluate(e=>getComputedStyle(e).cursor)).toBe('auto');
  expect(await page.locator('#theme').evaluate(e=>getComputedStyle(e).cursor)).toBe('pointer');
  expect(await page.locator('.image-view-trigger').first().evaluate(e=>getComputedStyle(e).cursor)).toBe('zoom-in');
  await expect(page.locator('.magnify-pointer')).toHaveCount(0);
 }
});

test('covered blog entries align across screen widths and image proportions',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/blog/');await page.evaluate(()=>document.fonts.ready);
 const card=page.locator('.post-entry.has-cover').first();
 for(const width of [240,280,319,320,350,351,360,375,390,414,430,550,640,641,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});
  for(const [w,h] of [[270,337],[400,225],[300,300],[100,400],[400,100]]){
   await card.locator('img').evaluate(async(element:HTMLImageElement,{w,h})=>{
    element.width=w;element.height=h;element.src='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"/>`);await element.decode();
   },{w,h});
   const box=await card.evaluate(element=>{
    const rect=(selector:string)=>{const r=element.querySelector(selector)!.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
    const r=element.getBoundingClientRect();return {card:{x:r.x,y:r.y,width:r.width},image:rect('.post-cover-link'),title:rect('h2'),date:rect('.post-date'),summary:rect('.post-summary'),text:rect('.post-entry-text'),heading:rect('.post-entry-heading'),overflow:document.documentElement.scrollWidth>innerWidth,fit:getComputedStyle(element.querySelector('img')!).objectFit};
   });
   expect(box.overflow,`${width}px ${w}x${h}`).toBe(false);expect(box.fit).toBe('contain');expect(box.image.height).toBeLessThanOrEqual(180);
   if(width<=640){
    expect(Math.abs(box.date.x-box.title.x)).toBeLessThan(1);expect(box.date.y+box.date.height).toBeLessThanOrEqual(box.title.y);expect(Math.abs(box.summary.x-box.card.x)).toBeLessThan(1);expect(box.summary.width).toBeCloseTo(box.card.width,0);
    if(width>=320){expect(box.title.x-box.image.x-box.image.width).toBeCloseTo(16,0);expect(Math.abs(box.image.y+box.image.height/2-box.heading.y-box.heading.height/2)).toBeLessThan(1);}
    else {expect(Math.abs(box.image.x-box.card.x)).toBeLessThan(1);expect(box.title.y).toBeGreaterThanOrEqual(box.image.y+box.image.height);}
   }else expect(Math.abs(box.image.y+box.image.height/2-box.text.y-box.text.height/2)).toBeLessThan(1);
  }
 }
});

test('project directory and detail pages work across screen sizes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const slugs=['macro-pad','tether','neon-os','cardputer-now-playing','gardenx','falak-academy','terminal-portfolio','nanolink','ui-components'];
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto('/projects/');
  await expect(page.locator('h1')).toHaveText('Projects');
  await expect(page.locator('.post-entry h2 a')).toHaveCount(slugs.length);
  await expect(page.locator('header nav a[href="/projects/"]')).toHaveAttribute('aria-current','page');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  for(const slug of slugs){
   await page.goto(`/projects/${slug}/`);
   await expect(page.locator('.project-body')).toBeVisible();
   await expect(page.locator('.project-resources a').first()).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
   const emphasis=page.locator('.project-body strong').first();
   await emphasis.scrollIntoViewIfNeeded();
   await expect(page.locator('.rough-annotation').first()).toBeAttached();
   const markerWidth=await page.locator('.rough-annotation').first().evaluate(element=>element.getBoundingClientRect().width);
   expect(markerWidth).toBeGreaterThan(0);
   expect(markerWidth).toBeLessThanOrEqual(1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  }
 }
 await page.goto('/projects/macro-pad/');
 await page.getByRole('button',{name:/Enlarge image/}).first().click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('blog and project covers preserve 4:5 and 4:3 layouts without cropping',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const path of ['/blog/2026-11-09-the-emudhra-certificate-compromise-why-updating-your-browser-isnt-enough/','/projects/macro-pad/']){
  for(const width of [320,390,640,768,1440]){
   await page.setViewportSize({width,height:900});await page.goto(path);
   for(const [w,h] of [[800,1000],[800,600]]){
    const cover=page.locator('.post-cover');
    await cover.evaluate(async(element:HTMLImageElement,{w,h})=>{element.width=w;element.height=h;element.src='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"/>`);await element.decode();},{w,h});
    const box=await cover.evaluate(image=>{const r=image.getBoundingClientRect();const main=document.querySelector('main')!.getBoundingClientRect();return {width:r.width,height:r.height,center:r.x+r.width/2,mainCenter:main.x+main.width/2,fit:getComputedStyle(image).objectFit,overflow:document.documentElement.scrollWidth>innerWidth};});
    expect(box.width/box.height).toBeCloseTo(w/h,2);
    expect(box.height).toBeLessThanOrEqual(640);
    expect(Math.abs(box.center-box.mainCenter)).toBeLessThan(1);
    expect(box.fit).toBe('contain');expect(box.overflow).toBe(false);
   }
  }
 }
});

test('homepage links meet AA contrast in both themes, including hover',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 for(const theme of ['light','dark']){
  await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;document.documentElement.classList.toggle('dark',theme==='dark');},theme);
  const links=page.locator('.site-shell a:not(.skip)');
  for(let index=0;index<await links.count();index++){
   const link=links.nth(index);
   for(const hover of [false,true]){
    if(hover)await link.hover();else await page.mouse.move(0,0);
    const result=await link.evaluate(element=>{
     const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d')!;
     const luminance=(color:string)=>{context.fillStyle=color;context.fillRect(0,0,1,1);const channels=context.getImageData(0,0,1,1).data;return [.2126,.7152,.0722].reduce((sum,weight,index)=>{const c=channels[index]/255;return sum+weight*(c<=.04045?c/12.92:((c+.055)/1.055)**2.4);},0);};
     const text=luminance(getComputedStyle(element).color),background=luminance(getComputedStyle(document.body).backgroundColor);
     return {text:element.textContent,ratio:(Math.max(text,background)+.05)/(Math.min(text,background)+.05)};
    });
    expect(result.ratio,`${theme} ${result.text} ${hover?'hover':'default'}`).toBeGreaterThanOrEqual(4.5);
   }
  }
 }
});

test('emphasis draws one bright marker stroke per line and keeps text readable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const theme of ['light','dark']){
  await page.goto('/projects/tether/');
  await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;document.documentElement.classList.toggle('dark',theme==='dark');},theme);
  const strong=page.locator('.post-body strong').first();await strong.scrollIntoViewIfNeeded();
  await expect(page.locator('.rough-annotation').first()).toBeAttached();
  const marker=await strong.evaluate(element=>{
   const host=element.closest('.highlight-host')!,svg=host.querySelector('svg')!;
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const context=canvas.getContext('2d')!;
   const rgb=(color:string)=>{context.fillStyle=color;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].slice(0,3);};
   const foreground=rgb(getComputedStyle(element).color),background=rgb(getComputedStyle(document.body).backgroundColor),color=rgb(getComputedStyle(svg.querySelector('path')!).stroke),opacity=Number(getComputedStyle(svg).opacity);
   const lum=(values:number[])=>values.reduce((sum,value,index)=>{const c=value/255;return sum+[.2126,.7152,.0722][index]*(c<=.04045?c/12.92:((c+.055)/1.055)**2.4);},0);
   const text=lum(foreground),fill=lum(background.map((value,index)=>value*(1-opacity)+color[index]*opacity));
   return {paths:svg.querySelectorAll('path').length,lines:element.getClientRects().length,opacity,stroke:svg.querySelector('path')!.getAttribute('stroke'),contrast:(Math.max(text,fill)+.05)/(Math.min(text,fill)+.05)};
  });
  expect(marker.paths).toBe(marker.lines);
  expect(marker.stroke).toBe('var(--secondary-200)');
  expect(marker.opacity).toBe(theme==='light'?.85:.45);
  expect(marker.contrast).toBeGreaterThanOrEqual(4.5);
 }
});
