"use client";

import { Button } from "components/catalyst/button";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { CertificateType, Course } from "generated/client";
import {
  CERTIFICATE_TYPE_LABELS,
  certificateRequiresReason,
  parseCertificateTypeInput
} from "./certificateTypeConfig";
import { generateBulkCertificates } from "./actions";

const SAMPLE_DATA = `Type,Recipient Name,Roblox User ID,Reason\nAppreciation,CynicallyClash,290965021,Adjudicator\nAchievement,T4keshiNakazato,2006064274,1st Place Team (Malay Category)\nParticipation,aimaankh87,3014712148,Participation`;

type BulkActionResult = Awaited<ReturnType<typeof generateBulkCertificates>>;

type BulkEntryPayload = {
  index: number;
  recipientName: string;
  identifier: string;
  type: CertificateType;
  robloxUserID?: string;
  recipientUserID?: string;
  externalOrg?: string;
  reason?: string;
};

type ParsedLine = {
  index: number;
  raw: string;
  columns: string[];
  payload?: BulkEntryPayload;
  errors: string[];
};

function splitLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if ((char === "," || char === "\t") && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());

  return cells;
}

function looksLikeHeader(columns: string[]): boolean {
  const headerTokens = ["certificate", "type", "recipient", "roblox", "reason"];
  const normalized = columns
    .map((column) => column.trim().toLowerCase())
    .filter(Boolean);

  if (normalized.length === 0) {
    return false;
  }

  const matches = normalized.filter((column) =>
    headerTokens.some((token) => column.includes(token))
  );

  return matches.length >= 2;
}

function parseBulkInput(raw: string): ParsedLine[] {
  const lines: ParsedLine[] = [];
  const rows = raw.replace(/\r\n/g, "\n").split("\n");
  let headerConsumed = false;

  rows.forEach((row, rowIndex) => {
    const trimmed = row.trim();
    if (!trimmed) {
      return;
    }

    const columns = splitLine(row);

    if (!headerConsumed && looksLikeHeader(columns)) {
      headerConsumed = true;
      return;
    }

    const lineNumber = rowIndex + 1;
    const errors: string[] = [];

    const [
      typeInput = "",
      recipientNameInput = "",
      identifierInput = "",
      ...rest
    ] = columns;

    const type = parseCertificateTypeInput(typeInput);
    if (!type) {
      errors.push("Unknown certificate type");
    }

    const recipientName = recipientNameInput.trim();
    if (!recipientName) {
      errors.push("Recipient name is required");
    }

    const identifierCandidate = identifierInput.trim();
    const identifier = identifierCandidate || recipientName;
    if (!identifier) {
      errors.push("Identifier is required");
    }

    const reasonRaw = rest.join(" ").trim();
    const reason = reasonRaw || undefined;

    const robloxUserID = identifierCandidate || undefined;

    if (type && certificateRequiresReason(type) && !reason) {
      errors.push("Reason is required for this certificate type");
    }

    const payload: BulkEntryPayload | undefined =
      errors.length === 0 && type
        ? {
            index: lineNumber,
            recipientName,
            identifier,
            type,
            robloxUserID,
            reason
          }
        : undefined;

    lines.push({
      index: lineNumber,
      raw: row,
      columns,
      payload,
      errors
    });
  });

  return lines;
}

function getLineStatus(
  line: ParsedLine,
  result: BulkActionResult | null
):
  | { type: "success"; code: string }
  | { type: "failure"; message: string }
  | undefined {
  if (!result) {
    return undefined;
  }

  const successMatch = result.successes.find(
    (entry) => entry.index === line.index
  );
  if (successMatch) {
    return { type: "success", code: successMatch.code };
  }

  const failureMatch = result.failures.find(
    (entry) => entry.index === line.index
  );
  if (failureMatch) {
    return { type: "failure", message: failureMatch.error };
  }

  return undefined;
}

interface BulkIssuanceFormProps {
  courses: Course[];
}

