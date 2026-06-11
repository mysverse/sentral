import clsx from "clsx";

type CardVariant = "default" | "elevated" | "glass";
type CardPadding = "none" | "sm" | "md";

const variantStyles: Record<CardVariant, string> = {
  default: "bg-surface shadow-sm",
  elevated: "bg-surface shadow-lg",
  glass: "border border-white/20 bg-white/10 shadow-2xl backdrop-blur-lg"
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "px-4 py-4 sm:px-6",
  md: "px-4 py-5 sm:px-6"
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  children
}: {
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "rounded-lg",
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
