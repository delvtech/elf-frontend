# ELF Deploy

The purpose of this repo is automate the setup of a local testnet to run the elf-contracts.

## How to run

### Get the contracts

```bash
$ sh scripts/load-elf-contracts.sh
```

### Run the hardhat local testnet

Install npm packages

```bash
$ npm ci
```

Compile the contracts

```bash
$ npx hardhat compile
```

Run the Hardhat Runtime Environment

```bash
$ npx hardhat node
```

(This makes a local testnet at http://localhost:8545/ and chain id 31337)

Deploy the contracts

```bash
$ npx hardhat run src/scripts/main.ts --network localhost --no-compile
```

Now all the contracts are loaded to the local testnet!

You'll need to grab the private key associated with the userAddres in addresses.json.
It should be the 2nd key created by hardhat, which is printed to the screen after you
run `npx hardhat node`.
