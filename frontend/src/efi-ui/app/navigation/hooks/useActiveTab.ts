import { useLocation } from "react-use";

import { Navigation } from "efi-ui/app/navigation/navigation";
import { typeAassertNever } from "efi/base/typeAssertNever";

export function useActiveTab(): Navigation {
  const location = useLocation();
  const navigation = location?.pathname?.split("/")[1] as Navigation;

  switch (navigation) {
    case Navigation.HOME: {
      return Navigation.HOME;
    }
    case Navigation.TRADE: {
      return Navigation.TRADE;
    }
    case Navigation.PORTFOLIO: {
      return Navigation.PORTFOLIO;
    }
    case Navigation.EARN: {
      return Navigation.EARN;
    }
    case Navigation.STATS: {
      return Navigation.STATS;
    }

    default:
      typeAassertNever(navigation);
      return Navigation.HOME;
  }
}
