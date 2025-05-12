"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createBatchAction } from "./actions";
import { getCourses } from "./utils"; // To fetch courses for the dropdown
import { Course } from "generated/client";
import clsx from "clsx";

export default function BatchForm() {
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);

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
    const formData = new FormData();
    formData.append("name", name);
    formData.append("courseId", courseId);

    try {
      await createBatchAction(formData);
      toast.success("Batch created successfully!");
      setName("");
      // Optionally reset courseId or keep it for creating multiple batches for the same course
    } catch (error) {
      toast.error("Failed to create batch.");
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
        {loading ? "Creating..." : "Create Batch"}
      </button>
    </form>
  );
}
