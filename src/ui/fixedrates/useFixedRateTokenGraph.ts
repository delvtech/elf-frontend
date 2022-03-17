import {
  CurveLpTokenInfo,
  PrincipalTokenInfo,
  TokenInfo,
} from "@elementfi/tokenlist";

// base -> principal
// token -> base -> principal
// token -> meta -> base -> principal
export interface FixedRateTokenGraph {
  baseToken: TokenInfo;
  principalToken: PrincipalTokenInfo;
  token: TokenInfo;
}
