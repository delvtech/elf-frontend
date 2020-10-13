import { typeAassertNever } from "efi/base/typeAssertNever";
import { Navigation } from "efi/ui/navigation/navigation";
import { useLocation } from "react-use";

export function useActiveTab(): Navigation {
  const location = useLocation();
  const navigation = location?.pathname?.split("/")[1] as Navigation;

  switch (navigation) {
    case Navigation.HOME: {
      return Navigation.HOME;
    }
    case Navigation.PORTFOLIO: {
      return Navigation.PORTFOLIO;
    }
    case Navigation.SWAP: {
      return Navigation.SWAP;
    }
    case Navigation.FUNDS: {
      return Navigation.FUNDS;
    }
    default:
      typeAassertNever(navigation);
      return Navigation.HOME;
  }
}
