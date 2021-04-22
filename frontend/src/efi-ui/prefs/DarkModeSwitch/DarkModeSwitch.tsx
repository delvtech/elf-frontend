import React, { ChangeEvent, Fragment, ReactElement, useCallback } from "react";

import { Switch } from "@blueprintjs/core";
import { t } from "ttag";

import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import tw from "efi-tailwindcss-classnames";

export function DarkModeSwitch(): ReactElement {
  const { isDarkMode, setDarkMode } = useDarkMode();

  const onDarkModeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setDarkMode(event.target.checked),
    [setDarkMode]
  );

  return (
    <Fragment>
      <Switch
        checked={isDarkMode}
        className={tw("mb-0", "lg:hidden")}
        onChange={onDarkModeChange}
        innerLabel={t`Light`}
        innerLabelChecked={t`Dark`}
      />
      <Switch
        large
        checked={isDarkMode}
        className={tw("mb-0", "hidden", "lg:inline-block")}
        onChange={onDarkModeChange}
        innerLabel={t`Light mode`}
        innerLabelChecked={t`Dark mode`}
      />
    </Fragment>
  );
}
