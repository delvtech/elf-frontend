import { gql } from "graphql-request";

export const getEthBlocksQuery = (blockNumbers: number[]) => {
  let blockQueries = "";
  blockNumbers.forEach((blockNumber) => {
    blockQueries += gql`n${blockNumber}: blocks(
      orderBy: timestamp
      orderDirection: asc
      where: {
        number: "${blockNumber}"
      }
    ) {
      id
      number
      timestamp
    }
    `;
  });

  return gql`
  query blocks {
    ${blockQueries}
  }
`;
};

export function getFirstAndLastBlockInTimeRangeQuery(
  startTime: number,
  endTime: number
) {
  return gql`
      query blocks {
        first: blocks(
          first: 1
          where: { timestamp_gt: "${startTime}" }
        ) {
          number,
        }
        last: blocks(
          first: 1
          where: { timestamp_gt: "${endTime}" }
        ) {
          number,
        }
      }
    `;
}
