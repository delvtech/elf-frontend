import { ReactElement } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PoolContract } from "efi/pools/PoolContract";
import { useUnstake } from "efi-ui/pools/useUnstake/useUnstake";
import { Signer } from "ethers";

interface UnstakeButtonProps {
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;
}

export function UnstakeButton({
  pool,
  library,
  account,
}: UnstakeButtonProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const exitPool = useUnstake(signer, account, pool);

  return (
    <Button fill minimal intent={Intent.PRIMARY} onClick={exitPool}>
      <div className={tw("p-2", "text-base")}>{t`Unstake`}</div>
    </Button>
  );
}
