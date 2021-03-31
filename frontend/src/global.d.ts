interface Window {
  /**
   * Injected wallet providers like MetaMask provide an ethereum client
   * directly on window. When users interact directly w/ their wallet plugin,
   * we can listen for events on this client to sync our app state.
   */
  ethereum: any;
  /**
   * web3react context object.  placed on global for easier debugging
   */
  __web3React: any;

  /**
   * addresses.json
   */
  addresses: Record<string, string>;
  /**
   * helper function to lookup the addresses.json key of a given address
   */
  lookupAddressKey: (address: string | undefined) => string | undefined;

  /**
   * helper console function to deal with BigNumbers
   */
  consoleEther: (name: string, value: BigNumber | undefined) => void;
}
