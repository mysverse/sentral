import { getCertificates } from "./utils";
import CertificatesTable from "./CertificatesTable";
import IssuanceForm from "./IssuanceForm";

export default async function CertifierPage() {
  const certificates = await getCertificates();
  return (
    <>
      <div className="rounded-lg bg-white px-4 py-4 shadow-sm sm:px-6">
        <h1 className="mb-4 text-lg font-semibold">Generate certificate</h1>
        <IssuanceForm />
      </div>
      <div className="rounded-lg bg-white py-4 shadow-sm">
        <h1 className="mb-4 px-4 text-lg font-semibold sm:px-6">
          Issued certificates
        </h1>
        <div className="overflow-x-auto">
          <CertificatesTable certificates={certificates} />
        </div>
      </div>
    </>
  );
}
