"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || !allowedRoles.includes(role)) {
      router.push("/login"); // redirect if not allowed
    } else {
      setLoading(false);
    }
  }, [router, allowedRoles]);

  if (loading) return <p className="p-6">Checking access...</p>;

  return <>{children}</>;
}
