import { useMedia } from "react-use";

/**
 * 'sm' breakpoint from tailwind.
 */
export const SMALL_BREAKPOINT = 640;

export function useIsTailwindSm(): boolean {
  return useMedia(`(max-width: ${SMALL_BREAKPOINT - 1}px)`);
}
/**
 * 'md' breakpoint from tailwind.
 */
export const MEDIUM_BREAKPOINT = 768;
export function useIsTailwindMd(): boolean {
  return useMedia(`(max-width: ${MEDIUM_BREAKPOINT - 1}px)`);
}

/**
 * 'lg' breakpoint from tailwind.
 */
export const LARGE_BREAKPOINT = 1024;
export function useIsTailwindLg(): boolean {
  return useMedia(`(max-width: ${LARGE_BREAKPOINT - 1}px)`);
}

/**
 * 'xl' breakpoint from tailwind.
 */
export const EXTRA_LARGE_BREAKPOINT = 1280;

export function useIsTailwindXl(): boolean {
  return useMedia(`(max-width: ${EXTRA_LARGE_BREAKPOINT - 1}px)`);
}
