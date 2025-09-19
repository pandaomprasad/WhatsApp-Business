import ProtectedRoute from "@/utils/ProtectedRoute";
import BillsPageComponent from "./BillsPageComponent"; // your existing component

export default function BillsPage() {
  return (
    <ProtectedRoute allowedRoles={["cashier", "owner"]}>
      <BillsPageComponent />
    </ProtectedRoute>
  );
}
