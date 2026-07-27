import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'

/**
 * Combines class names using clsx and merges Tailwind classes with twMerge.
 *
 * @param inputs An array of class values to be merged.
 *
 * @returns The merged class string.
 */
export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}
