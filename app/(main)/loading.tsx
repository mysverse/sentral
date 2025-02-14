import Spinner from "components/spinner";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
        <div className="h-screen px-5 py-32">
          <Spinner />
        </div>
      </div>
    </div>
  );
}
