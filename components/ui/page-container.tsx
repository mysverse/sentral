import clsx from "clsx";

// Single source of truth for page width/padding. Lives in segment layouts
// (not pages) so loading.tsx fallbacks render at the same width as content.
export function PageContainer({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
