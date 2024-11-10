import Spinner from "components/spinner";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="h-96 px-5 py-32">
      <Spinner />
    </div>
  );
}
