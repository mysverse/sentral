import DefaultTransitionLayout from "components/transition";

export default function DefaultLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <DefaultTransitionLayout show={true} appear={true}>
        <div className="rounded-lg bg-white px-4 py-4 shadow sm:px-6">
          {children}
        </div>
      </DefaultTransitionLayout>
    </div>
  );
}
