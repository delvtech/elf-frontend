import React, { FC } from "react";

import { BPool } from "elf-contracts/types/BPool";

import tw from "efi-tailwindcss-classnames";
import { FixedYieldSummary } from "efi-ui/markets/FixedYieldSummary/FixedYieldSummary";
import { MarketActionsCard } from "efi-ui/markets/MarketActionsCard/MarketActionsCard";
import { MarketHistory } from "efi-ui/markets/MarketHistory/MarketHistory";
import { MarketSummary } from "efi-ui/markets/MarketSummary/MarketSummary";
import { TokenSummary } from "efi-ui/markets/TokenSummary/TokenSummary";
import { useMarketDetails } from "efi-ui/markets/useMarketDetails";
import { Signer } from "ethers";

interface MarketDetailsProps {
  signer: Signer | undefined;
  accountAddress: string | null | undefined;
  marketContract: BPool | undefined;
}

export const MarketDetails: FC<MarketDetailsProps> = ({
  signer,
  accountAddress,
  marketContract,
}) => {
  const [marketDetails] = useMarketDetails(marketContract);

  // TODO: I'm undecided right now if I should be passing down the contracts to the subcomponents
  // and letting them do some contract calls and show loading states if the contract isn't loaded
  // yet OR passing the values like I am now and letting components show loading states if values
  // are undefined.  going with the latter for now to see how it feels so that I can keep those
  // components simple and easier to test.
  const {
    maturityDate,
    startDate,
    totalSupply,
    assets: [baseAsset, yieldAsset] = [undefined, undefined],
  } = marketDetails || {};

  return (
    <div className={tw("flex", "mb-8", "space-x-4", "w-full", "items-stretch")}>
      <div className={tw("flex", "flex-1")}>
        <div className={tw("flex", "flex-col", "space-y-8", "w-full")}>
          <div className={tw("flex", "space-x-12")}>
            <MarketSummary totalSupply={totalSupply} />
            <FixedYieldSummary
              startDate={startDate}
              maturityDate={maturityDate}
            />
            <TokenSummary baseAsset={baseAsset} yieldAsset={yieldAsset} />
          </div>
          <div className={tw("flex", "space-x-12")}>
            <MarketHistory />
            <MarketActionsCard
              signer={signer}
              accountAddress={accountAddress}
              market={marketDetails}
              marketContract={marketContract}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
