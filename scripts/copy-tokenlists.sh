# Copy over all the tokenlist.json files from the top-level directory into the frontend
rm -f frontend/src/tokenlists/goerli.tokenlist.json frontend/src/tokenlists/testnet.tokenlist.json
find testnet/src/tokenlist/ -type f -name "*.tokenlist.json" -exec cp {} frontend/src/tokenlists/ \;
