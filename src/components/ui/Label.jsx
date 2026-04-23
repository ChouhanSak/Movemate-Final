import React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../utils"; // adjust path if utils.js is elsewhere

export function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "flex items-center gap-2 text-sm font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
