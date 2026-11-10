import { test,expect } from '@playwright/test';
for(const width of [390,1440])test(`theme, hydration, dialog, blog and 404 at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('Failed to load resource'))errors.push(message.text());});
 await page.goto('/');await expect(page.getByRole('heading',{name:'Aman Sanoj',exact:true})).toBeVisible();
 for(const mode of ['light','dark','system']){await page.locator('#theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme',mode);}
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','system');
 await page.getByRole('button',{name:/Enlarge image/}).first().click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 await dialog.locator('img').evaluate(async(image:HTMLImageElement)=>image.decode());const before=await dialog.locator('img').boundingBox();await page.getByRole('button',{name:'Zoom In',exact:true}).click();const after=await dialog.locator('img').boundingBox();expect(after!.width).toBeCloseTo(before!.width*2,0);await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
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
