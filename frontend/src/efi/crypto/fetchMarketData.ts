import { gql, request } from "graphql-request";

const query = gql`
  {
    markets(first: 7) {
      borrowRate
      cash
      collateralFactor
      exchangeRate
      interestRateModelAddress
      name
      reserves
      supplyRate
      symbol
      id
      totalBorrows
      totalSupply
      underlyingAddress
      underlyingName
      underlyingPrice
      underlyingSymbol
      reserveFactor
      underlyingPriceUSD
    }
  }
`;

export async function fetchMarketData(): Promise<any> {
  const data = await request(
    "https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2",
    query
  );
  return data;
}
