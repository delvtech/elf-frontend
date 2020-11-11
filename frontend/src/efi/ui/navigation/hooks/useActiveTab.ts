import { useLocation } from "react-use";

import { typeAassertNever } from "efi/base/typeAssertNever";
import { Navigation } from "efi/ui/navigation/navigation";

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
    case Navigation.SWAP: {
      return Navigation.SWAP;
    }
    case Navigation.INVEST: {
      return Navigation.INVEST;
    }
    case Navigation.FAQ: {
      return Navigation.FAQ;
    }
    default:
      typeAassertNever(navigation);
      return Navigation.HOME;
  }
}
