import { Card, Classes, HTMLTable } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { Erc20 } from "elf-contracts/types/Erc20";
import React, { FC } from "react";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useEthBalance } from "efi-ui/coins/ether/hooks/useEthBalance/useEthBalance";
import { useEthFiatBalance } from "efi-ui/coins/ether/hooks/useEthBalance/useEthFiatBalance";
import { useEthPrice } from "efi-ui/coins/ether/hooks/useEthBalance/useEthPrice";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { formatEth } from "efi/coins/ether/formatEth";
import { elfContract } from "efi/contracts/Elf";
import { wethContract } from "efi/crypto/TokenContracts";
import { formatMoney } from "efi/money/formatMoney";

import { useTokenFiatBalance } from "../../token/hooks/useTokenFiatBalance";

interface WalletBalancesCardProps {}

interface WalletTokenInfo {
  tokenContract: Erc20;
}

const WALLET_TOKENS: WalletTokenInfo[] = [
  { tokenContract: wethContract },
  { tokenContract: elfContract },
];

export const WalletBalancesCard: FC<WalletBalancesCardProps> = () => {
  const { currency } = useCurrencyPref();

  // Ether price
  const { data: ethPrice, isLoading: isEthPriceLoading } = useEthPrice(
    currency.code
  );

  // Ether balance
  const { library, account } = useWeb3React<Web3Provider>();
  const { data: ethBalance } = useEthBalance(library, account);
  const formattedEthBalance = formatEth(ethBalance);

  // Ether balance in Fiat
  const [ethFiatBalance] = useEthFiatBalance(library, account, currency.code);
  const formattedEthFiatBalance = formatMoney(ethFiatBalance);

  // Total Wallet balance
  const totalBalance = useTotalBalance(library, account, currency.code);
  const formattedTotalBalance = formatMoney(totalBalance);

  return (
    <Card className={tw("flex", "flex-col", "space-y-4")}>
      <div className={tw("flex", "justify-between", "text-base")}>
        <span className={Classes.TEXT_MUTED}>{t`Wallet balance`}</span>
        <span>{t`${formattedTotalBalance} ${currency.code}`}</span>
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
              {t`${ethPrice} ${currency.code}`}
            </td>
            <td>
              <LabeledText
                text={t`${formattedEthBalance} ETH`}
                label={t`${formattedEthFiatBalance} ${currency.code}`}
              />
            </td>
          </tr>

          {WALLET_TOKENS.map(({ tokenContract }) => {
            return (
              <TokenBalanceTableRow
                key={tokenContract.address}
                account={account}
                tokenContract={tokenContract}
              />
            );
          })}
        </tbody>
      </HTMLTable>
    </Card>
  );
};

interface TokenBalanceTableRowProps {
  account: string | null | undefined;
  tokenContract: Erc20;
}

const TokenBalanceTableRow: FC<TokenBalanceTableRowProps> = ({
  account,
  tokenContract,
}) => {
  const { currency } = useCurrencyPref();

  // Token metadata
  const [tokenName] = useTokenName(tokenContract);
  const [tokenSymbol] = useTokenSymbol(tokenContract);

  // Token Price
  const [tokenPrice, tokenPriceLoadingStates] = useTokenPrice(
    tokenContract,
    currency.code
  );
  const isTokenPriceLoading = tokenPriceLoadingStates.some(
    ({ isLoading }) => isLoading
  );

  // Token Balance
  const [tokenBalance] = useTokenBalanceOf(tokenContract, account);
  const [tokenDecimals] = useTokenDecimals(tokenContract);
  const formattedTokenBalance = formatCurrency(tokenBalance, tokenDecimals);

  // Fiat Balance
  const [fiatBalance] = useTokenFiatBalance(
    tokenContract,
    account,
    currency.code
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
        {tokenPrice ? t`${tokenPrice} ${currency.code}` : t`N/A`}
      </td>
      {/* Fiat balance */}
      <td>
        <LabeledText
          text={t`${formattedTokenBalance} ${tokenSymbol}`}
          label={t`${formattedFiatBalance} ${currency.code}`}
        />
      </td>
    </tr>
  );
};

function useTotalBalance(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  currencyCode: string
) {
  // Ether balance in Fiat
  const [ethFiatBalance] = useEthFiatBalance(library, account, currencyCode);

  // Weth balance in Fiat
  const [wethFiatBalance] = useTokenFiatBalance(
    wethContract,
    account,
    currencyCode
  );

  const ethFiat = ethFiatBalance || new Money(0, currencyCode);
  const wethFiat = wethFiatBalance || new Money(0, currencyCode);

  const totalBalance = ethFiat.add(wethFiat);

  return totalBalance;
}
