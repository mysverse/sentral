/* eslint-disable jsx-a11y/alt-text */
import "server-only";

import prisma from "lib/prisma";
import QRCode from "qrcode";
import React from "react";
import {
  Document,
  Page,
  Text,
  Image,
  Font,
  pdf,
  View,
  Svg,
  G,
  Path,
  Link
} from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { CertificateType } from "@prisma/client";
import path from "path";

// Create an instance of Tailwind CSS for React-PDF
const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Public Sans"]
    },
    extend: {
      colors: {
        primary: "#1F2937" // Example color
      }
    }
  }
});

interface PDFProps {
  recipientName: string;
  courseName: string;
  issueDate: Date;
  qrCodeImage: string;
  code: string;
  type: CertificateType;
  robloxUserID?: string;
  recipientUserID?: string;
  externalOrg?: string;
}

Font.register({
  family: "Public Sans",
  fonts: [
    {
      src: "public/fonts/public_sans/PublicSans-Thin.ttf",
      fontWeight: 100
    },
    {
      src: "public/fonts/public_sans/PublicSans-ThinItalic.ttf",
      fontWeight: 100,
      fontStyle: "italic"
    },
    {
      src: "public/fonts/public_sans/PublicSans-ExtraLight.ttf",
      fontWeight: 200
    },
    {
      src: "public/fonts/public_sans/PublicSans-ExtraLightItalic.ttf",
      fontWeight: 200,
      fontStyle: "italic"
    },
    {
      src: "public/fonts/public_sans/PublicSans-Light.ttf",
      fontWeight: 300
    },
    {
      src: "public/fonts/public_sans/PublicSans-LightItalic.ttf",
      fontWeight: 300,
      fontStyle: "italic"
    },
    {
      src: "public/fonts/public_sans/PublicSans-Regular.ttf",
      fontWeight: 400
    },
    {
      src: "public/fonts/public_sans/PublicSans-Italic.ttf",
      fontWeight: 400,
      fontStyle: "italic"
    },
    {
      src: "public/fonts/public_sans/PublicSans-Medium.ttf",
      fontWeight: 500
    },
    {
      src: "public/fonts/public_sans/PublicSans-MediumItalic.ttf",
      fontWeight: 500,
      fontStyle: "italic"
    },
    {
      src: "public/fonts/public_sans/PublicSans-SemiBold.ttf",
      fontWeight: 600
    },
    {
      src: "public/fonts/public_sans/PublicSans-SemiBoldItalic.ttf",
      fontWeight: 600,
      fontStyle: "italic"
    },
    {
      src: "public/fonts/public_sans/PublicSans-Bold.ttf",
      fontWeight: 700
    },
    {
      src: "public/fonts/public_sans/PublicSans-BoldItalic.ttf",
      fontWeight: 700,
      fontStyle: "italic"
    },
    {
      src: "public/fonts/public_sans/PublicSans-ExtraBold.ttf",
      fontWeight: 800
    },
    {
      src: "public/fonts/public_sans/PublicSans-ExtraBoldItalic.ttf",
      fontWeight: 800,
      fontStyle: "italic"
    },
    {
      src: "public/fonts/public_sans/PublicSans-Black.ttf",
      fontWeight: 900
    },
    {
      src: "public/fonts/public_sans/PublicSans-BlackItalic.ttf",
      fontWeight: 900,
      fontStyle: "italic"
    }
  ].map((f) => ({ ...f, src: path.join(process.cwd(), f.src) }))
});

export async function exportCertificateById(id: string) {
  const certificate = await renderCertificateById(id);
  if (certificate) {
    const instance = pdf();
    instance.updateContainer(certificate);
    const fileBlob = await instance.toBlob();
    return fileBlob;
  }
  return undefined;
}

function getLinkFromCode(code: string) {
  return `https://mys.gg/v/${code}`;
}

export async function renderCertificateById(id: string) {
  const certificate = await prisma.certificate.findUnique({
    where: {
      id
    }
  });
  if (certificate) {
    const code = certificate.code;
    const qrData = getLinkFromCode(code);
    const qrCodeImage = await QRCode.toDataURL(qrData);
    return (
      <CertificateDocument
        recipientName={certificate.recipientName}
        courseName={certificate.courseName}
        issueDate={certificate.issueDate}
        qrCodeImage={qrCodeImage}
        code={code}
        type={certificate.type}
        robloxUserID={certificate.robloxUserID || undefined}
        recipientUserID={certificate.recipientUserID || undefined}
        externalOrg={certificate.externalOrg || undefined}
      />
    );
  }
  return null;
}

