# Remove files from frontend to make this a clean copy
rm -f src/tokenlists/goerli.tokenlist.json src/tokenlists/testnet.tokenlist.json src/tokenlists/mainnet.tokenlist.json
rm -f src/tokenlists/types.d.ts

# Copy the tokenlist.json files and TS definitions to the frontend
find ../elf-frontend-testnet/src/tokenlist/ -type f -name "*.tokenlist.json" -exec cp {} src/tokenlists/ \;
cp ../elf-frontend-testnet/src/tokenlist/types.ts src/tokenlists/types.ts