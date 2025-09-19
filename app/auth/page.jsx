"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "../dashboard/page";
// import DashboardContent from "./DashboardContent"; // your current Dashboard component

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !["owner", "cashier"].includes(role)) {
      router.push("/login"); // redirect if not authorized
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <p className="p-8">Checking authentication...</p>;

  return <Dashboard />;
}
