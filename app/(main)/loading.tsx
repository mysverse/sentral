import { PageContainer } from "components/ui/page-container";
import { SkeletonCard, SkeletonStatGrid } from "components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer>
      <div className="grid grid-cols-1 gap-6">
        <SkeletonCard lines={2} />
        <SkeletonStatGrid count={3} />
        <SkeletonCard lines={4} />
      </div>
    </PageContainer>
  );
}
