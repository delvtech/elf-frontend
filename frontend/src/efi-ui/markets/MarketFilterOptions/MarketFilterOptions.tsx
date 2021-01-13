import React, { FC } from "react";

import {
  Button,
  FormGroup,
  InputGroup,
  Intent,
  RangeSlider,
  Switch,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

interface MarketFilterOptionsProps {}

export const MarketFilterOptions: FC<MarketFilterOptionsProps> = () => {
  return (
    <div className={tw("space-y-6")}>
      <div className={tw("flex", "justify-between")}>
        <span className="h2">{`Filter`}</span>
        <Button minimal intent={Intent.PRIMARY}>{t`Reset`}</Button>
      </div>
      <FormGroup labelFor="text-input">
        <InputGroup
          leftIcon={IconNames.SEARCH}
          id="text-input"
          placeholder="Search markets"
        />
      </FormGroup>
      <FormGroup label="Time to maturity (weeks)" labelFor="maturity-slider">
        <RangeSlider
          min={0}
          max={52}
          stepSize={2}
          labelStepSize={26}
          value={[12, 24]}
        />
      </FormGroup>
      <FormGroup label="Asset State" labelFor="asset-radios">
        <Switch labelElement={t`Queue`} />
        <Switch labelElement={t`Running`} />
        <Switch labelElement={t`Mature`} />
      </FormGroup>
      <FormGroup label="Asset Types" labelFor="asset-radios">
        <Switch labelElement={t`Fixed Yield Tokens`} />
        <Switch labelElement={t`Yield Coupons`} />
      </FormGroup>
      <FormGroup label="Currencies" labelFor="currency-radios">
        <Switch labelElement={t`WETH`} />
        <Switch labelElement={t`USDC`} />
      </FormGroup>
      <FormGroup label="Miscellaneous" labelFor="currency-radios">
        <Switch labelElement={t`Invested`} />
        <Switch labelElement={t`Staking`} />
        <Switch labelElement={t`Wallet approved`} />
      </FormGroup>
    </div>
  );
};
