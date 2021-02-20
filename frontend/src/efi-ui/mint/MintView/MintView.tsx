import React, { FC, ReactNode, useMemo, useState } from "react";

import { Breadcrumbs, Classes, IBreadcrumbProps } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

import { ChooseBaseAssetStep } from "../ChooseBaseAssetStep/ChooseBaseAssetStep";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";

interface MintViewProps extends RouteComponentProps {}

interface MintingStep {
  title: string;
  description: string;

  content: ReactNode;
}

export const MintView: FC<MintViewProps> = () => {
  const {
    account,
    active,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [investmentAmount, setInvestmentAmount] = useState(0);

  const [currentStepIndex] = useState(0);
  const mintingSteps: MintingStep[] = useMemo(
    (): MintingStep[] => [
      {
        title: t`Choose a base asset`,
        description: t`To begin minting yield tokens, pick a base asset and yield position from the options below:`,
        content: (
          <ChooseBaseAssetStep
            account={account}
            onInvestmentAmountChange={setInvestmentAmount}
          />
        ),
      },
      {
        title: t`Set an amount`,
        description: t`To begin minting yield tokens, pick a base asset from the following options:`,
        content: null,
      },
      {
        title: t`Set time to maturity`,
        description: t`When do you want your yield tokens to mature?`,
        content: null,
      },
      {
        title: t`Confirmation`,
        description: "",
        content: null,
      },
    ],
    [account]
  );

  const breadcrumbItems = useMemo<IBreadcrumbProps[]>(
    () =>
      mintingSteps.map(({ title }, index) => ({
        text: title,
        current: currentStepIndex === index,
        className: tw("text-xl"),
      })),
    [currentStepIndex, mintingSteps]
  );

  const currentStep = mintingSteps[currentStepIndex];

  return (
    <div
      data-testid="mint-view"
      className={tw(
        "flex",
        "flex-col",
        "p-12",
        "h-full",
        "space-y-12",
        "overflow-scroll"
      )}
    >
      {/* page title */}
      <ViewTitle
        title={t`Mint Yield Tokens`}
        subtitle={t`A concise description of Minting makes it clear to the user why FYTs and YCs are useful to them.`}
        account={account}
        active={active}
        chainId={chainId}
        connector={connector}
        library={library}
      />

      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        <div
          className={tw(
            "flex",
            "flex-col",
            "space-y-8",
            "w-full",
            "items-center",
            "justify-center"
          )}
        >
          <div className={tw("flex", "flex-col", "space-y-10", "items-center")}>
            <Breadcrumbs
              minVisibleItems={mintingSteps.length}
              items={breadcrumbItems}
            />
          </div>
          <span
            className={classNames(
              Classes.RUNNING_TEXT,
              Classes.TEXT_MUTED,
              tw("text-base")
            )}
          >
            {currentStep.description}
          </span>
          {currentStep.content}
        </div>
      </div>
    </div>
  );
};
