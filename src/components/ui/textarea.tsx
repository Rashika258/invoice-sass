import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      suppressHydrationWarning
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-background dark:bg-zinc-900/90 dark:border-zinc-700/80 px-2.5 py-2 text-base text-foreground dark:text-zinc-100 transition-colors outline-none placeholder:text-muted-foreground dark:placeholder:text-zinc-500 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:disabled:bg-zinc-900/40 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 shadow-2xs",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
