export const metadata = {
  title: "inVote"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto my-auto max-w-7xl flex-grow px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
