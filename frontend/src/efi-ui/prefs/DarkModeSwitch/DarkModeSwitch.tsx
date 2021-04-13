import React, { ChangeEvent, ReactElement, useCallback } from "react";

import { Switch } from "@blueprintjs/core";
import { t } from "ttag";

import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

export function DarkModeSwitch(): ReactElement {
  const { isDarkMode, setDarkMode } = useDarkMode();

  const onDarkModeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setDarkMode(event.target.checked),
    [setDarkMode]
  );

  return (
    <Switch
      large
      checked={isDarkMode}
      onChange={onDarkModeChange}
      innerLabel={t`Light mode`}
      innerLabelChecked={t`Dark mode`}
    />
  );
}
