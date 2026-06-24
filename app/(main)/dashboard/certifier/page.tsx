import {
  checkPermissions,
  getCertificates,
  getCourses,
  getBatches,
  getApiKeys
} from "./utils";
import CertificatesTable from "./CertificatesTable";
import IssuanceForm from "./IssuanceForm";
import BulkIssuanceForm from "./BulkIssuanceForm";
import CoursesForm from "./CoursesForm";
import BatchesForm from "./BatchesForm";
import ApiKeysForm from "./ApiKeysForm";

export default async function CertifierPage() {
  if (!(await checkPermissions())) {
    return null;
  }
  const [certificates, courses, batches, apiKeys] = await Promise.all([
    getCertificates(),
    getCourses(),
    getBatches(),
    getApiKeys()
  ]);

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
          <BulkIssuanceForm courses={courses} />
        </div>
        <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
          <h1 className="mb-4 text-lg font-semibold">Generate Certificate</h1>
          <IssuanceForm courses={courses} />{" "}
          {/* Pass courses to IssuanceForm */}
        </div>
        <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
          <h1 className="mb-4 text-lg font-semibold">Manage Courses</h1>
          <CoursesForm courses={courses} />
        </div>
        <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
          <h1 className="mb-4 text-lg font-semibold">Manage Batches</h1>
          <BatchesForm batches={batches} courses={courses} />
        </div>
        <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
          <h1 className="mb-4 text-lg font-semibold">Manage API Keys</h1>
          <ApiKeysForm apiKeys={apiKeys} courses={courses} />
        </div>
      </div>

      <div className="bg-surface rounded-lg py-4 shadow-sm">
        <h1 className="mb-4 px-4 text-lg font-semibold sm:px-6">
          Issued Certificates
        </h1>
        <div className="overflow-x-auto">
          <CertificatesTable certificates={certificates} />
        </div>
      </div>
    </>
  );
}
