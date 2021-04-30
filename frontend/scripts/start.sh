set -e

# Purposefully not exporting this env variable because we want vanilla
# `npm start` to still work without having to specify "testnet".
REACT_APP_CHAIN_NAME=$1 npm start