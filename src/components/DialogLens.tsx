import { useRef, useState, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { Lens } from './magicui/lens';
import { MagnifyPointer } from './MagnifyPointer';
export function DialogLens({src,alt}:{src:string;alt:string}) {
  const surface=useRef<HTMLDivElement>(null);
  const reduce=useReducedMotion();
  const [touch,setTouch]=useState(()=>typeof window!=='undefined'&&matchMedia('(pointer: coarse)').matches);
  const [keyboard,setKeyboard]=useState(false);
  const [position,setPosition]=useState({x:0,y:0});
  const center=()=>{const r=surface.current?.getBoundingClientRect();if(r)setPosition({x:r.width/2,y:r.height/2});};
  useEffect(()=>{const media=matchMedia('(pointer: coarse)');const change=()=>setTouch(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  useEffect(()=>{const observer=new ResizeObserver(center);if(surface.current)observer.observe(surface.current);return()=>observer.disconnect();},[]);
  const move=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(event.pointerType==='mouse')return;
    const r=event.currentTarget.getBoundingClientRect();
    setTouch(true);
    setPosition({x:Math.max(0,Math.min(r.width,event.clientX-r.left)),y:Math.max(0,Math.min(r.height,event.clientY-r.top))});
  };
  return <div ref={surface} className="viewer-lens-surface" onPointerDown={event=>{if(event.pointerType!=='mouse'){event.currentTarget.setPointerCapture(event.pointerId);move(event);}}} onPointerMove={event=>{if(event.pointerType==='mouse')setKeyboard(false);else if(event.currentTarget.hasPointerCapture(event.pointerId))move(event);}} onKeyDown={event=>{
    if(!event.key.startsWith('Arrow'))return;
    event.preventDefault();
    const r=event.currentTarget.getBoundingClientRect();setKeyboard(true);
    setPosition(p=>({x:Math.max(0,Math.min(r.width,p.x+(event.key==='ArrowRight'?24:event.key==='ArrowLeft'?-24:0))),y:Math.max(0,Math.min(r.height,p.y+(event.key==='ArrowDown'?24:event.key==='ArrowUp'?-24:0)))}));
  }} onPointerEnter={event=>{if(event.pointerType==='mouse')setKeyboard(false);}}>
    <Lens isStatic={touch||keyboard} position={position} duration={reduce?0:.1} ariaLabel={`Magnify: ${alt||'Image'}`}>
      <img src={src} alt={alt} onLoad={center}/>
    </Lens>
    <MagnifyPointer/>
  </div>;
}
