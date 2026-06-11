const dotStyle = "h-2.5 w-2.5 rounded-full bg-primary-500";

export default function Spinner() {
  return (
    <div
      className="flex items-center justify-center gap-x-1.5"
      role="status"
      aria-label="Loading"
    >
      <div
        className={dotStyle}
        style={{ animation: "dot-fade 1.2s ease-in-out 0s infinite" }}
      />
      <div
        className={dotStyle}
        style={{ animation: "dot-fade 1.2s ease-in-out 0.2s infinite" }}
      />
      <div
        className={dotStyle}
        style={{ animation: "dot-fade 1.2s ease-in-out 0.4s infinite" }}
      />
    </div>
  );
}
