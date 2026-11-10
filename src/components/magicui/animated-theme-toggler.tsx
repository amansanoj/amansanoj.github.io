"use client"

// Magic UI Theme Toggler adaptation: vertical reveal with a controlled theme.
import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react"
import { flushSync } from "react-dom"

type AnimatedThemeTogglerProps = Omit<ComponentPropsWithoutRef<"button">, "onClick"> & {
  onToggle: () => void
  shouldAnimate: boolean | (() => boolean)
  duration?: number
}

export function AnimatedThemeToggler({
  onToggle,
  shouldAnimate,
  duration = 400,
  children,
  ...props
}: AnimatedThemeTogglerProps) {
  const busy = useRef(false)
  const [transitioning, setTransitioning] = useState(false)
  const activeTransition = useRef<ViewTransition | null>(null)
  const activeAnimation = useRef<Animation | null>(null)

  useEffect(() => () => {
    activeTransition.current?.skipTransition()
    activeAnimation.current?.cancel()
    delete document.documentElement.dataset.magicuiThemeVt
    document.documentElement.style.removeProperty("--theme-wipe-duration")
  }, [])

  function toggle() {
    if (busy.current) return
    const root = document.documentElement
    const animate = typeof shouldAnimate === "function" ? shouldAnimate() : shouldAnimate
    if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches ||
        typeof document.startViewTransition !== "function") {
      onToggle()
      return
    }
    busy.current = true
    setTransitioning(true)
    root.dataset.magicuiThemeVt = "active"
    root.style.setProperty("--theme-wipe-duration", `${duration}ms`)
    let applied = false
    const apply = () => { applied = true; flushSync(onToggle) }
    const cleanup = () => {
      busy.current = false
      setTransitioning(false)
      activeAnimation.current?.cancel()
      activeAnimation.current = null
      activeTransition.current = null
      delete root.dataset.magicuiThemeVt
      root.style.removeProperty("--theme-wipe-duration")
    }
    try {
      const transition = document.startViewTransition(apply)
      activeTransition.current = transition
      transition.ready.then(() => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
          transition.skipTransition()
          return
        }
        activeAnimation.current = root.animate(
          { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"] },
          { duration, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards",
            pseudoElement: "::view-transition-new(root)" }
        )
      }).catch(() => {})
      transition.finished.finally(cleanup).catch(() => {})
    } catch {
      cleanup()
      if (!applied) onToggle()
    }
  }

  return <button {...props} type="button" onClick={toggle} aria-busy={transitioning || undefined}>
    {children}
  </button>
}
