import React, { ReactElement } from "react";

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

export function MarketFilterOptions(): ReactElement {
  return (
    <div className={tw("space-y-6")}>
      <div className={tw("flex", "justify-between")}>
        <span className="h4">{t`Filter`}</span>
        <Button minimal intent={Intent.PRIMARY}>{t`Reset`}</Button>
      </div>
      <FormGroup labelFor="text-input">
        <InputGroup
          leftIcon={IconNames.SEARCH}
          id="text-input"
          placeholder={t`Search markets`}
        />
      </FormGroup>
      <FormGroup label={t`Time to maturity (weeks)`} labelFor="maturity-slider">
        <RangeSlider
          min={0}
          max={52}
          stepSize={2}
          labelStepSize={26}
          value={[12, 24]}
        />
      </FormGroup>
      <FormGroup label={t`Tranche State`} labelFor="asset-radios">
        <Switch labelElement={t`Queue`} />
        <Switch labelElement={t`Running`} />
        <Switch labelElement={t`Mature`} />
      </FormGroup>
      <FormGroup label={t`Asset Types`} labelFor="asset-radios">
        <Switch labelElement={t`Fixed Yield Tokens`} />
        <Switch labelElement={t`Interest Tokens`} />
      </FormGroup>
      <FormGroup label={t`Currencies`} labelFor="currency-radios">
        <Switch labelElement={t`WETH`} />
        <Switch labelElement={t`USDC`} />
      </FormGroup>
      <FormGroup label={t`Miscellaneous`} labelFor="currency-radios">
        <Switch labelElement={t`Invested`} />
        <Switch labelElement={t`Staking`} />
        <Switch labelElement={t`Wallet approved`} />
      </FormGroup>
    </div>
  );
}
