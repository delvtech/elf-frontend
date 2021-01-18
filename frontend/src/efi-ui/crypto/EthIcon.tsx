import { FC, SVGProps } from "react";

import { Colors } from "@blueprintjs/core";

import { ReactComponent as EthSVGIcon } from "efi-static-assets/logos/svg/ETH-alt.svg";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

export const EthIcon: FC<SVGProps<SVGSVGElement> & { title?: string }> = ({
  height,
  width,
}) => {
  const { isDarkMode } = useDarkMode();
  const fill = isDarkMode ? Colors.GRAY5 : Colors.DARK_GRAY5;
  return <EthSVGIcon height={height} width={width} fill={fill} />;
};
