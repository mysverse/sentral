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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              API Key
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
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-mono">{apiKey.key}</span>
                <button
                  onClick={() => copyToClipboard(apiKey.key)}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-900"
                >
                  Copy
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {apiKey.course.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${apiKey.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {apiKey.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDelete(apiKey.id)}
                  className="text-red-600 hover:text-red-900"
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
