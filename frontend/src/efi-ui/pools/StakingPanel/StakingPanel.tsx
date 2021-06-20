import { Fragment, ReactElement } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";

import tw from "efi-tailwindcss-classnames";
import { StakingForm } from "efi-ui/pools/StakingForm/StakingForm";
import { StakingInput } from "efi-ui/pools/StakingInput/StakingInput";
import { PoolInfo } from "efi/pools/PoolInfo";

interface StakingPanelProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  poolInfo: PoolInfo;
  formDisabled?: boolean;
  submitDisabled?: boolean;
  buttonLabel: string;
  buttonIntent?: Intent;
}

export function StakingPanel(props: StakingPanelProps): ReactElement {
  const {
    account,
    library,
    signer,
    buttonLabel,
    formDisabled = false,
    submitDisabled = false,
    poolInfo,
  } = props;
  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "justify-between",
        "py-2",
        "h-full",
        "space-y-2"
      )}
    >
      <StakingForm
        library={library}
        signer={signer}
        account={account}
        poolInfo={poolInfo}
        buttonLabel={buttonLabel}
        formDisabled={formDisabled}
        submitDisabled={submitDisabled}
        buttonIntent={Intent.PRIMARY}
        children={(inputProps) => {
          const {
            termAssetInputProps,
            baseAssetInputProps,
            submitButtonProps,
          } = inputProps;

          return (
            <Fragment>
              <StakingInput
                cryptoSymbol={termAssetInputProps.cryptoSymbol}
                cryptoDecimals={termAssetInputProps.cryptoDecimals}
                cryptoAssetIcon={termAssetInputProps.cryptoAssetIcon}
                cryptoBalanceOf={termAssetInputProps.cryptoBalanceOf}
                cryptoDisplayBalance={termAssetInputProps.cryptoDisplayBalance}
                disabled={termAssetInputProps.disabled}
                onChange={termAssetInputProps.onChange}
                onPreviewUpdate={termAssetInputProps.onPreviewUpdate}
                labelTopLeft={termAssetInputProps.labelTopLeft}
                value={termAssetInputProps.value}
                validValue={termAssetInputProps.validValue}
                tokenPoolReserves={termAssetInputProps.tokenPoolReserves}
                otherTokenPoolReserves={
                  termAssetInputProps.otherTokenPoolReserves
                }
                totalSupply={termAssetInputProps.totalSupply}
              />
              <StakingInput
                cryptoSymbol={baseAssetInputProps.cryptoSymbol}
                cryptoDecimals={baseAssetInputProps.cryptoDecimals}
                cryptoAssetIcon={baseAssetInputProps.cryptoAssetIcon}
                cryptoBalanceOf={baseAssetInputProps.cryptoBalanceOf}
                cryptoDisplayBalance={baseAssetInputProps.cryptoDisplayBalance}
                disabled={baseAssetInputProps.disabled}
                onChange={baseAssetInputProps.onChange}
                onPreviewUpdate={baseAssetInputProps.onPreviewUpdate}
                labelTopLeft={baseAssetInputProps.labelTopLeft}
                value={baseAssetInputProps.value}
                validValue={baseAssetInputProps.validValue}
                tokenPoolReserves={baseAssetInputProps.tokenPoolReserves}
                otherTokenPoolReserves={
                  baseAssetInputProps.otherTokenPoolReserves
                }
                totalSupply={baseAssetInputProps.totalSupply}
              />
              <Button
                disabled={submitButtonProps.disabled}
                onClick={submitButtonProps.onClick}
                minimal
                outlined
                large
                intent={
                  submitButtonProps.error ? Intent.DANGER : Intent.PRIMARY
                }
              >
                {submitButtonProps.label}
              </Button>
            </Fragment>
          );
        }}
      ></StakingForm>
    </div>
  );
}
