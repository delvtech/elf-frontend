rm -rf frontend/src/elf-contracts/types
mkdir -p frontend/src/elf-contracts/types

# Copy the types from testnet into the frontend
# TODO: A symlink would be prefered, but vscode isn't able to follow them
# without further investigation
cp -R testnet/src/types/* frontend/src/elf-contracts/types

# copy over any pre-built local types as well
cp -R testnet/src/localTypes/* frontend/src/elf-contracts/types
cp -R testnet/src/localTypes/factories/* frontend/src/elf-contracts/types/factories