import { ReactElement, useCallback, useState } from "react";

import { Button, Callout, Card, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "elf-tailwindcss-classnames";
import { useNumericInput } from "elf-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "elf-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "elf-ui/crypto/CryptoIcon";
import { useCryptoBalanceOf } from "elf-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useMintPreview } from "elf-ui/mint/hooks/useMintPreview";
import { MintTransactionConfirmationDrawer } from "elf-ui/mint/MintTransactionConfirmationDrawer/MintTransactionConfirmationDrawer";
import { useDarkMode } from "elf-ui/prefs/useDarkMode/useDarkMode";
import { TokenAmountInput } from "elf-ui/token/TokenAmountInput/TokenAmountInput";
import { useTrancheCanPerform } from "elf-ui/tranche/useTrancheCanPerform";
import { ConnectWalletDialog } from "elf-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { formatBalance } from "elf/base/formatBalance";
import { getCryptoAssetForToken } from "elf/crypto/getCryptoAssetForToken";
import { getCryptoDecimals } from "elf/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "elf/crypto/getCryptoSymbol";
import { formatYieldTokenShortSymbol } from "elf/interestToken/formatYieldTokenShortSymbol";
import { getTokenInfo } from "elf/tokenlists";
import { formatPrincipalTokenShortSymbol } from "elf/tranche/format";

interface MintFormProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  trancheInfo: PrincipalTokenInfo;
}

export function MintForm(props: MintFormProps): ReactElement | null {
  const { library, account, trancheInfo } = props;
  const { isDarkMode } = useDarkMode();

  const {
    address: trancheAddress,
    extensions: { interestToken, underlying },
  } = trancheInfo;

  const principalTokenSymbol = formatPrincipalTokenShortSymbol(trancheInfo);
  const yieldTokenSymbol = formatYieldTokenShortSymbol(
    getTokenInfo(interestToken)
  );

  const canPerformMint = useTrancheCanPerform(trancheAddress, "mint");

  const baseAsset = getCryptoAssetForToken(underlying);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAsset);

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);

  const { stringValue: amountIn, setValue: setAmountIn } = useNumericInput();

  const baseAssetDecimals = getCryptoDecimals(baseAsset);
  const baseAssetBalanceOf = useCryptoBalanceOf(library, account, baseAsset);

  const activeBaseAssetDisplayBalance = formatBalance(
    baseAssetBalanceOf,
    baseAssetDecimals
  );

  const { numPrincipalTokensOut, numYieldTokensOut } = useActiveMintPreview(
    trancheInfo,
    amountIn
  );

  const insufficientBalance = parseUnits(amountIn || "0", baseAssetDecimals).gt(
    baseAssetBalanceOf ?? 0
  );

  const mintButtonDisabled =
    (!!account && (insufficientBalance || !amountIn)) || !canPerformMint;

  let mintButtonLabel = t`Mint tokens`;
  let mintButtonError = false;

  if (!amountIn) {
    mintButtonLabel = t`Enter an amount`;
  }
  if (insufficientBalance && account) {
    mintButtonError = true;
    mintButtonLabel = t`Insufficient balance`;
  }
  if (!account) {
    mintButtonLabel = t`Connect wallet`;
  }

  const onClose = useCallback(() => {
    setDrawerOpen(false);
    setAmountIn("");
  }, [setAmountIn]);

  const onClick = useCallback(() => {
    if (!account) {
      return setWalletDialogOpen(true);
    }

    setDrawerOpen(true);
  }, [account, setDrawerOpen]);

  const totalAmount = +formatUnits(baseAssetBalanceOf ?? 0, baseAssetDecimals);
  const showSaveBaseAssetMessage = +amountIn * 2 > totalAmount;

  return (
    <Card
      className={tw("flex", "flex-1", "flex-col", "space-y-4", "border", {
        "border-gray-600": isDarkMode,
      })}
    >
      <div className={tw("flex", "flex-col", "w-full", "space-y-4")}>
        <div className={tw("flex", "flex-col", "space-y-2", "mb-4")}>
          <span
            className={tw("text-center", "mb-4", "font-semibold")}
          >{t`Mint Principal and Yield tokens with your ${baseAssetSymbol}`}</span>
          <TokenAmountInput
            className={tw("col-span-2")}
            showMaxButton
            placeholder="0"
            leftIcon={
              BaseAssetIcon ? (
                <BaseAssetIcon height={20} width={20} className={tw("ml-2")} />
              ) : undefined
            }
            maxAmount={baseAssetBalanceOf}
            tokenDecimals={baseAssetDecimals}
            value={amountIn}
            onValueChange={setAmountIn}
          />
          <span
            className={tw("text-right")}
          >{t`Available balance: ${activeBaseAssetDisplayBalance} ${baseAssetSymbol}`}</span>
        </div>
        {showSaveBaseAssetMessage && (
          <Callout
            intent={Intent.WARNING}
          >{t`It looks like you are minting most of your balance.  If you plan to provide liquidity,
              remember that you'll need to supply some of the base asset as well.`}</Callout>
        )}

        <div className={tw("flex", "flex-col", "space-y-6")}>
          <LabeledText
            bold
            muted={false}
            containerClassName={tw("justify-center", "text-center")}
            text={<span>{t`Principal Tokens you receive`}</span>}
            label={
              <span className={tw("text-base")}>{t`${(+(
                numPrincipalTokensOut || 0
              ))?.toFixed(4)} ${principalTokenSymbol}`}</span>
            }
          />
          <LabeledText
            muted={false}
            bold
            containerClassName={tw("justify-center", "text-center")}
            text={<span>{t`Yield Tokens you receive`}</span>}
            label={
              <span className={tw("text-base")}>
                {t`${(+(numYieldTokensOut || 0))?.toFixed(
                  4
                )} ${yieldTokenSymbol}`}
              </span>
            }
          />
          <Button
            outlined
            large
            className={tw("flex")}
            disabled={mintButtonDisabled}
            intent={
              mintButtonError || !canPerformMint
                ? Intent.DANGER
                : Intent.PRIMARY
            }
            onClick={onClick}
          >
            {mintButtonLabel}
          </Button>
        </div>

        {!canPerformMint ? (
          <Callout intent={Intent.DANGER}>
            {t`Minting for this term has been temporarily disabled, please refer to our Discord or Twitter for further updates.`}
          </Callout>
        ) : null}
      </div>

      <MintTransactionConfirmationDrawer
        baseAsset={baseAsset}
        baseAssetIcon={BaseAssetIcon}
        principalTokenSymbol={principalTokenSymbol}
        yieldTokenSymbol={yieldTokenSymbol}
        trancheInfo={trancheInfo}
        account={account}
        library={library}
        amountIn={amountIn}
        isOpen={isDrawerOpen}
        onClose={onClose}
      />
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
      />
    </Card>
  );
}

function useActiveMintPreview(
  activeTrancheInfo: PrincipalTokenInfo,
  amountIn: string
) {
  const numPrincipalTokensOut = useMintPreview(
    activeTrancheInfo,
    amountIn
  )?.toFixed(4);

  // You will always receive the same amount of yield tokens as the amount of
  // base asset you put in
  const numYieldTokensOut = amountIn;

  return { numPrincipalTokensOut, numYieldTokensOut };
}
