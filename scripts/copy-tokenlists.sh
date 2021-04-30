# Copy over all the tokenlist.json files from the top-level directory into the frontend
rm -rf frontend/src/tokenlists && mkdir frontend/src/tokenlists
find testnet/src/tokenlist/ -type f -name "*.tokenlist.json" -exec cp {} frontend/src/tokenlists/ \;
