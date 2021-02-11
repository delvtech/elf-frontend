rm -rf src/elf-contracts/types/**/*

# TODO: get the elf-deploy location from an environment variable
cp -r ~/src/elf-deploy/src/types/. src/elf-contracts/types/

# Remove the index.ts file since typechain doesn't generate properly, and it's
# breaking CRA's tsconfig.json hard rule for --isolatedModules
rm -f src/elf-contracts/types/index.ts

# copy addresses over
cp -r ~/src/elf-deploy/addresses.json src/addresses.json