import type { NextRequest } from "next/server";
import { exportCertificateById } from "app/(main)/dashboard/certifier/actions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const download = !(url.searchParams.get("view") === "true");
  const filename = "mysverse_certificate.pdf";
  const file = await exportCertificateById(params.id);
  if (file) {
    // This is the key part - set the headers to tell the browser to download the file
    const headers = new Headers();
    // remember to change the filename here
    headers.append(
      "Content-Disposition",
      `${download ? "attachment" : "inline"}; filename="${filename}"`
    );
    headers.append("Content-Type", "application/pdf");
    return new Response(file, {
      headers
    });
  }
}
