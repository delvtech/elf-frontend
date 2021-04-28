# Copy the testnet.addresses.json into the addresses/ top-level directory
cp -f testnet/src/testnet.addresses.json addresses/testnet.addresses.json

# Copy all *.addresses.json files to the frontend
rm -rf frontend/src/addresses && mkdir frontend/src/addresses
find addresses/ -type f -name "*.addresses.json" -exec cp {} frontend/src/addresses/ \;

# Copy the typescript definition file to the frontend
cp -f addresses/AddressesJsonFile.d.ts frontend/src/addresses/