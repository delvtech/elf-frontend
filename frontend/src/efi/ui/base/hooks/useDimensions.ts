import React, { useState, useLayoutEffect, useRef, useCallback } from "react";

export interface Dimensions {
  width: number;
  height: number;
  top: number;
  left: number;
  x: number;
  y: number;
  right: number;
  bottom: number;
}

export type UseDimensionsHook = [
  React.RefObject<HTMLElement> | null,
  Dimensions
];

function useDimensions(liveMeasure = true): UseDimensionsHook {
  const [dimensions, setDimensions] = useState<Dimensions>({} as Dimensions);
  const ref = useRef<HTMLElement>();
  const measure = useCallback(() => {
    const element = ref.current;
    if (refExists(element)) {
      window.requestAnimationFrame(() => {
        setDimensions(getDimensions(element));
      });
    }
  }, [ref, setDimensions]);

  useLayoutEffect(() => {
    if (ref.current) {
      measure();
      if (liveMeasure) {
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure);

        return () => {
          window.removeEventListener("resize", measure);
          window.removeEventListener("scroll", measure);
        };
      }
    }
  }, [ref.current]);

  return [ref as React.RefObject<HTMLElement>, dimensions];
}

function getDimensions(node: HTMLElement): Dimensions {
  if (!node) {
    return {} as Dimensions;
  }

  const { width, height, x, y }: DOMRect = node.getBoundingClientRect();

  return {
    width,
    height,
    x,
    y,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
  };
}

export default useDimensions;

function refExists(ref: HTMLElement | undefined): ref is HTMLElement {
  return !!ref;
}
