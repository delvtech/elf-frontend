## Building for production

### `npm run build:new <addresses-json-id>`

Example:

Create a prod build against the element Goerli contracts
```
npm run build:new goerli
```

## Developer setup

First install the dependencies. Open the directory in your terminal and run:

```bash
npm ci
```

  > **note:** Running `npm ci` instead of just `npm i` or `npm install` will ensure that the package-lock.json isn't modified if you're using a different version of npm. See the [npm-ci docs](https://docs.npmjs.com/cli/v8/commands/npm-ci) for more info.

To start the app in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The development server has some perks for developing like hot-code reloading, error reporting, and more, but it will pre-render each page on each request. This can cause some parts of the app to run a little slow. To start the app in production mode, run:

```
npm run build
npm start
```

### Adding a new base asset
1. Run `npm run update-elf-tokenlist`.
1. Add a logo svg to `src/efi-static-assets/svg/` directory.
1. Update `src/addresses/AddressesJsonFile.d.ts`