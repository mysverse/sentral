import { SkeletonTableCard } from "components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SkeletonTableCard rows={10} cols={3} />
      <SkeletonTableCard rows={10} cols={3} />
      <SkeletonTableCard rows={10} cols={3} />
      <SkeletonTableCard rows={10} cols={3} />
    </div>
  );
}
