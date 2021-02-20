import React, { FC, useCallback } from "react";

import { Select } from "@blueprintjs/select";
import { Elf__factory } from "elf-contracts/types/factories/Elf__factory";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber } from "ethers";
import zipWith from "lodash.zipwith";

import tw from "efi-tailwindcss-classnames";
import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";

import { TrancheInfo } from "./TrancheInfo";
import { TrancheInfoButton } from "./TrancheInfoButton";

interface TranchePickerProps {
  tranches: Tranche[];
  activeTrancheIndex: number | undefined;
  onTrancheChange: (newTranche: Tranche) => void;
}
export const TranchePicker: FC<TranchePickerProps> = ({
  tranches,
  onTrancheChange,
  activeTrancheIndex,
}) => {
  const trancheSymbolResults = useSmartContractReadCalls(tranches, "symbol");
  const trancheNameResults = useSmartContractReadCalls(tranches, "name");
  const trancheUnlockTimestampResults = useSmartContractReadCalls(
    tranches,
    "unlockTimestamp"
  );
  const elfAddressResults = useSmartContractReadCalls(tranches, "elf");
  const elfContracts = useSmartContractsFromFactory(
    getQueriesData(elfAddressResults),
    Elf__factory.connect
  );
  const vaultAddressResults = useSmartContractReadCalls(elfContracts, "vault");
  const vaultContracts = useSmartContractsFromFactory(
    getQueriesData(vaultAddressResults),
    ERC20__factory.connect
  );
  const vaultNameResults = useSmartContractReadCalls(vaultContracts, "name");

  const onTrancheInfoChange = useCallback(
    (trancheInfo: TrancheInfo) => {
      onTrancheChange(trancheInfo.tranche);
    },
    [onTrancheChange]
  );

  const trancheInfos = makeTrancheInfos(
    tranches,
    getQueriesData(trancheSymbolResults),
    getQueriesData(trancheNameResults),
    getQueriesData(trancheUnlockTimestampResults),
    // TODO: stub out apy for now
    tranches.map(() => 4.13),
    getQueriesData(vaultNameResults)
  );

  // TODO: Show a loading or disabled state of some kind
  if (!trancheInfos.length || activeTrancheIndex === undefined) {
    return null;
  }

  const activeTrancheInfo = trancheInfos[activeTrancheIndex];

  return (
    <Select
      disabled
      popoverProps={{ minimal: true, targetClassName: tw("w-full") }}
      items={trancheInfos}
      filterable={false}
      className={tw("w-full", "col-span-2")}
      itemRenderer={(
        { name, tranche, apy, symbol, unlockTimestamp, vaultName },
        { handleClick }
      ) => (
        <TrancheInfoButton
          vaultName={vaultName}
          tranche={tranche}
          name={name}
          apy={apy}
          symbol={symbol}
          unlockTimestamp={unlockTimestamp}
          onClick={handleClick}
        />
      )}
      onItemSelect={onTrancheInfoChange}
    >
      <TrancheInfoButton
        tranche={activeTrancheInfo.tranche}
        name={activeTrancheInfo.name}
        symbol={activeTrancheInfo.symbol}
        vaultName={activeTrancheInfo.vaultName}
        apy={activeTrancheInfo.apy}
        unlockTimestamp={activeTrancheInfo.unlockTimestamp}
      />
    </Select>
  );
};
function makeTrancheInfos(
  tranches: Tranche[],
  trancheSymbols: (string | undefined)[],
  trancheNames: (string | undefined)[],
  trancheUnlockTimestamps: (BigNumber | undefined)[],
  trancheAPYs: (number | undefined)[],
  vaultNames: (string | undefined)[]
): TrancheInfo[] {
  // have to use any until zipWith definition supports more than 5 inputs
  return zipWith<any, TrancheInfo>(
    tranches,
    trancheSymbols,
    trancheNames,
    trancheUnlockTimestamps,
    trancheAPYs,
    vaultNames,
    (tranche, symbol, name, unlockTimestamp, apy, vaultName) => ({
      tranche,
      symbol,
      name,
      unlockTimestamp,
      apy,
      vaultName,
    })
  );
}
