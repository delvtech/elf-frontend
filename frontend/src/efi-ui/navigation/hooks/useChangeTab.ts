import { useNavigate } from "@reach/router";
import { useCallback } from "react";

import { Navigation } from "efi-ui/navigation/navigation";

type ChangeTabFn = (tabId: Navigation) => void;

export function useChangeTab(): ChangeTabFn {
  const navigate = useNavigate();
  return useCallback(
    (tabId: Navigation) => {
      navigate(`/${tabId}`);
    },
    [navigate]
  );
}
