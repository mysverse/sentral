export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="flex min-h-dvh flex-row items-center justify-center bg-gradient-to-l from-blue-500 via-blue-700 to-blue-800">
          {children}
        </div>
      </body>
    </html>
  );
}
