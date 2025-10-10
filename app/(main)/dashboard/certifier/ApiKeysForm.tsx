"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createApiKeyAction, deleteApiKeyAction } from "./actions";
import clsx from "clsx";
import type { ApiKey, Course } from "generated/client";

interface ApiKeysFormProps {
  apiKeys: (ApiKey & { course: { name: string } })[];
  courses: Course[];
}

export default function ApiKeysForm({ apiKeys, courses }: ApiKeysFormProps) {
  const [courseId, setCourseId] = useState(
    courses.length > 0 ? courses[0].id : ""
  );
  const [loading, setLoading] = useState(false);
  // const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null); // For displaying new key

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!courseId) {
      toast.error("Please select a course.");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      // Assuming createApiKeyAction does not return the key for security, relying on revalidation
      await createApiKeyAction(formData);
      toast.success(
        "API Key created successfully! It will appear in the list below shortly."
      );
      // If createApiKeyAction were to return the key:
      // const result = await createApiKeyAction(formData);
      // if (result && result.key) { // Assuming result is { key: string } or similar
      //   setNewlyGeneratedKey(result.key);
      //   toast.success("API Key created! Copy it now as you won\'t see it again.");
      // }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create API Key"
      );
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this API Key?")) {
      setLoading(true);
      try {
        await deleteApiKeyAction(id);
        toast.success("API Key deleted successfully!");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete API Key"
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-md font-semibold">Create New API Key</h2>
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
        <button
          type="submit"
          disabled={loading || courses.length === 0}
          className={clsx(
            `w-full rounded-lg px-4 py-2 text-white transition focus:ring-2 focus:ring-blue-600 focus:outline-none`,
            loading || courses.length === 0
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {loading ? "Creating..." : "Create API Key"}
        </button>
        {courses.length === 0 && (
          <p className="text-sm text-red-500">Please create a course first.</p>
        )}
      </form>

      {/* {newlyGeneratedKey && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p><strong>New API Key Generated:</strong> {newlyGeneratedKey}</p>
          <p className="font-semibold">Please copy this key. You will not be able to see it again.</p>
          <button onClick={() => setNewlyGeneratedKey(null)} className="mt-2 text-sm text-green-700 underline">Dismiss</button>
        </div>
      )} */}

      <div>
        <h2 className="text-md mb-2 font-semibold">Existing API Keys</h2>
        {apiKeys.length === 0 ? (
          <p>No API Keys found.</p>
        ) : (
          <ul className="space-y-2">
            {apiKeys.map((apiKey) => (
              <li
                key={apiKey.id}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <div>
                  <span className="rounded bg-gray-100 p-1 font-mono break-all">
                    {apiKey.key}
                  </span>
                  <span className="ml-2">(Course: {apiKey.course.name})</span>
                  <span
                    className={clsx(
                      "ml-2 rounded-full px-2 py-0.5 text-xs",
                      apiKey.isActive
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    )}
                  >
                    {apiKey.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(apiKey.id)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
