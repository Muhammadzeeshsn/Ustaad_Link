import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BrandButtonProps = React.ComponentProps<typeof Button> & {
  intent?: 'primary' | 'subtle' | 'ghost';
  full?: boolean;
};

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ intent = 'primary', className, full, ...props }, ref) => {
    const base =
      'rounded-xl font-medium transition will-change-transform ' +
      'hover:translate-y-[-1px] active:translate-y-[0px] focus-visible:outline-none ' +
      'focus-visible:ring-2 focus-visible:ring-primary/40';

    const styles = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      subtle: 'bg-muted text-foreground hover:bg-muted/80',
      ghost: 'text-primary hover:bg-primary/10',
    }[intent];

    return (
      <Button
        ref={ref}
        className={cn(base, styles, full && 'w-full', className)}
        {...props}
      />
    );
  }
);
BrandButton.displayName = 'BrandButton';
