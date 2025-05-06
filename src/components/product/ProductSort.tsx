"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popularity", label: "Most Popular" },
];

interface ProductSortProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ProductSort({ value, onChange }: ProductSortProps) {
  const [open, setOpen] = useState(false);
 
  const selectedOption = sortOptions.find(option => option.value === value) || sortOptions[0];
 
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-1 px-3 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
          <span>Sort by: </span>
          <span className="font-medium">{selectedOption.label}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={`cursor-pointer ${option.value === value ? 'bg-primary/10 text-primary font-medium' : ''}`}
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
