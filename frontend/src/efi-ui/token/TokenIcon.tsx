import { CSSProperties, ReactElement } from "react";

import ethIconGrey from "efi-static-assets/logos/svg/ETH-grey.svg";
import usdcIcon from "efi-static-assets/logos/svg/USDC.svg";
import wethIcon from "efi-static-assets/logos/svg/WETH.svg";
import elfIconDark from "efi-static-assets/logos/svg/logo-dark.svg";
import elfIcon from "efi-static-assets/logos/svg/logo-light.svg";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

interface SvgIconProps {
  height: number;
  width: number;
  className: string | undefined;
  style: CSSProperties | undefined;
  alt: string;
  src: string;
}
export type TokenIcon = typeof EthIcon | typeof UsdcIcon | typeof WethIcon;
export function SvgIcon({
  height,
  width,
  className,
  style,
  src,
  alt,
}: SvgIconProps): ReactElement {
  return (
    <img
      alt={alt}
      className={className}
      style={style}
      src={src}
      height={height}
      width={width}
    />
  );
}
interface IconProps {
  height: number;
  width: number;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export function EthIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"ethereum"}
      className={className}
      style={style}
      src={ethIconGrey}
      height={height}
      width={width}
    />
  );
}

export function UsdcIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"usdc"}
      className={className}
      style={style}
      src={usdcIcon}
      height={height}
      width={width}
    />
  );
}

export function WethIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  // const { isDarkMode } = useDarkMode();
  // const color = isDarkMode ? Colors.GRAY5 : Colors.DARK_GRAY5;
  const iconStyle: CSSProperties = {
    // backgroundColor: color,
    ...style,
  };

  return (
    <SvgIcon
      alt={"weth"}
      className={className}
      style={iconStyle}
      src={wethIcon}
      height={height}
      width={width}
    />
  );
}

export function ElfIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const icon = isDarkMode ? elfIconDark : elfIcon;
  return (
    <SvgIcon
      alt={"element"}
      className={className}
      style={style}
      src={icon}
      height={height}
      width={width}
    />
  );
}
