import { SkeletonCard, SkeletonTableCard } from "components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SkeletonCard lines={2} />
      <SkeletonTableCard rows={6} cols={5} />
      <SkeletonTableCard rows={3} cols={3} />
    </div>
  );
}
