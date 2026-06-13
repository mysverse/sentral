"use client";

import { deleteApiKeyAction } from "./actions";
import { toast } from "sonner";
import { ApiKey } from "generated/client"; // Assuming ApiKey and Course types are available

interface ApiKeysTableProps {
  apiKeys: (ApiKey & { course: { name: string } })[]; // ApiKey with course name
}

export default function ApiKeysTable({ apiKeys }: ApiKeysTableProps) {
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      try {
        await deleteApiKeyAction(id);
        toast.success("API Key deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete API key.");
        console.error(error);
      }
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard
      .writeText(key)
      .then(() => {
        toast.success("API Key copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy API Key.");
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="overflow-x-auto">
      <table className="divide-edge min-w-full divide-y">
        <thead className="bg-surface-muted">
          <tr>
            <th
              scope="col"
              className="text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
            >
              API Key
            </th>
            <th
              scope="col"
              className="text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
            >
              Course Name
            </th>
            <th
              scope="col"
              className="text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
            >
              Status
            </th>
            <th
              scope="col"
              className="text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-edge bg-surface divide-y">
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-mono">{apiKey.key}</span>
                <button
                  onClick={() => copyToClipboard(apiKey.key)}
                  className="text-primary-600 ml-2 text-sm hover:text-blue-900 dark:hover:text-blue-400"
                >
                  Copy
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {apiKey.course.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${apiKey.isActive ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"}`}
                >
                  {apiKey.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDelete(apiKey.id)}
                  className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                >
                  Delete
                </button>
                {/* Add toggle status button here if needed */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
