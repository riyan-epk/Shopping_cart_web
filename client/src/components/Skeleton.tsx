import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
    <div className={`skeleton ${className}`}></div>
);

export const ProductCardSkeleton: React.FC = () => (
    <div className="rounded-[2rem] overflow-hidden border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <Skeleton className="aspect-[4/5] w-full" />
        <div className="p-6 space-y-4">
            <Skeleton className="h-3 w-16 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-full rounded-md" />
                <Skeleton className="h-5 w-2/3 rounded-md" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-4 w-12 rounded-lg" />
                <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
            <div className="pt-4">
                <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
    <div className="space-y-3">
        <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} className="h-8 flex-1" />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
                {Array.from({ length: cols }).map((_, j) => (
                    <Skeleton key={j} className="h-12 flex-1" />
                ))}
            </div>
        ))}
    </div>
);

export default Skeleton;
