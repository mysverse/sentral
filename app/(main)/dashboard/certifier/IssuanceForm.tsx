"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { generateCertificate } from "./actions";
import Link from "next/link";
import clsx from "clsx";

export default function IssuanceForm() {
  const [recipientName, setRecipientName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(false);

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
    <>
      <h1 className="mb-6 text-center text-2xl font-bold">
        Generate Certificate
      </h1>
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
        <div className="flex flex-col items-center gap-y-4">
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              `w-full rounded-lg px-4 py-2 text-white transition focus:outline-none focus:ring-2 focus:ring-blue-600`,
              loading
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-white hover:text-blue-600 hover:outline hover:outline-2 hover:outline-blue-600"
            )}
          >
            {loading ? "Generating..." : "Generate Certificate"}
          </button>
          <Link
            href="/verify"
            target="_blank"
            className="text-blue-600 underline transition hover:text-blue-400 hover:no-underline"
          >
            Verify Certificate
          </Link>
        </div>
      </form>
    </>
  );
}
