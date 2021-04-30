import { TokenList } from "@uniswap/token-lists";
import keyBy from "lodash.keyby";

// Default to the testnet in this repo so `npm start` Just Works without having
// to specify it on the command line.
const chainName = process.env.REACT_APP_CHAIN_NAME || "testnet";

// Import statements in TS are statically checked, and will throw compile-time
// errors if the file doesn't exist. Require statements on the other hand are
// dynamic and will throw an error at runtime. For tools like eslint and
// dependency-cruiser, we don't need to run the app, but we need TS to compile
// correctly, so we use a require() statement here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const tokenListJson: TokenList = require(`tokenlists/${chainName}.tokenlist.json`);

export const TokenMetadata = keyBy(tokenListJson.tokens, "address");
export default tokenListJson;
