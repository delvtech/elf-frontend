import { BigNumberish, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { Vault } from "elf/types/Vault";
import { WeightedPoolFactory } from "elf/types/WeightedPoolFactory";

import {
  WeightedPool__factory,
} from "elf/types/factories/WeightedPool__factory";

export async function deployWeightedPool(
  signer: Signer,
  vaultContract: Vault,
  poolFactory: WeightedPoolFactory,
  name: string,
  symbol: string,
  tokens: string[],
  weights: BigNumberish[],
  swapFee: string
) {
  const createTx = await poolFactory.create(
    name,
    symbol,
    tokens,
    weights,
    parseEther(swapFee)
  );
  await createTx.wait(1);

  const filter = vaultContract.filters.PoolCreated(null);
  const results = await vaultContract.queryFilter(filter);
  const poolId = results[results.length - 1]?.args?.poolId;
  const [poolAddress] = await vaultContract.getPool(poolId);

  const poolContract = WeightedPool__factory.connect(poolAddress, signer);
  return { poolId, poolContract };
}
