"use client"

import { usePathname } from "next/navigation"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { logout } from "@/utils/logout"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/cashier",
    icon: Home,
  },
  {
    title: "Order",
    url: "/",
    icon: Inbox,
  },
  {
    title: "Bill",
    url: "/bills",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/History",
    icon: Search,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Settings,
  },
  // {
  //   title: "Login",
  //   url: "/login",
  //   icon: Settings,
  // },
  // {
  //   title: "Register",
  //   url: "/register",
  //   icon: Settings,
  // },
]

export function AppSidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 ${
                            isActive ? "text-primary-foreground" : "text-muted-foreground"
                          }`}
                        />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter>
          <Button onClick={logout}>Log Out</Button>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}
