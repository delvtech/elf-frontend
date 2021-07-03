import { ReactElement, useCallback } from "react";

import { AnchorButton, Intent } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import {
  PoolAction,
  usePoolViewPoolActionsTab,
} from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";

interface GoToPoolButtonProps {
  poolAddress: string;
  poolAction: PoolAction;
  label: string;

  small?: boolean;
  outlined?: boolean;
  fill?: boolean;
}

export function GoToPoolButton(props: GoToPoolButtonProps): ReactElement {
  const {
    poolAddress,
    poolAction,
    label,
    fill,
    outlined = false,
    small = false,
  } = props;

  const { setTab } = usePoolViewPoolActionsTab();

  const onClick = useCallback(() => {
    setTab(poolAction);
  }, [setTab, poolAction]);

  return (
    <AnchorButton
      fill={fill}
      intent={Intent.PRIMARY}
      href={`/pools/${poolAddress}`}
      onClick={onClick}
      minimal
      small={small}
      outlined={outlined}
    >
      <div className={tw("p-2", "text-base")}>{label}</div>
    </AnchorButton>
  );
}
