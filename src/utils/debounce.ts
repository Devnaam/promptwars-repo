import { useState, useEffect } from 'react';

/**
 * Custom React hook that debounces a rapidly changing value.
 * Returns the debounced value only after the specified delay has elapsed
 * since the last change. Useful for reducing API calls on text inputs.
 *
 * @typeParam T - The type of the value being debounced
 * @param value - The raw value to debounce
 * @param delayMs - The debounce delay in milliseconds (default: 300)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
