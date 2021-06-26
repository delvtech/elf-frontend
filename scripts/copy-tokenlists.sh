# Remove files from frontend to make this a clean copy
rm -f frontend/src/tokenlists/goerli.tokenlist.json frontend/src/tokenlists/testnet.tokenlist.json frontend/src/tokenlists/mainnet.tokenlist.json
rm -f frontend/src/tokenlists/types.d.ts


# Copy the tokenlist.json files and TS definitions to the frontend
find testnet/src/tokenlist/ -type f -name "*.tokenlist.json" -exec cp {} frontend/src/tokenlists/ \;
cp testnet/src/tokenlist/types.ts frontend/src/tokenlists/types.ts
