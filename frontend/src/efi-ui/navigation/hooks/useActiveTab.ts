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
    case Navigation.POOLS: {
      return Navigation.POOLS;
    }
    case Navigation.RESOURCES: {
      return Navigation.RESOURCES;
    }
    case Navigation.PORTFOLIO: {
      return Navigation.PORTFOLIO;
    }
    case Navigation.EARN: {
      return Navigation.EARN;
    }
    case Navigation.MINT: {
      return Navigation.MINT;
    }

    default:
      typeAassertNever(navigation);
      return Navigation.HOME;
  }
}
