import { CSSProperties, FC, ReactElement } from "react";

import crvAlusdIcon from "elf-static-assets/logos/crvALUSD.png";
import crvLusdIcon from "elf-static-assets/logos/svg/crvLUSD.svg";
import crvMimIcon from "elf-static-assets/logos/crvMIM.png";
import crvEursIcon from "elf-static-assets/logos/crvEURS.png";
import crvStethIcon from "elf-static-assets/logos/svg/crvSTETH.svg";
import crvTricryptoIcon from "elf-static-assets/logos/svg/crvtricrypto.svg";
import daiIcon from "elf-static-assets/logos/svg/DAI.svg";
import elementIconDark from "elf-static-assets/logos/svg/ELEMENT-dark.svg";
import elementIcon from "elf-static-assets/logos/svg/ELEMENT-light.svg";
import ethIconGrey from "elf-static-assets/logos/svg/ethereum-eth.svg";
import lusdIcon from "elf-static-assets/logos/svg/LUSD.svg";
import usdcIcon from "elf-static-assets/logos/svg/USDC.svg";
import wethIcon from "elf-static-assets/logos/svg/WETH.svg";
import wbtcIcon from "elf-static-assets/logos/svg/WBTC.svg";
import { useDarkMode } from "elf-ui/prefs/useDarkMode/useDarkMode";

interface SvgIconProps {
  height: number;
  width: number;
  className: string | undefined;
  style: CSSProperties | undefined;
  alt: string;
  src: string;
}

/**
 * @deprecated, just use FC<IconProps>;
 */
export type TokenIcon = FC<IconProps>;

export function SvgIcon({
  height,
  width,
  className = "",
  style = {},
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

export interface IconProps {
  height: number;
  width: number;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export function CrvEursIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"crvEURS"}
      className={className}
      style={style}
      src={crvEursIcon}
      height={height}
      width={width}
    />
  );
}

export function CrvMimIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"crvMIM"}
      className={className}
      style={style}
      src={crvMimIcon}
      height={height}
      width={width}
    />
  );
}
export function WbtcIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"wbtc"}
      className={className}
      style={style}
      src={wbtcIcon}
      height={height}
      width={width}
    />
  );
}

export function LusdIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"lusd"}
      className={className}
      style={style}
      src={lusdIcon}
      height={height}
      width={width}
    />
  );
}
export function CrvTricryptoIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"crvtricrypto"}
      className={className}
      style={style}
      src={crvTricryptoIcon}
      height={height}
      width={width}
    />
  );
}

export function CrvStethIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"crvsteth"}
      className={className}
      style={style}
      src={crvStethIcon}
      height={height}
      width={width}
    />
  );
}
export function CrvAlusdIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"crvalusd"}
      className={className}
      style={style}
      src={crvAlusdIcon}
      height={height}
      width={width}
    />
  );
}
export function CrvLusdIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"crvlusd"}
      className={className}
      style={style}
      src={crvLusdIcon}
      height={height}
      width={width}
    />
  );
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

export function DaiIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  return (
    <SvgIcon
      alt={"dai"}
      className={className}
      style={style}
      src={daiIcon}
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

export function ElementIcon({
  height,
  width,
  className,
  style,
}: IconProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const icon = isDarkMode ? elementIconDark : elementIcon;
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
