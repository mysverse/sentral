"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { generateCertificate } from "./actions";
import Link from "next/link";
import clsx from "clsx";
import { CertificateType } from "@prisma/client";

export default function IssuanceForm() {
  const [recipientName, setRecipientName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<CertificateType>("ROLEPLAY");
  const [robloxUserID, setRobloxUserID] = useState("");
  const [recipientUserID, setRecipientUserID] = useState("");
  const [externalOrg, setExternalOrg] = useState("");

  // Client-side handler
  interface FormElements extends HTMLFormControlsCollection {
    recipientName: HTMLInputElement;
    courseName: HTMLInputElement;
  }

  interface CertificateFormElement extends HTMLFormElement {
    readonly elements: FormElements;
  }

  const handleSubmit = async (e: React.FormEvent<CertificateFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await generateCertificate(formData);
    toast.success("Certificate issued successfully!");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="recipientName"
        placeholder="Recipient Name"
        value={recipientName}
        onChange={(e) => setRecipientName(e.target.value)}
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <input
        type="text"
        name="courseName"
        placeholder="Course Name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <select
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value as CertificateType)}
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <option value="ROLEPLAY">MYSverse Sim Roleplay Certification</option>
        <option value="TEAM_RECOGNITION">Team Member Recognition</option>
        <option value="EXTERNAL">External Collaboration</option>
      </select>

      {type === "ROLEPLAY" && (
        <input
          type="text"
          name="robloxUserID"
          placeholder="Roblox User ID"
          value={robloxUserID}
          onChange={(e) => setRobloxUserID(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      )}

      {type === "TEAM_RECOGNITION" && (
        <input
          type="text"
          name="recipientUserID"
          placeholder="Recipient User ID"
          value={recipientUserID}
          onChange={(e) => setRecipientUserID(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      )}

      {type === "EXTERNAL" && (
        <input
          type="text"
          name="externalOrg"
          placeholder="External Organization"
          value={externalOrg}
          onChange={(e) => setExternalOrg(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      )}
      <div className="flex flex-col items-center gap-y-4">
        <button
          type="submit"
          disabled={loading}
          className={clsx(
            `w-full rounded-lg px-4 py-2 text-white transition focus:outline-none focus:ring-2 focus:ring-blue-600`,
            loading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 outline hover:bg-white hover:text-blue-600 hover:outline-blue-600"
          )}
        >
          {loading ? "Generating..." : "Generate certificate"}
        </button>
        <Link
          href="/verify"
          target="_blank"
          className="text-blue-600 underline transition hover:text-blue-400 hover:no-underline"
        >
          Verify certificate
        </Link>
      </div>
    </form>
  );
}
