import { gql, request } from "graphql-request";

import { Block, fetchEthBlocks } from "efi/crypto/fetchEthBlocks";

const getTokenDataQuery = (address: string, blocks: Block[]) => {
  let tokenQueries = "";
  blocks.forEach((block) => {
    tokenQueries += gql`t${block.timestamp}: token(
      id: "${address}",
      block: { number: ${block.number} }
    ) {
      decimals
      derivedETH
    }
    `;
  });

  return gql`
  query blocks {
    ${tokenQueries}
  }
`;
};

export async function fetchTokenData(
  tokenAddress: string,
  startTime: number,
  endTime: number
) {
  const blockData = await fetchEthBlocks(startTime, endTime);
  console.log("blockData", blockData);
  const tokenQuery = getTokenDataQuery(tokenAddress, blockData.blocks);
  const tokenData = await request(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    tokenQuery
  );
  return tokenData;
}
