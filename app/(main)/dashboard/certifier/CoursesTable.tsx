"use client";

import { deleteCourseAction } from "./actions";
import { toast } from "sonner";
import { Course } from "generated/client"; // Assuming Course type is available

interface CoursesTableProps {
  courses: Course[];
}

export default function CoursesTable({ courses }: CoursesTableProps) {
  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this course and all its related data (batches, API keys, certificates)?"
      )
    ) {
      try {
        await deleteCourseAction(id);
        toast.success("Course deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete course.");
        console.error(error);
      }
    }
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
              Name
            </th>
            <th
              scope="col"
              className="text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
            >
              Description
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
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="px-6 py-4 whitespace-nowrap">{course.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {course.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDelete(course.id)}
                  className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
