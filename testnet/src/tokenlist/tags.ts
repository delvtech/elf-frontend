import { Tags } from "@uniswap/token-lists";

export enum TokenListTag {
    CCPOOL = 'ccpool',
    WPOOL = 'wpool',
    UNDERLYING = 'underlying',
    PRINCIPAL = 'eP',
    YIELD = 'eY',

}

export const tags: Tags = {
  [TokenListTag.UNDERLYING]: {
    name: "Underlying asset",
    description: "The base asset of a principal or yield token",
  },
  [TokenListTag.PRINCIPAL]: {
    name: "Principal token",
    description: "Token that represents a deposit of principal into a yield position",
  },
  [TokenListTag.YIELD]: {
    name: "Yield token",
    description: "Token that represents the yield on a deposit into a yield position"
  },
  [TokenListTag.CCPOOL]: {
    name: "ConvergentCurve pool",
    description: "Token that represents the balancer pool for Principal tokens"
  },
  [TokenListTag.WPOOL]: {
    name: "Weighted pool",
    description: "Token that represents the balancer pool for Yield tokens"
  }
};
