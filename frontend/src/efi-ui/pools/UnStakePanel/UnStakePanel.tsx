import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";

import { PoolContract } from "efi/pools/PoolContract";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { UnstakeCard } from "efi-ui/pools/UnStakePanel/UnstakeCard";

interface UnStakePanelProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  pool: PoolContract | undefined;
}

export function UnStakePanel(props: UnStakePanelProps): ReactElement | null {
  const { account, library, pool, connector } = props;

  return (
    <UnstakeCard
      library={library}
      pool={pool as ConvergentCurvePool}
      account={account}
      connector={connector}
    />
  );
}