// React component for the certificate
function CertificateDocument({
  recipientName,
  courseName,
  issueDate,
  qrCodeImage,
  code,
  type,
  robloxUserID,
  recipientUserID,
  externalOrg
}: PDFProps) {
  const link = getLinkFromCode(code);

  // Modify the certificate content based on the type
  let description = "";
  if (type === "ROLEPLAY") {
    description = `This certifies that Roblox user ${recipientName} (ID: ${robloxUserID}) has achieved ${courseName} certification within the MYSverse Sim virtual roleplay community. This certificate should not imply any real-world qualifications or achievements outside of its intended context.`;
  } else if (type === "TEAM_RECOGNITION") {
    description = `This certificate recognizes ${recipientName} (User ID: ${recipientUserID}) for their outstanding contribution as a ${courseName} in MYSverse.`;
  } else if (type === "EXTERNAL") {
    description = `This certifies that ${recipientName} has successfully completed tasks in collaboration with ${externalOrg} for the ${courseName} project.`;
  }

  return (
    <Document title="Certificate" author="MYSverse">
      <Page
        style={tw(
          "flex flex-col font-sans justify-between p-12 border-8 border-gray-300 bg-white h-full text-primary"
        )}
      >
        <View style={tw("flex flex-col items-center mb-8")}>
          <Svg
            width={196}
            viewBox="0 0 1230 422"
            preserveAspectRatio="slice"
            fill="#1F2937"
          >
            <G>
              <G>
                <G>
                  <Path d="M512.162,348.796c-46.076,0 -70.4,-22.453 -70.4,-55.665l36.954,0c0.468,16.84 10.525,27.833 34.849,27.833c18.711,-0 30.873,-6.783 30.873,-20.348c-0,-16.372 -8.888,-19.881 -39.761,-25.026c-39.292,-6.081 -59.406,-19.88 -59.406,-49.584c-0,-32.042 25.259,-51.922 66.657,-51.922c7.185,-0 37.479,0.323 43.356,4.138c5.295,3.437 6.288,9.313 4.907,14.137c-3.242,11.319 -33.294,9.323 -49.433,9.323c-17.073,0 -27.598,7.485 -27.598,19.647c-0,15.67 11.694,17.775 41.164,22.686c28.534,4.444 58.003,11.929 58.003,53.092c0,30.639 -23.622,51.689 -70.165,51.689Z" />
                  <Path
                    d="M657.405,348.796c31.574,0 54.729,-16.606 58.003,-41.865l-32.51,-0c-2.573,9.589 -12.396,15.904 -25.493,15.904c-17.308,-0 -28.768,-11.227 -28.534,-31.107l87.239,0c4.21,-41.632 -16.372,-72.738 -59.875,-72.738c-37.188,-0 -61.278,25.493 -61.278,65.955c0,38.358 23.155,63.851 62.448,63.851Zm-1.17,-103.845c14.267,-0 25.26,8.186 26.195,24.792l-53.326,-0c1.404,-15.203 11.461,-24.792 27.131,-24.792Z"
                    style={{ fillRule: "nonzero" }}
                  />
                  <Path
                    d="M735.055,346.691l34.381,0l-0,-69.698c-0,-15.904 9.823,-29.937 27.598,-29.937c16.606,-0 23.623,10.291 23.623,31.341l-0,68.294l34.381,0l-0,-75.779c-0,-37.655 -19.179,-51.922 -44.205,-51.922c-17.775,-0 -33.211,8.42 -39.994,25.025l-1.403,0l-1.404,-22.686l-32.977,-0l-0,125.362Z"
                    style={{ fillRule: "nonzero" }}
                  />
                  <Path
                    d="M917.953,346.691l27.364,0l0,-27.832l-15.202,-0c-6.549,-0 -10.057,-1.871 -10.057,-9.356l-0,-60.576l25.259,0l0,-27.598l-25.259,-0l-0,-37.422l-34.147,3.274l-0,34.148l-22.453,-0l-0,27.598l22.453,0l-0,67.125c-0,18.945 6.548,30.639 32.042,30.639Z"
                    style={{ fillRule: "nonzero" }}
                  />
                  <Path
                    d="M963.093,346.691l34.381,0l-0,-65.488c0.468,-18.711 10.057,-29.235 33.212,-29.235l12.527,-32.277l-11.826,0c-15.904,0 -29.002,5.614 -34.615,21.752l-1.169,-0l-1.404,-20.114l-31.106,-0l-0,125.362Z"
                    style={{ fillRule: "nonzero" }}
                  />
                  <Path
                    d="M1093.13,348.796c19.412,0 33.913,-9.589 39.761,-24.09l1.871,-0l-0,21.985l34.381,0l-0,-125.362l-32.978,-0l-1.403,21.751l-1.871,-0c-5.848,-14.501 -20.349,-24.09 -39.761,-24.09c-29.937,-0 -50.051,21.751 -50.051,65.02c-0,43.035 20.114,64.786 50.051,64.786Zm13.098,-27.832c-16.84,-0 -28.067,-11.695 -28.067,-36.954c0,-25.494 11.227,-37.188 28.067,-37.188c19.178,0 28.066,14.969 28.066,31.107l-0,11.928c-0,16.138 -8.888,31.107 -28.066,31.107Z"
                    style={{ fillRule: "nonzero" }}
                  />
                  <Path
                    d="M1195.11,346.691l34.381,0l0,-170.502l-34.381,7.718l0,162.784Z"
                    style={{ fillRule: "nonzero" }}
                  />
                </G>
              </G>
              <G>
                <G>
                  <Path d="M127.22,119.633l-54.138,172.029l-36.571,-21.114l90.709,-150.915Z" />
                  <Path d="M113.125,293.477l191.247,54.418l-22.401,38.8l-168.846,-93.218Z" />
                  <Path d="M342.785,122.812l36.571,21.114l-82.279,165.34l45.708,-186.454Z" />
                  <Path d="M142.295,42.205l168.876,93.219l-191.277,-54.42l22.401,-38.799Z" />
                  <Path d="M154.417,116.341l154.75,41.467l-41.467,154.751l-154.75,-41.468l41.467,-154.75Zm103.664,130.06l23.977,-24.534l-23.98,-24.72l-21.144,3.35l8.74,-19.626l-17.491,-29.506l-30.084,16.762l10.239,26.422l9.65,-5.376l8.024,13.551l-4.005,9.01l9.702,-1.538l11.011,11.352l-11.008,11.262l-7.151,-1.131l3.277,7.355l-8.114,13.567l-13.732,-7.72l-0.835,-7.964l-4.739,6.515l-15.804,-0.238l-0.19,-15.749l6.556,-4.759l-6.803,-2.617l-3.864,-15.332l11.21,-3.142l-12.352,-25.592l-33.038,9.261l8.408,33.398l14.824,5.686l-14.265,10.36l0.392,34.306l34.432,0.524l10.316,-14.19l1.825,17.35l29.902,16.806l17.67,-29.56l-7.126,-16.008l15.57,2.465Zm-46.727,-23.118l-0.016,-0.009c3.329,-1.782 1.406,-5.265 1.406,-5.265l-32.222,-82.142l-16.523,-4.42l41.732,90.328c0,-0 0.13,0.262 0.404,0.598c0.042,0.054 0.095,0.106 0.136,0.161c0.408,0.465 1.053,1.024 1.935,1.263c0.051,0.019 0.099,0.026 0.155,0.037c0.052,0.02 0.112,0.023 0.168,0.035c0.048,0.007 0.108,0.01 0.156,0.017l0.008,0.005c0.04,0.002 0.088,0.009 0.128,0.011c0.016,0.009 0.028,0.006 0.048,0.007c0.056,0.012 0.117,0.015 0.182,0.011c0.064,-0.004 0.125,-0 0.19,-0.005c0.052,-0 0.097,-0.006 0.149,-0.007c0.033,-0.002 0.078,-0.007 0.11,-0.009c0.045,-0.006 0.094,-0.019 0.146,-0.02c0.05,-0.013 0.102,-0.014 0.152,-0.027c0.024,-0.007 0.057,-0.009 0.081,-0.015c0.049,-0.013 0.094,-0.019 0.143,-0.032l0.173,-0.046c0.078,-0.028 0.164,-0.051 0.255,-0.082c0.062,-0.016 0.115,-0.037 0.181,-0.062c0.037,-0.009 0.071,-0.032 0.108,-0.042c0.202,-0.08 0.402,-0.173 0.615,-0.29Z" />
                  <Path d="M369.737,62.519c25.46,0 46.13,20.67 46.13,46.129c-0,25.46 -20.67,46.13 -46.13,46.13c-25.459,-0 -46.129,-20.67 -46.129,-46.13c0,-25.459 20.67,-46.129 46.129,-46.129Zm0,24.046c-12.188,-0 -22.083,9.895 -22.083,22.083c-0,12.188 9.895,22.084 22.083,22.084c12.189,-0 22.084,-9.896 22.084,-22.084c-0,-12.188 -9.895,-22.083 -22.084,-22.083Z" />
                  <Path d="M585.452,134.211c22.143,0 40.12,17.977 40.12,40.119c-0,22.143 -17.977,40.12 -40.12,40.12c-22.142,-0 -40.119,-17.977 -40.119,-40.12c0,-22.142 17.977,-40.119 40.119,-40.119Zm0,20.913c-10.6,0 -19.206,8.606 -19.206,19.206c0,10.601 8.606,19.207 19.206,19.207c10.601,-0 19.207,-8.606 19.207,-19.207c-0,-10.6 -8.606,-19.206 -19.207,-19.206Z" />
                  <Path d="M97.068,-0c25.459,-0 46.129,20.67 46.129,46.129c-0,25.46 -20.67,46.129 -46.129,46.129c-25.46,0 -46.13,-20.669 -46.13,-46.129c0,-25.459 20.67,-46.129 46.13,-46.129Zm-0,24.046c-12.189,-0 -22.084,9.895 -22.084,22.083c0,12.188 9.895,22.084 22.084,22.084c12.188,-0 22.083,-9.896 22.083,-22.084c0,-12.188 -9.895,-22.083 -22.083,-22.083Z" />
                  <Path d="M315.318,328.985c25.459,-0 46.129,20.67 46.129,46.129c0,25.46 -20.67,46.129 -46.129,46.129c-25.46,0 -46.129,-20.669 -46.129,-46.129c-0,-25.459 20.669,-46.129 46.129,-46.129Zm-0,24.046c-12.188,-0 -22.084,9.895 -22.084,22.083c0,12.188 9.896,22.084 22.084,22.084c12.188,-0 22.083,-9.896 22.083,-22.084c0,-12.188 -9.895,-22.083 -22.083,-22.083Z" />
                  <Path d="M46.129,255.963c25.46,0 46.129,20.67 46.129,46.129c0,25.46 -20.669,46.13 -46.129,46.13c-25.459,-0 -46.129,-20.67 -46.129,-46.13c0,-25.459 20.67,-46.129 46.129,-46.129Zm0,24.046c-12.188,-0 -22.083,9.895 -22.083,22.083c-0,12.189 9.895,22.084 22.083,22.084c12.188,-0 22.084,-9.895 22.084,-22.084c-0,-12.188 -9.896,-22.083 -22.084,-22.083Z" />
                </G>
              </G>
            </G>
          </Svg>
        </View>
        <View style={tw("flex flex-col items-center")}>
          <Text style={tw("text-3xl mb-4 font-bold tracking-tight")}>
            MYSverse Certificate of Completion
          </Text>
          <Text style={tw("text-lg mb-2")}>This certifies that</Text>
          <Text style={tw("text-3xl mb-4 font-semibold")}>{recipientName}</Text>
          <Text style={tw("text-lg mb-2")}>
            has successfully completed the module
          </Text>
          <Text style={tw("text-3xl mb-6 font-semibold")}>{courseName}</Text>
        </View>
        <View style={tw("mt-auto text-center")}>
          <Text style={tw("text-sm mb-2")}>
            Issued on{" "}
            <Text style={tw("font-semibold")}>{issueDate.toDateString()}</Text>
          </Text>
          <Text style={tw("text-xs mb-2")}>
            Scan the QR code or visit MYSverse Sentral to validate
          </Text>
          <Link href={link}>
            <Image style={tw("h-48 w-48 mb-2 mx-auto")} src={qrCodeImage} />
          </Link>
          <Text style={tw("text-sm tracking-widest")}>{code}</Text>
          <Text style={tw("text-sm mt-8 text-center mx-8")}>{description}</Text>
          {/* <Text style={tw("text-sm mt-8")}>
            This certificate is presented to {recipientName} for outstanding
            performance and dedication in completing the {courseName} module.
          </Text> */}
          <Text style={tw("text-sm mt-4")}>
            For more information, visit{" "}
            <Text style={tw("text-blue-600 underline")}>https://mysver.se</Text>
          </Text>
          <Text style={tw("text-sm mt-4 opacity-50")}>
            © {new Date().getFullYear()} MYSverse Digital Ventures. All rights
            reserved.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
