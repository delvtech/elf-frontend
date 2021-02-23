rm -rf frontend/src/elf-contracts/types
mkdir frontend/src/elf-contracts/types

# Copy the types from elf-deploy into the frontend
# TODO: A symlink would be prefered, but vscode isn't able to follow them
# without further investigation
cp -R elf-deploy/src/types/* frontend/src/elf-contracts/types