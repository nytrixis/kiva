"use client";

import React, { useState, useEffect } from "react";

// Create a separate interface for our custom props
interface SliderOwnProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number | number[];
  onValueChange?: ((value: number) => void) | ((values: number[]) => void);
  onValueCommit?: ((value: number) => void) | ((values: number[]) => void);
}

// Combine with HTML input props, but exclude the ones we're redefining
type SliderProps = SliderOwnProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'min' | 'max' | 'step'>;

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, onValueChange, onValueCommit, ...props }, ref) => {
    // Convert array value to a single number for the input element
    const [internalValue, setInternalValue] = useState<number>(
      Array.isArray(value) ? value[0] : (value as number) || min
    );

    // Update internal value when prop changes
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(Array.isArray(value) ? value[0] : value as number);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setInternalValue(newValue);
      
      // Call the appropriate callback based on the type of the original value
      if (onValueChange) {
        if (Array.isArray(value)) {
          // If the original value was an array, call with an array
          (onValueChange as (values: number[]) => void)([newValue, Array.isArray(value) ? value[1] : max]);
        } else {
          // If the original value was a single number, call with a single number
          (onValueChange as (value: number) => void)(newValue);
        }
      }
    };

    const handleBlur = () => {
      if (onValueCommit) {
        if (Array.isArray(value)) {
          // If the original value was an array, call with an array
          (onValueCommit as (values: number[]) => void)([internalValue, Array.isArray(value) ? value[1] : max]);
        } else {
          // If the original value was a single number, call with a single number
          (onValueCommit as (value: number) => void)(internalValue);
        }
      }
    };

    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary ${className}`}
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";
