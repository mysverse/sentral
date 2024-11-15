import type { NextApiRequest } from "next";
import { pdf } from "@react-pdf/renderer";
import { renderCertificateById } from "app/(main)/dashboard/certifier/actions";

export async function GET(
  req: NextApiRequest,
  { params }: { params: { id: string } }
) {
  const Certificate = await renderCertificateById(params.id);
  if (Certificate) {
    const instance = pdf();
    instance.updateContainer(Certificate);
    const fileBlob = await instance.toBlob();
    // This is the key part - set the headers to tell the browser to download the file
    const headers = new Headers();
    // remember to change the filename here
    headers.append(
      "Content-Disposition",
      'attachment; filename="certificater.pdf"'
    );
    headers.append("Content-Type", "application/pdf");
    return new Response(fileBlob, {
      headers
    });
  }
}
