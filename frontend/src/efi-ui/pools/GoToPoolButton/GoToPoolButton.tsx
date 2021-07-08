import { MouseEventHandler, ReactElement, useCallback } from "react";

import { Classes } from "@blueprintjs/core";
import { Link } from "@reach/router";
import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";
import {
  PoolAction,
  usePoolViewPoolActionsTab,
} from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";

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

  const onClick: MouseEventHandler = useCallback(
    (event) => {
      setTab(poolAction);

      // this button might be inside an interactive Card, so we stop propagation
      // to prevent double routing, eg: cmd+click to open link in new tab should
      // not navigate the current tab.
      event.stopPropagation();
    },
    [setTab, poolAction]
  );

  // Note: Internal links should never be implemented as anchor tags, including
  // blueprint's AnchorButton. Instead, use the Link component from the router
  // so that the browser can still open links in new tabs, etc..  but just
  // clicking a link doesn't cause a full-page refresh (like with an anchor
  // tag).
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
