import type {
  FontStyle,
  FontWeight
} from "next/dist/compiled/@vercel/og/satori";
import { getCertificateByCode } from "app/(main)/dashboard/certifier/utils";
import { CERTIFICATE_TYPE_SHORT_NAMES } from "app/(main)/dashboard/certifier/certificateTypeConfig";
import { readFile } from "fs/promises";
import { ImageResponse } from "next/og";
import SentralLogo from "public/img/MYSverse_Sentral_Logo.svg";
import path from "path";

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

function dir(p: string) {
  return path.join(process.cwd(), p);
}

async function getFonts() {
  const [fontRegular, fontBold, fontMedium, fontSemibold, fontLight] =
    await Promise.all([
      readFile(dir("public/fonts/public_sans/PublicSans-Regular.ttf")),
      readFile(dir("public/fonts/public_sans/PublicSans-Bold.ttf")),
      readFile(dir("public/fonts/public_sans/PublicSans-Medium.ttf")),
      readFile(dir("public/fonts/public_sans/PublicSans-SemiBold.ttf")),
      readFile(dir("public/fonts/public_sans/PublicSans-Light.ttf"))
    ]);

  interface Font {
    name: string;
    data: Buffer;
    style: FontStyle;
    weight: FontWeight;
  }
  return [
    {
      name: "Public Sans",
      data: fontLight,
      style: "normal",
      weight: 300
    },
    {
      name: "Public Sans",
      data: fontRegular,
      style: "normal",
      weight: 400
    },
    {
      name: "Public Sans",
      data: fontMedium,
      style: "normal",
      weight: 500
    },
    {
      name: "Public Sans",
      data: fontSemibold,
      style: "normal",
      weight: 600
    },
    {
      name: "Public Sans",
      data: fontBold,
      style: "normal",
      weight: 700
    }
  ] satisfies Font[];
}

export default async function Image(props: Props) {
  const code = getCodeFromProps(props);
  const [certificate, fonts] = await Promise.all([
    getCertificateByCode(code),
    getFonts()
  ]);

  if (!certificate) {
    return new ImageResponse(
      <div tw="bg-red-600 text-white w-full h-full flex flex-col items-center justify-center">
        <SentralLogo height={128} alt="MYSverse Sentral Logo" fill="white" />
        <h1 tw="text-7xl font-bold tracking-tight mt-6">Invalid certificate</h1>
        <p tw="text-5xl mt-6">The given certificate is invalid.</p>
      </div>,
      {
        ...size,
        fonts
      }
    );
  }

  return new ImageResponse(
    <div tw="bg-blue-600 text-white w-full h-full flex flex-col items-center justify-center">
      <SentralLogo height={128} alt="MYSverse Sentral Logo" fill="white" />
      <h1 tw="text-7xl font-bold tracking-tight mt-12">
        {certificate.recipientName}
      </h1>
      <p tw="text-5xl font-semibold tracking-tight mt-6">
        {certificate.courseName}
      </p>
      <p tw="text-5xl font-medium mt-6">
        {CERTIFICATE_TYPE_SHORT_NAMES[certificate.type] ?? certificate.type}
      </p>
      {certificate.reason && (
        <p tw="text-4xl font-medium mt-6">{certificate.reason}</p>
      )}
    </div>,
    {
      ...size,
      fonts
    }
  );
}
