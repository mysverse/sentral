"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCourseAction } from "./actions";
import clsx from "clsx";

export default function CourseForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    try {
      await createCourseAction(formData);
      toast.success("Course created successfully!");
      setName("");
      setDescription("");
    } catch (error) {
      toast.error("Failed to create course.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
  );
}
