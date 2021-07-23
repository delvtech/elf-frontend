set -e

export REACT_APP_CHAIN_NAME=$1

export REACT_APP_ELEMENT_APP_ID=$2

if [ $2 = "app" ]
then
    cp -f src/efi-ui/app/_index.tsx src/index.tsx
fi

if [ $2 = "save" ]
then
    cp -f src/efi-ui/saveApp/_index.tsx src/index.tsx
fi

mkdir -p public/json
cp -f src/tokenlists/$1.tokenlist.json public/json/

npm run build
