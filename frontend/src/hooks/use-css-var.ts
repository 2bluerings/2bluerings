import { useCallback } from 'react'

/**
 * Hook to get and set CSS variables on a target element (default is :root).
 *
 * @param variableName - CSS variable name, e.g., "--primary-color"
 * @param target - Optional target element, defaults to document.documentElement
 */
export function useCssVar(variableName: string, target: HTMLElement = document.documentElement) {
  const get = useCallback(() => {
    return getComputedStyle(target).getPropertyValue(variableName).trim()
  }, [target, variableName])

  const set = useCallback((value: string) => {
    target.style.setProperty(variableName, value)
  }, [target, variableName])

  return { get, set }
}
