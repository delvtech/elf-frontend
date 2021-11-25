import { Fragment, ReactElement, useCallback, useState } from "react";
import { Helmet } from "react-helmet";

import { Button, Card, Classes, Colors, Icon, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { commify } from "ethers/lib/utils";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "elf-tailwindcss-classnames";
import { useNumericInput } from "elf-ui/base/hooks/useNumericInput/useNumericInput";
import { LabeledText } from "elf-ui/base/LabeledText/LabeledText";
import { useIsTailwindLargeScreen } from "elf-ui/base/mediaBreakpoints";
import { useCalculatePrincipalTokenAmountOut } from "elf-ui/ccpools/useCalculatePrincipalTokenAmountOut";
import { useMarketPrice } from "elf-ui/ccpools/useMarketPrice";
import { findAssetIcon } from "elf-ui/crypto/CryptoIcon";
import { useCryptoBalanceOf } from "elf-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useValidateBuyPrincipalTokenInput } from "elf-ui/pools/hooks/useValidateBuyPrincipalTokenInput";
import { useDarkMode } from "elf-ui/prefs/useDarkMode/useDarkMode";
import { TokenAmountInput2 } from "elf-ui/token/TokenAmountInput/TokenAmountInput2";
import { getMarketRateLabel } from "elf-ui/tranche/getMarketRateLabel";
import { PrincipalTokenTermButtonLabel2 } from "elf-ui/tranche/TermPicker/PrincipalTokenTermButtonLabel2";
import { TermPicker2 } from "elf-ui/tranche/TermPicker/TermPicker2";
import { useOpenPrincipalTokensWithSameBaseAsset } from "elf-ui/tranche/useOpenPrincipalTokensWithSameBaseAsset";
import { formatBalance } from "elf/base/formatBalance";
import { getCryptoAssetForToken } from "elf/crypto/getCryptoAssetForToken";
import { getCryptoDecimals } from "elf/crypto/getCryptoDecimals";
import { getCryptoName } from "elf/crypto/getCryptoName/getCryptoName";
import { getCryptoSymbol } from "elf/crypto/getCryptoSymbol";
import { getPoolInfoForPrincipalToken } from "elf/pools/ccpool";
import { getTokenInfo } from "elf/tokenlists";
import { FixedRatePreviewCallout } from "./FixedRatePreviewCallout";
import { SwapKind } from "elf-balancer/SwapKind";
import { SwapTokensTransactionConfirmationDrawer } from "elf-ui/swaps/SwapTokensTransactionConfirmationDrawer/SwapTokensTransactionConfirmationDrawer";
import { getTokenAddressForBalancer } from "elf-balancer/getTokenAddressForBalancer";
import { IconNames } from "@blueprintjs/icons";
import { useNavigation } from "elf-ui/app/navigation/hooks/useNavigation";
import { Navigation } from "elf-ui/app/navigation/navigation";

interface BuyFixedRatesViewProps extends RouteComponentProps {
  // principalTokenAddress comes from the url, so it's intentionally optional as
  // per https://reach.tech/router/typescript
  principalTokenAddress?: string;
}

export function BuyFixedRatesView({
  principalTokenAddress,
}: BuyFixedRatesViewProps): ReactElement | null {
  const { account, library } = useWeb3React<Web3Provider>();
  const { isDarkMode } = useDarkMode();
  const { changeTab } = useNavigation();
  const goToFixedRatesListPage = useCallback(() => {
    changeTab(Navigation.FIXED_RATES);
  }, [changeTab]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  // Tailwind mindset is mobile-first, but sometimes we need to know at runtime
  // if a large screen is being used.
  const isLargeScreen = useIsTailwindLargeScreen();

  // Used for the Term picker, since base assets can have multiple terms (ie:
  // principal tokens) running at the same time.
  const availablePrincipalTokens = useOpenPrincipalTokensWithSameBaseAsset(
    principalTokenAddress
  );

  const principalTokenInfo = getTokenInfo<PrincipalTokenInfo>(
    principalTokenAddress as string
  );

  const {
    extensions: { underlying },
  } = principalTokenInfo;
  const baseAsset = getCryptoAssetForToken(underlying);
  const baseAssetUnderlyingAddress = getTokenAddressForBalancer(baseAsset);
  const baseAssetName = getCryptoName(baseAsset);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const AssetIcon = findAssetIcon(baseAsset);
  const height = isLargeScreen ? 40 : 30;
  const width = height;

  const baseAssetDecimals = getCryptoDecimals(baseAsset);
  const baseAssetBalanceOf = useCryptoBalanceOf(library, account, baseAsset);
  const baseAssetDisplayBalance = formatBalance(
    baseAssetBalanceOf,
    baseAssetDecimals
  );

  // Market price stuff
  const principalPrice = useMarketPrice(principalTokenInfo);
  const roundedPrincipalPrice = commify((+principalPrice)?.toFixed(4));
  const marketRateLabel = getMarketRateLabel(
    baseAssetSymbol,
    roundedPrincipalPrice,
    baseAssetSymbol
  );

  // Deposit Amount stuff
  const { stringValue: baseAssetInputValue, setValue: onBaseAssetInputChange } =
    useNumericInput();
  const principalTokenPoolInfo = getPoolInfoForPrincipalToken(
    principalTokenAddress as string
  );
  const { tokenOutError, tokenInError } = useValidateBuyPrincipalTokenInput(
    library,
    account,
    principalTokenPoolInfo,
    baseAssetInputValue
  );
  const { amountOut: principalTokensOut, error: previewError } =
    useCalculatePrincipalTokenAmountOut(
      principalTokenPoolInfo,
      baseAssetInputValue
    );

  const inputErrorMessage = tokenInError || tokenOutError;
  const hasInputError = !!inputErrorMessage || !!previewError;

  const isBuyButtonDisabled = hasInputError || !+baseAssetInputValue;
  const buttonErrorMessage = previewError
    ? t`Insufficient liquidity in pool`
    : inputErrorMessage;
  const buyButtonIntent = hasInputError ? Intent.DANGER : Intent.PRIMARY;

  return (
    <Fragment>
      <Helmet>
        <title>{t`Earn fixed yield from buying at a discount. Exit anytime.`}</title>
      </Helmet>
      {/* Top-level route components should specify their own containers. */}
      <div className={tw("flex", "flex-col", "h-full", "items-center")}>
        <div
          className={tw(
            "flex",
            "items-center",
            "w-full",
            "space-x-5",
            "lg:px-16",
            "lg:text-lg"
          )}
        >
          <Button
            className={tw("font-semibold")}
            icon={
              <Icon
                color={Colors.WHITE}
                icon={IconNames.DOWNLOAD}
                size={32}
                className={tw(
                  // transform is a weird property that requires casting in tw()
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  "transform" as any,
                  "rotate-90"
                )}
              />
            }
            minimal
            large
            onClick={goToFixedRatesListPage}
          >{t`Principal Pools`}</Button>
          <div style={{ width: 1 }} className={tw("h-full", "bg-white")} />
          <span
            className={tw("pl-2", "font-semibold")}
          >{`${baseAssetSymbol}`}</span>
        </div>
        <div
          className={tw(
            "flex",
            "flex-col",
            "w-full",
            "items-center",
            "text-center",
            "space-y-4",
            "pt-2",
            "px-6",
            "pb-24",
            "lg:py-10",
            "lg:max-w-4xl"
          )}
        >
          <Card className={tw("flex", "flex-col", "w-400", "p-6", "space-y-8")}>
            {/* Base asset Picker */}
            <div className={tw("flex", "flex-col", "space-y-3")}>
              <span
                className={tw("text-base", "text-left")}
              >{t`Choose Token`}</span>
              <div
                style={{
                  background: isDarkMode ? "var(--bp3-dark-bg-color)" : "",
                }}
                className={classNames(
                  tw("flex", "p-1", "border", "rounded", "border-gray-500")
                )}
              >
                <LabeledText
                  containerClassName={tw("p-4")}
                  icon={<AssetIcon height={height} width={width} />}
                  iconClassName={tw("flex-shrink-0", "mr-4")}
                  large={isLargeScreen}
                  labelClassName={tw("text-xs", "text-left")}
                  label={t`${baseAssetName}`}
                  textClassName={tw("lg:text-base", "text-left")}
                  text={baseAssetSymbol}
                />
              </div>
            </div>

            {/* Term Picker  */}
            <div className={tw("flex", "flex-col", "space-y-3")}>
              <span
                className={tw("text-base", "text-left")}
              >{t`Select Term Period`}</span>
              <div
                style={{
                  background: isDarkMode ? "var(--bp3-dark-bg-color)" : "",
                }}
                className={classNames(
                  tw("flex", "p-1", "border", "rounded", "border-gray-500")
                )}
              >
                {availablePrincipalTokens.length > 1 ? (
                  <TermPicker2
                    account={account}
                    principalTokenInfos={availablePrincipalTokens}
                    activePrincipalToken={principalTokenInfo}
                    buttonLabelRenderer={buttonLabelRenderer}
                  />
                ) : (
                  // just show the label if there's no picker
                  <PrincipalTokenTermButtonLabel2
                    className={tw("p-4")}
                    principalTokenInfo={principalTokenInfo}
                  />
                )}
              </div>
            </div>

            {/* Deposit Amount */}
            <div className={tw("flex", "flex-col")}>
              <span
                className={tw("text-base", "text-left")}
              >{t`You Spend`}</span>
              {!!account && (
                <span
                  className={classNames(
                    Classes.TEXT_MUTED,
                    tw("text-right", "mb-2")
                  )}
                >{t`Balance: ${baseAssetDisplayBalance} ${baseAssetSymbol}`}</span>
              )}
              <div
                style={{
                  background: isDarkMode ? "var(--bp3-dark-bg-color)" : "",
                }}
                className={classNames(tw("flex", "rounded", "mb-2"))}
              >
                <TokenAmountInput2
                  showMaxButton
                  placeholder="0.00"
                  inputGroupStyle={{
                    height: "72px",
                    width: "100%",
                    fontSize: "1.125rem",
                  }}
                  intent={hasInputError ? Intent.DANGER : Intent.NONE}
                  value={baseAssetInputValue}
                  maxAmount={baseAssetBalanceOf}
                  tokenDecimals={baseAssetDecimals}
                  onValueChange={onBaseAssetInputChange}
                />
              </div>
              {hasInputError && (
                <span
                  className={classNames(
                    tw(
                      "text-xs",
                      "text-right",
                      "mb-2",
                      isDarkMode ? "text-red-500" : "text-red-700"
                    )
                  )}
                >
                  {inputErrorMessage}
                </span>
              )}
              {marketRateLabel && (
                <span
                  className={classNames(
                    Classes.TEXT_MUTED,
                    tw("text-xs", "text-right")
                  )}
                >
                  {marketRateLabel}
                </span>
              )}
            </div>

            <div className={tw("flex", "flex-col", "space-y-3")}>
              <span
                className={tw("text-base", "text-left")}
              >{t`Review Order`}</span>

              <FixedRatePreviewCallout
                principalTokensOut={principalTokensOut}
                baseAssetIn={baseAssetInputValue}
                baseAssetDecimals={baseAssetDecimals}
              />
            </div>

            <Button
              disabled={isBuyButtonDisabled}
              onClick={openDrawer}
              outlined
              large
              intent={buyButtonIntent}
            >
              {hasInputError ? buttonErrorMessage : t`Buy`}
            </Button>
          </Card>
        </div>
      </div>
      <SwapTokensTransactionConfirmationDrawer
        buttonLabel={t`Buy`}
        tokenInAddress={baseAssetUnderlyingAddress}
        tokenInSymbol={baseAssetSymbol}
        tokenInDecimals={baseAssetDecimals}
        tokenInAsset={baseAsset}
        tokenInIcon={AssetIcon}
        tokenOutAddress={principalTokenAddress as string}
        tokenOutSymbol={principalTokenInfo.symbol}
        tokenOutDecimals={baseAssetDecimals}
        tokenOutIcon={undefined}
        account={account}
        library={library}
        poolInfo={principalTokenPoolInfo}
        amountIn={baseAssetInputValue}
        amountOut={principalTokensOut}
        swapKind={SwapKind.GIVEN_IN}
        spotPrice={+principalPrice}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />
    </Fragment>
  );
}

function buttonLabelRenderer(term: PrincipalTokenInfo): ReactElement {
  return <PrincipalTokenTermButtonLabel2 principalTokenInfo={term} />;
}
