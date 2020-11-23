import { gql, request } from "graphql-request";

import { USDC_CONTRACT_ADDRESS_MAINNET } from "efi/crypto/erc20";
import { Block, fetchEthBlocks } from "efi/crypto/fetchEthBlocks";
import { THE_GRAPH_UNISWAP_V2_URL } from "efi/crypto/thegraph";

function getTokenDataQuery(address: string, blocks: Block[]) {
  let tokenQueries = "";
  blocks.forEach((block) => {
    tokenQueries += gql`t${block.timestamp}: token(
      id: "${address}",
      block: { number: ${block.number} }
    ) {
      symbol
      derivedETH
    }
    `;
  });

  return gql`
  query blocks {
    ${tokenQueries}
  }`;
}

export interface TokenResponse {
  [timestamp: string]: {
    symbol: string;
    derivedETH: string;
  };
}
export interface TokenData {
  /** The token symbol, i.e. ETH */
  symbol: string;

  /** the value in USD at the timestamp.  derived from the inverse USDC ETH value at that timestamp */
  derivedUSD: number;

  /**
   * unix timestamp in milliseconds for the price calculation.
   */
  timeMs: number;
}

export async function fetchTokenData(
  tokenAddress: string,
  startTimeSeconds: number,
  endTimeSeconds: number
): Promise<TokenData[]> {
  const blockData = await fetchEthBlocks(startTimeSeconds, endTimeSeconds);
  const tokenQueries = blockData.map((chunk) =>
    getTokenDataQuery(tokenAddress, chunk)
  );
  const tokenRequests: Promise<TokenResponse>[] = tokenQueries.map(
    (tokenQuery) => request(THE_GRAPH_UNISWAP_V2_URL, tokenQuery)
  );

  const tokenResults = await Promise.all(tokenRequests);

  const usdcQueries = blockData.map((chunk) =>
    getTokenDataQuery(USDC_CONTRACT_ADDRESS_MAINNET, chunk)
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
      symbol: tokenInfo.symbol,
      derivedUSD: Number(tokenInfo.derivedETH) * ethUSDValueAtTimestamp,
      // times come back prefixed with a 't', remove that here
      timeMs: Number(timestamp.slice(1)) * 1000,
    };
  });

  return tokenData;
}
