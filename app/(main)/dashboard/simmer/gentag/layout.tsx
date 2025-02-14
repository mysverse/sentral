export const metadata = {
  title: "GenTag"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white px-4 py-4 shadow-sm sm:px-6">
      {children}
    </div>
  );
}
