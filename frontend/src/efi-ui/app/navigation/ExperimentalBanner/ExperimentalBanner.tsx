import { ReactElement } from "react";

import { Button, Colors } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

import { useBannerPref } from "./useBannerPref";

interface ExperimentalBannerProps {}
export function ExperimentalBanner(
  props: ExperimentalBannerProps
): ReactElement | null {
  const { isDarkMode } = useDarkMode();
  const { bannerIsVisible, hideBanner } = useBannerPref();

  if (!bannerIsVisible) {
    return null;
  }

  return (
    <div
      className={tw(
        "flex",
        "h-8",
        "mb-4",
        "w-full",
        "font-bold",
        "text-center",
        "justify-center",
        "items-center",
        "space-x-4"
      )}
      style={{
        borderRadius: 0,
        background: isDarkMode ? Colors.ORANGE3 : Colors.ORANGE4,
        color: isDarkMode ? undefined : Colors.DARK_GRAY2,
      }}
    >
      {/* this just here for symmetry so message is centered */}
      <Button className={tw("invisible")} minimal small />
      <span
        style={{
          color: isDarkMode ? undefined : Colors.DARK_GRAY3,
        }}
      >{t`This application is experimental, please do your own research.`}</span>
      <Button onClick={hideBanner} icon={IconNames.DELETE} minimal small />
    </div>
  );
}
