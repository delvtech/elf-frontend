import { parseEther } from "ethers/lib/utils";
import { USDC } from "elf/types/USDC";
import { WETH } from "elf/types/WETH";

const defaultOptions = {
  tokens: [],
  amounts: "1000000",
};

export async function mintTokensForAddress(
  elementAddress: string,
  options: {
    tokens: (WETH | USDC)[];
    amounts?: string | string[];
  }
) {
  let { amounts, tokens } = { ...defaultOptions, ...options };
  if (!Array.isArray(amounts)) {
    amounts = tokens.map(() => amounts) as string[];
  }

  const transactions = await Promise.all(
    tokens.map(async (tokenContract, i) => {
      const txReceipt = await tokenContract.mint(
        elementAddress,
        parseEther(amounts[i])
      );
      await txReceipt.wait(1);
    })
  );

  return transactions;
}
