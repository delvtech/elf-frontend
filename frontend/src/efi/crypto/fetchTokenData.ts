import { gql, request } from "graphql-request";

import { USDC_CONTRACT_ADDRESS_MAINNET } from "efi/crypto/erc20";
import { Block, fetchEthBlocks } from "efi/crypto/fetchEthBlocks";
import { THE_GRAPH_UNISWAP_V2_URL } from "efi/crypto/thegraph";

const getTokenDataQuery = (address: string, blocks: Block[]) => {
  let tokenQueries = "";
  blocks.forEach((block) => {
    tokenQueries += gql`t${block.timestamp}: token(
      id: "${address}",
      block: { number: ${block.number} }
    ) {
      name
      decimals
      derivedETH
    }
    `;
  });

  return gql`
  query blocks {
    ${tokenQueries}
  }`;
};

export interface TokenResponse {
  [timestamp: string]: {
    derivedETH: string;
    name: string;
    decimals: string;
  };
}
export interface TokenData {
  decimals: string;
  derivedUSD: number;
  derivedETH: string;
  name: string;

  /**
   * time in ms
   */
  timestamp: number;
}
export async function fetchTokenData(
  tokenAddress: string,
  startTime: number,
  endTime: number
): Promise<TokenData[]> {
  const blockData = await fetchEthBlocks(startTime, endTime);
  const tokenQueries = blockData.map((blockSet) =>
    getTokenDataQuery(tokenAddress, blockSet)
  );
  const tokenRequests: Promise<
    TokenResponse
  >[] = tokenQueries.map((tokenQuery) =>
    request(THE_GRAPH_UNISWAP_V2_URL, tokenQuery)
  );

  const tokenResults = await Promise.all(tokenRequests);

  const usdcQueries = blockData.map((blockSet) =>
    getTokenDataQuery(USDC_CONTRACT_ADDRESS_MAINNET, blockSet)
  );

  const usdcRequests: Promise<TokenResponse>[] = usdcQueries.map((usdcQuery) =>
    request(THE_GRAPH_UNISWAP_V2_URL, usdcQuery)
  );

  const usdcResults = await Promise.all(usdcRequests);

  let tokenResult: TokenResponse = {};
  tokenResults.forEach((result) => {
    tokenResult = { ...tokenResult, ...result };
  });

  let usdcResult: TokenResponse = {};
  usdcResults.forEach((result) => {
    usdcResult = { ...usdcResult, ...result };
  });

  const timestamps = Object.keys(usdcResult).sort();

  const tokenData = timestamps.map((timestamp) => {
    const usdcInfo = usdcResult[timestamp];
    const tokenInfo = tokenResult[timestamp];
    const ethUSDValueAtTimestamp = 1 / Number(usdcInfo.derivedETH);
    return {
      ...tokenInfo,
      derivedUSD: Number(tokenInfo.derivedETH) * ethUSDValueAtTimestamp,
      timestamp: Number(timestamp.slice(1)) * 1000,
    };
  });

  return tokenData;
}
