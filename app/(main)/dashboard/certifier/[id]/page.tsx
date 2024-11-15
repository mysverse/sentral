import { renderCertificateById } from "../actions";
import PDFViewer from "./clientPdf";

export default async function Page({ params }: { params: { id: string } }) {
  const Certificate = await renderCertificateById(params.id);
  if (Certificate) {
    return <PDFViewer>{Certificate}</PDFViewer>;
  }
  return <div>My Post: {params.id}</div>;
}
