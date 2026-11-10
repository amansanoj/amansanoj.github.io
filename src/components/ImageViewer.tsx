import { createContext, useContext, useRef, useState, useEffect, type ImgHTMLAttributes, type ReactNode, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'motion/react';
import { BlurFade } from './magicui/blur-fade';
import { Backlight } from './magicui/backlight';
const DialogLens = lazy(() => import('./DialogLens').then(module => ({ default: module.DialogLens })));
const Context = createContext<(src:string,alt:string,opener:HTMLElement)=>void>(()=>{});
export function ImageViewerProvider({children}:{children:ReactNode}) {
  const [image,setImage]=useState<{src:string;alt:string}|null>(null);
  const dialog=useRef<HTMLDialogElement>(null),opener=useRef<HTMLElement|null>(null);
  useEffect(()=>{if(image)dialog.current?.showModal();},[image]);
  const open=(src:string,alt:string,button:HTMLElement)=>{opener.current=button;setImage({src,alt});};
  const close=()=>{setImage(null);opener.current?.focus({preventScroll:true});};
  return <Context.Provider value={open}>{children}{image&&createPortal(<dialog ref={dialog} className="image-viewer" aria-label="Image viewer" onClose={close} onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.current?.close();}}}>
    <div className="viewer-toolbar"><button className="viewer-close" type="button" autoFocus onPointerUp={event=>{if(event.pointerType==='touch'){event.preventDefault();dialog.current?.close();}}} onClick={()=>dialog.current?.close()}>Close</button></div>
    <div className="viewer-viewport"><Suspense fallback={<img src={image.src} alt={image.alt}/>}><DialogLens src={image.src} alt={image.alt}/></Suspense></div>
    <p className="viewer-caption">{image.alt}</p>
  </dialog>,document.body)}</Context.Provider>;
}
export function SafeBlurFade({children}:{children:ReactNode}) {
  const reduce=useReducedMotion();
  const ref=useRef<HTMLSpanElement>(null); const [enabled,setEnabled]=useState(false);
  useEffect(()=>{if(matchMedia('(hover: hover) and (pointer: fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&(ref.current?.getBoundingClientRect().top??0)>innerHeight+40)setEnabled(true);},[]);
  return <span ref={ref} className="image-entrance">{enabled&&!reduce?<BlurFade className="block" inView inViewMargin="40px" duration={.5} blur="4px" offset={4} direction="up">{children}</BlurFade>:children}</span>;
}
export function ViewableImage({screenshot=false,thumbnail=false,fullSrc,...props}:ImgHTMLAttributes<HTMLImageElement>&{screenshot?:boolean;thumbnail?:boolean;fullSrc?:string}) {
  const open=useContext(Context); const isCover=props.className?.split(' ').includes('post-cover');
  if(thumbnail)return <button className="image-view-trigger post-cover-link" type="button" aria-haspopup="dialog" aria-label={`Enlarge image: ${props.alt||'Image'}`} onClick={event=>open(fullSrc||String(props.src||''),props.alt||'',event.currentTarget)}><img {...props}/></button>;
  return <SafeBlurFade><button className={`image-view-trigger${screenshot?' screenshot':''}${isCover?' is-cover':''}`} type="button" aria-haspopup="dialog" aria-label={`Enlarge image: ${props.alt||'Image'}`} onClick={e=>open(fullSrc||String(props.src||''),props.alt||'',e.currentTarget)}><Backlight><img {...props}/></Backlight></button></SafeBlurFade>;
}
