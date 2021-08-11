import { ReactElement, useCallback } from "react";

import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { navigate } from "@reach/router";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

interface ViewBalancesButtonProps {
  className?: string;
}

export function ViewBalancesButton(
  props: ViewBalancesButtonProps
): ReactElement {
  const goToPortfolio = useCallback(() => navigate("/portfolio"), []);
  return (
    <div className={classNames(tw("text-right"), props.className)}>
      <Button minimal large onClick={goToPortfolio} icon={IconNames.TH_LIST}>
        {t`View balances`}
      </Button>
    </div>
  );
}
