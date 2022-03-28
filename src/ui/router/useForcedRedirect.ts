import { useEffect } from "react";
import { useRouter } from "next/router";

export const useForcedRedirect = (route: string, enabled: boolean): void => {
  const router = useRouter();
  useEffect(() => {
    if (enabled && router.route !== route) router.replace(route);
  }, [enabled, route, router]);
};
