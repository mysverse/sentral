export const metadata = {
  title: "GenTag"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-lg px-4 py-4 shadow-sm sm:px-6">
      {children}
    </div>
  );
}
