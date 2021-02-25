rm -rf frontend/src/elf-contracts/types
mkdir -p frontend/src/elf-contracts/types

# Copy the types from elf-deploy into the frontend
# TODO: A symlink would be prefered, but vscode isn't able to follow them
# without further investigation
cp -R testnet/src/types/* frontend/src/elf-contracts/types

cp -f testnet/addresses.json frontend/src/addresses.json