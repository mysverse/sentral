"use client";

import { deleteBatchAction } from "./actions";
import { toast } from "sonner";
import { Batch } from "generated/client"; // Assuming Batch and Course types are available

interface BatchesTableProps {
  batches: (Batch & { course: { name: string } })[]; // Batch with course name
}

export default function BatchesTable({ batches }: BatchesTableProps) {
  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this batch and all its related certificates?"
      )
    ) {
      try {
        await deleteBatchAction(id);
        toast.success("Batch deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete batch.");
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
              Batch Name
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
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {batches.map((batch) => (
            <tr key={batch.id}>
              <td className="px-6 py-4 whitespace-nowrap">{batch.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {batch.course.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDelete(batch.id)}
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
