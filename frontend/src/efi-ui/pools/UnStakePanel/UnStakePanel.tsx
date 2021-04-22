import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";

import tw from "efi-tailwindcss-classnames";
import { PoolContract } from "efi/pools/PoolContract";
import { UnstakeConvergentCurvePoolButton } from "efi-ui/portfolio/UnstakeButton/UnstakeConvergentCurvePoolButton";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";

interface UnStakePanelProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  pool: PoolContract | undefined;
}

export function UnStakePanel(props: UnStakePanelProps): ReactElement {
  const { account, library, pool, connector } = props;

  // const setMaxValue = useSetMaxValue(
  //   baseAssetBalanceOf,
  //   setValueIn,
  //   baseAssetDecimals
  // );

  // const submitButtonDisabled =
  //   formDisabled ||
  //   submitDisabled ||
  //   !isValidBaseAssetValue ||
  //   !isValidTrancheAssetValue ||
  //   !amountIn ||
  //   !amountOut;

  return (
    <div className={tw("flex", "flex-col", "space-y-5")}>
      <div className={tw("flex", "justify-between", "items-center")}>
        <UnstakeConvergentCurvePoolButton
          pool={pool as ConvergentCurvePool}
          library={library}
          account={account}
          connector={connector}
        />
      </div>
    </div>
  );
}
