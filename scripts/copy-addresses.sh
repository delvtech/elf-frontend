# Copy over all the addresses.json files from the top-level directory into the frontend
rm -f frontend/src/addresses/goerli.addresses.json frontend/src/addresses/testnet.addresses.json frontend/src/addresses/mainnet.addresses.json
find testnet/src/addresses/ -type f -name "*.addresses.json" -exec cp {} frontend/src/addresses/ \;

# Copy the typescript definition file to the frontend
cp -f testnet/src/addresses/AddressesJsonFile.d.ts frontend/src/addresses/