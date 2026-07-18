import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer group/switch inline-flex items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-5 w-[38px] data-[state=checked]:bg-[#00D076] data-[state=unchecked]:bg-[#00D076]/50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white ring-0 transition-transform size-3 data-[state=unchecked]:translate-x-[3px] data-[state=checked]:translate-x-[23px]",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
