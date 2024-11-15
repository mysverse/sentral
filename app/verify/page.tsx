import QRCodeScanner from "components/QRscanner";
import prisma from "lib/prisma";
import Link from "next/link";

export default async function VerifyPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const code =
    typeof searchParams.code === "string"
      ? searchParams.code.toUpperCase().trim()
      : undefined;

  if (typeof code !== "string") {
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
