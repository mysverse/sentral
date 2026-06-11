import { Skeleton, SkeletonCard } from "components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="bg-surface flex w-full items-center justify-around rounded-lg p-4 shadow-sm">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    </>
  );
}
