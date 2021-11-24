import { ReactElement } from "react";

import { Classes, Icon } from "@blueprintjs/core";
import { Link } from "@reach/router";
import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";
import { PoolAction } from "efi-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { IconNames } from "@blueprintjs/icons";

interface GoToPoolButtonTagProps {
  poolAddress: string;
  poolAction: PoolAction;
  label: string;
  className?: string;
}

export function GoToPoolButtonTag(props: GoToPoolButtonTagProps): ReactElement {
  const { poolAddress, poolAction, label, className } = props;

  // Note: Internal links should never be implemented as anchor tags, including
  // blueprint's AnchorButton. Instead, use the Link component from the router
  // so that the browser can still open links in new tabs, etc..  but just
  // clicking a link doesn't cause a full-page refresh (like with an anchor
  // tag).
  return (
    <Link
      to={`/pools/${poolAddress}?action=${poolAction}`}
      className={classNames(
        Classes.TAG,
        Classes.LARGE,
        Classes.MINIMAL,
        Classes.INTERACTIVE,
        Classes.INTENT_PRIMARY,
        Classes.FILL,
        tw("flex", "justify-between"),
        className
      )}
    >
      <div className={tw("p-2")}>{label}</div>
      <Icon icon={IconNames.CHEVRON_RIGHT} color={"#a7b6c2"} />
    </Link>
  );
}
