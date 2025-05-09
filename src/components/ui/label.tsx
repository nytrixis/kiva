"use client";

import * as React from "react";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={`block text-sm font-medium text-gray-700 mb-1 ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Label.displayName = "Label";
