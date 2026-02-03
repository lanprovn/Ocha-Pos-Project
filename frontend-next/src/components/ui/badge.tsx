"use client";
"use client";
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-white shadow hover:bg-primary/90',
                secondary:
                    'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200',
                success:
                    'border-transparent bg-emerald-500 text-white hover:bg-emerald-600',
                destructive:
                    'border-transparent bg-rose-500 text-white shadow hover:bg-rose-600',
                warning:
                    'border-transparent bg-amber-500 text-white hover:bg-amber-600',
                outline: 'text-slate-600 border-slate-200 bg-transparent',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
