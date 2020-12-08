import React, { FC, Fragment } from "react";

import { Button, Menu, MenuItem, Popover, Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import tw from "efi-tailwindcss-classnames";
import { CryptoIcon } from "efi-ui/crypto/CryptoIcon";
import { CryptoName } from "efi/crypto/CryptoName";
import { StakingAssets, stakingAssets } from "efi/crypto/stakingAssets";

interface StakingAssetProps {
  selectedAsset: StakingAssets;
  onSelect: (asset: StakingAssets) => void;
}

export const StakingAssetSelect: FC<StakingAssetProps> = (props) => {
  const { selectedAsset, onSelect } = props;
  return (
    <Popover
      content={
        <Menu>
          <Fragment>
            {stakingAssets.map((asset) => (
              <MenuItem
                onClick={() => onSelect(asset)}
                icon={
                  <img
                    className={tw("h-5", "w-5")}
                    src={CryptoIcon[asset]}
                    alt={CryptoName[asset]}
                  />
                }
                key={asset}
                text={CryptoName[asset]}
              />
            ))}
          </Fragment>
        </Menu>
      }
      position={Position.BOTTOM_LEFT}
      minimal
    >
      <Button
        rightIcon={IconNames.CARET_DOWN}
        text={CryptoName[selectedAsset]}
      />
    </Popover>
  );
};
