import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#070707]">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
