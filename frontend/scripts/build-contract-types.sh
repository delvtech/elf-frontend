#!/bin/bash

# First parse out the smart contract ABIs from dapp.sol.json
printf "\nParsing dapp.sol.json file into seperate abi json files...\n\n"

for contractKey in $(jq -r '.contracts | keys[]') ; do
    IFS=':' # setting comma as delimiter
    read -a strarr <<<"$contractKey"

    CONTRACT_NAME=${strarr[1]}
    OUTPUT_FILE=src/elf-contracts/contracts/${CONTRACT_NAME}.json

    printf "$OUTPUT_FILE\n"

    jq -r ".contracts[\"$contractKey\"].abi" < src/elf-contracts/dapp.sol.json > $OUTPUT_FILE
done < src/elf-contracts/dapp.sol.json

# Generate typescript types for the smart contracts
typechain --target ethers-v5 --outDir src/elf-contracts/types/ 'src/elf-contracts/contracts/*.json'

# Remove the index.ts file since typechain doesn't generate properly, and it's
# breaking CRA's tsconfig.json hard rule for --isolatedModules
rm -f src/elf-contracts/types/index.ts