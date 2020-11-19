import { gql, request } from "graphql-request";

export interface Block {
  id: string;
  number: string;
  timestamp: string;
}

const getEthBlocksQuery = (timestamp: number) => {
  return gql`
  {
    blocks(
      first: 500
      skip: 10000
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: "${timestamp}" }
    ) {
      id
      number
      timestamp
    }
  }
`;
};

// TODO: use enough queries to conver the range, for now just grabbing 500 from start time
// TODO: add 'skip' when we need less granularity
// TODO: use infinite query from react-query
export async function fetchEthBlocks(startTime: number, endTime: number) {
  const query = getEthBlocksQuery(startTime);
  const data = (await request(
    // TODO: store this as a constant somewhere
    "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
    query
  )) as { blocks: Block[] };
  return data;
}
