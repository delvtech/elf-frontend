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
  YieldTokenInfo,
} from "@elementfi/tokenlist";

export type AnyTokenListInfo =
  | TokenInfo
  | PrincipalTokenInfo
  | YieldTokenInfo
  | PrincipalPoolTokenInfo
  | YieldPoolTokenInfo;
