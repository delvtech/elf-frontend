import { providers } from "ethers";

// TODO: Get this from the environment
const RPC_HOST = "http://127.0.0.1:8545";

export const jsonRpcProvider = new providers.JsonRpcProvider(RPC_HOST);
