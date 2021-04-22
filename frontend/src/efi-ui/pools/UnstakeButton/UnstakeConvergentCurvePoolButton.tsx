import { ReactElement } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useExitConvergentCurvePool } from "efi-ui/pools/useUnstake/useExitConvergentCurvePool";

interface UnstakeConvergentCurvePoolButtonProps {
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: ConvergentCurvePool | undefined;
}

export function UnstakeConvergentCurvePoolButton({
  pool,
  library,
  account,
}: UnstakeConvergentCurvePoolButtonProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const exitPool = useExitConvergentCurvePool(signer, account, pool);

  return (
    <Button fill minimal intent={Intent.PRIMARY} onClick={exitPool}>
      <div className={tw("p-2", "text-base")}>{t`Unstake`}</div>
    </Button>
  );
}
