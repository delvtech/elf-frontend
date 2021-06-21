import { ReactElement } from "react";
import { Callout, H4, Intent } from "@blueprintjs/core";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";

interface ChartMessagesProps {
  poolAtLeastOneDayOld: boolean;
  hasData: boolean;
  children: ReactElement | null;
}
export function ChartMessages(props: ChartMessagesProps): ReactElement {
  const { poolAtLeastOneDayOld, hasData, children } = props;

  let message = t`No data available for chart`;
  if (!poolAtLeastOneDayOld) {
    message = t`Charts available after 24 hours of activity`;
  }

  if (!poolAtLeastOneDayOld || !hasData) {
    return (
      <div className={tw("w-full", "h-full", "pt-8")}>
        <Callout
          icon={null}
          className={tw(
            "flex",
            "items-center",
            "justify-center",
            "h-full",
            "w-full"
          )}
          intent={Intent.NONE}
        >
          <H4>{message}</H4>
        </Callout>
      </div>
    );
  }

  return <div className={tw("w-full", "h-full")}>{children}</div>;
}
