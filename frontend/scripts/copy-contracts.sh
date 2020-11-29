#!/bin/bash

echo "Copying contracts.json from elf-contracts/"
rm -f src/contracts.json
cp ../../elf-contracts/out/contracts.json src/contracts.json