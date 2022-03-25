import { Callout, Dialog } from "@blueprintjs/core";
import classNames from "classnames";
import { CSSProperties, ReactElement } from "react";
import { useMedia } from "react-use";
import { t } from "ttag";
import { useDarkMode } from "ui/prefs/useDarkMode/useDarkMode";

const smallScreenStyle: CSSProperties = {
  margin: 0,
  height: "100vh",
  width: "100vw",
};

interface IneligibleWalletDialogProps {
  isOpen: boolean;
}

export default function IneligibleWalletDialog({
  isOpen,
}: IneligibleWalletDialogProps): ReactElement {
  const { darkModeClassName } = useDarkMode();
  const isSmallScreen = useMedia("(max-width: 639px)");
  return (
    <Dialog
      isCloseButtonShown={false}
      style={isSmallScreen ? smallScreenStyle : undefined}
      className={classNames(darkModeClassName, "pb-0", "overflow-auto")}
      isOpen={isOpen}
      // onClose={onClose}
      title={
        <span className="text-center text-base py-6">{t`Ineligible Wallet`}</span>
      }
    >
      <div className="p-5">
        <Callout intent="danger">
          This wallet is not eligible to use this website.
        </Callout>
      </div>
    </Dialog>
  );
}
