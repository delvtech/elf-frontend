import {
  Toaster,
  Position,
  Classes,
  IToastProps,
  Intent,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

/**
 * Create toasts in response to interactions.
 *
 * In most cases, it's enough to simply create and forget (thanks to timeout).
 *
 * Example:
 *
 * import { AppToaster } from 'efi/ui/app/AppToaster';
 *
 * AppToaster.show({ message: "Toasted." });
 */
export const AppToaster = Toaster.create({
  className: Classes.DARK,
  position: Position.TOP,
});

export function makeSuccessToast(message: string): IToastProps {
  return {
    message,
    icon: IconNames.TICK,
    intent: Intent.SUCCESS,
  };
}

export function makeErrorToast(message: string): IToastProps {
  return {
    message,
    icon: IconNames.ERROR,
    intent: Intent.DANGER,
  };
}
