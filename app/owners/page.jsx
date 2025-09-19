"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import DataTable from "../components/table/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function OwnerPage() {
  const [admin, setAdmin] = useState(null);
  const [totalTables, setTotalTables] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [veg, setVeg] = useState(true);
  const [category, setCategory] = useState("");
  const [active, setActive] = useState(true);
  const [editId, setEditId] = useState(null);

  // ✅ dynamic categories for filter
  const [categories, setCategories] = useState([]);

  // ✅ filters
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterVeg, setFilterVeg] = useState(null); // "veg", "nonveg", or null
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editData, setEditData] = useState({
    foodId: null,
    name: "",
    price: "",
    category: "",
    veg: true,
    active: true,
  });

  const fetchAdmin = async () => {
    const res = await fetch("/api/admin");
    const data = await res.json();
    setAdmin(data);

    if (data?.menu?.length) {
      const unique = [...new Set(data.menu.map((item) => item.category))];
      setCategories(unique);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  const updateTables = async () => {
    if (!totalTables) return;
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalTables }),
    });
    fetchAdmin();
    setTotalTables("");
  };

  const saveMenuItem = async () => {
    if (!name || !price || !category) return;
    const payload = editId
      ? { updateId: editId, name, price, veg, category, active }
      : { name, price, veg, category, active };

    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await fetchAdmin();
    setName("");
    setPrice("");
    setCategory("");
    setVeg(true);
    setActive(true);
    setEditId(null);
  };

  const deleteMenuItem = async (id) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteId: id }),
    });
    fetchAdmin();
  };

  const editMenuItem = (m) => {
    setEditData({
      foodId: m.foodId,
      name: m.name,
      price: m.price,
      category: m.category,
      veg: m.veg,
      active: m.active,
    });
    setIsEditOpen(true);
  };

  const updateMenuItem = async () => {
    if (!editData.name || !editData.price || !editData.category) return;

    const payload = {
      updateId: Number(editData.foodId),
      name: editData.name,
      price: Number(editData.price),
      veg: editData.veg,
      category: editData.category,
      active: editData.active,
    };

    console.log("Sending update payload:", payload);

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data = null;
    try {
      data = await res.json();
    } catch (err) {
      console.warn("No JSON returned from update API");
    }

    console.log("Update response:", data);

    await fetchAdmin();
    setIsEditOpen(false);
  };

  // ✅ DataTable columns
  const columns = [
    { accessorKey: "foodId", header: "Food ID" },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "veg",
      header: "Type",
      cell: ({ row }) =>
        row.original.veg ? (
          <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
            Veg
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
            Non-Veg
          </span>
        ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="text-green-600">Active</span>
        ) : (
          <span className="text-gray-500">Inactive</span>
        ),
    },
    { accessorKey: "price", header: "Price (₹)" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => editMenuItem(item)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteMenuItem(item.foodId)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // ✅ Apply filters before passing to DataTable
  // Apply filters
  const filteredMenu =
    admin?.menu?.filter((item) => {
      const matchesCategory = filterCategory
        ? item.category === filterCategory
        : true;

      const matchesVeg = filterVeg
        ? filterVeg === (item.veg ? "veg" : "nonveg")
        : true;

      return matchesCategory && matchesVeg;
    }) || [];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Owner Panel</h2>
      {/* Total Tables Section */}
      <Card className="shadow-md rounded-2xl w-xs">
        <CardHeader>
          <CardTitle>Total Tables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-semibold">
            Current: {admin?.totalTables || 0}
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Enter total tables"
              value={totalTables}
              onChange={(e) => setTotalTables(e.target.value)}
            />
            <Button onClick={updateTables}>Update</Button>
          </div>
        </CardContent>
      </Card>



      {/* ✅ Menu Table */}
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredMenu.length ? (
            <DataTable
              data={filteredMenu}
              columns={columns}
              onDeleteRows={deleteMenuItem}
              tableTitle="Menu Items"
            />
          ) : (
            <p className="text-sm text-gray-500">No menu items found.</p>
          )}

          <Separator />

          {/* Form for Add/Edit */}
          {/* ✅ Add/Edit Form */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* This will always show for adding new items */}
            <div className="flex flex-col">
              <Label htmlFor="name" className="mb-1">Food Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Biryani"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="price" className="mb-1">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="120"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-1">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Main Course">Main Course</SelectItem>
                  <SelectItem value="Dessert">Dessert</SelectItem>
                  <SelectItem value="Beverage">Beverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <Label className="mb-1">Veg / Non-Veg</Label>
              <Select
                value={veg ? "veg" : "nonveg"}
                onValueChange={(v) => setVeg(v === "veg")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Veg</SelectItem>
                  <SelectItem value="nonveg">Non-Veg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <Label className="mb-1">Active</Label>
              <div className="flex items-center space-x-2">
                <Switch checked={active} onCheckedChange={setActive} />
                <span>{active ? "Active" : "Inactive"}</span>
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={saveMenuItem}>Add Item</Button>
            </div>
          </div>

          {/* ✅ Edit Modal */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Menu Item</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="flex flex-col">
                  <Label htmlFor="editName" className="mb-2">Food Name</Label>
                  <Input
                    id="editName"
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="editPrice" className="mb-2">Price</Label>
                  <Input
                    id="editPrice"
                    type="number"
                    value={editData.price}
                    onChange={(e) =>
                      setEditData({ ...editData, price: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <Label className="mb-2">Category</Label>
                  <Select
                    value={editData.category}
                    onValueChange={(val) =>
                      setEditData({ ...editData, category: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Starter">Starter</SelectItem>
                      <SelectItem value="Main Course">Main Course</SelectItem>
                      <SelectItem value="Dessert">Dessert</SelectItem>
                      <SelectItem value="Beverage">Beverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <Label className="mb-2">Veg / Non-Veg</Label>
                  <Select
                    value={editData.veg ? "veg" : "nonveg"}
                    onValueChange={(val) =>
                      setEditData({ ...editData, veg: val === "veg" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Veg</SelectItem>
                      <SelectItem value="nonveg">Non-Veg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <Label className="mb-2">Active</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editData.active}
                      onCheckedChange={(val) =>
                        setEditData({ ...editData, active: val })
                      }
                    />
                    <span>{editData.active ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={updateMenuItem}>Update Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

            {/* Table Status Section */}
      <Card className="shadow-md rounded-2xl w-lg">
        <CardHeader>
          <CardTitle>Table Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {admin?.tables?.map((t) => (
              <Badge
                key={t.tableNumber}
                className={`flex items-center justify-center h-12 w-20 rounded-md text-sm font-medium ${
                  t.status === "occupied"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                Table {t.tableNumber}
              </Badge>
            ))}

            {!admin?.tables?.length && (
              <p className="text-sm text-gray-500">No tables configured yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
