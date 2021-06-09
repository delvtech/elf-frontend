import { ReactElement, useCallback } from "react";

import { AnchorButton, Intent } from "@blueprintjs/core";
import { navigate } from "@reach/router";

import tw from "efi-tailwindcss-classnames";
import {
  PoolAction,
  usePoolViewPoolActionsTab,
} from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";

interface GoToMarketButtonProps {
  poolAddress: string;
  poolAction: PoolAction;
  label: string;

  small?: boolean;
  outlined?: boolean;
}

export function GoToMarketButton(props: GoToMarketButtonProps): ReactElement {
  const {
    poolAddress,
    poolAction,
    label,
    outlined = false,
    small = false,
  } = props;

  const { setTab } = usePoolViewPoolActionsTab();

  const onClick = useCallback(() => {
    setTab(poolAction);

    navigate(`/pools/${poolAddress}`);
  }, [setTab, poolAction, poolAddress]);

  return (
    <AnchorButton
      fill
      intent={Intent.PRIMARY}
      onClick={onClick}
      minimal
      small={small}
      outlined={outlined}
    >
      <div className={tw("p-2", "text-base")}>{label}</div>
    </AnchorButton>
  );
}
