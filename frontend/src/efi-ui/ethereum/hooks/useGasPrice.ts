import { useQuery } from "react-query";
import { fetchGasPrice } from "efi-etherchain/fetchGasPrice";

export const useGasPrice = () => {
  return useQuery({
    queryKey: "ethereum-gas-price",
    queryFn: () => fetchGasPrice(),
    refetchInterval: 5000,
  });
};
