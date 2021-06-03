import { Fragment, ReactElement, useCallback, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { Signer } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useExitConvergentCurvePool } from "efi-ui/pools/useUnstake/useExitConvergentCurvePool";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";

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

  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const onClickUnstake = useCallback(() => {
    if (!account) {
      return setWalletDialogOpen(true);
    }
    exitPool();
  }, [account, exitPool]);

  // disable the button when there's lp tokens or fine dust
  const { data: lpBalanceOf } = useTokenBalanceOf(pool, account);
  let disabled = !!account;
  if (lpBalanceOf) {
    disabled = !+(
      clipStringValueToDecimals(formatUnits(lpBalanceOf, 18), 16) || 0
    );
  }

  const buttonLabel = !!account ? t`Unstake` : t`Connect Wallet`;

  return (
    <Fragment>
      <Button
        disabled={disabled}
        fill
        minimal
        outlined
        intent={Intent.PRIMARY}
        onClick={onClickUnstake}
      >
        <div className={tw("p-2", "text-base")}>{buttonLabel}</div>
      </Button>
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
      />
    </Fragment>
  );
}
