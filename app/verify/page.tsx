import type { Metadata, ResolvingMetadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getCertificateByCode } from "app/(main)/dashboard/certifier/utils";
import dynamic from "next/dynamic";

const QRCodeScanner = dynamic(() => import("components/QRscanner"), {
  ssr: false
});

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

function getCodeFromProps(props: Props) {
  return typeof props.searchParams.code === "string"
    ? props.searchParams.code.toUpperCase().trim()
    : undefined;
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const metadata = await parent;
  const code = getCodeFromProps(props);
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
  const code = getCodeFromProps(props);
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
