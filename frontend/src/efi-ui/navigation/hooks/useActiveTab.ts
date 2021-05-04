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
    case Navigation.PRINCIPAL_POOLS: {
      return Navigation.PRINCIPAL_POOLS;
    }
    case Navigation.YIELD_POOLS: {
      return Navigation.YIELD_POOLS;
    }
    case Navigation.RESOURCES: {
      return Navigation.RESOURCES;
    }
    case Navigation.PORTFOLIO: {
      return Navigation.PORTFOLIO;
    }
    case Navigation.POOL: {
      return Navigation.POOL;
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
