import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";

import { isConvergentCurvePool, PoolContract } from "efi/pools/PoolContract";
import { UnstakeCard } from "efi-ui/pools/UnStakePanel/UnstakeCard";

interface UnStakePanelProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  pool: PoolContract | undefined;
}

export function UnStakePanel(props: UnStakePanelProps): ReactElement | null {
  const { account, library, pool, connector } = props;

  if (isConvergentCurvePool(pool)) {
    return (
      <UnstakeCard
        library={library}
        pool={pool}
        account={account}
        connector={connector}
      />
    );
  }
  return null;
}
