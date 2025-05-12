"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createApiKeyAction } from "./actions";
import { getCourses } from "./utils"; // To fetch courses for the dropdown
import { Course } from "generated/client";
import clsx from "clsx";

export default function ApiKeyForm() {
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setCoursesLoading(true);
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
        if (fetchedCourses.length > 0) {
          setCourseId(fetchedCourses[0].id); // Default to the first course
        }
      } catch (error) {
        toast.error("Failed to load courses.");
        console.error(error);
      } finally {
        setCoursesLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!courseId) {
      toast.error("Please select a course.");
      return;
    }
    setLoading(true);
    setGeneratedKey(null); // Reset previous key
    const formData = new FormData();
    formData.append("courseId", courseId);

    try {
      const newKey = await createApiKeyAction(formData);
      toast.success("API Key created successfully!");
      setGeneratedKey(newKey);
      // Optionally reset courseId or keep it
    } catch (error) {
      toast.error("Failed to create API Key.");
      console.error(error);
    } finally {
      setLoading(false);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        name="courseId"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        required
        disabled={coursesLoading || courses.length === 0}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
      >
        {coursesLoading ? (
          <option>Loading courses...</option>
        ) : courses.length === 0 ? (
          <option>No courses available. Create a course first.</option>
        ) : (
          courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))
        )}
      </select>
      <button
        type="submit"
        disabled={loading || coursesLoading || courses.length === 0}
        className={clsx(
          `w-full rounded-lg px-4 py-2 text-white transition focus:ring-2 focus:ring-blue-600 focus:outline-none`,
          loading || coursesLoading || courses.length === 0
            ? "cursor-not-allowed bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        {loading ? "Generating..." : "Generate API Key"}
      </button>
      {generatedKey && (
        <div className="mt-4 rounded-lg border border-green-300 bg-green-50 p-3">
          <p className="text-sm text-green-700">
            New API Key (Save this key, it won&apos;t be shown again):
          </p>
          <div className="flex items-center justify-between">
            <span className="font-mono text-green-800">{generatedKey}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(generatedKey)}
              className="ml-2 text-sm text-blue-600 hover:text-blue-900"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
