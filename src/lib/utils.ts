import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(val: number) {
  if (val >= 1e12) {
    const exponent = Math.floor(Math.log10(val))
    const mantissa = val / Math.pow(10, exponent)

    return `${mantissa.toFixed(2)}e+${exponent}`
  }

  if (val >= 1e9) {
    return (val / 1e9).toFixed(2) + 'B'
  }

  if (val >= 1e6) {
    return (val / 1e6).toFixed(2) + 'M'
  }

  if (val >= 1e3) {
    return (val / 1e3).toFixed(2) + 'K'
  }

  if (val === 0) {
    return 0
  }

  if (val < 0.0000001) {
    const exponent = Math.floor(Math.log10(val))
    const mantissa = val / Math.pow(10, exponent)

    return `${mantissa.toFixed(2)}e${exponent}`
  }

  return Math.round(val * 1000) / 1000
}
