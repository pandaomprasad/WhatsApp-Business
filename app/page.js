"use client";
import ExpandableCardDemo from "@/components/expandable-card-demo-grid";
import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";
import SiteHeader from "./components/header/siteheader";
import OwnerPage from "./owners/page";

export default function Home() {
  return (
    <main className="flex-1 overflow-auto">
      {/* <section className="mt-6">
        <ExpandableCardDemo />
      </section> */}
      <OwnerPage/>
    </main>
  );
}
