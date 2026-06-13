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
      <table className="divide-edge min-w-full divide-y">
        <thead className="bg-surface-muted">
          <tr>
            <th
              scope="col"
              className="text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
            >
              Batch Name
            </th>
            <th
              scope="col"
              className="text-muted px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
            >
              Course Name
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
          {batches.map((batch) => (
            <tr key={batch.id}>
              <td className="px-6 py-4 whitespace-nowrap">{batch.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {batch.course.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDelete(batch.id)}
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
