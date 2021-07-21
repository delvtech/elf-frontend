/**
 * This vault is new and the apy is wrong for ReAsOnS currently. Use this to
 * identify this problematic vault and show something else instead.
 */
export function isYearnDaiVault(vaultAddress: string): boolean {
  return vaultAddress === "0xdA816459F1AB5631232FE5e97a05BBBb94970c95";
}
