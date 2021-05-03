import { ERC20Permit } from "elf-contracts/types/ERC20Permit";
import { BigNumberish, BytesLike, ethers, Signer } from "ethers";

import { TokenMetadata } from "efi/tokenlists";

export interface PermitCallData {
  tokenContract: string;
  who: string;
  amount: BigNumberish;
  expiration: BigNumberish;
  r: BytesLike;
  s: BytesLike;
  v: BigNumberish;
}

// Uses a default infinite permit expiration time
export async function fetchPermitData(
  signer: Signer,
  token: ERC20Permit,
  sourceAddr: string,
  spenderAddr: string,
  spenderAmount: BigNumberish,
  // '1' for every ERC20Permit.  Except USDC which is '2' ¯\_(ツ)_/¯
  version: string
): Promise<PermitCallData> {
  const name = TokenMetadata[token.address].name;
  const chainId = TokenMetadata[token.address].chainId;
  const domain = {
    name: name,
    version: version,
    chainId: chainId,
    verifyingContract: token.address,
  };

  const types = {
    Permit: [
      {
        name: "owner",
        type: "address",
      },
      {
        name: "spender",
        type: "address",
      },
      {
        name: "value",
        type: "uint256",
      },
      {
        name: "nonce",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ],
  };

  // don't do this in a query hook.  make sure we grab the latest
  const nonce = await token.nonces;

  const data = {
    owner: sourceAddr,
    spender: spenderAddr,
    value: spenderAmount,
    nonce: nonce,
    deadline: ethers.constants.MaxUint256,
  };

  // _signeTypedData is an experimental feature and is not on the type signature!
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sigString: string = await (signer as any)._signTypedData(
    domain,
    types,
    data
  );

  const r = sigString.slice(2, 33);
  const s = sigString.slice(34, 63);
  const v = sigString.slice(64);

  return {
    tokenContract: token.address,
    who: spenderAddr,
    amount: spenderAmount,
    expiration: ethers.constants.MaxUint256,
    r,
    s,
    v,
  };
}
