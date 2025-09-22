"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState } from "react";
import SiteHeader from "./components/header/siteheader";

import { Provider } from "react-redux";
import { store } from "@/store/store";

import { NotificationsContainer } from "@/app/components/Notification/NotificationsContainer";
import { NotificationsProvider } from "@/NotificationsProvider";

import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // ✅ any "public" route without sidebar/navbar
  const publicRoutes = ["/login", "/register"];
  const isPublic = publicRoutes.includes(pathname);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider store={store}>
          <NotificationsProvider>
            {isPublic ? (
              // 👉 Only render page content (no sidebar/header)
              <main className="flex min-h-screen items-center justify-center bg-gray-50">
                {children}
              </main>
            ) : (
              // 👉 Normal layout
              <SidebarProvider>
                <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                {/* <SidebarTrigger /> */}
                <main
                  className={`flex-1 transition-all duration-300 ${
                    collapsed ? "max-w-xl" : "max-w-8xl"
                  }`}
                >
                  <SiteHeader />
                  {children}
                </main>
              </SidebarProvider>
            )}

            <NotificationsContainer />
          </NotificationsProvider>
        </Provider>
      </body>
    </html>
  );
}
