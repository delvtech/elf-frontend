import { MutationCache, QueryCache, QueryClient } from "react-query";

/**
 * If you need to use this in a React component, it is recommended to use the
 * `useQueryClient` hook from react-query instead. (This makes testing
 * components easier.)
 */
export const efiQueryClient = createQueryClient();

export function createQueryClient() {
  const queryCache = new QueryCache();
  const mutationCache = new MutationCache();

  const queryClient = new QueryClient({
    queryCache,
    mutationCache,
  });

  return queryClient;
}
