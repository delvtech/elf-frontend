import {
  Button,
  Card,
  H3,
  InputGroup,
  Intent,
  Spinner,
  Tag,
} from "@blueprintjs/core";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { Strategy } from "efi/pools/strategy";
import { CryptoIcon } from "efi/ui/crypto/CryptoIcon";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";
import styles from "efi/ui/pools/StrategyCard/StrategyCard.module.css";
import pieChart from "efi/ui/staticAssets/piechart.png";

export const StrategyCard: FC<StrategyCardProps> = ({
  strategy: { name, heldAssets, stakingAsset },
}) => {
  return (
    <Card className={tw("flex", "flex-col", "w-3/5", "max-w-xl", "gap-8")}>
      <div className={tw("flex", "gap-8", "items-center", "w-full")}>
        <div className={tw("flex", "flex-col", "gap-8")}>
          <H3>{name}</H3>

          {/* Staking Asset */}
          <div className={tw("flex", "flex-col", "gap-3")}>
            <span> {t`Primary asset`}</span>
            <div className={tw("flex", "gap-4")}>
              <Tag minimal intent={Intent.PRIMARY} interactive large>
                {stakingAsset}
              </Tag>
            </div>
          </div>

          {/*Held Assets Tags*/}
          <div className={tw("flex", "flex-col", "gap-3")}>
            <span> {t`Assets in this strategy`}</span>
            <div className={tw("flex", "gap-4")}>
              {heldAssets.map((assetName) => {
                return (
                  <Tag
                    minimal
                    intent={Intent.PRIMARY}
                    interactive
                    large
                    key={assetName}
                  >
                    {assetName}
                  </Tag>
                );
              })}
            </div>
          </div>

          <div className={tw("flex", "flex-col", "gap-4")}>
            <span>{t`Exected APY`}</span>
            <Spinner
              className={tw("justify-start")}
              size={Spinner.SIZE_SMALL}
            />
          </div>
        </div>

        <div
          className={tw(
            "hidden",
            "lg:flex",
            "w-full",
            "h-full",
            "justify-center",
            "items-center"
          )}
        >
          <img
            src={pieChart}
            alt="asset percentages"
            height={128}
            width={128}
          />
        </div>
      </div>
      <div className={tw("flex", "gap-8")}>
        {/* Deposit */}
        <div className={tw("flex", "flex-col", "gap-5")}>
          <span>{t`Deposit`}</span>
          <div className={tw("flex", "flex-col", "gap-2")}>
            <InputGroup
              className={styles.depositInput}
              large
              rightElement={
                <Tag large minimal>
                  <span>{stakingAsset}</span>
                </Tag>
              }
              leftElement={
                <div className={tw("px-2")}>
                  <img
                    className={tw("h-5", "w-5")}
                    src={CryptoIcon[stakingAsset as keyof typeof CryptoSymbol]}
                    alt={CryptoName[stakingAsset as keyof typeof CryptoSymbol]}
                  />
                </div>
              }
            />
            <span
              className={tw("text-xs", "text-right")}
            >{t`Available: 0.328 ${stakingAsset}`}</span>
          </div>
          <Button
            minimal
            outlined
            large
            intent={Intent.PRIMARY}
          >{t`Deposit ${stakingAsset}`}</Button>
        </div>

        {/* Withdraw */}
        <div className={tw("flex", "flex-col", "gap-5")}>
          <span>{t`Withdraw`}</span>
          <div className={tw("flex", "flex-col", "gap-2")}>
            <InputGroup
              className={styles.depositInput}
              large
              rightElement={
                <Tag large minimal>
                  <span>{stakingAsset}</span>
                </Tag>
              }
              leftElement={
                <div className={tw("px-2")}>
                  <img
                    className={tw("h-5", "w-5")}
                    src={CryptoIcon[stakingAsset as keyof typeof CryptoSymbol]}
                    alt={CryptoName[stakingAsset as keyof typeof CryptoSymbol]}
                  />
                </div>
              }
            />
            <span
              className={tw("text-xs", "text-right")}
            >{t`Available: 0.328 ${stakingAsset}`}</span>
          </div>
          <Button
            minimal
            outlined
            large
            intent={Intent.PRIMARY}
          >{t`Withdraw ${stakingAsset}`}</Button>
        </div>
      </div>
    </Card>
  );
};
interface StrategyCardProps {
  strategy: Strategy<any>;
}
