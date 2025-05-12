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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Description
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
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="px-6 py-4 whitespace-nowrap">{course.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {course.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDelete(course.id)}
                  className="text-red-600 hover:text-red-900"
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
