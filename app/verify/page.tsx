// app/verify/page.tsx

import QRCodeScanner from "components/QRscanner";
import prisma from "lib/prisma";

export default async function VerifyPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const code = searchParams.code;

  if (!code || typeof code !== "string") {
    return (
      <>
        <h1 className="mb-4 text-2xl font-bold text-blue-600">
          Verify MYSverse Certificate
        </h1>
        <QRCodeScanner />
      </>
    );
  }

  const certificate = await prisma.certificate.findUnique({
    where: { code }
  });

  if (!certificate) {
    return (
      <>
        <h1 className="mb-4 text-2xl font-bold text-red-600">
          Invalid Certificate Code
        </h1>
        <p className="text-gray-700">
          The certificate code provided is invalid or does not exist.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold text-green-600">
        Certificate Verified
      </h1>
      <p className="mb-2 text-gray-700">
        Recipient:{" "}
        <span className="font-semibold">{certificate.recipientName}</span>
      </p>
      <p className="mb-2 text-gray-700">
        Course: <span className="font-semibold">{certificate.courseName}</span>
      </p>
      <p className="text-gray-700">
        Issued on:{" "}
        <span className="font-semibold">
          {new Date(certificate.issueDate).toDateString()}
        </span>
      </p>
    </>
  );
}
