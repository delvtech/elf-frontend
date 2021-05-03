import { Tags } from "@uniswap/token-lists";

export const tags: Tags = {
  underyling: {
    name: "Underlying asset",
    description: "The base asset of a principal or yield token",
  },
  eP: {
    name: "Principal token",
    description: "Token that represents a deposit of principal into a yield position",
  },
  eY: {
    name: "Yield token",
    description: "Token that represents the yield on a deposit into a yield position"
  }
};
