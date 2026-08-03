import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-1/3 before:bg-gradient-to-r before:from-transparent before:via-white/45 before:to-transparent before:animate-btn-sweep before:pointer-events-none before:[mix-blend-mode:overlay]",
  {
    variants: {
      variant: {
        default: "bg-appointment text-appointment-foreground hover:bg-appointment/90 border border-transparent shadow-soft",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-transparent shadow-soft",
        outline: "border border-appointment bg-appointment text-appointment-foreground hover:bg-appointment/90 shadow-soft",
        secondary: "bg-appointment text-appointment-foreground hover:bg-appointment/90 border border-transparent shadow-soft",
        ghost: "bg-appointment text-appointment-foreground hover:bg-appointment/90 border border-transparent shadow-soft",
        ghostLight: "border border-transparent bg-appointment text-appointment-foreground hover:bg-appointment/90 shadow-soft",
        gold: "bg-appointment text-appointment-foreground hover:bg-appointment/90 border border-transparent shadow-soft tracking-wide",
        appointment:
          "bg-appointment text-appointment-foreground hover:bg-appointment/90 border border-transparent shadow-soft tracking-wide font-bold",
        contact:
          "bg-appointment text-appointment-foreground hover:bg-appointment/90 border border-transparent shadow-soft tracking-wide font-bold",
        link: "text-primary underline-offset-4 hover:underline before:hidden",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs uppercase tracking-[0.18em]",
        lg: "h-12 px-8 text-xs uppercase tracking-[0.22em]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
