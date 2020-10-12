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
  position: Position.BOTTOM_RIGHT,

  // TODO: Figure out a way to change this dynamically via user pref. Might need
  // to contribute a Toaster.setClassName() method back to Blueprint for this,
  // or have multiple toasters.
  className: Classes.DARK,
});
export function makeToast(message: string): IToastProps {
  return {
    message,
  };
}

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
