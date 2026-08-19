import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { QueryProvider } from "@/components/query-provider"
import { SessionExpiredModal } from "@/components/session-expired-modal"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
      <SessionExpiredModal />
    </QueryProvider>
  )
}
