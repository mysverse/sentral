import { SkeletonCard, SkeletonChartCard } from "components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SkeletonCard lines={2} />
      <SkeletonChartCard />
      <SkeletonCard lines={4} />
    </div>
  );
}
