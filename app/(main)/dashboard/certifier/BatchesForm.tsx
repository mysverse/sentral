"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createBatchAction, deleteBatchAction } from "./actions";
import clsx from "clsx";
import type { Batch, Course } from "generated/client";

interface BatchesFormProps {
  batches: (Batch & { course: { name: string } })[];
  courses: Course[];
}

export default function BatchesForm({ batches, courses }: BatchesFormProps) {
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id);
    }
  }, [courses, courseId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!courseId) {
      toast.error("Please select a course.");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createBatchAction(formData);
      toast.success("Batch created successfully!");
      setName("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create batch"
      );
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this batch and all its related certificates?"
      )
    ) {
      setLoading(true);
      try {
        await deleteBatchAction(id);
        toast.success("Batch deleted successfully!");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete batch"
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-md font-semibold">Create New Batch</h2>
        <input
          type="text"
          name="name"
          placeholder="Batch Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          {loading ? "Creating..." : "Create Batch"}
        </button>
        {courses.length === 0 && (
          <p className="text-sm text-red-500">Please create a course first.</p>
        )}
      </form>
      <div>
        <h2 className="text-md mb-2 font-semibold">Existing Batches</h2>
        {batches.length === 0 ? (
          <p>No batches found.</p>
        ) : (
          <ul className="space-y-2">
            {batches.map((batch) => (
              <li
                key={batch.id}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <span>
                  {batch.name} (Course: {batch.course.name})
                </span>
                <button
                  onClick={() => handleDelete(batch.id)}
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
