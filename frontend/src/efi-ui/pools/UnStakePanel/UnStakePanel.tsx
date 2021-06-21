import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";

import { UnstakeCard } from "efi-ui/pools/UnstakePanel/UnstakeCard";
import { PoolInfo } from "efi/pools/PoolInfo";

interface UnstakePanelProps {
  signer: Signer | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  poolInfo: PoolInfo;
}

// TODO: remove this component, its not doing anything unless we decide to lift logic out of UnstakeCard
export function UnstakePanel(props: UnstakePanelProps): ReactElement | null {
  const { signer, account, library, poolInfo } = props;

  return (
    <UnstakeCard
      signer={signer}
      library={library}
      account={account}
      poolInfo={poolInfo}
    />
  );
}
