"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  style,
  viewportClassName,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  viewportClassName?: string
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      style={style}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          "h-full w-full rounded-[inherit] outline-none transition-colors",
          viewportClassName
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner className="bg-border" />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      className={cn(
        "flex touch-none select-none transition-colors",
        "h-full w-2.5 border-l border-l-transparent p-px",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
