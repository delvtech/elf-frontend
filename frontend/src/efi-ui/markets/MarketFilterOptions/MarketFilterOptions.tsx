import React, { FC } from "react";

import { FormGroup, InputGroup, RangeSlider, Switch } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

interface MarketFilterOptionsProps {}

export const MarketFilterOptions: FC<MarketFilterOptionsProps> = () => {
  return (
    <div>
      <FormGroup
        helperText="type to filter results..."
        label="Filter"
        labelFor="text-input"
      >
        <InputGroup
          leftIcon={IconNames.SEARCH}
          id="text-input"
          placeholder="Search markets"
        />
      </FormGroup>
      <FormGroup
        helperText="weeks until mature..."
        label="Time to maturity"
        labelFor="maturity-slider"
      >
        <RangeSlider
          min={0}
          max={52}
          stepSize={2}
          labelStepSize={13}
          value={[12, 24]}
        />
      </FormGroup>
      <FormGroup label="Asset State" labelFor="asset-radios">
        <Switch labelElement={t`Registering`} />
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
