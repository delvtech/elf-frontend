import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";

import { UnstakeCard } from "efi-ui/pools/UnStakePanel/UnstakeCard";
import { PoolInfo } from "efi/pools/PoolInfo";

interface UnStakePanelProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  poolInfo: PoolInfo;
}

export function UnStakePanel(props: UnStakePanelProps): ReactElement | null {
  const { account, library, poolInfo, connector } = props;

  return (
    <UnstakeCard
      library={library}
      account={account}
      connector={connector}
      poolInfo={poolInfo}
    />
  );
}
