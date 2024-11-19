import { readFile } from "fs/promises";
import prisma from "lib/prisma";
import { ImageResponse } from "next/og";
import SentralLogo from "public/img/MYSverse_Sentral_Logo.svg";

// Image metadata
export const alt = "Certificate Information";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

type Props = { params: { id: string } };

function getCodeFromProps(props: Props) {
  return props.params.id.toUpperCase().trim();
}

// Image generation
export default async function Image(props: Props) {
  const code = getCodeFromProps(props);

  if (typeof code !== "string") {
    return undefined;
  }

  const certificate = await prisma.certificate.findUnique({
    where: { code }
  });

  if (!certificate) {
    return undefined;
  }

  const [fontRegular, fontBold] = await Promise.all([
    readFile("public/fonts/public_sans/PublicSans-Regular.ttf"),
    readFile("public/fonts/public_sans/PublicSans-Bold.ttf")
  ]);

  console.log("image generating...");

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div tw="bg-blue-600 text-white w-full h-full flex flex-col items-center justify-center">
        <SentralLogo height={96} alt="MYSverse Sentral Logo" fill="white" />
        {/* Recipient Name */}
        <h1 tw="text-7xl font-bold mt-4">{certificate.recipientName}</h1>
        {/* Course Name */}
        <p tw="text-5xl mt-2">{certificate.courseName}</p>
        {/* Certificate Type */}
        <p tw="text-xl mt-1">
          {certificate.type === "ROLEPLAY" ? "MYSverse Sim" : certificate.type}
        </p>
        {/* Conditional Content Based on Type */}
        {certificate.type === "ROLEPLAY" && (
          <p tw="text-lg mt-1">Roleplay Achievement</p>
        )}
        {certificate.type === "TEAM_RECOGNITION" && (
          <p tw="text-lg mt-1">Team Member</p>
        )}
        {certificate.type === "EXTERNAL" && (
          <p tw="text-lg mt-1">External Collaboration</p>
        )}
        {/* Certificate Code */}
        <p tw="text-lg mt-4">Code: {certificate.code}</p>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      fonts: [
        {
          name: "Public Sans",
          data: fontRegular,
          style: "normal",
          weight: 400
        },
        {
          name: "Public Sans",
          data: fontBold,
          style: "normal",
          weight: 600
        }
      ]
    }
  );
}
