"use client";
import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  // manages textarea's height
  const manage_textarea_height = () => {
    const textArea = document.getElementById(
      "chat-text-area",
    ) as HTMLTextAreaElement;
    textArea.style.height = "auto";

    textArea.style.height = textArea.scrollHeight > 56
      ? textArea.scrollHeight + "px"
      : "48px";
  };

  return (
    <textarea
      data-slot="textarea"
      onInput={manage_textarea_height}
      className={cn(
        "border-input resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex w-full rounded-md border bg-input px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
