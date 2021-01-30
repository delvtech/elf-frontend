import { MOCK_TRANCHE_ADDRESSES } from "efi/contracts/mockAddresses";
import { ONE_ETHER } from "efi/crypto/ethereum";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import { MOCK_YC_ADDRESSES } from "./mockAddresses";
import {
  ERC20__factory,
  Tranche__factory,
  TrancheFactory__factory,
} from "./mockContracts";

test("should create a tranche factory contract", async () => {
  const trancheFactoryContract = TrancheFactory__factory.connect(
    "0xTRANCHE_FACTORY",
    jsonRpcProvider
  );

  expect(trancheFactoryContract.address).toEqual(MOCK_TRANCHE_ADDRESSES[0]);
  const events = await trancheFactoryContract.queryFilter();
  expect(events.length).toEqual(3);
});

test("should create a tranche contract", async () => {
  const trancheContract = Tranche__factory.connect(
    "0xTRANCHE_ETH_1",
    jsonRpcProvider
  );

  expect(trancheContract.address).toEqual(MOCK_TRANCHE_ADDRESSES[0]);
  const [fytBalance] = await trancheContract.functions.balanceOf(
    "0xSOME_ADDRESS"
  );

  expect(fytBalance.toString()).toEqual(ONE_ETHER.toString());

  const [yc] = await trancheContract.yc();
  expect(yc).toEqual("0xYC_ETH_1");
});

test("should create a yc contract", async () => {
  const ycContract = ERC20__factory.connect(
    MOCK_YC_ADDRESSES[0],
    jsonRpcProvider
  );

  expect(ycContract.address).toEqual(MOCK_YC_ADDRESSES[0]);
  const [balance] = await ycContract.functions.balanceOf("0xSOME_ADDRESS");
  expect(balance.toString()).toEqual(ONE_ETHER.toString());
});
