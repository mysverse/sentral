import type { NextRequest } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { renderCertificateById } from "app/(main)/dashboard/certifier/actions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const filename = "mysverse_certificate.pdf";
  const certificate = await renderCertificateById(params.id);
  if (certificate) {
    const instance = pdf();
    instance.updateContainer(certificate);
    const fileBlob = await instance.toBlob();
    // This is the key part - set the headers to tell the browser to download the file
    const headers = new Headers();
    // remember to change the filename here
    headers.append("Content-Disposition", `attachment; filename="${filename}"`);
    headers.append("Content-Type", "application/pdf");
    return new Response(fileBlob, {
      headers
    });
  }
}
