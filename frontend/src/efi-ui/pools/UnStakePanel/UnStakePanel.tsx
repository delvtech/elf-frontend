import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";

import { UnstakeCard } from "efi-ui/pools/UnstakePanel/UnstakeCard";
import { PoolInfo } from "efi/pools/PoolInfo";

interface UnstakePanelProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  poolInfo: PoolInfo;
}

export function UnstakePanel(props: UnstakePanelProps): ReactElement | null {
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
