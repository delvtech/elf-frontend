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
    case Navigation.FAQ: {
      return Navigation.FAQ;
    }
    case Navigation.WALLET: {
      return Navigation.WALLET;
    }
    case Navigation.EXCHANGE: {
      return Navigation.EXCHANGE;
    }
    default:
      typeAassertNever(navigation);
      return Navigation.HOME;
  }
}
