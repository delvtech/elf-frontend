import { CurveContract__factory } from "elf-contracts-typechain/dist/types/factories/CurveContract__factory";
import { CurveStethPool__factory } from "elf-contracts-typechain/dist/types/factories/CurveStethPool__factory";

import { defaultProvider } from "efi/providers/providers";

/*
 * Curve pools that aren't strictly stablecoins are architected such that the LP
 * token (like what is used for minting in Element) is separate from the pool
 * contract that deals with trading and pricing.
 *
 * To price one of these assets, use the `withdraw_one_coin` method to price one
 * of the assets in the pool against an external price sensor, ie: coingecko.
 */
const CRVTriCrytoPoolAddress = "0x80466c64868e1ab14a1ddf27a676c3fcbe638fe5";
export const crvTriCryptoPoolContract = CurveContract__factory.connect(
  CRVTriCrytoPoolAddress,
  defaultProvider
);

const steCRVPoolAddress = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
export const steCrvPoolContract = CurveStethPool__factory.connect(
  steCRVPoolAddress,
  defaultProvider
);
