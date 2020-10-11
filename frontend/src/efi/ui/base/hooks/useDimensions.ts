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

function useDimensions(
  updateOnResize = true
): [React.RefObject<HTMLElement> | null, Dimensions] {
  const [dimensions, setDimensions] = useState<Dimensions>({} as Dimensions);
  const ref = useRef<HTMLElement>();

  const updateDimensions = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const {
      width,
      height,
      x,
      y,
    }: DOMRect = ref.current.getBoundingClientRect();

    const dimensions: Dimensions = {
      width,
      height,
      x,
      y,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
    };

    window.requestAnimationFrame(() => {
      setDimensions(dimensions);
    });
  }, [ref, setDimensions]);

  useLayoutEffect(() => {
    if (ref.current) {
      updateDimensions();
      if (updateOnResize) {
        window.addEventListener("resize", updateDimensions);

        return () => {
          window.removeEventListener("resize", updateDimensions);
        };
      }
    }
  }, [updateDimensions, updateOnResize]);

  return [ref as React.RefObject<HTMLElement>, dimensions];
}

export default useDimensions;
