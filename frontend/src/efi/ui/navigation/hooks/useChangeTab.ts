import { useNavigate } from "@reach/router";
import { Navigation } from "efi/ui/navigation/navigation";
import { useCallback } from "react";

export function useChangeTab() {
  const navigate = useNavigate();
  return useCallback(
    (tabId: Navigation) => {
      navigate(`/${tabId}`);
    },
    [navigate]
  );
}
