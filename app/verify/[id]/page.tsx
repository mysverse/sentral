import type { Metadata, ResolvingMetadata } from "next";
import { getCertificateByCode } from "app/(main)/dashboard/certifier/utils";
import { CERTIFICATE_TYPE_LABELS } from "app/(main)/dashboard/certifier/certificateTypeConfig";
import Link from "next/link";
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";

type Props = { params: Promise<{ id: string }> };

async function getCodeFromProps(props: Props) {
  const params = await props.params;
  return params.id.toUpperCase().trim();
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const metadata = await parent;
  const code = await getCodeFromProps(props);
  if (code) {
    const certificate = await getCertificateByCode(code);
    if (certificate) {
      return {
        title: `Verified Certificate - ${certificate.courseName}`,
        description: `Recipient: ${certificate.recipientName}, Issued on: ${new Date(certificate.issueDate).toLocaleDateString()}`
      };
    }
  }
  return {
    title: metadata.title,
    description: metadata.description
  };
}

export default async function VerifyPage(props: Props) {
  const code = await getCodeFromProps(props);

  const certificate = await getCertificateByCode(code);

  return (
    <>
      {certificate ? (
        <>
          <h1 className="mb-4 text-2xl font-bold text-green-600">
            Verified Certificate
          </h1>
          <div className="w-full text-center">
            <div className="mb-4">
              <p className="text-gray-700">Recipient</p>
              <p className="text-lg font-semibold">
                {certificate.recipientName}
              </p>
            </div>
            <hr className="my-4" />
            <div className="mb-4">
              <p className="text-gray-700">Module</p>
              <p className="text-lg font-semibold">{certificate.courseName}</p>
            </div>
            <hr className="my-4" />
            <div className="mb-4">
              <p className="text-gray-700">Certificate Type</p>
              <p className="text-lg font-semibold">
                {CERTIFICATE_TYPE_LABELS[certificate.type] ?? certificate.type}
              </p>
            </div>
            {certificate.reason && (
              <>
                <hr className="my-4" />
                <div className="mb-4">
                  <p className="text-gray-700">Reason</p>
                  <p className="text-lg font-semibold">
                    {certificate.reason}
                  </p>
                </div>
              </>
            )}
            {certificate.robloxUserID && (
              <>
                <hr className="my-4" />
                <div className="mb-4">
                  <p className="text-gray-700">Roblox ID</p>
                  <p className="text-lg font-semibold">
                    {certificate.robloxUserID}
                  </p>
                </div>
              </>
            )}
            <hr className="my-4" />
            <div className="mb-4">
              <p className="text-gray-700">Issued on</p>
              <p className="text-lg font-semibold" suppressHydrationWarning>
                {new Date(certificate.issueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold text-red-600 sm:text-2xl">
            Invalid Certificate Code
          </h1>
          <p className="text-gray-700">
            The certificate code provided is invalid or does not exist.
          </p>
        </>
      )}

      <Link
        href="/verify"
        className="text-sm text-gray-400 underline transition hover:text-gray-300 hover:no-underline"
      >
        Verify another certificate
      </Link>
      {certificate && (
        <Link
          href={`/api/certifier/${certificate.id}`}
          className="mt-2 flex w-full items-center justify-center gap-x-2 rounded bg-linear-to-l from-blue-500 via-blue-700 to-blue-800 py-3 font-semibold text-white opacity-100 transition hover:opacity-80"
        >
          <ArrowDownTrayIcon className="size-5" /> Download certificate
        </Link>
      )}
    </>
  );
}
