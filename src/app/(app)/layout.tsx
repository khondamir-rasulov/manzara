import { Sidebar } from "@/components/layout/Sidebar";
import { LanguageProvider } from "@/lib/i18n";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden bg-[#f8f9fc]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
