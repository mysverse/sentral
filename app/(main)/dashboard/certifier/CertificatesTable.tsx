"use client";

import type { getCertificates } from "./utils";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCertificate } from "./actions";
import Link from "next/link";
import ConfirmationDialog from "components/ConfirmationDialog";
import { CERTIFICATE_TYPE_LABELS } from "./certificateTypeConfig";

function renderDetails(certificate: Certificates[number]) {
  switch (certificate.type) {
    case "ROLEPLAY":
      return certificate.robloxUserID
        ? `Roblox ID: ${certificate.robloxUserID}`
        : null;
    case "TEAM_RECOGNITION":
      return certificate.recipientUserID
        ? `User ID: ${certificate.recipientUserID}`
        : null;
    case "EXTERNAL":
      return certificate.externalOrg
        ? `Organization: ${certificate.externalOrg}`
        : null;
    case "APPRECIATION":
    case "ACHIEVEMENT":
    case "PARTICIPATION": {
      const details: string[] = [];
      if (certificate.reason) {
        details.push(`Reason: ${certificate.reason}`);
      }
      if (certificate.robloxUserID) {
        details.push(`Roblox ID: ${certificate.robloxUserID}`);
      }
      return details.join(" | ") || null;
    }
    default:
      return null;
  }
}

type Certificates = Awaited<ReturnType<typeof getCertificates>>;

export default function CertificatesTable({
  certificates
}: {
  certificates: Certificates;
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(
    null
  );

  const handleRevoke = async () => {
    if (selectedCertificate) {
      await deleteCertificate(selectedCertificate);
      toast.success("Certificate revoked successfully!");
      setShowModal(false);
      setSelectedCertificate(null);
    }
  };

  const openModal = (id: string) => {
    setSelectedCertificate(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCertificate(null);
  };

  return (
    <>
      <table className="min-w-full divide-y divide-gray-200 rounded-lg bg-white shadow-md">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Recipient Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Course Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Issued On
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Certificate Code
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Type
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Details
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {certificates.map((certificate) => (
            <tr key={certificate.id}>
              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                {certificate.recipientName}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {certificate.courseName}
              </td>
              <td
                className="px-6 py-4 text-sm whitespace-nowrap text-gray-500"
                suppressHydrationWarning
              >
                {new Date(certificate.issueDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {certificate.code}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {CERTIFICATE_TYPE_LABELS[certificate.type] ?? certificate.type}
              </td>
              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                {renderDetails(certificate)}
              </td>
              <td className="space-x-3 px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                <Link
                  href={`/api/certifier/${certificate.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Download
                </Link>
                <Link
                  href={`/api/certifier/${certificate.id}?view=true`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View
                </Link>
                <button
                  onClick={() => openModal(certificate.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmationDialog
        isOpen={showModal}
        onClose={closeModal}
        onConfirm={handleRevoke}
        title="Confirm Revocation"
        description="Are you sure you want to revoke this certificate?"
        confirmText="Revoke"
        cancelText="Cancel"
      />
    </>
  );
}
