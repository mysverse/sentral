import { PageContainer } from "components/ui/page-container";
import SWRFallback from "components/SWRFallback";
import {
  getMecsAuditStats,
  getMecsBlacklist,
  getMecsCaseStats,
  getMecsStaff
} from "lib/data/mecs";
import { MECS_READ_KEYS } from "lib/readKeys";

export const metadata = {
  title: "MECS"
};

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const [staff, caseStats, audit, blacklist] = await Promise.all([
    getMecsStaff(),
    getMecsCaseStats(),
    getMecsAuditStats(),
    getMecsBlacklist()
  ]);
  return (
    <PageContainer>
      <SWRFallback
        fallback={{
          [MECS_READ_KEYS.staff]: staff,
          [MECS_READ_KEYS.caseStats]: caseStats,
          [MECS_READ_KEYS.audit]: audit,
          [MECS_READ_KEYS.blacklist]: blacklist
        }}
      >
        {children}
      </SWRFallback>
    </PageContainer>
  );
}
