import { ReactElement, useCallback } from "react";
import { AnchorButton, Intent } from "@blueprintjs/core";
import { navigate } from "@reach/router";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { PoolContract } from "efi/pools/PoolContract";

interface GoToMarketButtonProps {
  pool: PoolContract | undefined;
}

export function GoToMarketButton(props: GoToMarketButtonProps): ReactElement {
  const { pool } = props;
  const onClick = useCallback(() => navigate(`exchange/${pool?.address}`), [
    pool?.address,
  ]);
  return (
    <AnchorButton fill intent={Intent.PRIMARY} onClick={onClick} minimal>
      <div className={tw("p-2", "text-base")}>{t`Go to market`}</div>
    </AnchorButton>
  );
}
