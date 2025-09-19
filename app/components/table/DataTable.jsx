"use client";

import { useEffect, useId, useRef, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedUniqueValues,
  flexRender,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ListFilterIcon, CircleXIcon, Leaf, Drumstick } from "lucide-react";

import IconDropdownMenu from "../dropdown/IconDropdownMenu";

export default function DataTable({
  data,
  columns,
  onDeleteRows,
  tableTitle = "Table",
  menuItems = [],
}) {
  const id = useId();
  const inputRef = useRef(null);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [sorting, setSorting] = useState([]);
  const [internalData, setInternalData] = useState(data);

  // filters
  const [activeCategory, setActiveCategory] = useState(null); // category filter
  const [vegFilter, setVegFilter] = useState(null); // veg / non-veg filter
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    setInternalData(data);
  }, [data]);

  // ✅ get unique categories
  const categories = useMemo(() => {
    const unique = new Set(internalData.map((item) => item.category));
    return Array.from(unique);
  }, [internalData]);

  // ✅ filter data (category + veg/non-veg)
  // ✅ filter data (category + veg/non-veg + search)
  const filteredData = useMemo(() => {
    let result = [...internalData];

    // category filter
    if (activeCategory) {
      result = result.filter((item) => item.category === activeCategory);
    }

    // veg / non-veg filter
    // veg / non-veg filter
    if (vegFilter) {
  result = result.filter((item) =>
    vegFilter === "Veg" ? item.veg === true : item.veg === false
  );
}


    // search filter
    if (globalFilter.trim() !== "") {
      if (/^\d+$/.test(globalFilter)) {
        // 🔹 numbers only → search by ID
        result = result.filter((item) =>
          String(item.id).includes(globalFilter.trim())
        );
      } else {
        // 🔹 letters/mixed → search by Name
        result = result.filter(
          (item) =>
            item.name &&
            item.name.toLowerCase().includes(globalFilter.toLowerCase())
        );
      }
    }

    return result;
  }, [activeCategory, vegFilter, internalData, globalFilter]);

  // ✅ build Veg/Non-Veg menu with styles for button
  const vegMenu = [
    {
      text: "Veg",
      icon: Leaf,
      textColor: "text-green-700",
      bgColor: "bg-green-100",
      onClick: () => setVegFilter("Veg"),
    },
    {
      text: "Non-Veg",
      icon: Drumstick,
      textColor: "text-red-700",
      bgColor: "bg-red-100",
      onClick: () => setVegFilter("Non-Veg"),
    },
    { separator: true },
    {
      text: "All",
      textColor: "text-gray-700",
      bgColor: "bg-gray-100",
      onClick: () => setVegFilter(null),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div className="space-y-1">
      {/* Filters and actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              ref={inputRef}
              className="min-w-60 ps-9"
              placeholder="Search by ID or Name..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
            <div className="absolute inset-y-0 start-0 flex items-center justify-center ps-3">
              <ListFilterIcon size={16} />
            </div>
            {globalFilter && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center"
                onClick={() => {
                  setGlobalFilter("");
                  inputRef.current?.focus();
                }}
              >
                <CircleXIcon size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right-side controls */}
        <div className="flex items-center gap-3">
          {/* Veg / Non-Veg filter via dropdown */}
          <IconDropdownMenu defaultLabel="Filter Food" items={vegMenu} />

          {/* ✅ Dynamic Category filter buttons */}
          <Button
            variant={!activeCategory ? "default" : "outline"}
            onClick={() => setActiveCategory(null)}
          >
            All Categories
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-background overflow-hidden rounded-md border">
        <div className="max-h-96 overflow-y-auto">
          <Table className="table-fixed">
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="sticky top-0 bg-background z-10"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
