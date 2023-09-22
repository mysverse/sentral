export default function Spinner() {
  return (
    <div className="flex items-center justify-center space-x-2 animate-pulse">
      <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
      <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
      <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
    </div>
  );
}
