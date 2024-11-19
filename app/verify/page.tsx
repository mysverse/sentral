import type { Metadata, ResolvingMetadata } from "next";
import prisma from "lib/prisma";
import dynamic from "next/dynamic";
import Link from "next/link";

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
    const certificate = await prisma.certificate.findUnique({
      where: { code }
    });
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

  if (!code) {
    return (
      <>
        <h1 className="text-xl font-bold text-blue-600 sm:text-2xl">
          MYSverse Certificate Verifier
        </h1>
        <QRCodeScanner />
      </>
    );
  }

  const certificate = await prisma.certificate.findUnique({
    where: { code }
  });

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
        className="text-gray-400 underline transition hover:text-gray-300 hover:no-underline"
      >
        Verify another certificate
      </Link>
    </>
  );
}
