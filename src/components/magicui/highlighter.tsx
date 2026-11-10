"use client"

import { useLayoutEffect, useRef } from "react"
import type React from "react"
import { useInView } from "motion/react"
import { annotate } from "rough-notation"
import { type RoughAnnotation } from "rough-notation/lib/model"

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket"

interface HighlighterProps {
  children: React.ReactNode
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number
  multiline?: boolean
  isView?: boolean
  animate?: boolean
}

export function Highlighter({
  children,
  action = "highlight",
  color = "var(--secondary)",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
  animate = true,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null)

  const isInView = useInView(elementRef, {
    once: true,
    margin: "0px",
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  useLayoutEffect(() => {
    const element = elementRef.current
    let annotation: RoughAnnotation | null = null
    let resizeObserver: ResizeObserver | null = null

    if (shouldShow && element) {
      const annotationConfig = {
        type: action,
        animate,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
      }

      const currentAnnotation = annotate(element, annotationConfig)
      annotation = currentAnnotation
      currentAnnotation.show()
      currentAnnotation.animate = false

      // The annotation SVG is a sibling of the target. A positioned host keeps
      // both in the same coordinate system while ancestors translate on hover.
      // Redraw only for actual wrapping changes, not position-only movement.
      const container = element.closest(".post-body")
      if (container) {
        let width = container.getBoundingClientRect().width
        resizeObserver = new ResizeObserver(() => {
          const nextWidth = container.getBoundingClientRect().width
          if (Math.abs(nextWidth - width) < 0.5) return
          width = nextWidth
          currentAnnotation.show()
        })
        resizeObserver.observe(container)
      }
    }

    return () => {
      annotation?.remove()
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
    animate,
  ])

  return (
    <span className="highlight-host relative">
      <span ref={elementRef} className="relative bg-transparent">
        {children}
      </span>
    </span>
  )
}
