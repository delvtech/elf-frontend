import { Fragment, ReactElement, useCallback, useState } from "react";

import { Button, Callout, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { parseUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoBalanceOf } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import { MintTransactionConfirmationDrawer } from "efi-ui/mint/MintTransactionConfirmationDrawer/MintTransactionConfirmationDrawer";
import { TokenAmountInput } from "efi-ui/token/TokenAmountInput/TokenAmountInput";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { useTrancheCanPerform } from "efi-ui/tranche/useTrancheCanPerform";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { formatBalance } from "efi/base/formatBalance";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";

interface MintFormProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  trancheInfo: TrancheInfo;
}

export function MintForm(props: MintFormProps): ReactElement | null {
  const { library, account, trancheInfo } = props;

  const {
    address: trancheAddress,
    extensions: { interestToken, underlying },
  } = trancheInfo;
  const canPerformMint = useTrancheCanPerform(trancheAddress, "mint");

  const baseAsset = getCryptoAssetForToken(underlying);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAsset);
  const vaultSymbol = getVaultSymbol(baseAsset) as string;

  const principalTokenContract = trancheContractsByAddress[trancheAddress];
  const yieldTokenContract = interestTokenContractsByAddress[interestToken];

  const { symbol: yieldTokenSymbol = "" } = getTermAssetSymbol(
    yieldTokenContract.address,
    vaultSymbol
  );
  const { symbol: principalTokenSymbol = "" } = getTermAssetSymbol(
    principalTokenContract.address,
    vaultSymbol
  );

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);

  const { stringValue: amountInString, setValue: setAmountIn } =
    useNumericInput();

  const amountIn = +(amountInString || 0);

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

  const insufficientBalance = parseUnits(
    amountInString || t`0`,
    baseAssetDecimals
  ).gt(baseAssetBalanceOf ?? 0);

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

  const onClick = useCallback(
    (event) => {
      if (!account) {
        return setWalletDialogOpen(true);
      }

      setDrawerOpen(true);
    },
    [account, setDrawerOpen]
  );

  return (
    <Fragment>
      <div className={tw("flex", "flex-col", "w-full", "space-y-4")}>
        <div className={tw("flex", "flex-col", "space-y-2", "mb-4")}>
          <span
            className={tw("text-center", "mb-4")}
          >{t`Mint principal and yield tokens with your ${baseAssetSymbol}`}</span>
          <div className={tw("grid", "grid-cols-3", "gap-3")}>
            <TokenAmountInput
              className={tw("col-span-2")}
              showMaxButton
              placeholder="0"
              leftIcon={
                BaseAssetIcon ? (
                  <BaseAssetIcon
                    height={20}
                    width={20}
                    className={tw("ml-2")}
                  />
                ) : undefined
              }
              maxAmount={baseAssetBalanceOf}
              tokenDecimals={baseAssetDecimals}
              value={amountInString}
              onValueChange={setAmountIn}
            />
            <Button
              outlined
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
          <div className={tw("grid", "grid-cols-3")}>
            <span
              className={tw("col-span-2", "text-right")}
            >{t`Available balance: ${activeBaseAssetDisplayBalance} ${baseAssetSymbol}`}</span>
          </div>
        </div>
        <div className={tw("grid", "grid-cols-2", "pb-4")}>
          <LabeledText
            bold
            muted={false}
            containerClassName={tw("justify-center")}
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
            containerClassName={tw("justify-center")}
            text={<span>{t`Yield Tokens you receive`}</span>}
            label={
              <span className={tw("text-base")}>
                {t`${(+(numYieldTokensOut || 0))?.toFixed(
                  4
                )} ${yieldTokenSymbol}`}
              </span>
            }
          />
        </div>

        {!canPerformMint ? (
          <Callout intent={Intent.DANGER}>
            {t`Minting for this term has been temporarily disabled, please refer to our Discord or Twitter for further updates.`}
          </Callout>
        ) : null}
      </div>

      <MintTransactionConfirmationDrawer
        baseAsset={baseAsset}
        baseAssetIcon={BaseAssetIcon as TokenIcon}
        principalTokenSymbol={principalTokenSymbol}
        yieldTokenSymbol={yieldTokenSymbol}
        trancheInfo={trancheInfo}
        account={account}
        library={library}
        amountIn={amountInString}
        isOpen={isDrawerOpen}
        onClose={onClose}
      />
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
      />
    </Fragment>
  );
}

function useActiveMintPreview(
  activeTrancheInfo: TrancheInfo,
  amountIn: number
) {
  const numPrincipalTokensOut = useMintPreview(
    activeTrancheInfo,
    amountIn
  )?.toFixed(4);

  // You will always receive the same amount of yield tokens as the amount of
  // base asset you put in
  const numYieldTokensOut = amountIn?.toFixed(4);

  return { numPrincipalTokensOut, numYieldTokensOut };
}
