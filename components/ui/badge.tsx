import clsx from "clsx";

type BadgeColor = "neutral" | "primary" | "green" | "yellow" | "red";

const colorStyles: Record<BadgeColor, string> = {
  neutral: "bg-surface-muted text-muted",
  primary:
    "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
  green: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  yellow:
    "bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  red: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
};

export function Badge({
  color = "neutral",
  className,
  children
}: {
  color?: BadgeColor;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        colorStyles[color],
        className
      )}
    >
      {children}
    </span>
  );
}
