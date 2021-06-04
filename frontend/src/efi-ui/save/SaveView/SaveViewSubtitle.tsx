import { Fragment, ReactElement } from "react";

import { jt, t } from "ttag";

import { assertNever } from "efi/base/assertNever";

import { SaveNavigation } from "./SaveNavigation";

interface SaveViewSubtitleProps {
  activeTab: SaveNavigation;
}

const fixedYieldLink = (
  <a
    key="fixed-yield-link"
    href={
      "https://medium.com/element-finance/fixed-rate-interest-markets-a-casual-users-journey-through-fixed-rate-interest-using-element-50f420df1859"
    }
    target="_noreferrer"
  >
    {t`Read more about Fixed Yield.`}
  </a>
);

export function SaveViewSubtitle(
  props: SaveViewSubtitleProps
): ReactElement | null {
  const { activeTab } = props;

  switch (activeTab) {
    case SaveNavigation.SAVE:
      return (
        <Fragment>{jt`No minimums, no withdrawal penalties, no lockups. Just fixed rate interest. ${fixedYieldLink}`}</Fragment>
      );

    case SaveNavigation.BALANCES:
      return null;

    default:
      assertNever(activeTab);
      return null;
  }
}
