"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  formatLabel,
  showValue = true,
  onValueChange,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  formatLabel?: (value: number) => string
  showValue?: boolean
}) {
  const [internalValues, setInternalValues] = React.useState<number[]>(
    defaultValue ?? value ?? [min]
  )
  const values = value ?? internalValues

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={(vals) => {
        setInternalValues(vals)
        onValueChange?.(vals)
      }}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-border relative grow overflow-hidden rounded-full",
          "data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute rounded-full",
            "data-[orientation=horizontal]:h-full",
            "data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>

      {values.map((val, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          className={cn(
            "border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border-2 shadow-sm transition-[color,box-shadow] outline-none hover:ring-[3px] focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none"
          )}
        >
          {showValue && (
            <span className="bg-popover text-popover-foreground absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border px-2 py-1 text-xs whitespace-nowrap shadow-sm">
              {formatLabel ? formatLabel(val) : val}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
