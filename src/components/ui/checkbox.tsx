"use client";

import React from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
    };

    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${className || ''}`}
          {...props}
        />
        {label && (
          <label className="ml-2 text-sm text-gray-700">{label}</label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