export default function BulkIssuanceForm({ courses }: BulkIssuanceFormProps) {
  const [courseId, setCourseId] = useState(() => courses[0]?.id ?? "");
  const [rawInput, setRawInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<BulkActionResult | null>(null);

  const parsedLines = useMemo(() => parseBulkInput(rawInput), [rawInput]);

  const validPayloads = useMemo(
    () =>
      parsedLines
        .filter((line) => line.payload && line.errors.length === 0)
        .map((line) => line.payload as BulkEntryPayload),
    [parsedLines]
  );

  const totalLines = parsedLines.length;
  const totalErrors = parsedLines.reduce(
    (count, line) => count + (line.errors.length > 0 ? 1 : 0),
    0
  );

  const [resultDeps, setResultDeps] = useState({ rawInput, courseId });
  if (resultDeps.rawInput !== rawInput || resultDeps.courseId !== courseId) {
    setResultDeps({ rawInput, courseId });
    setResult(null);
  }

  const handleInsertSample = () => {
    setRawInput(SAMPLE_DATA);
  };

  const handleClear = () => {
    setRawInput("");
    setResult(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (courses.length === 0) {
      toast.error("Please create a course before issuing certificates.");
      return;
    }

    if (!courseId) {
      toast.error("Select a course before issuing certificates.");
      return;
    }

    if (validPayloads.length === 0) {
      toast.error("Add at least one valid entry to issue certificates.");
      return;
    }

    if (totalErrors > 0) {
      toast.error(
        "Resolve the highlighted errors before issuing certificates."
      );
      return;
    }

    const formData = new FormData();
    formData.set("courseId", courseId);
    formData.set("entries", JSON.stringify(validPayloads));

    try {
      setIsSubmitting(true);
      const submissionResult = await generateBulkCertificates(formData);
      setResult(submissionResult);

      if (
        submissionResult.successCount > 0 &&
        submissionResult.failureCount === 0
      ) {
        toast.success(
          `Issued ${submissionResult.successCount} certificates successfully.`
        );
      } else if (submissionResult.successCount > 0) {
        toast.success(
          `${submissionResult.successCount} certificates issued. ${submissionResult.failureCount} failed.`
        );
      } else {
        toast.error("No certificates were issued.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to issue certificates."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Bulk Issue Certificates</h2>
          <p className="text-muted text-sm">
            Paste rows in the format: Type, Recipient Name, Roblox User ID,
            Reason. Headers are optional. Each row must include a valid
            certificate type.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleInsertSample}
            className="text-primary-600 rounded border border-blue-200 px-3 py-1 text-sm transition hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
          >
            Insert sample
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="border-edge text-muted hover:bg-surface-muted rounded border px-3 py-1 text-sm transition"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="bulk-course">
            Course
          </label>
          <select
            id="bulk-course"
            name="courseId"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            required
            className="border-edge bg-surface text-strong w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            disabled={courses.length === 0}
          >
            <option value="" disabled>
              Select a course
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
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="bulk-format">
            Accepted columns
          </label>
          <div
            id="bulk-format"
            className="border-edge bg-surface-muted text-muted rounded-lg border border-dashed px-4 py-3 text-sm"
          >
            <p>
              <span className="font-semibold">Type</span> → matches any existing
              certificate type (e.g. “Achievement” or “Certificate of
              Appreciation”).
            </p>
            <p>
              <span className="font-semibold">Recipient Name</span> → Roblox
              username or display name.
            </p>
            <p>
              <span className="font-semibold">Roblox User ID</span> → used as
              the unique identifier (defaults to the recipient name if left
              blank).
            </p>
            <p>
              <span className="font-semibold">Reason</span> → required for
              Appreciation, Achievement, and Participation certificates.
            </p>
          </div>
        </div>
      </div>

      <textarea
        name="bulkEntries"
        value={rawInput}
        onChange={(event) => setRawInput(event.target.value)}
        placeholder="Appreciation,CynicallyClash,290965021,Adjudicator"
        rows={8}
        className="border-edge bg-surface text-strong placeholder:text-muted w-full rounded-lg border px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
      />

      <div className="text-muted flex flex-wrap items-center gap-4 text-sm">
        <span>
          Parsed rows: <strong>{totalLines}</strong>
        </span>
        <span>
          Valid entries: <strong>{validPayloads.length}</strong>
        </span>
        <span>
          Rows with errors:{" "}
          <strong
            className={
              totalErrors > 0 ? "text-red-600 dark:text-red-400" : undefined
            }
          >
            {totalErrors}
          </strong>
        </span>
      </div>

      {parsedLines.length > 0 && (
        <div className="overflow-x-auto">
          <table className="divide-edge border-edge min-w-full divide-y rounded-lg border">
            <thead className="bg-surface-muted">
              <tr>
                <th className="text-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase">
                  Row
                </th>
                <th className="text-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase">
                  Type
                </th>
                <th className="text-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase">
                  Recipient
                </th>
                <th className="text-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase">
                  Identifier
                </th>
                <th className="text-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase">
                  Reason
                </th>
                <th className="text-muted px-4 py-2 text-left text-xs font-semibold tracking-wide uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-edge bg-surface divide-y text-sm">
              {parsedLines.map((line) => {
                const status = getLineStatus(line, result);
                const isError =
                  line.errors.length > 0 || status?.type === "failure";
                const isSuccess = status?.type === "success";

                const typeLabel = line.payload
                  ? CERTIFICATE_TYPE_LABELS[line.payload.type]
                  : line.columns[0]?.trim();

                return (
                  <tr
                    key={line.index}
                    className={clsx(
                      isError && "bg-red-50 dark:bg-red-950",
                      isSuccess && "bg-green-50 dark:bg-green-950"
                    )}
                  >
                    <td className="text-muted px-4 py-2 font-mono text-xs whitespace-nowrap">
                      {line.index}
                    </td>
                    <td className="text-strong px-4 py-2 whitespace-nowrap">
                      {typeLabel}
                    </td>
                    <td className="text-strong px-4 py-2 whitespace-nowrap">
                      {line.payload?.recipientName ?? line.columns[1] ?? "—"}
                    </td>
                    <td className="text-strong px-4 py-2 whitespace-nowrap">
                      {line.payload?.identifier ?? line.columns[2] ?? "—"}
                    </td>
                    <td className="text-strong px-4 py-2 whitespace-pre-wrap">
                      {line.payload?.reason ??
                        line.columns.slice(3).join(" ") ??
                        ""}
                    </td>
                    <td className="text-strong px-4 py-2">
                      {line.errors.length > 0 ? (
                        <ul className="list-inside list-disc text-xs text-red-600 dark:text-red-400">
                          {line.errors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      ) : status ? (
                        status.type === "success" ? (
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Issued · Code: {status.code}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">
                            {status.message}
                          </span>
                        )
                      ) : (
                        <span className="text-muted text-xs">Ready</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {result && (
        <div className="border-edge bg-surface-muted text-strong rounded-lg border px-4 py-3 text-sm">
          <p>
            <strong>{result.successCount}</strong> certificates issued
            successfully.
          </p>
          {result.failureCount > 0 && (
            <p className="text-red-600 dark:text-red-400">
              <strong>{result.failureCount}</strong> certificates failed to
              issue. Review the table above for details.
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || courses.length === 0}
        className="w-full"
      >
        {isSubmitting ? "Issuing certificates…" : "Issue certificates"}
      </Button>
    </form>
  );
}
