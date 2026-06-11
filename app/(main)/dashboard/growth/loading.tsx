import { SkeletonCard, SkeletonChartCard } from "components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <SkeletonCard lines={1} />
      <SkeletonChartCard />
      <SkeletonChartCard />
    </div>
  );
}
