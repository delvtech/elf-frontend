import { ReactElement, useCallback } from "react";

import { AnchorButton, Intent } from "@blueprintjs/core";
import { navigate } from "@reach/router";

import tw from "efi-tailwindcss-classnames";
import {
  PoolAction,
  usePoolViewPoolActionsTab,
} from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { PoolContract } from "efi/pools/PoolContract";

interface GoToMarketButtonProps {
  pool: PoolContract | undefined;
  isStake: boolean;
  label: string;
}

export function GoToMarketButton(props: GoToMarketButtonProps): ReactElement {
  const { pool, isStake, label } = props;

  const { setTab } = usePoolViewPoolActionsTab();

  const onClick = useCallback(() => {
    if (isStake) {
      setTab(PoolAction.STAKE);
    } else {
      setTab(PoolAction.SWAP);
    }

    navigate(`/pools/${pool?.address}`);
  }, [pool?.address, isStake, setTab]);
  return (
    <AnchorButton fill intent={Intent.PRIMARY} onClick={onClick} minimal>
      <div className={tw("p-2", "text-base")}>{label}</div>
    </AnchorButton>
  );
}
