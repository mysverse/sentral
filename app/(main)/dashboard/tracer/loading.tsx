import Spinner from "components/spinner";

export default function Loading() {
  return (
    <div className="rounded-lg bg-white px-5 py-32 shadow-sm sm:px-6">
      <Spinner />
    </div>
  );
}
