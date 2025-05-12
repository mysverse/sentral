"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCourseAction, deleteCourseAction } from "./actions";
import clsx from "clsx";
import type { Course } from "generated/client";

interface CoursesFormProps {
  courses: Course[];
}

export default function CoursesForm({ courses }: CoursesFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createCourseAction(formData);
      toast.success("Course created successfully!");
      setName("");
      setDescription("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create course"
      );
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this course and all its related data (batches, API keys, certificates)?"
      )
    ) {
      setLoading(true);
      try {
        await deleteCourseAction(id);
        toast.success("Course deleted successfully!");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete course"
        );
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-md font-semibold">Create New Course</h2>
        <input
          type="text"
          name="name"
          placeholder="Course Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
        <textarea
          name="description"
          placeholder="Course Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className={clsx(
            `w-full rounded-lg px-4 py-2 text-white transition focus:ring-2 focus:ring-blue-600 focus:outline-none`,
            loading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
      <div>
        <h2 className="text-md mb-2 font-semibold">Existing Courses</h2>
        {courses.length === 0 ? (
          <p>No courses found.</p>
        ) : (
          <ul className="space-y-2">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <span>
                  {course.name}
                  {course.description && ` - ${course.description}`}
                </span>
                <button
                  onClick={() => handleDelete(course.id)}
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
