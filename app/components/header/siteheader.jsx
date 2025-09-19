"use client";

import { useId, useState, useEffect } from "react";
import {
  PowerIcon,
  PowerOffIcon,
  CoffeeIcon,
  SunIcon,
  MoonIcon,
  IndianRupee,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const navigationLinks = [{ href: "#", label: "Overview", active: true }];

export default function SiteHeader() {
  const id = useId();
  const [powerOn, setPowerOn] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // ✅ Orders & Revenue state
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // ✅ Fetch bills & update orders/revenue
  async function fetchBills() {
    try {
      const res = await fetch("/api/bills");
      if (!res.ok) return;
      const data = await res.json();

      setTotalOrders(data.length);
      setTotalRevenue(data.reduce((sum, b) => sum + (b.grandTotal || 0), 0));
    } catch (err) {
      console.error("🚨 Error fetching bills:", err);
    }
  }

  // ✅ Auto-refresh every 3 seconds
  useEffect(() => {
    fetchBills(); // first load
    const interval = setInterval(fetchBills, 3000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Dark mode toggle
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("transition-colors", "duration-300", "ease-in-out");
    if (darkMode) html.classList.add("dark");
    else html.classList.remove("dark");
  }, [darkMode]);

  return (
    <header className="border-b px-4 md:px-6 bg-white dark:bg-black transition-colors duration-100">
      <div className="flex h-16 justify-between gap-4">
        {/* Left side */}
        <div className="flex gap-2">
          <div className="flex items-center md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="group size-8" variant="ghost" size="icon">
                  ☰
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-36 p-1 md:hidden">
                <NavigationMenu className="max-w-none *:w-full">
                  <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <NavigationMenuLink href={link.href} className="py-1.5">
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className={`gap-1.5 transition-colors duration-300 ${
              powerOn
                ? "text-emerald-600 border-emerald-600"
                : "text-red-600 border-red-600"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                powerOn ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {powerOn ? "Online" : "Offline"}
          </Badge>

          <Badge variant="outline" className="gap-1.5">
            <CoffeeIcon size={12} /> {totalOrders} Orders
          </Badge>

          <Badge variant="outline" className="gap-1.5 text-emerald-600">
            <IndianRupee size={12} className="text-black dark:text-white" /> {totalRevenue.toFixed(2)}
          </Badge>

          {/* Power Toggle */}
          <div>
            <Switch
              id={`${id}-power`}
              checked={powerOn}
              onCheckedChange={setPowerOn}
            />
            <Label htmlFor={`${id}-power`} className="sr-only">
              Power
            </Label>
          </div>

          {/* Dark mode */}
          <Button
            variant="ghost"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full"
          >
            {darkMode ? <MoonIcon size={18} /> : <SunIcon size={18} />}
          </Button>
        </div>
      </div>
    </header>
  );
}
