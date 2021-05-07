import { ReactElement } from "react";

import { Colors, Divider, H2, H6, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";

interface PoolViewHeaderProps {
  pool: PoolContract | undefined;
}
export function PoolViewHeader({ pool }: PoolViewHeaderProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const { data: [tokens] = [] } = usePoolTokens(pool);
  const { baseAssetContract, termAssetContract } = parseSortedTokensForPool(
    tokens
  );
  const baseAsset = useCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const { label: termAssetSymbol } = useTermAssetSymbol(
    termAssetContract?.address,
    baseAssetSymbol
  );
  const BaseAssetIcon = findAssetIcon(baseAssetSymbol);

  return (
    <div style={{ height: 70 }} className={tw("flex", "items-center")}>
      {BaseAssetIcon ? (
        <div
          className={classNames(
            tw(
              "hidden",
              "md:flex",
              "items-center",
              "rounded",
              "p-2",
              "flex-shrink-0"
            )
          )}
        >
          <div
            style={{
              borderColor: isDarkMode ? Colors.GRAY5 : undefined,
              backgroundColor: isDarkMode ? Colors.WHITE : undefined,
            }}
            className={tw(
              "flex",
              "flex-shrink-0",
              "items-center",
              "p-2",
              "rounded-full",
              "z-10",
              "bg-white",
              "border",
              "shadow-sm"
            )}
          >
            <BaseAssetIcon height={36} width={36} />
          </div>
          <div
            style={{ marginLeft: -8 }}
            className={tw(
              "flex",
              "flex-shrink-0",
              "items-center",
              "p-2",
              "rounded-full",
              "bg-white",
              "border"
            )}
          >
            <BaseAssetIcon height={36} width={36} />
          </div>
        </div>
      ) : null}
      <div>
        <div className={tw("flex", "items-center")}>
          <H2
            className={tw("ml-4", "m-0", "mt-3")}
          >{t`${baseAssetSymbol} - ${termAssetSymbol}`}</H2>
          <div></div>
        </div>
        <div className={tw("flex", "items-center", "ml-4")}>
          <div>90 Day - Jul, 7, 2020</div>
        </div>
      </div>
    </div>
  );
}
