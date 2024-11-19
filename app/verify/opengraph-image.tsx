import prisma from "lib/prisma";
import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Certificate Information";
export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

// Image generation
export default async function Image({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const code =
    typeof searchParams.code === "string"
      ? searchParams.code.toUpperCase().trim()
      : undefined;

  if (typeof code !== "string") {
    return null;
  }

  const certificate = await prisma.certificate.findUnique({
    where: { code }
  });

  if (!certificate) {
    return null;
  }

  // Font
  const interSemiBold = fetch("/fonts/public_sans/PublicSans-Regular.ttf").then(
    (res) => res.arrayBuffer()
  );

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {/* Recipient Name */}
        <h1>{certificate.recipientName}</h1>
        {/* Course Name */}
        <p>Course: {certificate.courseName}</p>
        {/* Certificate Type */}
        <p>Type: {certificate.type}</p>
        {/* Conditional Content Based on Type */}
        {certificate.type === "ROLEPLAY" && <p>Roleplay Achievement</p>}
        {certificate.type === "TEAM_RECOGNITION" && <p>Team Member</p>}
        {certificate.type === "EXTERNAL" && <p>External Collaboration</p>}
        {/* Certificate Code */}
        <p>Code: {certificate.code}</p>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await interSemiBold,
          style: "normal",
          weight: 400
        }
      ]
    }
  );
}
