import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate discounted price
 */
export function calculateDiscountedPrice(price: number, discountPercentage: number): number {
  if (!discountPercentage) return price;
  return price - (price * (discountPercentage / 100));
}

/**
 * Format a date
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get image URL or placeholder
 */
export function getImageUrl(images: string[] | Record<string, unknown> | null, index = 0): string {
  if (Array.isArray(images) && images.length > index) {
    return images[index];
  }
  return 'https://via.placeholder.com/300';
}

