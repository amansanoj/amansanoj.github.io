import { useEffect, useState } from 'react';
import { useMotionValue } from 'motion/react';
import { ProgressiveBlur } from './magicui/progressive-blur';
import { ScrollProgress } from './magicui/scroll-progress';
export function BottomBlur() {
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const footer=document.querySelector('footer');if(!footer)return;
    let footerVisible=true;
    const update=()=>setVisible(!footerVisible&&document.documentElement.scrollHeight>innerHeight+80);
    const observer=new IntersectionObserver(entries=>{footerVisible=entries[0].isIntersecting;update();},{rootMargin:'0px 0px 64px 0px'});
    observer.observe(footer);const resize=new ResizeObserver(update);resize.observe(document.body);window.addEventListener('resize',update);
    return()=>{observer.disconnect();resize.disconnect();window.removeEventListener('resize',update);};
  },[]);
  return <div aria-hidden="true"><ProgressiveBlur className={`bottom-blur${visible?' is-visible':''}`} height="clamp(40px, 6vw, 56px)" blurLevels={[.5,1,1.5,2,3,4,6,8]}/></div>;
}
export function ReadingProgress() {
  const progress=useMotionValue(0);
  useEffect(()=>{
    const body=document.querySelector('.post-body');if(!body)return;
    let frame=0;
    const update=()=>{frame=0;const r=body.getBoundingClientRect();const end=Math.max(0,scrollY+r.bottom-innerHeight);const start=Math.min(Math.max(0,scrollY+r.top-24),end);progress.set(end<=start?(scrollY>=end?1:0):Math.max(0,Math.min(1,(scrollY-start)/(end-start))));};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);const resize=new ResizeObserver(schedule);resize.observe(document.body);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
  },[progress]);
  return <ScrollProgress className="reading-progress" aria-hidden="true" progress={progress}/>;
}
