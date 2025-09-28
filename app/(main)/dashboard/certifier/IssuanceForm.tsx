"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateCertificate } from "./actions";
import Link from "next/link";
import clsx from "clsx";
import { CertificateType, Course } from "generated/client";
import {
  CERTIFICATE_TYPE_LABELS,
  certificateRequiresReason,
  certificateSupportsRobloxId
} from "./certificateTypeConfig";

interface IssuanceFormProps {
  courses: Course[];
}

export default function IssuanceForm({ courses }: IssuanceFormProps) {
  const [recipientName, setRecipientName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<CertificateType>("ROLEPLAY");
  const [identifier, setIdentifier] = useState("");
  const [robloxUserID, setRobloxUserID] = useState("");
  const [recipientUserID, setRecipientUserID] = useState("");
  const [externalOrg, setExternalOrg] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  useEffect(() => {
    if (!certificateRequiresReason(type) && reason) {
      setReason("");
    }
  }, [type, reason]);

  const requiresReason = certificateRequiresReason(type);
  const showRobloxField = certificateSupportsRobloxId(type);

  interface FormElements extends HTMLFormControlsCollection {
    recipientName: HTMLInputElement;
    courseId: HTMLSelectElement;
    identifier: HTMLInputElement;
    type: HTMLSelectElement;
    robloxUserID?: HTMLInputElement;
    recipientUserID?: HTMLInputElement;
    externalOrg?: HTMLInputElement;
    reason?: HTMLInputElement;
  }

  interface CertificateFormElement extends HTMLFormElement {
    readonly elements: FormElements;
  }

  const handleSubmit = async (e: React.FormEvent<CertificateFormElement>) => {
    e.preventDefault();
    if (!courseId) {
      toast.error("Please select a course.");
      return;
    }
    if (!identifier) {
      // Basic check, Zod schema will also validate
      toast.error("Identifier is required.");
      return;
    }
    if (requiresReason && !reason.trim()) {
      toast.error("Reason is required for this certificate type.");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    if (reason) {
      formData.set("reason", reason.trim());
    }

    try {
      await generateCertificate(formData);
      toast.success("Certificate issued successfully!");
      setRecipientName("");
      setIdentifier("");
      setRobloxUserID("");
      setRecipientUserID("");
      setExternalOrg("");
      setReason("");
      // Keep courseId and type selected for potentially issuing multiple similar certs
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to issue certificate"
      );
    }
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
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
      />
      <select
        name="courseId"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        disabled={courses.length === 0}
      >
        <option value="" disabled={courseId !== ""}>
          Select a Course
        </option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>
      {courses.length === 0 && (
        <p className="text-sm text-red-500">
          Please create a course first to issue certificates.
        </p>
      )}

      <input
        type="text"
        name="identifier"
        placeholder="Identifier (e.g., NRIC, Passport, Roblox ID)"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
      />

      <select
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value as CertificateType)}
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
      >
        <option value="ROLEPLAY">
          {`${CERTIFICATE_TYPE_LABELS.ROLEPLAY} (Roleplay)`}
        </option>
        <option value="TEAM_RECOGNITION">
          {`${CERTIFICATE_TYPE_LABELS.TEAM_RECOGNITION} (Team)`}
        </option>
        <option value="EXTERNAL">
          {`${CERTIFICATE_TYPE_LABELS.EXTERNAL} (External)`}
        </option>
        <option value="APPRECIATION">
          {CERTIFICATE_TYPE_LABELS.APPRECIATION}
        </option>
        <option value="ACHIEVEMENT">
          {CERTIFICATE_TYPE_LABELS.ACHIEVEMENT}
        </option>
        <option value="PARTICIPATION">
          {CERTIFICATE_TYPE_LABELS.PARTICIPATION}
        </option>
      </select>

      {showRobloxField && (
        <input
          type="text"
          name="robloxUserID"
          placeholder="Roblox User ID (Optional, if different from Identifier)"
          value={robloxUserID}
          onChange={(e) => setRobloxUserID(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
      )}

      {type === "TEAM_RECOGNITION" && (
        <input
          type="text"
          name="recipientUserID"
          placeholder="Recipient User ID (e.g. Discord ID, Optional)"
          value={recipientUserID}
          onChange={(e) => setRecipientUserID(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
      )}

      {type === "EXTERNAL" && (
        <input
          type="text"
          name="externalOrg"
          placeholder="External Organization (Optional)"
          value={externalOrg}
          onChange={(e) => setExternalOrg(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
      )}
      {requiresReason && (
        <input
          type="text"
          name="reason"
          placeholder="Reason for recognition (e.g. Adjudicator)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
      )}
      <div className="flex flex-col items-center gap-y-4">
        <button
          type="submit"
          disabled={loading || courses.length === 0}
          className={clsx(
            `w-full rounded-lg px-4 py-2 text-white transition focus:ring-2 focus:ring-blue-600 focus:outline-none`,
            loading || courses.length === 0
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
