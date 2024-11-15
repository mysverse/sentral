"use server";
import "server-only";

import prisma from "lib/prisma";
import QRCode from "qrcode";
import React from "react";
import { Document, Page, Text, Image } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { redirect } from "next/navigation";
import { auth } from "auth";

// Font.register({
//   family: "Public Sans",
//   src: "/fonts/PublicSans-Regular.ttf"
//   // fonts: [
//   //   {
//   //     src: "/fonts/Public_Sans/static/PublicSans-Regular.ttf",
//   //     fontWeight: 400
//   //   }
//   // ]
// });

// Create an instance of Tailwind CSS for React-PDF
const tw = createTw({
  theme: {
    // fontFamily: {
    //   sans: ["Public Sans"]
    // },
    extend: {
      colors: {
        primary: "#1F2937" // Example color
      }
    }
  }
});

export async function generateCertificate(formData: FormData) {
  const session = await auth();

  if (!(session?.user.id === "1055048")) {
    throw new Error("Unauthorized");
  }

  // Register your custom font if needed

  const recipientName = formData.get("recipientName")?.toString();
  const courseName = formData.get("courseName")?.toString();

  if (!recipientName || !courseName) {
    throw new Error("Recipient Name and Course Name are required");
  }

  // Generate a unique code
  const code = generateUniqueCode();

  // Create PDF certificate using React-PDF and Tailwind CSS

  // Save certificate data to the database
  const data = await prisma.certificate.create({
    data: {
      recipientName,
      courseName,
      code
    }
  });

  // Return the PDF buffer
  redirect(`/api/certifier/${data.id}`);
}

// Helper functions
function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

interface PDFProps {
  recipientName: string;
  courseName: string;
  issueDate: Date;
  qrCodeImage: string;
  code: string;
}

export async function renderCertificateById(id: string) {
  const certificate = await prisma.certificate.findUnique({
    where: {
      id
    }
  });
  if (certificate) {
    const code = certificate.code;
    const qrData = `https://sentral.mysver.se/verify?code=${code}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);
    return (
      <CertificateDocument
        recipientName={certificate.recipientName}
        courseName={certificate.courseName}
        issueDate={certificate.issueDate}
        qrCodeImage={qrCodeImage}
        code={code}
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
  code
}: PDFProps) {
  return (
    <Document>
      <Page style={tw("flex flex-col items-center p-12")}>
        <Text style={tw("text-4xl font-bold mb-4")}>
          MYSverse Certificate of Completion
        </Text>
        <Text style={tw("text-lg mb-2")}>This certifies that</Text>
        <Text style={tw("text-2xl font-semibold mb-4")}>{recipientName}</Text>
        <Text style={tw("text-lg mb-2")}>has completed the course</Text>
        <Text style={tw("text-xl italic mb-6")}>{courseName}</Text>
        <Text style={tw("text-sm mb-8")}>
          Issued on {issueDate.toLocaleDateString()}
        </Text>
        <Text style={tw("text-lg mb-4")}>
          Scan the QR code to verify on MYSverse Sentral
        </Text>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={tw("h-24 w-24")} src={qrCodeImage} />
        <Text style={tw("text-sm tracking-widest my-4")}>{code}</Text>
      </Page>
    </Document>
  );
}
