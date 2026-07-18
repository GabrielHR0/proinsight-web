"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function AspectRatio({
  className,
  ratio = 16 / 9,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  ratio?: number
}) {
  return (
    <div
      data-slot="aspect-ratio"
      className={cn("relative w-full", className)}
      style={{ aspectRatio: ratio }}
      {...props}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}

export { AspectRatio }
