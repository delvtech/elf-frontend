import { CSSProperties, ReactElement, useMemo } from "react";

import logoDark from "elf-static-assets/logos/svg/ELEMENT-dark.svg";
import logo from "elf-static-assets/logos/svg/ELEMENT-light.svg";
import wordLogoDark from "elf-static-assets/logos/svg/logo--dark.svg";
import wordLogo from "elf-static-assets/logos/svg/logo--light.svg";

interface ElementLogoProps {
  iconOnly?: boolean;
  height: number;
  isDarkMode: boolean;
  className?: string;
}
export function ElementLogo({
  height,
  iconOnly = false,
  isDarkMode,
  className,
}: ElementLogoProps): ReactElement {
  // don't use tailwind for height since we want fixed height and rem is dynamic
  const style: CSSProperties = useMemo(
    () => ({
      height,
    }),
    [height]
  );

  let logoSrc = logo;
  if (isDarkMode) {
    logoSrc = iconOnly ? logoDark : wordLogoDark;
  } else {
    logoSrc = iconOnly ? logo : wordLogo;
  }

  return (
    <img
      style={style}
      src={logoSrc}
      alt={"Element Finance"}
      className={className}
    />
  );
}
