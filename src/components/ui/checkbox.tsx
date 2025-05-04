"use client";

import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          ref={ref}
          className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${className}`}
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
