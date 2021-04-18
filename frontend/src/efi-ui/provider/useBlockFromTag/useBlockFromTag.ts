import { QueryObserverResult, useQuery } from "react-query";

import { BlockTag } from "@ethersproject/providers";

import { Block } from "efi/crypto/fetchEthBlocks";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

// TODO: generalize to make a useProviderCall just like we have useSmartContractReadCall
/**
 * returns a block for a given block number
 * @param {BlockTag} blockTag a block hash (string) or number
 * @returns {Block}
 */
export function useBlockFromTag(
  blockTag: BlockTag | undefined
): QueryObserverResult<Block> {
  const queryResult = useQuery({
    queryKey: [["provider", "getBlock"], { blockNumber: blockTag }],
    queryFn: async () => {
      return jsonRpcProvider.getBlock(blockTag as number);
    },
    enabled: !!blockTag,
  }) as QueryObserverResult<Block>;

  return queryResult;
}
