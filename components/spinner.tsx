export default function Spinner() {
  return (
    <div className="flex animate-pulse items-center justify-center space-x-2">
      <div className="h-6 w-6 rounded-full bg-blue-500"></div>
      <div className="h-6 w-6 rounded-full bg-blue-500"></div>
      <div className="h-6 w-6 rounded-full bg-blue-500"></div>
    </div>
  );
}
