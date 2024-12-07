import type { Metadata, ResolvingMetadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getCertificateByCode } from "app/(main)/dashboard/certifier/utils";

import QRCodeScanner from "components/QRscanner";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getCodeFromProps(props: Props) {
  const searchParams = await props.searchParams;
  return typeof searchParams.code === "string"
    ? searchParams.code.toUpperCase().trim()
    : undefined;
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
  if (code) {
    permanentRedirect(`/verify/${code}`);
  }
  return (
    <>
      <h1 className="text-xl font-bold text-blue-600 sm:text-2xl">
        MYSverse Certificate Verifier
      </h1>
      <QRCodeScanner />
    </>
  );
}
