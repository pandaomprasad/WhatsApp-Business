import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { useToast } from "@/components/ui/use-toast"
import {
  BoxIcon,
  PanelsTopLeftIcon,
  TableRowsSplit,
  Salad,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import DataTable from "@/app/components/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Papa from "papaparse";
import FileUpload from "./comp-126";

export default function Component() {
  const [admin, setAdmin] = useState(null);
  const [totalTables, setTotalTables] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [veg, setVeg] = useState(true);
  const [category, setCategory] = useState("");
  const [active, setActive] = useState(true);
  const [editId, setEditId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  // const { toast } = useToast()
  const handleUpdate = async () => {
    await updateTables();
    setIsOpen(false); // ✅ auto-close modal after update
    // toast({
    //   title: "Tables Updated",
    //   description: `Total tables updated to ${totalTables}`,
    //   variant: "success", // you can also use "default" if you don't have custom success
    // })
  };

  // ✅ dynamic categories for filter
  const [categories, setCategories] = useState([]);

  // ✅ filters
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterVeg, setFilterVeg] = useState(null); // "veg", "nonveg", or null
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [csvFile, setCsvFile] = useState(null);
  const [csvErrors, setCsvErrors] = useState([]);
  const [csvPreview, setCsvPreview] = useState([]);

  const uploadCsv = async () => {
    if (!csvFile) {
      setCsvErrors(["No CSV file selected."]);
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(), // normalize headers
      complete: async (results) => {
        const errors = [];
        const formattedData = [];

        results.data.forEach((item, index) => {
          const name = item.name?.trim();
          const priceRaw = item.price?.trim();
          const category = item.category?.trim();
          const vegRaw = item.veg?.trim()?.toLowerCase();
          const activeRaw = item.active?.trim()?.toLowerCase();

          // Required fields validation
          if (!name || !priceRaw || !category || !vegRaw || !activeRaw) {
            errors.push(`Row ${index + 2}: Missing required field(s).`);
            return;
          }

          const price = Number(priceRaw);
          if (isNaN(price)) {
            errors.push(`Row ${index + 2}: Price must be a number.`);
            return;
          }

          const veg = vegRaw === "true" || vegRaw === "veg";
          const active = activeRaw === "true" || activeRaw === "active";

          formattedData.push({ name, price, veg, category, active });
        });

        setCsvErrors(errors);
        setCsvPreview(formattedData);

        if (errors.length === 0 && formattedData.length > 0) {
          try {
            const res = await fetch("/api/admin/upload-csv", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: formattedData }),
            });

            if (!res.ok) {
              const msg = await res.text();
              errors.push(`Server error: ${msg}`);
              setCsvErrors(errors);
              return;
            }

            // ✅ Success
            fetchAdmin();
            setCsvFile(null);
            setIsAddOpen(false);
            setCsvPreview([]);
          } catch (err) {
            errors.push(`Upload failed: ${err.message}`);
            setCsvErrors(errors);
          }
        }
      },
      error: (err) => {
        setCsvErrors([`CSV parsing error: ${err.message}`]);
      },
    });
  };

  const [isAddOpen, setIsAddOpen] = useState(false);

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
    <Tabs defaultValue="tab-1">
      <ScrollArea>
        <TabsList className="mb-3">
          <TabsTrigger value="tab-1">
            <TableRowsSplit
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Table
          </TabsTrigger>
          <TabsTrigger value="tab-2" className="group">
            <Salad
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Menu
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="tab-1">
        <Card className="shadow-md rounded-2xl w-lg">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className={"flex items-center text-2xl font-bold"}>
              <TableRowsSplit
                className="-ms-0.5 me-1.5 opacity-60 text-green-500"
                size={24}
                aria-hidden="true"
              />
              Table Status
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge className="px-2 text-sm">
                Total Tables {admin?.totalTables || 0}
              </Badge>
              {/* ✅ Update Button with controlled Dialog */}
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Pencil
                      className="-ms-0.5 me-1.5 opacity-100"
                      size={16}
                      aria-hidden="true"
                    />{" "}
                    Update
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xs">
                  <DialogHeader>
                    <DialogTitle>Total Tables</DialogTitle>
                  </DialogHeader>

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
                    <Button onClick={handleUpdate}>Submit</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
                <p className="text-sm text-gray-500">
                  No tables configured yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tab-2">
        {/* ✅ Menu Table */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center text-2xl font-bold">
              <Salad
                className="-ms-0.5 me-1.5 opacity-100 text-green-500"
                size={24}
                aria-hidden="true"
              />
              Food Menu
            </CardTitle>
            <CardTitle className="flex items-center gap-2">
              {/* ✅ Add Food Modal */}
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus
                      className="-ms-0.5 me-1.5 opacity-100"
                      size={16}
                      aria-hidden="true"
                    />
                    Add Food
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[650px] max-w-full max-h-[80vh] overflow-y-auto p-6 rounded-2xl shadow-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Food Item</DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-col gap-6 mt-4">
                    {/* Single Item Form */}
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 flex-1">
                      <div className="flex flex-col">
                        <Label htmlFor="name" className="mb-1">
                          Food Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="e.g. Biryani"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="price" className="mb-1">
                          Price
                        </Label>
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
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Starter">Starter</SelectItem>
                            <SelectItem value="Main Course">
                              Main Course
                            </SelectItem>
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
                          <Switch
                            checked={active}
                            onCheckedChange={setActive}
                          />
                          <span>{active ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                    </div>

                    {/* CSV Upload */}
                    <div className="flex flex-col flex-1">
                      <Label className="mb-1">Or Upload CSV</Label>
                      <FileUpload
                        accept=".csv"
                        label="Upload CSV file"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        CSV must have headers:{" "}
                        <code>name,price,veg,category,active</code>
                      </p>
                      {csvErrors.length > 0 && (
                        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md max-h-40 overflow-y-auto">
                          <ul className="list-disc list-inside text-sm">
                            {csvErrors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button
                      onClick={() => {
                        if (csvFile) {
                          uploadCsv(); // Bulk CSV upload
                        } else {
                          saveMenuItem(); // Single item
                          setIsAddOpen(false);
                        }
                      }}
                    >
                      Add Item
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
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

            {/* <Separator /> */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="px-2 text-sm bg-blue-100 text-blue-700">
                Total: {admin?.menu?.length || 0}
              </Badge>
              <Badge className="px-2 text-sm bg-green-100 text-green-700">
                Active: {admin?.menu?.filter((item) => item.active).length || 0}
              </Badge>
              <Badge className="px-2 text-sm bg-red-100 text-red-700">
                Inactive:{" "}
                {admin?.menu?.filter((item) => !item.active).length || 0}
              </Badge>
            </div>

            {/* 🚀 Removed inline Add Form, now handled in modal */}
            {/* Only Edit Modal remains */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Menu Item</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  {" "}
                  <div className="flex flex-col">
                    {" "}
                    <Label htmlFor="editName" className="mb-2">
                      {" "}
                      Food Name{" "}
                    </Label>{" "}
                    <Input
                      id="editName"
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />{" "}
                  </div>{" "}
                  <div className="flex flex-col">
                    {" "}
                    <Label htmlFor="editPrice" className="mb-2">
                      {" "}
                      Price{" "}
                    </Label>{" "}
                    <Input
                      id="editPrice"
                      type="number"
                      value={editData.price}
                      onChange={(e) =>
                        setEditData({ ...editData, price: e.target.value })
                      }
                    />{" "}
                  </div>{" "}
                  <div className="flex flex-col">
                    {" "}
                    <Label className="mb-2">Category</Label>{" "}
                    <Select
                      value={editData.category}
                      onValueChange={(val) =>
                        setEditData({ ...editData, category: val })
                      }
                    >
                      {" "}
                      <SelectTrigger>
                        {" "}
                        <SelectValue placeholder="Select category" />{" "}
                      </SelectTrigger>{" "}
                      <SelectContent>
                        {" "}
                        <SelectItem value="Starter">Starter</SelectItem>{" "}
                        <SelectItem value="Main Course">Main Course</SelectItem>{" "}
                        <SelectItem value="Dessert">Dessert</SelectItem>{" "}
                        <SelectItem value="Beverage">Beverage</SelectItem>{" "}
                      </SelectContent>{" "}
                    </Select>{" "}
                  </div>{" "}
                  <div className="flex flex-col">
                    {" "}
                    <Label className="mb-2">Veg / Non-Veg</Label>{" "}
                    <Select
                      value={editData.veg ? "veg" : "nonveg"}
                      onValueChange={(val) =>
                        setEditData({ ...editData, veg: val === "veg" })
                      }
                    >
                      {" "}
                      <SelectTrigger>
                        {" "}
                        <SelectValue placeholder="Choose" />{" "}
                      </SelectTrigger>{" "}
                      <SelectContent>
                        {" "}
                        <SelectItem value="veg">Veg</SelectItem>{" "}
                        <SelectItem value="nonveg">Non-Veg</SelectItem>{" "}
                      </SelectContent>{" "}
                    </Select>{" "}
                  </div>{" "}
                  <div className="flex flex-col">
                    {" "}
                    <Label className="mb-2">Active</Label>{" "}
                    <div className="flex items-center space-x-2">
                      {" "}
                      <Switch
                        checked={editData.active}
                        onCheckedChange={(val) =>
                          setEditData({ ...editData, active: val })
                        }
                      />{" "}
                      <span>{editData.active ? "Active" : "Inactive"}</span>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
                {/* ... your existing edit form code ... */}
                <DialogFooter>
                  <Button onClick={updateMenuItem}>Update Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
