import { useLocation } from "react-use";

import { Navigation } from "efi-ui/navigation/navigation";
import { typeAassertNever } from "efi/base/typeAssertNever";

export function useActiveTab(): Navigation {
  const location = useLocation();
  const navigation = location?.pathname?.split("/")[1] as Navigation;

  switch (navigation) {
    case Navigation.HOME: {
      return Navigation.HOME;
    }
    case Navigation.PULSE: {
      return Navigation.PULSE;
    }
    case Navigation.TRADE: {
      return Navigation.TRADE;
    }
    case Navigation.RESOURCES: {
      return Navigation.RESOURCES;
    }
    case Navigation.PORTFOLIO: {
      return Navigation.PORTFOLIO;
    }
    case Navigation.SAVE: {
      return Navigation.SAVE;
    }
    case Navigation.EARN: {
      return Navigation.EARN;
    }
    case Navigation.DEPOSIT: {
      return Navigation.DEPOSIT;
    }

    default:
      typeAassertNever(navigation);
      return Navigation.HOME;
  }
}
