import React, { FC, Fragment, useCallback, useState } from "react";

import { Classes, Colors, H2 } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

interface PortfolioViewTitleProps {
  account: string | null | undefined;
}

export const PortfolioViewTitle: FC<PortfolioViewTitleProps> = ({
  account,
}) => {
  const { isDarkMode } = useDarkMode();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const openDialog = useCallback(() => setDialogOpen(true), []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  return (
    <Fragment>
      <div className={tw("flex", "flex-col", "justify-start")}>
        <H2 className={tw("mb-4")}>{t`Portfolio`}</H2>
        <span
          className={classNames(
            Classes.RUNNING_TEXT,
            Classes.TEXT_MUTED,
            tw("text-base")
          )}
        >
          {account ? (
            t`Wallet address: ${account}`
          ) : (
            <span>
              {t`View your balances and interest earnings.`}{" "}
              <button
                onClick={openDialog}
                className={classNames(Classes.BUTTON_TEXT, Classes.TEXT_LARGE)}
                style={{ color: isDarkMode ? Colors.BLUE5 : Colors.BLUE2 }}
              >
                {t`Connect a wallet to begin.`}
              </button>
            </span>
          )}
        </span>
      </div>
      <ConnectWalletDialog isOpen={isDialogOpen} onClose={closeDialog} />
    </Fragment>
  );
};
