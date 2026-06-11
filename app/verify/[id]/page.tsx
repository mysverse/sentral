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

function DetailRow({
  label,
  value,
  divider = true,
  suppressHydrationWarning
}: {
  label: string;
  value: string;
  divider?: boolean;
  suppressHydrationWarning?: boolean;
}) {
  return (
    <>
      {divider && <hr className="my-4" />}
      <div className="mb-4">
        <dt className="text-gray-700">{label}</dt>
        <dd
          className="text-lg font-semibold"
          suppressHydrationWarning={suppressHydrationWarning}
        >
          {value}
        </dd>
      </div>
    </>
  );
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
          <dl className="w-full text-center">
            <DetailRow
              label="Recipient"
              value={certificate.recipientName}
              divider={false}
            />
            <DetailRow label="Module" value={certificate.courseName} />
            <DetailRow
              label="Certificate Type"
              value={
                CERTIFICATE_TYPE_LABELS[certificate.type] ?? certificate.type
              }
            />
            {certificate.reason && (
              <DetailRow label="Reason" value={certificate.reason} />
            )}
            {certificate.robloxUserID && (
              <DetailRow label="Roblox ID" value={certificate.robloxUserID} />
            )}
            <DetailRow
              label="Issued on"
              value={new Date(certificate.issueDate).toLocaleDateString()}
              suppressHydrationWarning
            />
          </dl>
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
          className="bg-brand-gradient mt-2 flex w-full items-center justify-center gap-x-2 rounded py-3 font-semibold text-white opacity-100 transition hover:opacity-80"
        >
          <ArrowDownTrayIcon className="size-5" /> Download certificate
        </Link>
      )}
    </>
  );
}
