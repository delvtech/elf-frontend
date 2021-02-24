/**
 * Takes an svg element and converts it into something that can be used in an
 * image tag. This allows you to style an svg using standard css patterns:
 *
 * Example:
 *
 *   const MyComponent = () => {
 *     const svgElement = svgGenerator();
 *
 *     return (
 *       <img
 *         src={encodeSVG(svgElement)}
 *         className={tw('rounded-full)} />
 *     );
 *   };
 */
export function encodeSVG(svg: SVGElement): string {
  const html = svg.outerHTML;
  const blob = new Blob([html], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  return url;
}
