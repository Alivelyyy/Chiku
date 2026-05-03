import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#070707] text-white">
      <PublicNavbar />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
