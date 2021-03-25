import { FC } from "react";

import { Link } from "@reach/router";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { getTimeLeft2 } from "efi/base/time";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useTrancheForInterestToken } from "efi-ui/tranche/useTrancheForInterestToken";
import { useInterestTokenForPool } from "efi-ui/pools/useInterestTokenForPool/useInterestTokenForPool";

interface InterestTokenPoolTableRowProps {
  pool: WeightedPool | undefined;
}

export const InterestTokenPoolTableRow: FC<InterestTokenPoolTableRowProps> = ({
  pool,
}) => {
  const interestToken = useInterestTokenForPool(pool);
  const tranche = useTrancheForInterestToken(interestToken);

  const poolNameResult = useSmartContractReadCall(pool, "name");
  const totalSupplyResult = useSmartContractReadCall(pool, "totalSupply");
  const baseAsset = usePoolPairedToken(pool, tranche as ERC20Shim);
  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const maturityDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  if (!pool || !baseAsset) {
    return null;
  }

  const totalSupply = getQueryData(totalSupplyResult);
  // TODO: Convert total supply to fiat

  const startDate = new Date(pool?.startDate);

  const timeLeft = getTimeLeft2(maturityDate);

  return (
    <tr>
      <td>{maturityDate?.toLocaleDateString()}</td>
      <td>
        <Link className={tw("flex", "space-x-2")} to={pool?.address || ""}>
          {getQueryData(poolNameResult)}
        </Link>
      </td>

      <td>${totalSupply?.toLocaleString()}</td>
      <td>2.13%</td>

      <td>{startDate.toLocaleDateString()}</td>

      <td>
        <LabeledProgressBar
          progressValue={0.5}
          label={t`running`}
          helperText={timeLeft}
        />
      </td>
    </tr>
  );
};
