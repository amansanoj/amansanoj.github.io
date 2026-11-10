"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useMotionValue, useReducedMotion, type HTMLMotionProps } from "motion/react"

// Magic UI Pointer, portaled outside transformed parents and into modal top layers.
export function Pointer({ children, style, className, ...props }: HTMLMotionProps<"div">): ReactNode {
  const x = useMotionValue(0), y = useMotionValue(0)
  const [active,setActive] = useState(false)
  const [host,setHost] = useState<HTMLElement|null>(null)
  const marker = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const parent = marker.current?.parentElement
    if (!parent) return
    setHost(parent.closest("dialog") || document.body)
    const media = matchMedia("(hover: hover) and (pointer: fine)")
    let detach = () => {}
    const configure = () => {
      detach(); setActive(false)
      if (!media.matches) return
      const cursor = parent.style.cursor
      parent.style.cursor = "none"
      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return
        x.set(event.clientX); y.set(event.clientY); setActive(true)
      }
      const leave = () => setActive(false)
      parent.addEventListener("pointermove",move)
      parent.addEventListener("pointerenter",move)
      parent.addEventListener("pointerleave",leave)
      window.addEventListener("blur",leave)
      detach = () => {
        parent.style.cursor = cursor
        parent.removeEventListener("pointermove",move)
        parent.removeEventListener("pointerenter",move)
        parent.removeEventListener("pointerleave",leave)
        window.removeEventListener("blur",leave)
      }
    }
    configure(); media.addEventListener("change",configure)
    return () => { detach(); media.removeEventListener("change",configure) }
  }, [x,y])
  return <>
    <span ref={marker} hidden aria-hidden="true" />
    {host && createPortal(<AnimatePresence>{active && <motion.div
      {...props}
      className={`magnify-pointer ${className || ""}`}
      aria-hidden="true"
      style={{ position:"fixed", top:y, left:x, pointerEvents:"none", zIndex:100, ...style }}
      initial={reduce ? false : {scale:0,opacity:0}}
      animate={{scale:1,opacity:1}}
      exit={{scale:0,opacity:0}}
      transition={{duration:reduce ? 0 : .12}}
    >{children}</motion.div>}</AnimatePresence>,host)}
  </>
}
