import React, { FC, useCallback } from "react";

import { Button, Intent, MenuItem } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { t } from "ttag";

import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { useCryptoSymbol } from "efi/ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { useCurrencyPref } from "efi/ui/prefs/useCurrency/useCurency";

interface CurrencySelectProps {}

const CurrencySelectComponent = Select.ofType<string>();
export const CurrencySelect: FC<CurrencySelectProps> = (props) => {
  const { currency, setCurrency } = useCurrencyPref();
  const { data: symbolData } = useCryptoSymbol(CryptoSymbol.ETH);
  // TODO: get this from an enum
  const supportedCurrencies = Object.keys(
    symbolData?.market_data?.current_price || {}
  );
  const renderItems = useCallback((item: string, { handleClick }) => {
    return <MenuItem onClick={handleClick} text={item} />;
  }, []);
  const onItemSelect = useCallback(
    (item) => {
      setCurrency(item);
    },
    [setCurrency]
  );

  return (
    <CurrencySelectComponent
      onItemSelect={onItemSelect}
      itemRenderer={renderItems}
      activeItem={currency}
      itemPredicate={() => true}
      noResults={<MenuItem disabled={true} text={t`No results.`} />}
      items={supportedCurrencies}
    >
      <Button
        minimal
        small
        outlined
        intent={Intent.PRIMARY}
        text={currency}
        rightIcon="double-caret-vertical"
      />
    </CurrencySelectComponent>
  );
};
