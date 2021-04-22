import { ReactElement } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Signer } from "ethers";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { useExitWeightedPool } from "efi-ui/pools/useUnstake/useExitWeightedPool";

interface UnstakeWeightedPoolButtonProps {
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: WeightedPool | undefined;
}

export function UnstakeWeightedPoolButton({
  pool,
  library,
  account,
}: UnstakeWeightedPoolButtonProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const exitPool = useExitWeightedPool(signer, account, pool);

  return (
    <Button fill minimal intent={Intent.PRIMARY} onClick={exitPool}>
      <div className={tw("p-2", "text-base")}>{t`Unstake`}</div>
    </Button>
  );
}
