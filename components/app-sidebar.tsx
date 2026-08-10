"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Layers,
  Sparkles,
  TrendingUp,
  Stethoscope,
  Building2,
  HeartHandshake,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const contentNav = [
  { title: "Blog", href: "/blog-posts", icon: BookOpen },
  { title: "Páginas", href: "/pages", icon: FileText },
]

const configNav = [
  { title: "Tipos de Experiência", href: "/experience-types", icon: Sparkles },
  { title: "Formulários", href: "/schemas", icon: Layers },
  { title: "PAI", href: "/pai", icon: HeartHandshake },
]

const platformNav = [
  { title: "Leads", href: "/leads", icon: TrendingUp },
  { title: "Profissionais", href: "/professionals", icon: Stethoscope },
  { title: "Estabelecimentos", href: "/establishments", icon: Building2 },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <span
                  className="text-5xl font-medium leading-none tracking-wide"
                  style={{ fontFamily: "var(--font-wordmark)" }}
                >
                  GAIA
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Painel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conteúdo</SidebarGroupLabel>
          <SidebarMenu>
            {contentNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                  <Link href={item.href}>
                    <item.icon className="text-[#8752AD]"/>
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuração</SidebarGroupLabel>
          <SidebarMenu>
            {configNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                  <Link href={item.href}>
                   <item.icon className="text-[#8752AD]"/>
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarMenu>
            {platformNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                  <Link href={item.href}>
                    <item.icon className="text-[#8752AD]"/>
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
