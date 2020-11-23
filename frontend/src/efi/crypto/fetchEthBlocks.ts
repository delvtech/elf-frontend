import { range } from "d3-array";
import { request } from "graphql-request";

import {
  getEthBlocksQuery,
  getFirstAndLastBlockInTimeRangeQuery,
} from "efi/crypto/queryEthBlocks";
import { THE_GRAPH_ETH_BLOCKS_URL } from "efi/crypto/thegraph";

export interface Block {
  id: string;
  number: string;
  timestamp: string;
}

export interface BlockResponse {
  // each timestamp returns an array of length one.
  [timestamp: string]: [Block];
}

// TODO: add 'skip' variable to tune the granularity
// TODO: use infinite query from react-query to grab chunks of blocks as user interacts
export async function fetchEthBlocks(
  startTime: number,
  endTime: number
): Promise<Block[][]> {
  const {
    firstBlockNumber,
    lastBlockNumber,
  } = await fetchFirstAndLastBlockNumber(startTime, endTime);

  // get blocks back in sets of 500 so that requests don't fail.  TheGraph only lets you query 500
  // at a time.
  const blockSets = getBlockSets(firstBlockNumber, lastBlockNumber);
  const queries = blockSets.map((blockSet) => getEthBlocksQuery(blockSet));
  const requests: Promise<BlockResponse>[] = queries.map((query) =>
    request(THE_GRAPH_ETH_BLOCKS_URL, query)
  );
  const responses = await Promise.all(requests);

  const mappedResponses = responses.map((response) =>
    Object.values(response).map((blocks) => blocks[0])
  );

  return mappedResponses;
}

/**
 * Returns numBlocks number of blocks between firstBlockNumber and lastBlockNumber.  The result is a
 * chunked array so that each set is <= 500.  This is because we cannot query more than 500 blocks
 * at a time on TheGraph. i.e:
 * fistBlockNumer = 1, lastBlockNumber = 2000, numbBlocks = 1000 would yield a stepSize of 2, and
 * two 500 length sets of blocks:
 * [ [1, 3, ... 1000], [1001, 1003, ... 2000] ]
 * @param firstBlockNumber
 * @param lastBlockNumber
 * @param numbBlocks
 */
const getBlockSets = (
  firstBlockNumber: number,
  lastBlockNumber: number,
  numbBlocks: number = 1000
) => {
  const numBlocks = lastBlockNumber - firstBlockNumber;
  const stepSize = Math.round(numBlocks / numbBlocks);

  const blockSet = range(firstBlockNumber, lastBlockNumber, stepSize);

  return chunkArray(blockSet, 500);
};

// TODO: use lodash chunk instad
function chunkArray<T = any>(array: T[], size: number) {
  const chunkedArray = [];
  const numChunks = Math.ceil(array.length / size);
  for (let chunk = 0; chunk < numChunks; chunk++) {
    chunkedArray.push(array.slice(chunk * size, (chunk + 1) * size));
  }
  return chunkedArray;
}

interface FirstAndLastBlock {
  first: Block[];
  last: Block[];
}
async function fetchFirstAndLastBlockNumber(
  startTime: number,
  endTime: number
) {
  const blocks: FirstAndLastBlock = await request(
    THE_GRAPH_ETH_BLOCKS_URL,
    getFirstAndLastBlockInTimeRangeQuery(startTime, endTime)
  );

  return {
    firstBlockNumber: Number(blocks.first[0].number),
    lastBlockNumber: Number(blocks.last[0].number),
  };
}
