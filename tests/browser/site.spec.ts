import { test,expect } from '@playwright/test';
for(const width of [390,1440])test(`theme, hydration, dialog, blog and 404 at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(message.text());});
 await page.goto('/');await expect(page.getByRole('heading',{name:'Aman Sanoj',exact:true})).toBeVisible();
 for(const mode of ['light','dark','system']){await page.locator('#theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme',mode);await expect(page.locator('html')).not.toHaveAttribute('data-magicui-theme-vt','active');}
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','system');
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

test('theme wipe respects reduced motion, browser support and live system mode',async({page})=>{
 await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});await page.goto('/');
 await page.locator('#theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.locator('#theme').click();await expect(page.locator('html')).toHaveClass('dark');
 await expect(page.locator('html')).not.toHaveAttribute('data-magicui-theme-vt','active');
 await page.locator('#theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme','system');
 await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('html')).toHaveClass('dark');
 await page.emulateMedia({colorScheme:'light'});await expect(page.locator('html')).not.toHaveClass('dark');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>Object.defineProperty(document,'startViewTransition',{value:undefined,configurable:true}));
 await page.locator('#theme').click();await page.locator('#theme').click();await expect(page.locator('html')).toHaveClass('dark');
 await expect(page.locator('html')).not.toHaveAttribute('data-magicui-theme-vt','active');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
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
 await page.locator('#theme').click();await page.locator('#theme').click();
 await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.documentElement,'::view-transition-group(theme-edge-blur-7)').backdropFilter)).toBe('blur(8px)');
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
