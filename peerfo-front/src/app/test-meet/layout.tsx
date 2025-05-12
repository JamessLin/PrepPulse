export default function TestMeetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <main className="flex-1 h-full overflow-hidden">{children}</main>
    </div>
  );
} 