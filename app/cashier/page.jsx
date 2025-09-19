"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DataTable from "@/app/components/table/DataTable";
import ProtectedRoute from "@/utils/ProtectedRoute";
import CashierPageComponent from "./CashierPageComponent";

export default function CashierPage() {
  return (
    <ProtectedRoute allowedRoles={["cashier", "owner"]}>
      <CashierPageComponent />
    </ProtectedRoute>
  );
}
