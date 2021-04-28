# The addresses/ directory is the source of truth for addresses.json files in
# this repo.  This script populates the addresses/ directory and copies it over
# to the frontend.

# The testnet/ directory contains the latest addresses.json for the localnet.
cp -f testnet/src/testnet.addresses.json addresses/testnet.addresses.json

# Copy over all the addresses.json files from the top-level directory into the frontend
rm -rf frontend/src/addresses && mkdir frontend/src/addresses
find addresses/ -type f -name "*.addresses.json" -exec cp {} frontend/src/addresses/ \;

# Copy the typescript definition file to the frontend
cp -f addresses/AddressesJsonFile.d.ts frontend/src/addresses/