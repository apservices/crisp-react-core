import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";

export type SafeTabsProps = React.ComponentPropsWithoutRef<typeof Tabs.Root>;

export function SafeTabs({ children, ...props }: SafeTabsProps) {
  return (
    <Tabs.Root {...props}>
      {children}
    </Tabs.Root>
  );
}

export const SafeTabsList = React.forwardRef<
  React.ElementRef<typeof Tabs.List>,
  React.ComponentPropsWithoutRef<typeof Tabs.List>
>(({ className, ...rest }, ref) => (
  <Tabs.List
    ref={ref}
    className={[
      "inline-flex items-center justify-start gap-2 rounded-2xl bg-muted/50 p-1 backdrop-blur",
      className || ""
    ].join(" ")}
    {...rest}
  />
));
SafeTabsList.displayName = "SafeTabsList";
