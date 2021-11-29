# Copy over all the addresses.json files from the top-level directory into the frontend
rm -f src/addresses/goerli.addresses.json src/addresses/testnet.addresses.json src/addresses/mainnet.addresses.json
find ../elf-frontend-testnet/src/addresses/ -type f -name "*.addresses.json" -exec cp {} src/addresses/ \;

# Copy the typescript definition file to the frontend
cp -f ../elf-frontend-testnet/src/addresses/AddressesJsonFile.d.ts src/addresses/