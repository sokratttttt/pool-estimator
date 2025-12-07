// Skeleton loader component for loading states
interface SkeletonCardProps {
    className?: string;
}

export default function SkeletonCard({ className = '' }: SkeletonCardProps) {
    return (
        <div className={`bg-white/10 backdrop-blur-xl rounded-xl p-6 animate-pulse ${className}`}>
            <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-white/20 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-full mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-2/3"></div>
        </div>
    );
}

export function SkeletonList({ count = 3 }) {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_: unknown, i: number) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
