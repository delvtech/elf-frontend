## Building for production

| Network          | Command                     |
|------------------|-----------------------------|
| Hardhat          | `npm run build`             |
| Goerli           | `npm run build:goerli-app`  |
| Ethereum Mainnet | `npm run build:mainnet-app` |

## Developer setup

First install the dependencies. Open the directory in your terminal and run:

```bash
npm ci
```

  > **note:** Running `npm ci` instead of just `npm i` or `npm install` will ensure that the package-lock.json isn'tmodified if you're using a different version of npm. See the [npm-ci docs](https://docs.npmjs.com/cli/v8/commands/npm-ci) for more info.

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

## Deployment

This app is deployed to 3 different projects in [Vercel](https://vercel.com/element-finance).

### 1. [elf-frontend-staging](https://vercel.com/element-finance/elf-frontend-staging)

This is a password protected app accessible at [staging.element.fi][staging-app-url]. It uses `main` as it's production branch and will create a new [preview deployment](https://vercel.com/docs/concepts/deployments/environments#preview) each time there's a push to *any* branch or a deployment is made using the [`vercel` command](https://vercel.com/docs/concepts/deployments/overview#vercel-cli).

Once a branch has been merged into `main`, it will be deployed to [staging.element.fi][staging-app-url].

### 2. [elf-frontend-testnet](https://vercel.com/element-finance/elf-frontend-testnet)

This is the Goerli app accessible at [testnet.element.fi][testnet-app-url] and uses `testnet` as it's production branch.

After merging a branch into `main`, merge `main` into `testnet` to deploy to [testnet.element.fi][testnet-app-url].

### 3. [elf-frontend](https://vercel.com/element-finance/elf-frontend)

This is the main app accessible at [app.element.fi][mainnet-app-url] and uses `mainnet` as it's production branch.

After merging a branch into `main`, merge `main` into `mainnet` to deploy to [app.element.fi][mainnet-app-url].

[staging-app-url]: https://staging.element.fi
[testnet-app-url]: https://testnet.element.fi
[mainnet-app-url]: https://app.element.fi