import { ReactElement } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PoolContract } from "efi/pools/PoolContract";

interface UnstakeButtonProps {
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;
}

export function UnstakeButton({ pool }: UnstakeButtonProps): ReactElement {
  return (
    <Button fill minimal intent={Intent.PRIMARY}>
      <div className={tw("p-2", "text-base")}>{t`Unstake`}</div>
    </Button>
  );
}
