import React, { FC } from "react";

import { Card, Classes, HTMLTable } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { Erc20 } from "elf-contracts/types/Erc20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useEthBalance } from "efi-ui/coins/ether/hooks/useEthBalance/useEthBalance";
import { useEthPrice } from "efi-ui/coins/ether/hooks/useEthBalance/useEthPrice";
import { useConvertToFiatBalance } from "efi-ui/money/hooks/useConvertCryptoToFiatBalance";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance/useTokenBalance";
import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { formatEth } from "efi/coins/ether/formatEth";
import { usdcContract, wethContract } from "efi/crypto/TokenContracts";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";
import { formatMoney } from "efi/money/formatMoney";

interface WalletBalancesCardProps {}

interface WalletTokenInfo {
  tokenSymbolOld: TokenContractSymbols;
  tokenContract: Erc20;
}

const WALLET_TOKENS: WalletTokenInfo[] = [
  { tokenSymbolOld: "WETH", tokenContract: wethContract },
  { tokenSymbolOld: "USDC", tokenContract: usdcContract },
];

export const WalletBalancesCard: FC<WalletBalancesCardProps> = () => {
  const { fiatBalance } = useWallet();
  const { library, account } = useWeb3React<Web3Provider>();

  const { data: ethPrice, isLoading: isEthPriceLoading } = useEthPrice();
  const { data: ethBalance } = useEthBalance(library, account);

  const formattedEthBalance = formatEth(ethBalance);

  const totalBalance = "$10,000.00";

  return (
    <Card className={tw("flex", "flex-col", "space-y-4")}>
      <div className={tw("flex", "justify-between", "text-base")}>
        <span className={Classes.TEXT_MUTED}>{t`Wallet balance`}</span>
        <span>{totalBalance}</span>
      </div>

      <HTMLTable striped className={tw("w-full")}>
        <thead>
          <tr className={Classes.TEXT_SMALL}>
            {[t`Asset`, t`Price`, t`Balance`].map((label) => (
              <th key={label}>
                <span className={classNames(tw("text-xs"), Classes.TEXT_MUTED)}>
                  {label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={Classes.TEXT_LARGE}>
          <tr>
            <td>
              <LabeledText bold text="ETH" label="Ether" />
            </td>

            <td
              className={classNames({ [Classes.SKELETON]: isEthPriceLoading })}
            >
              {`$${ethPrice}`}
            </td>
            <td>
              <LabeledText
                text={t`${formattedEthBalance} ETH`}
                label={t`${formatMoney(fiatBalance)} USD`}
              />
            </td>
          </tr>

          {WALLET_TOKENS.map(({ tokenSymbolOld, tokenContract }) => {
            return (
              <TokenBalanceTableRow
                key={tokenSymbolOld}
                account={account}
                tokenSymbolOld={tokenSymbolOld}
                tokenContract={tokenContract}
              />
            );
          })}
        </tbody>
      </HTMLTable>
    </Card>
  );
};

export default WalletBalancesCard;

interface TokenBalanceTableRowProps {
  account: string | null | undefined;
  tokenSymbolOld: TokenContractSymbols;
  tokenContract: Erc20;
}

const TokenBalanceTableRow: FC<TokenBalanceTableRowProps> = ({
  account,
  tokenSymbolOld,
  tokenContract,
}) => {
  const [tokenSymbol] = useTokenSymbol(tokenContract);
  const [tokenName] = useTokenName(tokenContract);
  const [tokenPrice, tokenPriceLoadingStates] = useTokenPrice(tokenContract);

  const isTokenPriceLoading = tokenPriceLoadingStates.some(
    ({ isLoading }) => isLoading
  );

  const [tokenBalance] = useTokenBalance(tokenSymbolOld, account);
  const [fiatBalance] = useConvertToFiatBalance(
    tokenSymbolOld,
    tokenBalance?.value,
    tokenBalance?.decimals.toNumber()
  );

  const formattedTokenBalance = formatCurrency(
    tokenBalance?.value,
    tokenBalance?.decimals.toNumber()
  );
  const formattedFiatBalance = formatMoney(fiatBalance);

  return (
    <tr>
      {/* Token name */}
      <td>
        <LabeledText bold text={tokenSymbol || ""} label={tokenName || ""} />
      </td>

      {/* Price per token */}
      <td className={classNames({ [Classes.SKELETON]: isTokenPriceLoading })}>
        {`$${tokenPrice}`}
      </td>

      {/* Fiat balance */}
      <td>
        <LabeledText
          text={t`${formattedTokenBalance} ETH`}
          label={t`${formattedFiatBalance} USD`}
        />
      </td>
    </tr>
  );
};
