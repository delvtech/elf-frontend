import { useNavigate } from "@reach/router";
import { useCallback } from "react";

import { Navigation } from "efi-ui/navigation/navigation";

export function useChangeTab() {
  const navigate = useNavigate();
  return useCallback(
    (tabId: Navigation) => {
      navigate(`/${tabId}`);
    },
    [navigate]
  );
}
