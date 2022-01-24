/**
 * Element Finance tokenlist type definitions.
 *
 * This file is maintained in the `elf-frontend-testnet` repo at
 * `tokenlist/types.ts` and copied over to this directory as a means of
 * codesharing.
 */

import {
  PrincipalPoolTokenInfo,
  PrincipalTokenInfo,
  TokenInfo,
  YieldPoolTokenInfo,
} from "@elementfi/tokenlist";

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

    /**
     * Number of seconds after epoch when the yield token can be redeemed
     */
    unlockTimestamp: number;
  };
}

export type AnyTokenListInfo =
  | TokenInfo
  | PrincipalTokenInfo
  | YieldTokenInfo
  | PrincipalPoolTokenInfo
  | YieldPoolTokenInfo;
