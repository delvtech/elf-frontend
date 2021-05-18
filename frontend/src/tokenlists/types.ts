/**
 * Element Finance tokenlist type definitions.
 *
 * This file is maintained in `efi-frontend/testnet/tokenlist/types.ts` and
 * copied over to the frontend/ directory as a means of codesharing.
 */
import { TokenInfo } from "@uniswap/token-lists";

export enum TokenListTag {
  CCPOOL = "ccpool",
  WPOOL = "wpool",
  UNDERLYING = "underlying",
  PRINCIPAL = "eP",
  YIELD = "eY",
}

export interface UnderlyingTokenInfo extends TokenInfo {}

export interface PrincipalTokenInfo extends TokenInfo {
  extensions: {
    /**
     * The underlying base asset for the principal token
     */
    underlying: string;

    /**
     * The interest token for the principal token
     */
    interestToken: string;

    /**
     * Number of seconds after epoch when the principal token was created
     */
    createdAtTimestamp: number;
    /**
     * Number of seconds after epoch when the principal token can be redeemed
     */
    unlockTimestamp: number;

    /**
     * The wrapped position, eg: an Element yearn vault asset proxy
     */
    position: string;
  };
}

export interface YieldTokenInfo extends TokenInfo {
  extensions: {
    /**
     * The underlying base asset for the yield token
     */
    underlying: string;

    /**
     * The Principal Token's address
     */
    tranche: string;
  };
}

export interface PrincipalPoolTokenInfo extends TokenInfo {
  extensions: {
    /**
     * The principal token address
     */
    bond: string;

    /**
     * The underlying base asset for the principal token
     */
    underlying: string;

    /**
     * balancer poolId
     */
    poolId: string;

    /**
     * Number of seconds after epoch when the pool assets will converge in
     * price.
     */
    expiration: number;

    /**
     * The number of seconds in the pools timescale.
     */
    unitSeconds: number;
  };
}

export interface YieldPoolTokenInfo extends TokenInfo {
  extensions: {
    /**
     * The yield token address
     */
    interestToken: string;

    /**
     * The underlying base asset for the yield token
     */
    underlying: string;

    /**
     * The underlying base asset for the yield token
     */
    poolId: string;
  };
}

export type AnyTokenListInfo =
  | TokenInfo
  | PrincipalTokenInfo
  | YieldTokenInfo
  | PrincipalPoolTokenInfo
  | YieldPoolTokenInfo;
