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
  startTimeSeconds: number,
  endTimeSeconds: number
): Promise<Block[][]> {
  const {
    startBlockNumber,
    endBlockNumber,
  } = await fetchFirstAndLastBlockNumber(startTimeSeconds, endTimeSeconds);

  // get blocks back in sets of 500 so that requests don't fail.  TheGraph only lets you query 500
  // at a time.
  const blockSets = getBlockSets(startBlockNumber, endBlockNumber);
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
 * Returns numBlocks number of blocks between startBlockNumber and endBlockNumber.  The result is a
 * chunked array so that each set is <= 500.  This is because we cannot query more than 500 blocks
 * at a time on TheGraph. i.e:
 * fistBlockNumer = 1, endBlockNumber = 2000, numbBlocks = 1000 would yield a stepSize of 2, and
 * two 500 length sets of blocks:
 * [ [1, 3, ... 1000], [1001, 1003, ... 2000] ]
 * @param startBlockNumber
 * @param endBlockNumber
 * @param numbBlocks
 */
function getBlockSets(
  startBlockNumber: number,
  endBlockNumber: number,
  numbBlocks = 1000
): number[][] {
  const numBlocks = endBlockNumber - startBlockNumber;
  const stepSize = Math.round(numBlocks / numbBlocks);

  const blocks = range(startBlockNumber, endBlockNumber, stepSize);

  return chunkArray(blocks, 500);
}

// TODO: use lodash chunk instad
function chunkArray<T = any>(array: T[], size: number) {
  const chunkedArray = [];
  const numChunks = Math.ceil(array.length / size);
  for (let chunk = 0; chunk < numChunks; chunk++) {
    chunkedArray.push(array.slice(chunk * size, (chunk + 1) * size));
  }
  return chunkedArray;
}

interface StartAndEndBlock {
  start: Block[];
  end: Block[];
}
async function fetchFirstAndLastBlockNumber(
  startTimeSeconds: number,
  endTimeSeconds: number
) {
  const blocks: StartAndEndBlock = await request(
    THE_GRAPH_ETH_BLOCKS_URL,
    getFirstAndLastBlockInTimeRangeQuery(startTimeSeconds, endTimeSeconds)
  );

  return {
    startBlockNumber: Number(blocks.start[0].number),
    endBlockNumber: Number(blocks.end[0].number),
  };
}
