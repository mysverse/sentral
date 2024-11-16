import { getCertificates } from "./actions";
import CertificatesTable from "./CertificatesTable";
import IssuanceForm from "./IssuanceForm";

export default async function CertifierPage() {
  const certificates = await getCertificates();
  return (
    <>
      <IssuanceForm />
      <h1 className="mt-8 text-2xl font-bold">Issued Certificates</h1>
      <div className="mt-4 overflow-x-auto">
        <CertificatesTable certificates={certificates} />
      </div>
    </>
  );
}
