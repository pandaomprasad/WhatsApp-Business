"use client";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function NumButton({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
      <Button
        className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
        variant="outline"
        size="icon"
        aria-label="Upvote"
        onClick={() => setCount((c) => c + 1)}
      >
        <ChevronUpIcon size={16} aria-hidden="true" />
      </Button>
      <span className="border-input flex items-center border px-3 text-sm font-medium min-w-[40px] justify-center">
        {count}
      </span>
      <Button
        className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
        variant="outline"
        size="icon"
        aria-label="Downvote"
        onClick={() => setCount((c) => (c > 0 ? c - 1 : 0))}
      >
        <ChevronDownIcon size={16} aria-hidden="true" />
      </Button>
    </div>
  );
}
