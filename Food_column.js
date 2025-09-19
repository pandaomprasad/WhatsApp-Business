// columns.js
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const getFoodColumns = ({ lockedItems, addedItems, lockedItemIds, increaseQty, decreaseQty }) => [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => (
      <Badge
        className={`${
          row.original.type === "Veg"
            ? "bg-green-100 text-green-700 border border-green-100"
            : "bg-red-100 text-red-700 border border-red-100"
        }`}
      >
        {row.original.type}
      </Badge>
    ),
  },
  {
    header: "Price",
    accessorKey: "price",
    cell: ({ row }) => `₹${row.original.price}`,
  },
  {
    header: "Quantity",
    id: "quantity",
    cell: ({ row }) => {
      const id = row.original.id;
      const lockedQty = lockedItems[id] || 0;
      const addedQty = addedItems[id] || 0;
      const totalQty = lockedQty + addedQty;

      return (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => decreaseQty(id)}
            disabled={lockedItemIds.has(id) && !addedItems[id]}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-6 text-center">{totalQty}</span>
          <Button size="sm" variant="outline" onClick={() => increaseQty(id)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
