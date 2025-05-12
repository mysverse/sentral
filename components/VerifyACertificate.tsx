import { DocumentCheckIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export default function VerifyACertificate({ name }: { name?: string }) {
  return (
    <Link
      href="/verify"
      className="flex items-center gap-x-2 rounded px-4 py-2 text-white opacity-100 transition hover:opacity-80"
    >
      <DocumentCheckIcon className="size-5" />
      {name ?? "or verify a certificate"}
    </Link>
  );
}
