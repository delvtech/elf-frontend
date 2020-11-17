import React, { FC, useCallback } from "react";

import { Button, Intent, MenuItem } from "@blueprintjs/core";
import { ItemListPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import { filter } from "fuzzaldrin-plus";
import { Currencies, Currency } from "ts-money";
import { t } from "ttag";

import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { useCryptoSymbol } from "efi/ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { useCurrencyPref } from "efi/ui/prefs/useCurrency/useCurency";

interface CurrencySelectProps {}

const CurrencySelectComponent = Select.ofType<Currency>();
export const CurrencySelect: FC<CurrencySelectProps> = () => {
  const { currency, setCurrency } = useCurrencyPref();
  const { data: symbolData } = useCryptoSymbol(CryptoSymbol.ETH);
  const supportedCurrencies = getSupportedCurrencies(symbolData);

  const onItemSelect = useCallback(
    (item: Currency) => {
      setCurrency(item);
    },
    [setCurrency]
  );

  const activeItem = supportedCurrencies.find(
    ({ code }) => code === currency.code
  );

  return (
    <CurrencySelectComponent
      onItemSelect={onItemSelect}
      itemRenderer={renderItems}
      activeItem={activeItem}
      itemListPredicate={itemListPredicate}
      noResults={<MenuItem disabled={true} text={t`No results.`} />}
      items={supportedCurrencies}
    >
      <Button
        minimal
        small
        outlined
        intent={Intent.PRIMARY}
        text={currency.code}
        rightIcon="double-caret-vertical"
      />
    </CurrencySelectComponent>
  );
};

/**
 * @param symbolData coin data from coingecko
 */
function getSupportedCurrencies(symbolData: any) {
  return Object.keys(symbolData?.market_data?.current_price || {})
    .map((isoCode) => {
      const currencyCode = isoCode.toUpperCase() as keyof typeof Currencies;
      return Currencies[currencyCode] as Currency;
    })
    .filter((metadata) => !!metadata);
}

const renderItems: ItemRenderer<Currency> = (
  item: Currency,
  { handleClick }
) => {
  return (
    <MenuItem
      key={item.code}
      onClick={handleClick}
      text={
        <span>
          {item.code} {item.name} {`(${item.symbol_native || item.symbol})`}
        </span>
      }
    />
  );
};

const itemListPredicate: ItemListPredicate<Currency> = (query, items) => {
  if (!query) {
    return items;
  }

  const itemsBySearchStrings = Object.fromEntries(
    items.map((item) => [
      item.code + item.name + item.symbol + item.symbol_native,
      item,
    ])
  );

  const searchStrings = Object.keys(itemsBySearchStrings);

  const results = filter<string>(searchStrings, query, {
    maxResults: 10,
    pathSeparator: "/",
    usePathScoring: true,
  });

  return results.map((searchString) => itemsBySearchStrings[searchString]);
};
