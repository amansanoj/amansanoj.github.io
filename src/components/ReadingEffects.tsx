import { useEffect, useState, type CSSProperties } from 'react';
import { useMotionValue } from 'motion/react';
import { ProgressiveBlur } from './magicui/progressive-blur';
import { ScrollProgress } from './magicui/scroll-progress';
export function BottomBlur() {
  const [strength,setStrength]=useState(0);
  useEffect(()=>{
    const footer=document.querySelector('footer');if(!footer)return;
    let frame=0;
    const update=()=>{
      frame=0;
      const bounds=footer.getBoundingClientRect();
      const fadeDistance=Math.min(300,bounds.height+100);
      // Start clearing just before the footer enters and finish when it is
      // fully visible. Reverse the same curve when scrolling upward.
      const distance=bounds.top-(innerHeight-bounds.height);
      // Browsers round the final scroll offset to a device pixel.
      const linear=distance<=1?0:Math.max(0,Math.min(1,distance/fadeDistance));
      const smooth=linear*linear*(3-2*linear);
      setStrength(document.documentElement.scrollHeight>innerHeight+80?smooth:0);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    const resize=new ResizeObserver(schedule);resize.observe(document.body);
    return()=>{cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
  },[]);
  return <div aria-hidden="true" style={{'--edge-blur-strength':strength} as CSSProperties}><ProgressiveBlur className={`bottom-blur${strength>0?' is-visible':''}`} height="clamp(40px, 6vw, 56px)" blurLevels={[.5,1,1.5,2,3,4,6,8]}/></div>;
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
