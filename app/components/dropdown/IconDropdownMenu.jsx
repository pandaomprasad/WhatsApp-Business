"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDownIcon } from "lucide-react"

// Reusable component
export default function IconDropdownMenu({
  defaultLabel = "Menu",
  items = [], // [{ icon: Icon, text: "Copy", textColor: "text-red-500", bgColor: "bg-red-100" }]
  className = "",
}) {
  const [selected, setSelected] = useState(null)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center gap-2 ${className} ${
            selected?.textColor ? selected.textColor : ""
          } ${selected?.bgColor ? selected.bgColor : ""}`}
        >
          {selected && selected.Icon ? (
            <selected.Icon
              size={16}
              className={`mr-1 ${selected.textColor || "opacity-70"}`}
              aria-hidden="true"
            />
          ) : null}
          <span>{selected ? selected.text : defaultLabel}</span>
          <ChevronDownIcon className="-me-1 opacity-60 ml-2" size={16} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {items.map(
          ({ icon: Icon, text, textColor, bgColor, onClick }, index) => (
            <DropdownMenuItem
              key={index}
              className={`${textColor || ""} hover:opacity-90 gap-0`}
              onClick={() => {
                setSelected({ text, Icon, textColor, bgColor })
                if (onClick) onClick()
              }}
            >
              {Icon && <Icon size={16} className={`mr-2 ${textColor || ""}`} />}
              {text}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
