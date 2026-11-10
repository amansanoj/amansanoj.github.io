import { createContext, useContext, useRef, useState, useEffect, type ImgHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'motion/react';
import { BlurFade } from './magicui/blur-fade';
import { Backlight } from './magicui/backlight';
const Context = createContext<(src:string,alt:string,opener:HTMLElement)=>void>(()=>{});
export function ImageViewerProvider({children}:{children:ReactNode}) {
  const [image,setImage]=useState<{src:string;alt:string}|null>(null), [zoom,setZoom]=useState<number|null>(null);
  const dialog=useRef<HTMLDialogElement>(null), displayed=useRef<HTMLImageElement>(null), opener=useRef<HTMLElement|null>(null);
  useEffect(()=>{if(image) dialog.current?.showModal();},[image]);
  useEffect(()=>{const fit=()=>setZoom(null);window.addEventListener('resize',fit);return()=>window.removeEventListener('resize',fit);},[]);
  const open=(src:string,alt:string,button:HTMLElement)=>{opener.current=button;setZoom(null);setImage({src,alt});};
  const toggle=()=>setZoom(zoom?null:(displayed.current?.getBoundingClientRect().width||0)*2);
  const close=()=>{setImage(null);setZoom(null);opener.current?.focus({preventScroll:true});};
  return <Context.Provider value={open}>{children}{image&&createPortal(<dialog ref={dialog} className={`image-viewer${zoom?' is-zoomed':''}`} aria-label="Image viewer" onClose={close} onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.current?.close();}}}>
    <div className="viewer-toolbar"><button className="viewer-zoom" type="button" aria-pressed={!!zoom} onClick={toggle}>{zoom?'Fit Image':'Zoom In'}</button><button className="viewer-close" type="button" autoFocus onClick={()=>dialog.current?.close()}>Close</button></div>
    <div className="viewer-viewport" tabIndex={0} aria-label="Image. Scroll to pan when zoomed."><img ref={displayed} src={image.src} alt={image.alt} style={zoom?{width:zoom}:undefined} onClick={toggle}/></div><p className="viewer-caption">{image.alt}</p>
  </dialog>,document.body)}</Context.Provider>;
}
export function SafeBlurFade({children}:{children:ReactNode}) {
  const reduce=useReducedMotion();
  const ref=useRef<HTMLSpanElement>(null); const [enabled,setEnabled]=useState(false);
  useEffect(()=>{if(matchMedia('(hover: hover) and (pointer: fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&(ref.current?.getBoundingClientRect().top??0)>innerHeight+40)setEnabled(true);},[]);
  return <span ref={ref} className="image-entrance">{enabled&&!reduce?<BlurFade className="block" inView inViewMargin="40px" duration={.5} blur="4px" offset={4} direction="up">{children}</BlurFade>:children}</span>;
}
export function ViewableImage({screenshot=false,...props}:ImgHTMLAttributes<HTMLImageElement>&{screenshot?:boolean}) {
  const open=useContext(Context); const isCover=props.className==='post-cover';
  return <SafeBlurFade><button className={`image-view-trigger${screenshot?' screenshot':''}${isCover?' is-cover':''}`} type="button" aria-haspopup="dialog" aria-label={`Enlarge image: ${props.alt||'Post image'}`} onClick={e=>open(String(props.src||''),props.alt||'',e.currentTarget)}><Backlight><img {...props}/></Backlight></button></SafeBlurFade>;
}
