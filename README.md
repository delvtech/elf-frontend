This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Building for production

### `npm run build:new <addresses-json-id>`

Example:

Create a prod build against the element Goerli contracts
```
npm run build:new goerli
```

## Developer setup

In the project directory, run:

```bash
npm ci
next build
```

Then start the development server with

### `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Adding a new base asset
1. Run `npm run update-elf-tokenlist`.
1. Add a logo svg to `src/efi-static-assets/svg/` directory.
1. Update `src/addresses/AddressesJsonFile.d.ts`
