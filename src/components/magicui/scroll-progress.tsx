"use client"

import { motion, useScroll, type MotionValue, type MotionProps } from "motion/react"

import { cn } from "@/lib/utils"

interface ScrollProgressProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  keyof MotionProps
> {
  ref?: React.Ref<HTMLDivElement>
  progress?: MotionValue<number>
}

export function ScrollProgress({
  className,
  ref,
  progress,
  ...props
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()

  return (
    <motion.div
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-px origin-left bg-[var(--accent)]",
        className
      )}
      style={{
        scaleX: progress ?? scrollYProgress,
      }}
      {...props}
    />
  )
}
