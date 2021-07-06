import { ReactElement, useCallback } from "react";

import { AnchorButton, Classes, Intent } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import {
  PoolAction,
  usePoolViewPoolActionsTab,
} from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { Link } from "@reach/router";
import { BUTTON } from "@blueprintjs/core/lib/esm/common/classes";
import classNames from "classnames";

interface GoToPoolButtonProps {
  poolAddress: string;
  poolAction: PoolAction;
  label: string;

  small?: boolean;
  outlined?: boolean;
  fill?: boolean;
}

export function GoToPoolButton(props: GoToPoolButtonProps): ReactElement {
  const {
    poolAddress,
    poolAction,
    label,
    fill,
    outlined = false,
    small = false,
  } = props;

  const { setTab } = usePoolViewPoolActionsTab();

  const onClick = useCallback(() => {
    setTab(poolAction);
  }, [setTab, poolAction]);

  return (
    <Link
      to={`/pools/${poolAddress}`}
      onClick={onClick}
      className={classNames(
        Classes.BUTTON,
        Classes.MINIMAL,
        {
          [Classes.OUTLINED]: outlined,
          [Classes.SMALL]: small,
          [Classes.FILL]: fill,
        },
        Classes.INTENT_PRIMARY
      )}
    >
      <div className={tw("p-2", "text-base")}>{label}</div>
    </Link>
  );
}
